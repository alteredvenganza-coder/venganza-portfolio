import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items' });

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

    const origin = req.headers.origin || 'https://alteredvenganza.com';
    const hasPremades = items.some(i => i.kind === 'premade');
    const successPath = hasPremades ? '/premades?success=true' : '/?success=true';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/premades`,
      metadata: {
        premade_numbers: items.filter(i => i.kind === 'premade').map(i => i.number).join(','),
        services: items.filter(i => i.kind === 'service').map(i => `${i.title}${i.tier ? ` (${i.tier})` : ''}`).join(', '),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Cart checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
