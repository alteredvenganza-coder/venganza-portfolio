import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { items } = JSON.parse(event.body);
    if (!items?.length) return { statusCode: 400, body: JSON.stringify({ error: 'No items' }) };

    const line_items = items.map(item => {
      if (item.kind === 'premade') {
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Premade #${item.number}`,
              description: `${item.type === 'premium' ? 'Premium' : item.type === 'legacy' ? 'Archive' : 'Basic'} Pre-made Design`,
              images: item.imageUrl ? [item.imageUrl] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: 1,
        };
      } else {
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.tier ? `${item.title} — ${item.tier}` : item.title,
              description: 'Custom clothing design service · Brief required after payment',
            },
            unit_amount: item.priceCents,
          },
          quantity: 1,
        };
      }
    });

    const origin = event.headers.origin || 'https://alteredvenganza.com';
    const hasPremades = items.some(i => i.kind === 'premade');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}${hasPremades ? '/premades?success=true' : '/?success=true'}`,
      cancel_url: `${origin}/premades`,
      metadata: {
        premade_numbers: items.filter(i => i.kind === 'premade').map(i => i.number).join(','),
        services: items.filter(i => i.kind === 'service').map(i => `${i.title}${i.tier ? ` (${i.tier})` : ''}`).join(', '),
      },
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Cart checkout error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
