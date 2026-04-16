import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, displayName, inviteCode } = req.body;

  if (!email || !password || !inviteCode) {
    return res.status(400).json({ error: 'Campi obbligatori: email, password, inviteCode' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Variabili Supabase non configurate' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Validate invite code exists and hasn't been used
    const { data: invite, error: invErr } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode.toUpperCase())
      .is('used_by', null)
      .single();

    if (invErr || !invite) {
      return res.status(400).json({ error: 'Codice invito non valido o già utilizzato.' });
    }

    // 2. Check max 5 guests
    const { count, error: countErr } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'guest');

    if (!countErr && count >= 5) {
      return res.status(400).json({ error: 'Limite massimo di 5 utenti ospiti raggiunto.' });
    }

    // 3. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authErr) {
      return res.status(400).json({ error: authErr.message });
    }

    const userId = authData.user.id;

    // 4. Create user_profile with role='guest'
    const { error: profErr } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: displayName || email.split('@')[0],
        role: 'guest',
        invite_code_id: invite.id,
      });

    if (profErr) {
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Errore creazione profilo: ' + profErr.message });
    }

    // 5. Mark invite code as used
    await supabase
      .from('invite_codes')
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq('id', invite.id);

    return res.status(200).json({ success: true, userId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
