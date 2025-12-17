import { sendEmail } from '../../_lib/email';
import type { EmailEnv } from '../../_lib/email';

type TestBody = {
  to?: string;
};

const TEST_SUBJECT = 'New Inquiry – The Chesapeake Shell (Test)';
const TEST_TEXT = 'This is a test email from The Chesapeake Shell.';
const TEST_HTML = `<div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">This is a test email from The Chesapeake Shell.</div>`;
const TEST_ATTACHMENT = {
  filename: 'pixel.png',
  content:
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2N3JkAAAAASUVORK5CYII=',
  contentType: 'image/png',
};

// TODO: Add auth before enabling this endpoint in production.
export async function onRequestPost(context: { request: Request; env: EmailEnv }): Promise<Response> {
  const { request, env } = context;
  const body = (await request.json().catch(() => null)) as TestBody | null;
  const ownerTo = env.RESEND_OWNER_TO || env.EMAIL_OWNER_TO || null;
  const to = body?.to?.trim() || ownerTo || '';

  if (!to) {
    return json({ error: 'Missing to' }, 400);
  }

  const hasKey = !!env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL || env.EMAIL_FROM || 'onboarding@resend.dev';
  if (!hasKey || !from) {
    return json(
      {
        error: 'Email not configured',
        detail: !hasKey ? 'Missing RESEND_API_KEY' : 'Missing sender email',
      },
      500
    );
  }

  const result = await sendEmail(
    {
      to,
      subject: TEST_SUBJECT,
      text: TEST_TEXT,
      html: TEST_HTML,
      attachments: [TEST_ATTACHMENT],
    },
    env
  );

  if (!result.ok) {
    return json({ error: 'Failed to send email', detail: result.error }, 500);
  }

  return json({ success: true, to, from, resendId: (result as any).id });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
