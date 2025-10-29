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

    // Build notification HTML (without title since it's shown in DialogTitle)
    let notificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
          ${formattedTime ? `<p style="margin: 0 0 12px 0;"><strong>🕐 Ora:</strong> ${formattedTime}</p>` : ''}
          ${location ? `<p style="margin: 0 0 12px 0;"><strong>📍 Località:</strong> ${location}</p>` : ''}
        </div>
    `;

    if ((event as any).description) {
      notificationHtml += `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 8px;">Descrizione</h3>
          <p style="color: #6b7280; line-height: 1.6;">${(event as any).description}</p>
        </div>
      `;
    }

    notificationHtml += `
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Accedi alla dashboard per maggiori dettagli sull'evento.
          </p>
        </div>
      </div>
    `;

    const sanitizedHtml = sanitizeHtml(notificationHtml, sanitizeConfig);
    const plainText = stripHtml(sanitizedHtml);

    // Create notification
    const { data: notificationRows, error: notificationError } = await (supabase
      .from('notifications') as any)
      .insert({
        title: `Nuovo Evento: ${title}`,
        body_html: sanitizedHtml,
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
