import { supabase } from './supabase';

// ── Auto-categorization from Revolut description / merchant ───────────────────

const KEYWORD_RULES = [
  { match: ['mcdonald', 'burger king', 'kfc', 'subway', 'pizza', 'sushi', 'poke', 'deliveroo', 'glovo', 'just eat', 'wolt', 'ubereats', 'uber eats', 'ristorante', 'trattoria', 'osteria', 'bar ', 'caffe', 'coffee', 'starbucks', 'panino', 'gelateria', 'pasticceria', 'bakery'], category: 'Ristoranti & Food' },
  { match: ['supermercato', 'esselunga', 'conad', 'carrefour', 'lidl', 'coop', 'aldi', 'penny', 'pam ', 'eurospin', 'bennet', 'ipercoop', 'despar', 'spesa', 'grocery', 'tesco', 'rewe', 'edeka'], category: 'Spesa alimentare' },
  { match: ['netflix', 'spotify', 'amazon prime', 'disney+', 'disney plus', 'apple tv', 'dazn', 'sky q', 'youtube premium', 'paramount', 'crunchyroll', 'twitch', 'hbo'], category: 'Abbonamenti' },
  { match: ['figma', 'adobe', 'notion', 'slack', 'github', 'vercel', 'supabase', 'openai', 'anthropic', 'midjourney', 'canva', 'zapier', 'mailchimp', 'shopify', 'webflow', 'framer', 'linear', 'loom', 'dropbox', 'google workspace', 'microsoft 365', 'namecheap', 'godaddy', 'cloudflare', 'aws', 'digitalocean', 'netlify'], category: 'Software & Tools' },
  { match: ['uber', 'taxi', 'trenitalia', 'italo', 'frecciarossa', 'ryanair', 'easyjet', 'wizz', 'vueling', 'ita airways', 'autobus', 'atm ', 'atac', 'metro', 'autostrada', 'telepass', 'q8', 'eni ', 'ip ', 'tamoil', 'carburante', 'benzina', 'agip', 'shell'], category: 'Trasporti' },
  { match: ['amazon', 'ebay', 'zalando', 'asos', 'h&m', 'zara', 'ikea', 'unieuro', 'mediaworld', 'mediamarkt', 'euronics', 'decathlon', 'nike', 'adidas', 'apple store', 'primark', 'shein', 'aliexpress'], category: 'Shopping' },
  { match: ['farmacia', 'dottore', 'medico', 'dentista', 'clinica', 'ospedale', 'visita', 'analisi', 'salute', 'pharmacy', 'doctor', 'hospital'], category: 'Salute & Farmacia' },
  { match: ['affitto', 'rent', 'condominio', 'luce', 'enel', 'a2a', 'eni gas', 'sorgenia', 'tim ', 'vodafone', 'wind', 'fastweb', 'iliad', 'internet casa', 'bolletta', 'acqua', 'hera', 'acea', 'iren'], category: 'Casa & Utenze' },
  { match: ['palestra', 'gym', 'fitness', 'cinema', 'teatro', 'museo', 'sport', 'steam', 'nintendo', 'playstation', 'xbox', 'ps5', 'ps store', 'epic games', 'concert', 'evento', 'livenation', 'ticketmaster', 'viagogo'], category: 'Svago & Sport' },
  { match: ['f24', 'irpef', ' iva ', 'inps', 'agenzia entrate', 'tasse', 'tributi', 'acconto fiscale', 'commercialista', 'caf ', 'consulenza contabile'], category: 'Fisco & Tasse' },
  { match: ['formazione', 'udemy', 'coursera', 'masterclass', 'skillshare', 'domestika', 'conference', 'conferenza', 'workshop', 'corso', 'libro', 'book', 'feltrinelli', 'ibs '], category: 'Formazione' },
  { match: ['marketing', 'facebook ads', 'google ads', 'instagram ads', 'meta ads', 'tiktok ads', 'advertising', 'pubblicità'], category: 'Marketing' },
];

export function autoCategorize(description = '', merchant = '') {
  const text = `${description} ${merchant}`.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.match.some(k => text.includes(k))) return rule.category;
  }
  return 'Altro';
}

// ── Category lists ─────────────────────────────────────────────────────────────

export const CATEGORIES_ENTRATA = [
  'Fattura cliente', 'Acconto', 'Saldo', 'Retainer mensile',
  'Vendita prodotto', 'Rimborso', 'Stipendio', 'Altro',
];

export const CATEGORIES_USCITA = [
  // Business
  'Software & Tools', 'Marketing', 'Attrezzatura', 'Formazione', 'Fisco & Tasse',
  // Personale
  'Ristoranti & Food', 'Spesa alimentare', 'Shopping', 'Trasporti',
  'Casa & Utenze', 'Salute & Farmacia', 'Svago & Sport', 'Abbonamenti',
  'Altro',
];

// ── DB helpers ─────────────────────────────────────────────────────────────────

function entryFromDb(row) {
  return {
    id:          row.id,
    type:        row.type,
    amount:      Number(row.amount),
    category:    row.category    ?? '',
    description: row.description ?? '',
    date:        row.date,
    source:      row.source      ?? 'manual',
    revolutId:   row.revolut_id  ?? null,
    createdAt:   row.created_at,
  };
}

export async function fetchEntries(userId) {
  const { data, error } = await supabase
    .from('cashflow_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(entryFromDb);
}

export async function insertEntry(userId, entry) {
  const { data, error } = await supabase
    .from('cashflow_entries')
    .insert({
      user_id:     userId,
      type:        entry.type,
      amount:      Number(entry.amount),
      category:    entry.category    || null,
      description: entry.description || null,
      date:        entry.date,
      source:      'manual',
    })
    .select()
    .single();
  if (error) throw error;
  return entryFromDb(data);
}

export async function upsertRevolutEntries(userId, transactions) {
  if (!transactions.length) return [];

  const rows = transactions
    .filter(t => t.state === 'completed')
    .map(t => {
      const desc    = t.description || t.merchant?.name || t.counterpart?.name || '';
      const isIn    = Number(t.amount) >= 0;
      const cat     = isIn ? 'Rimborso' : autoCategorize(desc, t.merchant?.name ?? '');
      return {
        user_id:     userId,
        type:        isIn ? 'entrata' : 'uscita',
        amount:      Math.abs(Number(t.amount)),
        category:    cat,
        description: desc,
        date:        (t.completed_at || t.created_at || '').split('T')[0],
        source:      'revolut',
        revolut_id:  t.id,
      };
    })
    .filter(r => r.date && r.amount > 0);

  if (!rows.length) return [];

  const { data, error } = await supabase
    .from('cashflow_entries')
    .upsert(rows, { onConflict: 'revolut_id' })
    .select();
  if (error) throw error;
  return (data ?? []).map(entryFromDb);
}

export async function updateEntry(id, patch) {
  const { data, error } = await supabase
    .from('cashflow_entries')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return entryFromDb(data);
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from('cashflow_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
