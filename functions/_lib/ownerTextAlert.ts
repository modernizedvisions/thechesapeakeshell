import { sendEmail, type EmailEnv } from './email';

type OwnerTextEnv = EmailEnv & {
  OWNER_TEXT_ENABLED?: string;
  OWNER_TEXT_TO?: string;
  OWNER_TEXT_SUBJECT?: string;
  OWNER_TEXT_FROM?: string;
};

type OwnerTextAlertParams = {
  env: OwnerTextEnv;
  orderNumber: string;
  totalLabel: string;
  adminUrl: string;
};

export function formatOwnerTextAlert(params: OwnerTextAlertParams): { subject: string; text: string } {
  const subject = (params.env.OWNER_TEXT_SUBJECT || '').trim() || 'New Order';
  const orderNumber = params.orderNumber.trim();
  const totalLabel = params.totalLabel.trim();
  const adminUrl = params.adminUrl || '/admin';
  const text = `New Order ${orderNumber} ${totalLabel} View now in admin ${adminUrl}`;

  return { subject, text };
}

export function shouldSendOwnerText(env: OwnerTextEnv): boolean {
  if (env.OWNER_TEXT_ENABLED !== 'true') return false;
  const to = (env.OWNER_TEXT_TO || '').trim();
  return to.includes('@');
}

export async function sendOwnerText(
  env: OwnerTextEnv,
  message: { subject: string; text: string; orderNumber?: string }
): Promise<void> {
  const to = (env.OWNER_TEXT_TO || '').trim();
  if (!to) return;

  const maskedTo = maskRecipient(to);
  console.log('[owner-text] sending', {
    to: maskedTo,
    orderNumber: message.orderNumber,
  });

  const sendEnv = resolveOwnerTextEnv(env);

  try {
    const result = await sendEmail(
      {
        to,
        subject: message.subject,
        text: message.text,
        logTo: maskedTo,
      },
      sendEnv
    );

    if (!result.ok) {
      console.error('[owner-text] failed', result.error);
    }
  } catch (err) {
    console.error('[owner-text] failed', err);
  }
}

function resolveOwnerTextEnv(env: OwnerTextEnv): EmailEnv {
  const ownerFrom = (env.OWNER_TEXT_FROM || '').trim();
  if (!ownerFrom) return env;
  return {
    ...env,
    RESEND_FROM: ownerFrom,
    RESEND_FROM_EMAIL: ownerFrom,
    EMAIL_FROM: ownerFrom,
  };
}

function maskRecipient(value: string): string {
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) {
    return `${trimmed.slice(0, 2)}***`;
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const localPrefix = local.slice(0, 2);
  const safePrefix = localPrefix || '**';
  return `${safePrefix}***@${domain}`;
}
