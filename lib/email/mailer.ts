import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function ensureConfig() {
  const host = getEnv('SMTP_HOST');
  const port = getEnv('SMTP_PORT');
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(port),
    auth: {
      user,
      pass,
    },
    secure: getEnv('SMTP_SECURE') === 'true',
    from: getEnv('SMTP_FROM') ?? user,
  };
}

export interface MailerConfig {
  transporter: Transporter;
  from: string;
}

export async function getMailer(): Promise<MailerConfig | null> {
  if (transporter) {
    const from = getEnv('SMTP_FROM') ?? getEnv('SMTP_USER') ?? '';
    return { transporter, from };
  }

  const config = ensureConfig();
  if (!config) {
    console.warn('[mailer] SMTP configuration missing; email delivery disabled');
    return null;
  }

  console.log('[mailer] Initializing SMTP with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    from: config.from,
  });

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? config.port === 465,
    auth: config.auth,
  });

  try {
    await transporter.verify();
    console.log('[mailer] SMTP connection verified successfully');
  } catch (error) {
    console.error('[mailer] SMTP verification failed:', error);
    // Don't return null, let's try to send anyway
  }

  return { transporter, from: config.from };
}
