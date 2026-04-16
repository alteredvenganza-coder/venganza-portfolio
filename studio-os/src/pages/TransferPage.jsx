import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, Clock, Send } from 'lucide-react';
import { getDelivery } from '../lib/db';

const BG_IMAGES = [
  '/transfer-bg/1.png',
  '/transfer-bg/2.png',
  '/transfer-bg/3.png',
  '/transfer-bg/4.png',
  '/transfer-bg/5.png',
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

export default function TransferPage() {
  const { token } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [bgIdx, setBgIdx]       = useState(0);

  useEffect(() => {
    if (!token) { setError('Link non valido.'); setLoading(false); return; }
    getDelivery(token)
      .then(data => {
        if (new Date(data.expires_at) < new Date()) {
          setError('Questo link di trasferimento è scaduto.');
        } else {
          setTransfer(data);
        }
      })
      .catch(() => setError('Link non trovato o scaduto.'))
      .finally(() => setLoading(false));
  }, [token]);

  // Background carousel — rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIdx(prev => (prev + 1) % BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const files    = transfer?.files ?? [];
  const daysLeft = transfer
    ? Math.ceil((new Date(transfer.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div style={{
      minHeight:     '100vh',
      position:      'relative',
      overflow:      'hidden',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      justifyContent:'center',
      padding:       '40px 20px',
      fontFamily:    'Georgia, serif',
    }}>

      {/* ── Background carousel ── */}
      {BG_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          style={{
            position:        'absolute',
            inset:           0,
            width:           '100%',
            height:          '100%',
            objectFit:       'cover',
            objectPosition:  'center top',
            opacity:         i === bgIdx ? 1 : 0,
            transition:      'opacity 1.2s ease-in-out',
            zIndex:          0,
          }}
        />
      ))}

      {/* Dark overlay */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex:     1,
      }} />

      {/* Carousel dots */}
      <div style={{
        position:      'fixed',
        bottom:        20,
        left:          '50%',
        transform:     'translateX(-50%)',
        display:       'flex',
        gap:           8,
        zIndex:        10,
      }}>
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setBgIdx(i)}
            style={{
              width:        i === bgIdx ? 20 : 8,
              height:       8,
              borderRadius: 4,
              background:   i === bgIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              border:       'none',
              cursor:       'pointer',
              transition:   'all 0.3s ease',
              padding:      0,
            }}
          />
        ))}
      </div>

      {/* Studio label */}
      <p style={{
        fontSize:      11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color:         'rgba(255,255,255,0.6)',
        marginBottom:  10,
        textAlign:     'center',
        position:      'relative',
        zIndex:        2,
        textShadow:    '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        Altered Venganza
      </p>

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, position: 'relative', zIndex: 2 }}>
          Caricamento...
        </p>
      )}

      {!loading && error && (
        <div style={glassCard}>
          <AlertCircle size={28} color="#f5e8e8" style={{ marginBottom: 12 }} />
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Link non disponibile
          </p>
          <p style={{ color: '#fff', fontSize: 15 }}>{error}</p>
        </div>
      )}

      {!loading && transfer && (
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 540, width: '100%' }}>

          {/* Icon */}
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            marginBottom:   16,
          }}>
            <div style={{
              width:          48,
              height:         48,
              borderRadius:   '50%',
              background:     'rgba(123,31,36,0.35)',
              border:         '1px solid rgba(123,31,36,0.5)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <Send size={20} color="rgba(255,255,255,0.9)" />
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize:      28,
            fontWeight:    700,
            color:         '#fff',
            textAlign:     'center',
            marginBottom:  8,
            letterSpacing: '0.02em',
            textShadow:    '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {transfer.title}
          </h1>

          {/* Summary */}
          <p style={{
            textAlign:    'center',
            fontSize:     13,
            color:        'rgba(255,255,255,0.55)',
            marginBottom: 28,
            fontFamily:   'sans-serif',
          }}>
            {files.length} {files.length === 1 ? 'file' : 'file'}
            {totalSize > 0 && ` \u00B7 ${formatBytes(totalSize)}`}
          </p>

          {/* Glass card */}
          <div style={glassCard}>

            {/* Message */}
            {transfer.message && (
              <p style={{
                color:        'rgba(255,255,255,0.85)',
                fontSize:     14,
                lineHeight:   1.7,
                whiteSpace:   'pre-wrap',
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontFamily:   'sans-serif',
              }}>
                {transfer.message}
              </p>
            )}

            {/* Files label */}
            <p style={{
              fontSize:      11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.4)',
              marginBottom:  12,
              fontFamily:    'sans-serif',
            }}>
              File disponibili
            </p>

            {/* File list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {files.map((file, i) => (
                <div key={i} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          12,
                  padding:      '12px 14px',
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}>
                  <FileText size={16} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize:     14,
                      fontWeight:   500,
                      color:        '#fff',
                      margin:       0,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                      fontFamily:   'sans-serif',
                    }}>
                      {file.name}
                    </p>
                    {file.size > 0 && (
                      <p style={{
                        fontSize:   11,
                        color:      'rgba(255,255,255,0.35)',
                        fontFamily: 'monospace',
                        margin:     '3px 0 0',
                      }}>
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
                      display:        'inline-flex',
                      alignItems:     'center',
                      gap:            6,
                      padding:        '8px 16px',
                      background:     '#7b1f24',
                      color:          '#fff',
                      borderRadius:   6,
                      fontSize:       13,
                      fontWeight:     600,
                      textDecoration: 'none',
                      flexShrink:     0,
                      fontFamily:     'sans-serif',
                      transition:     'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#942529'}
                    onMouseLeave={e => e.currentTarget.style.background = '#7b1f24'}
                  >
                    <Download size={13} />
                    Scarica
                  </a>
                </div>
              ))}
            </div>

            {/* Expiry */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        6,
              paddingTop: 14,
              borderTop:  '1px solid rgba(255,255,255,0.08)',
            }}>
              <Clock size={11} color="rgba(255,255,255,0.3)" />
              <span style={{
                fontSize:   11,
                color:      'rgba(255,255,255,0.35)',
                fontFamily: 'monospace',
              }}>
                {daysLeft > 0
                  ? `Scade il ${formatDate(transfer.expires_at)} (tra ${daysLeft} giorni)`
                  : 'Scade oggi'
                }
              </span>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            marginTop: 24,
            fontSize:  12,
            color:     'rgba(255,255,255,0.3)',
            textAlign: 'center',
          }}>
            Inviato tramite <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Venganza OS</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Glassmorphism card style ─────────────────────────────────────────────────
const glassCard = {
  background:           'rgba(255,255,255,0.08)',
  backdropFilter:       'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border:               '1px solid rgba(255,255,255,0.12)',
  borderRadius:         14,
  padding:              '28px 32px',
  boxShadow:            '0 8px 32px rgba(0,0,0,0.4)',
  position:             'relative',
  zIndex:               1,
};
