import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SERVICE_PRICES = {
  'Packaging Design & Development': { priceCents: 90000, label: 'Packaging Design & Development — Starting From €900' },
  'Clothing Brand': { priceCents: 350000, label: 'Clothing Brand Identity — Starting From €3,500' },
  'Drop Starter': { priceCents: 90000, label: 'Drop Starter Package — Starting From €900' },
  'RETAINER': { priceCents: 60000, label: 'Monthly Retainer — Starting From €600' },
  'Premade Design': { priceCents: 15000, label: 'Premade Design — Starting From €150' },
  'Tailored Design': { priceCents: 19000, label: 'Tailored Design — Starting From €190' },
  'E-commerce Visual Asset': {
    options: { 'Single View': 4500, 'Custom View': 6000, '360°': 14000 },
    label: 'E-commerce Visual Asset',
  },
  'Techpack': {
    options: { 'One Page': 7000, 'Full Techpack': 17000 },
    label: 'Techpack',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { service, tier, name, email, brand, instagram, brief, referenceLinks, fileNames } = req.body;

    const def = SERVICE_PRICES[service];
    if (!def) return res.status(400).json({ error: 'Unknown service' });

    let priceCents, productName;

    if (def.options && tier) {
      const tierKey = Object.keys(def.options).find(k => tier.includes(k));
      priceCents = tierKey ? def.options[tierKey] : Object.values(def.options)[0];
      productName = `${service} — ${tierKey || 'Standard'}`;
    } else {
      priceCents = def.priceCents;
      productName = def.label;
    }

    const origin = req.headers.origin || 'https://alteredvenganza.com';
    const encodedId = encodeURIComponent(service);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: `Brand: ${brand}${instagram ? ` · @${instagram}` : ''}`,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/service/${encodedId}/order?success=true`,
      cancel_url: `${origin}/service/${encodedId}/order`,
      metadata: {
        service,
        tier: tier || '',
        client_name: name,
        email,
        brand,
        instagram: instagram || '',
        brief: (brief || '').slice(0, 490),
        reference_links: (referenceLinks || '').slice(0, 490),
        file_names: (fileNames || []).slice(0, 6).join(', '),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Service checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
