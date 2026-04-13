import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, AlertCircle, Clock } from 'lucide-react';
import { getDelivery } from '../lib/db';

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
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

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

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.subtle}>Caricamento…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <AlertCircle size={32} color="#7b1f24" style={{ marginBottom: 12 }} />
          <p style={{ ...styles.label, color: '#7b1f24', marginBottom: 8 }}>Link non disponibile</p>
          <p style={styles.body}>{error}</p>
        </div>
      </div>
    );
  }

  const files = delivery.files ?? [];
  const daysLeft = Math.ceil((new Date(delivery.expires_at) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.studio}>Altered Venganza</p>
        <h1 style={styles.title}>{delivery.title}</h1>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Message */}
        {delivery.message && (
          <p style={{ ...styles.body, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
            {delivery.message}
          </p>
        )}

        {/* Files */}
        <p style={{ ...styles.label, marginBottom: 12 }}>
          {files.length} {files.length === 1 ? 'file' : 'file'}
        </p>

        <div style={styles.fileList}>
          {files.map((file, i) => (
            <div key={i} style={styles.fileRow}>
              <FileText size={16} color="#7b7270" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.fileName}>{file.name}</p>
                {file.size > 0 && (
                  <p style={styles.fileMeta}>{formatBytes(file.size)}</p>
                )}
              </div>
              <a
                href={file.url}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                style={styles.downloadBtn}
              >
                <Download size={14} />
                Scarica
              </a>
            </div>
          ))}
        </div>

        {/* Expiry */}
        <div style={styles.expiry}>
          <Clock size={12} color="#999" />
          <span style={styles.expiryText}>
            {daysLeft > 0
              ? `Scade il ${formatDate(delivery.expires_at)} (tra ${daysLeft} giorni)`
              : 'Scade oggi'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        Inviato da <strong>Altered Venganza</strong>
      </p>
    </div>
  );
}

// ── Inline styles (nessun Tailwind — pagina pubblica standalone) ──────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f9f7f4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'Georgia, serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  studio: {
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#7b1f24',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 600,
    color: '#1a1a1a',
    margin: 0,
  },
  card: {
    background: '#fff',
    border: '1px solid #e8e4dc',
    borderRadius: 10,
    padding: '28px 32px',
    width: '100%',
    maxWidth: 560,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  label: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#7b7270',
    margin: 0,
  },
  body: {
    fontSize: 15,
    color: '#444',
    lineHeight: 1.6,
    margin: 0,
  },
  subtle: {
    fontSize: 13,
    color: '#999',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    background: '#f9f7f4',
    borderRadius: 8,
    border: '1px solid #e8e4dc',
  },
  fileName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a1a',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileMeta: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    margin: '2px 0 0',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    background: '#7b1f24',
    color: '#fff',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    flexShrink: 0,
    fontFamily: 'sans-serif',
  },
  expiry: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    borderTop: '1px solid #e8e4dc',
  },
  expiryText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
};
