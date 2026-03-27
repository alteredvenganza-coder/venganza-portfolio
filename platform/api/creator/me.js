// GET /api/creator/me — get current creator's profile
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data, error: dbError } = await supabase
    .from('creators')
    .select('*')
    .eq('id', user.id)
    .single();

  if (dbError) return res.status(500).json({ error: dbError.message });
  return res.status(200).json(data);
}
