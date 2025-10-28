'use server';

import { revalidatePath } from 'next/cache';
import sanitizeHtml from 'sanitize-html';
import { createServerClient } from '@/lib/api/createServerClient';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';

interface PublishCommunicationInput {
  title: string;
  bodyHtml: string;
  sendEmail?: boolean;
}

interface PublishCommunicationResult {
  success: boolean;
  error?: string;
  notificationId?: string;
  recipients?: number;
  emailsSent?: number;
  emailsFailed?: number;
}

const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
};

function stripHtml(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

export async function publishCommunication(
  input: PublishCommunicationInput
): Promise<PublishCommunicationResult> {
  const supabase = await createServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUser = authData?.user;

  if (!currentUser) {
    return { success: false, error: 'Utente non autenticato' };
  }

  const title = input.title?.trim();
  const bodyHtml = input.bodyHtml?.trim();

  if (!title) {
    return { success: false, error: 'Titolo obbligatorio' };
  }

  if (!bodyHtml) {
    return { success: false, error: 'Testo comunicazione obbligatorio' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, email, full_name')
    .eq('id', currentUser.id)
    .single();

  if (profileError || !profile) {
    console.error('[notifications] Unable to load profile', profileError);
    return { success: false, error: 'Impossibile caricare il profilo' };
  }

  const userRole = (profile as any).role as string | null;
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return { success: false, error: 'Permessi insufficienti' };
  }

  const sanitizedHtml = sanitizeHtml(bodyHtml, sanitizeConfig);
  const plainText = stripHtml(sanitizedHtml);

  const { data: notificationRows, error: notificationError } = await (supabase
    .from('notifications') as any)
    .insert({
      title,
      body_html: sanitizedHtml,
      body_text: plainText,
      sent_by: (profile as any).id,
    })
    .select('id, title, body_html, body_text, published_at')
    .limit(1);

  if (notificationError || !notificationRows?.[0]) {
    console.error('[notifications] Failed to insert notification', notificationError);
    return { success: false, error: 'Errore durante la creazione della comunicazione' };
  }

  const notification = notificationRows[0];

  const { data: recipientsResult, error: recipientsError } = await (supabase
    .from('profiles') as any)
    .select('id, email, is_active')
    .eq('is_active', true);

  if (recipientsError || !recipientsResult) {
    console.error('[notifications] Failed to load recipients', recipientsError);
    return { success: false, error: 'Errore durante il recupero degli utenti' };
  }

  const recipientRows = (recipientsResult as any[]).map((recipient: any) => ({
    notification_id: (notification as any).id,
    user_id: recipient.id,
  }));

  const { data: insertedRecipients, error: insertRecipientsError } = await (supabase
    .from('notification_recipients') as any)
    .insert(recipientRows)
    .select('id, user_id');

  if (insertRecipientsError) {
    console.error('[notifications] Failed to insert notification recipients', insertRecipientsError);
    return { success: false, error: "Errore durante l'assegnazione della comunicazione agli utenti" };
  }

  let emailsSent = 0;
  let emailsFailed = 0;

  const globalEmailEnabled = process.env.NOTIFICATIONS_SEND_EMAILS !== 'false';
  const shouldSendEmails = globalEmailEnabled && input.sendEmail !== false;

  if (shouldSendEmails) {
    const recipientMap = new Map((insertedRecipients as any[])?.map((r: any) => [r.user_id, r.id] as const));
    const now = new Date().toISOString();
    const sentIds: string[] = [];
    const failedIds: string[] = [];

    for (const recipient of (recipientsResult as any[])) {
      const recipientId = recipientMap.get(recipient.id);
      if (!recipientId) continue;

      if (!recipient.email) {
        failedIds.push(recipientId);
        emailsFailed += 1;
        continue;
      }

      const result = await sendNotificationEmail({
        to: recipient.email,
        subject: title,
        html: sanitizedHtml,
        text: plainText,
      });

      if (result.success) {
        sentIds.push(recipientId);
        emailsSent += 1;
      } else {
        failedIds.push(recipientId);
        emailsFailed += 1;
      }
    }

    if (sentIds.length > 0) {
      await (supabase
        .from('notification_recipients') as any)
        .update({ email_status: 'sent', email_sent_at: now })
        .in('id', sentIds);
    }

    if (failedIds.length > 0) {
      await (supabase
        .from('notification_recipients') as any)
        .update({ email_status: 'failed' })
        .in('id', failedIds);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/communications');

  return {
    success: true,
    notificationId: (notification as any).id,
    recipients: recipientRows.length,
    emailsSent,
    emailsFailed,
  };
}

export async function markNotificationAsRead(recipientId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUser = authData?.user;

  if (!currentUser) {
    return { success: false, error: 'Utente non autenticato' };
  }

  const now = new Date().toISOString();

  const { error } = await (supabase
    .from('notification_recipients') as any)
    .update({ read_at: now })
    .eq('id', recipientId)
    .eq('user_id', currentUser.id)
    .is('read_at', null);

  if (error) {
    console.error('[notifications] Unable to mark notification as read', error);
    return { success: false, error: "Errore durante l'aggiornamento della notifica" };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Delete a notification (admin/super_admin only)
 * This will delete the notification and all its recipients
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUser = authData?.user;

  if (!currentUser) {
    return { success: false, error: 'Utente non autenticato' };
  }

  // Check if user is admin or super_admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (profileError || !profile) {
    console.error('[deleteNotification] Unable to load profile', profileError);
    return { success: false, error: 'Impossibile caricare il profilo' };
  }

  const userRole = (profile as any).role as string | null;
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return { success: false, error: 'Permessi insufficienti' };
  }

  // Delete notification_recipients first (due to foreign key constraint)
  const { error: recipientsError } = await (supabase
    .from('notification_recipients') as any)
    .delete()
    .eq('notification_id', notificationId);

  if (recipientsError) {
    console.error('[deleteNotification] Failed to delete notification recipients', recipientsError);
    return { success: false, error: 'Errore durante l\'eliminazione dei destinatari' };
  }

  // Delete the notification
  const { error: notificationError } = await (supabase
    .from('notifications') as any)
    .delete()
    .eq('id', notificationId);

  if (notificationError) {
    console.error('[deleteNotification] Failed to delete notification', notificationError);
    return { success: false, error: 'Errore durante l\'eliminazione della notifica' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/communications');

  return { success: true };
}
