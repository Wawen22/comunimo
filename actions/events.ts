'use server';

import { revalidatePath } from 'next/cache';
import sanitizeHtml from 'sanitize-html';
import { createServerClient } from '@/lib/api/createServerClient';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface CreateCustomEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  max_participants?: number;
  sendNotification?: boolean;
}

interface CreateCustomEventResult {
  success: boolean;
  error?: string;
  eventId?: string;
  notificationId?: string;
  recipients?: number;
  emailsSent?: number;
  emailsFailed?: number;
}

interface UpdateCustomEventInput {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  max_participants?: number;
}

interface UpdateCustomEventResult {
  success: boolean;
  error?: string;
}

// Sanitize configuration (same as notifications)
const sanitizeConfig = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel']
  },
  allowedSchemes: ['http', 'https', 'mailto']
};

function escapeHtml(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

function stripHtml(html: string): string {
  return html
    // Replace <br> and </p> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up excessive whitespace but preserve single newlines
    .replace(/ +/g, ' ')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

export async function createCustomEvent(
  input: CreateCustomEventInput
): Promise<CreateCustomEventResult> {
  const supabase = await createServerClient();

  // Check authentication
  const { data: authData } = await supabase.auth.getUser();
  const currentUser = authData?.user;

  if (!currentUser) {
    return { success: false, error: 'Utente non autenticato' };
  }

  // Validate input
  const title = input.title?.trim();
  const event_date = input.event_date?.trim();

  if (!title) {
    return { success: false, error: 'Titolo obbligatorio' };
  }

  if (!event_date) {
    return { success: false, error: 'Data evento obbligatoria' };
  }

  // Get user profile and check permissions
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, email, full_name')
    .eq('id', currentUser.id)
    .single();

  if (profileError || !profile) {
    console.error('[events] Unable to load profile', profileError);
    return { success: false, error: 'Impossibile caricare il profilo' };
  }

  const userRole = (profile as any).role as string | null;
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return { success: false, error: 'Permessi insufficienti' };
  }

  try {
    // Create the event
    const { data: eventRows, error: eventError } = await (supabase
      .from('events') as any)
      .insert({
        title,
        description: input.description?.trim() || null,
        event_date,
        event_time: input.event_time?.trim() || null,
        location: input.location?.trim() || null,
        max_participants: input.max_participants || null,
        championship_id: null, // Custom event
        society_id: null,
        is_public: true,
        is_active: true,
        created_by: (profile as any).id,
      })
      .select('id, title, description, event_date, event_time, location')
      .limit(1);

    if (eventError || !eventRows?.[0]) {
      console.error('[events] Failed to create event', eventError);
      return { success: false, error: 'Errore durante la creazione dell\'evento' };
    }

    const event = eventRows[0];

    // If sendNotification is false, return early
    if (input.sendNotification === false) {
      revalidatePath('/dashboard/events');
      return {
        success: true,
        eventId: (event as any).id,
      };
    }

    // Create notification for the event
    const eventDate = parseISO((event as any).event_date);
    const formattedDate = format(eventDate, 'dd MMMM yyyy', { locale: it });
    const formattedTime = (event as any).event_time || '';
    const location = (event as any).location || '';

    const safeDescription = (event as any).description
      ? escapeHtml((event as any).description).replace(/\n/g, '<br />')
      : '';

    const notificationHtml = `
      <div style="background:#f5f3ff;border:1px solid #e0e7ff;border-radius:16px;padding:20px;font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;">
          <span style="font-size:26px;">🎉</span>
          <div>
            <p style="margin:0;font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Nuovo evento creato</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1e1b4b;">${escapeHtml(title)}</p>
          </div>
        </div>
        <div style="background:#eef2ff;border-radius:12px;padding:16px;margin-bottom:18px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;color:#312e81;font-size:14px;">
            <span style="font-size:18px;">📅</span>
            <span><strong>Data:</strong> ${escapeHtml(formattedDate)}</span>
          </div>
          ${formattedTime ? `<div style="display:flex;align-items:center;gap:10px;color:#312e81;font-size:14px;"><span style="font-size:18px;">🕒</span><span><strong>Ora:</strong> ${escapeHtml(formattedTime)}</span></div>` : ''}
          ${location ? `<div style="display:flex;align-items:center;gap:10px;color:#312e81;font-size:14px;"><span style="font-size:18px;">📍</span><span><strong>Luogo:</strong> ${escapeHtml(location)}</span></div>` : ''}
        </div>
        ${safeDescription ? `<div style="margin-bottom:18px;"><p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#312e81;">Dettagli evento</p><p style="margin:0;font-size:13px;line-height:1.6;color:#4338ca;">${safeDescription}</p></div>` : ''}
        <div style="margin-top:20px;padding-top:18px;border-top:1px solid #c7d2fe;display:flex;flex-direction:column;gap:8px;">
          <p style="margin:0;font-size:12px;color:#4338ca;">Ricorda di verificare le iscrizioni e condividere l'evento con le società interessate.</p>
          <p style="margin:0;font-size:12px;color:#312e81;">Apri la sezione Eventi della dashboard per consultare tutti i dettagli aggiornati.</p>
        </div>
      </div>
    `;

    const plainText = stripHtml(notificationHtml);

    // Create notification
    const { data: notificationRows, error: notificationError } = await (supabase
      .from('notifications') as any)
      .insert({
        title: `Nuovo Evento: ${title}`,
        body_html: notificationHtml,
        body_text: plainText,
        sent_by: (profile as any).id,
      })
      .select('id, title, body_html, body_text, published_at')
      .limit(1);

    if (notificationError || !notificationRows?.[0]) {
      console.error('[events] Failed to create notification', notificationError);
      // Event was created, but notification failed
      revalidatePath('/dashboard/events');
      return {
        success: true,
        eventId: (event as any).id,
        error: 'Evento creato ma notifica non inviata',
      };
    }

    const notification = notificationRows[0];

    // Get all active users
    const { data: recipientsResult, error: recipientsError } = await (supabase
      .from('profiles') as any)
      .select('id, email, is_active')
      .eq('is_active', true);

    if (recipientsError || !recipientsResult) {
      console.error('[events] Failed to load recipients', recipientsError);
      revalidatePath('/dashboard/events');
      return {
        success: true,
        eventId: (event as any).id,
        notificationId: (notification as any).id,
        error: 'Evento creato ma impossibile inviare notifiche',
      };
    }

    // Create notification recipients
    const recipientRows = (recipientsResult as any[]).map((recipient: any) => ({
      notification_id: (notification as any).id,
      user_id: recipient.id,
    }));

    const { data: insertedRecipients, error: insertRecipientsError } = await (supabase
      .from('notification_recipients') as any)
      .insert(recipientRows)
      .select('id, user_id');

    if (insertRecipientsError) {
      console.error('[events] Failed to insert notification recipients', insertRecipientsError);
      revalidatePath('/dashboard/events');
      return {
        success: true,
        eventId: (event as any).id,
        notificationId: (notification as any).id,
        error: 'Evento creato ma impossibile assegnare notifiche',
      };
    }

    // Send emails
    let emailsSent = 0;
    let emailsFailed = 0;

    const globalEmailEnabled = process.env.NOTIFICATIONS_SEND_EMAILS !== 'false';
    const shouldSendEmails = globalEmailEnabled;

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
            subject: `Nuovo Evento: ${title}`,
            html: notificationHtml,
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

      // Update email status
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
    revalidatePath('/dashboard/events');

    return {
      success: true,
      eventId: (event as any).id,
      notificationId: (notification as any).id,
      recipients: recipientRows.length,
      emailsSent,
      emailsFailed,
    };
  } catch (error) {
    console.error('[events] Unexpected error creating event', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore imprevisto',
    };
  }
}

export async function updateCustomEvent(
  input: UpdateCustomEventInput
): Promise<UpdateCustomEventResult> {
  const supabase = await createServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const currentUser = authData?.user;

  if (!currentUser) {
    return { success: false, error: 'Utente non autenticato' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', currentUser.id)
    .single();

  if (profileError || !profile) {
    console.error('[events] Unable to load profile for update', profileError);
    return { success: false, error: 'Impossibile caricare il profilo' };
  }

  const userRole = (profile as any).role as string | null;
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return { success: false, error: 'Permessi insufficienti' };
  }

  const eventId = input.id;
  const title = input.title?.trim();
  const event_date = input.event_date?.trim();

  if (!eventId) {
    return { success: false, error: 'Evento non valido' };
  }

  if (!title) {
    return { success: false, error: 'Titolo obbligatorio' };
  }

  if (!event_date) {
    return { success: false, error: 'Data evento obbligatoria' };
  }

  const { data: existingEvent, error: existingEventError } = await (supabase
    .from('events') as any)
    .select('id, championship_id')
    .eq('id', eventId)
    .single();

  if (existingEventError || !existingEvent) {
    console.error('[events] Event not found for update', existingEventError);
    return { success: false, error: 'Evento non trovato' };
  }

  if ((existingEvent as any).championship_id) {
    return { success: false, error: 'Puoi modificare solo eventi personalizzati' };
  }

  const sanitizedDescription = input.description
    ? sanitizeHtml(input.description, sanitizeConfig)
    : null;

  try {
    const { error: updateError } = await (supabase
      .from('events') as any)
      .update({
        title,
        description: sanitizedDescription,
        event_date,
        event_time: input.event_time?.trim() || null,
        location: input.location?.trim() || null,
        max_participants: input.max_participants || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('[events] Failed to update event', updateError);
      return { success: false, error: 'Errore durante l\'aggiornamento dell\'evento' };
    }

    revalidatePath('/dashboard/events');

    return { success: true };
  } catch (error) {
    console.error('[events] Unexpected error updating event', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore imprevisto',
    };
  }
}
