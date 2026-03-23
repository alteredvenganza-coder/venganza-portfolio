import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Premade #${item.number}`,
          description: `${item.type === 'premium' ? 'Premium' : item.type === 'legacy' ? 'Archive' : 'Basic'} Pre-made Design`,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: item.price * 100,
      },
      quantity: 1,
    }));

    const origin = req.headers.origin || req.headers.referer || 'https://alteredvenganza.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/premades?success=true`,
      cancel_url: `${origin}/premades?canceled=true`,
      metadata: {
        premade_numbers: items.map((i) => i.number).join(','),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
