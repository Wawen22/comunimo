'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { supabaseAdmin } from '@/lib/api/supabase-server';
import { sendNotificationEmail } from '@/lib/email/sendNotificationEmail';
import type { Database } from '@/types/database';

const payloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().max(255).optional(),
  societyIds: z.array(z.string().uuid()).min(1),
});

function toPlainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim();
}

function escapeHtml(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error('[register.complete] JSON parse failed', error);
    return NextResponse.json({ success: false, error: 'Payload non valido' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Dati registrazione non validi' }, { status: 400 });
  }

  const { userId, email, fullName, societyIds } = parsed.data;

  const { data: supabaseUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (getUserError || !supabaseUser?.user) {
    console.error('[register.complete] User verification failed', getUserError);
    return NextResponse.json({ success: false, error: 'Utente non trovato' }, { status: 404 });
  }

  const authUser = supabaseUser.user;

  if (!authUser.email || authUser.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Mismatch dati utente' }, { status: 403 });
  }

  const metadataSocieties = Array.isArray(authUser.user_metadata?.requested_society_ids)
    ? (authUser.user_metadata.requested_society_ids as string[])
    : [];

  const missingInMetadata = societyIds.some((id) => !metadataSocieties.includes(id));
  if (missingInMetadata) {
    console.warn('[register.complete] Payload societies differ from auth metadata', {
      userId,
      metadataSocieties,
      societyIds,
    });
  }

  const registrantLabel = fullName?.trim() || email;
  const nowIso = new Date().toISOString();

  try {
    let profileUpdated = false;

    for (let attempt = 0; attempt < 6 && !profileUpdated; attempt += 1) {
      const { data: profileRow, error: loadError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (loadError) {
        console.error('[register.complete] Failed loading profile', loadError);
        break;
      }

      if (!profileRow) {
        await wait(400);
        continue;
      }

      const { error: profileError } = await (supabaseAdmin
        .from('profiles') as any)
        .update({
          full_name: fullName?.trim() || null,
          requested_society_ids: societyIds,
          updated_at: nowIso,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('[register.complete] Failed updating profile', profileError);
        throw new Error('Impossibile salvare le società richieste');
      }

      profileUpdated = true;
    }

    if (!profileUpdated) {
      console.error('[register.complete] Profile record not available for user', userId);
      throw new Error('Profilo non disponibile, riprova tra pochi minuti');
    }

    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName?.trim() || null,
        requested_society_ids: societyIds,
      },
    });

    if (metadataError) {
      console.error('[register.complete] Failed updating auth metadata', metadataError);
    }

    const { data: societies, error: societiesError } = await supabaseAdmin
      .from('all_societies')
      .select('id, name, society_code')
      .in('id', societyIds);

    if (societiesError) {
      console.error('[register.complete] Failed loading societies', societiesError);
      throw new Error('Impossibile caricare le società richieste');
    }

    const societiesList = (societies ?? []) as Array<{
      id: string;
      name: string;
      society_code: string | null;
    }>;

    const formattedSocieties = societiesList.map((society) =>
      society.society_code ? `${society.society_code} — ${society.name}` : society.name
    );

    const societiesMarkup = formattedSocieties.length
      ? formattedSocieties
          .map((entry) => `<li style="margin: 4px 0;">${escapeHtml(entry)}</li>`)
          .join('')
      : '<li style="margin: 4px 0;">Nessuna società specificata</li>';

    const notificationTitle = '🆕 Nuova richiesta di registrazione utente';
    const notificationHtml = `
      <div style="background: #f0f9ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 16px; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-size: 22px;">👤</span>
          <div>
            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1e3a8a;">${escapeHtml(registrantLabel)}</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">ha completato la registrazione su ComUniMo</p>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #0f172a;">Ha richiesto l'accesso alle seguenti società:</p>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #1f2937;">
            ${societiesMarkup}
          </ul>
        </div>
        <p style="margin: 0; font-size: 12px; color: #2563eb; font-weight: 500;">⚡ Vai in Gestione Utenti per approvare o assegnare le società.</p>
      </div>
    `;
    const notificationText = toPlainText(notificationHtml);

    const { data: notificationRows, error: notificationError } = await (supabaseAdmin
      .from('notifications') as any)
      .insert({
        title: notificationTitle,
        body_html: notificationHtml,
        body_text: notificationText,
        sent_by: userId,
      })
      .select('id')
      .limit(1);

    if (notificationError) {
      console.error('[register.complete] Failed creating notification', notificationError);
    }

    const notificationId: string | undefined = notificationRows?.[0]?.id;

    const { data: adminProfiles, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .in('role', ['admin', 'super_admin'])
      .eq('is_active', true);

    if (adminError) {
      console.error('[register.complete] Failed loading admin recipients', adminError);
      throw new Error('Impossibile recuperare gli amministratori');
    }

    const adminList = (adminProfiles ?? []) as Array<{
      id: string;
      email: string | null;
    }>;

    if (notificationId && adminList.length > 0) {
      const recipientsPayload = adminList.map((admin) => ({
        notification_id: notificationId,
        user_id: admin.id,
      }));

      const { error: recipientsError, data: recipientsRows } = await (supabaseAdmin
        .from('notification_recipients') as any)
        .insert(recipientsPayload)
        .select('id, user_id');

      if (recipientsError) {
        console.error('[register.complete] Failed assigning recipients', recipientsError);
      } else {
        const shouldSendEmails = process.env.NOTIFICATIONS_SEND_EMAILS !== 'false';
        if (shouldSendEmails) {
          const recipientRows = (recipientsRows ?? []) as Array<{ id: string; user_id: string }>;
          const recipientMap = new Map(recipientRows.map((row) => [row.user_id, row.id] as const));
          const sentIds: string[] = [];
          const failedIds: string[] = [];
          const timestamp = new Date().toISOString();

          for (const admin of adminList) {
            const recipientId = recipientMap.get(admin.id);
            if (!recipientId || !admin.email) {
              if (recipientId) {
                failedIds.push(recipientId);
              }
              continue;
            }

            const emailResult = await sendNotificationEmail({
              to: admin.email,
              subject: notificationTitle,
              html: notificationHtml,
              text: notificationText,
            });

            if (emailResult.success) {
              sentIds.push(recipientId);
            } else {
              failedIds.push(recipientId);
            }
          }

          if (sentIds.length > 0) {
            await (supabaseAdmin
              .from('notification_recipients') as any)
              .update({ email_status: 'sent', email_sent_at: timestamp })
              .in('id', sentIds);
          }

          if (failedIds.length > 0) {
            await (supabaseAdmin
              .from('notification_recipients') as any)
              .update({ email_status: 'failed' })
              .in('id', failedIds);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[register.complete] Unexpected error', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Errore inatteso' },
      { status: 500 }
    );
  }
}
