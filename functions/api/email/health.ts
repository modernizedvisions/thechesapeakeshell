import type { EmailEnv } from '../../_lib/email';

type Env = EmailEnv;

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { env } = context;
  const hasResendKey = !!env.RESEND_API_KEY;
  const hasFrom = !!env.EMAIL_FROM;
  const hasOwnerTo = !!env.EMAIL_OWNER_TO;
  const hasSiteUrl = !!env.PUBLIC_SITE_URL;

  return new Response(
    JSON.stringify({
      ok: true,
      hasResendKey,
      hasFrom,
      hasOwnerTo,
      hasSiteUrl,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

