import { useState, useRef, useEffect } from 'react';

export default function AiChat({ onAddCard }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Ciao! Sono MAT AI. Come posso aiutarti con la tua collezione oggi?' },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, 1e9); }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setDraft('');
    setBusy(true);
    try {
      const reply = await callAI(text);
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'bot', text: 'Errore: ' + (e.message || e) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, padding:'12px 14px', gap:8, minHeight:0 }}>
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '88%', padding:'8px 12px', borderRadius: 9,
            background: m.role === 'user' ? 'var(--cv-border2)' : 'var(--cv-text)',
            color:      m.role === 'user' ? 'var(--cv-text)' : 'var(--cv-white)',
            fontSize: 12.5, lineHeight: 1.5,
            borderBottomRightRadius: m.role === 'user' ? 3 : 9,
            borderBottomLeftRadius:  m.role === 'user' ? 9 : 3,
            position: 'relative',
          }}>
            {m.text}
            {m.role === 'bot' && i > 0 && (
              <button onClick={() => onAddCard({ data: { title: '✨ MAT AI', text: m.text } })}
                style={{
                  display:'block', marginTop:6, fontSize:10, padding:'3px 8px',
                  background:'transparent', color:'inherit', opacity:0.7,
                  border:'1px solid currentColor', borderRadius:4, cursor:'pointer',
                }}>+ Aggiungi al canvas</button>
            )}
          </div>
        ))}
        {busy && <div style={{ fontSize: 11, color: 'var(--cv-muted)' }}>MAT AI sta pensando…</div>}
      </div>

      <div style={{ display:'flex', gap:6 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Scrivi a MAT AI…"
          rows={2}
          style={{
            flex:1, resize:'none', border:'1px solid var(--cv-border)', borderRadius:7,
            padding:'7px 9px', fontSize:12, background:'var(--cv-white)',
            color:'var(--cv-text)', outline:'none',
          }}
        />
        <button onClick={send} disabled={busy} style={{
          width:32, height:32, alignSelf:'flex-end',
          background:'var(--cv-gold2)', border:'none', borderRadius:7,
          cursor:'pointer', fontSize:14, color:'var(--cv-text)',
        }}>↑</button>
      </div>
    </div>
  );
}

async function callAI(prompt) {
  // Try the existing analyze-brief endpoint as a generic Claude proxy.
  // If unavailable, fall back to a stubbed response.
  try {
    const res = await fetch('/api/analyze-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: prompt,
        system: 'Sei MAT AI, assistente creativo per brand di moda. Rispondi in italiano, conciso e ispirazionale. Massimo 3 frasi salvo richiesta esplicita.',
      }),
    });
    if (!res.ok) throw new Error('AI endpoint ' + res.status);
    const data = await res.json();
    return data.text || data.response || data.analysis || '(risposta vuota)';
  } catch (e) {
    return `[MAT AI offline] Risposta simulata per: "${prompt.slice(0, 60)}…"`;
  }
}
