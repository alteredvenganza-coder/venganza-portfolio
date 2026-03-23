const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { items, successUrl, cancelUrl } = JSON.parse(event.body);

    if (!items || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No items provided' }) };
    }

    // Build line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Premade #${item.number}`,
          description: `${item.type === 'premium' ? 'Premium' : item.type === 'legacy' ? 'Archive' : 'Basic'} Pre-made Design`,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: item.price * 100, // Stripe uses cents
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl || `${event.headers.origin}/premades?success=true`,
      cancel_url: cancelUrl || `${event.headers.origin}/premades?canceled=true`,
      metadata: {
        premade_numbers: items.map((i) => i.number).join(','),
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
