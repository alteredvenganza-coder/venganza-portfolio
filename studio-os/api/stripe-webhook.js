import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/stripe-webhook
 * Receives Stripe webhook events and logs completed payments as cashflow entries.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      — Stripe secret key (from Folio project)
 *   STRIPE_WEBHOOK_SECRET  — Webhook signing secret (from Stripe Dashboard)
 *   VITE_SUPABASE_URL      — Supabase project URL
 *   SUPABASE_SERVICE_KEY   — Supabase service role key (not anon key!)
 */

export const config = {
  api: { bodyParser: false }, // Need raw body for Stripe signature verification
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripeKey       = process.env.STRIPE_SECRET_KEY;
  const webhookSecret   = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl     = process.env.VITE_SUPABASE_URL;
  const supabaseService = process.env.SUPABASE_SERVICE_KEY;

  if (!stripeKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe keys not configured' });
  }
  if (!supabaseUrl || !supabaseService) {
    return res.status(500).json({ error: 'Supabase keys not configured' });
  }

  const stripe   = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, supabaseService);

  // Verify Stripe signature
  let event;
  try {
    const rawBody  = await getRawBody(req);
    const sig      = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Only process completed checkout sessions
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, skipped: event.type });
  }

  const session = event.data.object;

  // Extract useful info
  const amount       = (session.amount_total ?? 0) / 100; // cents → euros/dollars
  const currency     = (session.currency ?? 'usd').toUpperCase();
  const premadeNums  = session.metadata?.premade_numbers ?? '';
  const customerEmail = session.customer_details?.email ?? '';
  const customerName  = session.customer_details?.name ?? '';

  // Build description
  const items = premadeNums
    ? `Premade #${premadeNums}`
    : 'Vendita Stripe';
  const desc = customerName
    ? `${items} — ${customerName} (${customerEmail})`
    : `${items}${customerEmail ? ` — ${customerEmail}` : ''}`;

  // Find the Studio OS user (use the first user — single-user CRM)
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users?.users?.[0]?.id;

  if (!userId) {
    console.error('No user found in Supabase');
    return res.status(500).json({ error: 'No user found' });
  }

  // Insert cashflow entry
  const { error: insertErr } = await supabase
    .from('cashflow_entries')
    .insert({
      user_id:     userId,
      type:        'entrata',
      amount:      amount,
      category:    'Vendita prodotto',
      description: desc,
      date:        new Date().toISOString().split('T')[0],
      source:      'stripe',
    });

  if (insertErr) {
    console.error('Failed to insert cashflow entry:', insertErr);
    return res.status(500).json({ error: 'DB insert failed' });
  }

  console.log(`✅ Stripe sale logged: ${amount} ${currency} — ${desc}`);
  return res.status(200).json({ received: true, logged: true, amount, description: desc });
}
