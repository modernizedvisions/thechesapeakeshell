import Stripe from 'stripe';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const createStripeClient = (secretKey: string) =>
  new Stripe(secretKey, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

export const onRequestGet = async (context: {
  params: Record<string, string>;
  env: { STRIPE_SECRET_KEY?: string };
}) => {
  const { params, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return json({ error: 'Stripe is not configured' }, 500);
  }

  const sessionId = params?.id;
  if (!sessionId) {
    return json({ error: 'Missing session ID' }, 400);
  }

  try {
    const stripe = createStripeClient(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        'line_items.data.price.product',
        'payment_intent.payment_method',
        'payment_intent.charges.data.payment_method_details',
        'payment_intent.shipping',
      ],
    });

    const paymentIntent =
      session.payment_intent && typeof session.payment_intent !== 'string'
        ? session.payment_intent
        : null;

    const shippingDetails =
      (session.shipping_details as Stripe.Checkout.Session.ShippingDetails | null) ||
      paymentIntent?.shipping ||
      null;

    const cardFromCharges =
      paymentIntent?.charges?.data?.[0]?.payment_method_details &&
      (paymentIntent.charges.data[0].payment_method_details as any).card
        ? (paymentIntent.charges.data[0].payment_method_details as any).card
        : null;

    const cardFromPaymentMethod =
      paymentIntent?.payment_method && typeof paymentIntent.payment_method !== 'string'
        ? (paymentIntent.payment_method as Stripe.PaymentMethod).card
        : null;

    const cardLast4 = cardFromCharges?.last4 ?? cardFromPaymentMethod?.last4 ?? null;
    const cardBrand = cardFromCharges?.brand ?? cardFromPaymentMethod?.brand ?? null;

    const lineItems =
      session.line_items?.data.map((li) => ({
        productName:
          (li.price?.product &&
          typeof li.price.product !== 'string' &&
          (li.price.product as Stripe.Product).name) ||
          li.description ||
          'Item',
        quantity: li.quantity ?? 0,
        lineTotal: li.amount_total ?? 0,
      })) ?? [];

    const cardLast4 =
      session.payment_intent &&
      typeof session.payment_intent !== 'string' &&
      session.payment_intent.payment_method &&
      typeof session.payment_intent.payment_method !== 'string'
        ? (session.payment_intent.payment_method as any).card?.last4 ?? null
        : null;

    return json({
      id: session.id,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      customer_email: session.customer_details?.email ?? paymentIntent?.receipt_email ?? null,
      shipping: {
        name: shippingDetails?.name ?? session.customer_details?.name ?? null,
        address: shippingDetails?.address ?? null,
      },
      line_items: lineItems,
      card_last4: cardLast4,
      card_brand: cardBrand,
    });
  } catch (error) {
    console.error('Error in checkout session endpoint', error);
    return json({ error: 'Failed to load checkout session' }, 500);
  }
};
