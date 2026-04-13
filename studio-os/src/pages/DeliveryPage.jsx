import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, Clock } from 'lucide-react';
import { getDelivery } from '../lib/db';

// ── Curated background images ─────────────────────────────────────────────────
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7d3?w=1920&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  'https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=1920&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80',
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function DeliveryPage() {
  const { token } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [bgIndex,  setBgIndex]  = useState(0);
  const [fading,   setFading]   = useState(false);

  // ── Carousel ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setBgIndex(i => (i + 1) % BG_IMAGES.length);
        setFading(false);
      }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch delivery ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setError('Link non valido.'); setLoading(false); return; }
    getDelivery(token)
      .then(data => {
        if (new Date(data.expires_at) < new Date()) {
          setError('Questo link è scaduto.');
        } else {
          setDelivery(data);
        }
      })
      .catch(() => setError('Link non trovato o scaduto.'))
      .finally(() => setLoading(false));
  }, [token]);

  const files    = delivery?.files ?? [];
  const daysLeft = delivery
    ? Math.ceil((new Date(delivery.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── Background carousel ─────────────────────────────────────────────── */}
      {BG_IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position:   'absolute',
            inset:      0,
            backgroundImage:    `url(${src})`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
            opacity:    i === bgIndex ? (fading ? 0 : 1) : 0,
            transition: 'opacity 0.7s ease-in-out',
            zIndex:     0,
          }}
        />
      ))}

      {/* ── Dark overlay ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1,
      }} />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{
        position:       'relative',
        zIndex:         2,
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '40px 20px',
        fontFamily:     'Georgia, serif',
      }}>

        {/* Studio label */}
        <p style={{
          fontSize:       11,
          letterSpacing:  '0.14em',
          textTransform:  'uppercase',
          color:          'rgba(255,255,255,0.7)',
          marginBottom:   10,
          textAlign:      'center',
        }}>
          Altered Venganza
        </p>

        {loading && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Caricamento…</p>
        )}

        {!loading && error && (
          <div style={glass}>
            <AlertCircle size={28} color="#f5e8e8" style={{ marginBottom: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Link non disponibile
            </p>
            <p style={{ color: '#fff', fontSize: 15 }}>{error}</p>
          </div>
        )}

        {!loading && delivery && (
          <>
            {/* Title */}
            <h1 style={{
              fontSize:    28,
              fontWeight:  700,
              color:       '#fff',
              textAlign:   'center',
              marginBottom: 24,
              letterSpacing: '0.02em',
              textShadow:  '0 2px 12px rgba(0,0,0,0.4)',
            }}>
              {delivery.title}
            </h1>

            {/* Glass card */}
            <div style={{ ...glass, maxWidth: 540, width: '100%' }}>

              {/* Message */}
              {delivery.message && (
                <p style={{
                  color:      'rgba(255,255,255,0.9)',
                  fontSize:   15,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {delivery.message}
                </p>
              )}

              {/* Files label */}
              <p style={{
                fontSize:      11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.5)',
                marginBottom:  12,
              }}>
                {files.length} {files.length === 1 ? 'file' : 'file'}
              </p>

              {/* File list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {files.map((file, i) => (
                  <div key={i} style={{
                    display:         'flex',
                    alignItems:      'center',
                    gap:             12,
                    padding:         '12px 14px',
                    background:      'rgba(255,255,255,0.08)',
                    border:          '1px solid rgba(255,255,255,0.15)',
                    borderRadius:    8,
                  }}>
                    <FileText size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize:     14,
                        fontWeight:   500,
                        color:        '#fff',
                        margin:       0,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                      }}>
                        {file.name}
                      </p>
                      {file.size > 0 && (
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', margin: '3px 0 0' }}>
                          {formatBytes(file.size)}
                        </p>
                      )}
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display:         'inline-flex',
                        alignItems:      'center',
                        gap:             6,
                        padding:         '8px 16px',
                        background:      '#7b1f24',
                        color:           '#fff',
                        borderRadius:    6,
                        fontSize:        13,
                        fontWeight:      600,
                        textDecoration:  'none',
                        flexShrink:      0,
                        fontFamily:      'sans-serif',
                        transition:      'background 0.2s',
                      }}
                    >
                      <Download size={13} />
                      Scarica
                    </a>
                  </div>
                ))}
              </div>

              {/* Expiry */}
              <div style={{
                display:     'flex',
                alignItems:  'center',
                gap:         6,
                paddingTop:  14,
                borderTop:   '1px solid rgba(255,255,255,0.12)',
              }}>
                <Clock size={11} color="rgba(255,255,255,0.35)" />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {daysLeft > 0
                    ? `Scade il ${formatDate(delivery.expires_at)} (tra ${daysLeft} giorni)`
                    : 'Scade oggi'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              Inviato da <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Altered Venganza</strong>
            </p>
          </>
        )}
      </div>

      {/* ── Carousel dots ────────────────────────────────────────────────────── */}
      <div style={{
        position:       'absolute',
        bottom:         24,
        left:           '50%',
        transform:      'translateX(-50%)',
        display:        'flex',
        gap:            8,
        zIndex:         3,
      }}>
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setBgIndex(i)}
            style={{
              width:        i === bgIndex ? 24 : 8,
              height:       8,
              borderRadius: 4,
              background:   i === bgIndex ? '#fff' : 'rgba(255,255,255,0.35)',
              border:       'none',
              cursor:       'pointer',
              padding:      0,
              transition:   'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Glassmorphism style ───────────────────────────────────────────────────────
const glass = {
  background:    'rgba(255,255,255,0.12)',
  backdropFilter:'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:        '1px solid rgba(255,255,255,0.2)',
  borderRadius:  14,
  padding:       '28px 32px',
  boxShadow:     '0 8px 32px rgba(0,0,0,0.3)',
};
