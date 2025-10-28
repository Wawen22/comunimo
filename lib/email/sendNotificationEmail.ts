import { getMailer } from './mailer';

export interface NotificationEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendNotificationEmail(
  email: NotificationEmail
): Promise<{ success: boolean; error?: string }>
{
  const mailer = await getMailer();
  if (!mailer) {
    console.error('[sendNotificationEmail] SMTP configuration missing');
    return {
      success: false,
      error: 'SMTP configuration missing',
    };
  }

  console.log('[sendNotificationEmail] Sending email to:', email.to);

  try {
    const info = await mailer.transporter.sendMail({
      from: mailer.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    console.log('[sendNotificationEmail] Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      to: email.to,
    });
    return { success: true };
  } catch (error) {
    console.error('[sendNotificationEmail] Failed to send email to', email.to, ':', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
