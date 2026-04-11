// ─── ID generation ────────────────────────────────────────────────────────────
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isOverdue(deadlineIso) {
  if (!deadlineIso) return false;
  return new Date(deadlineIso) < new Date();
}

export function daysUntil(deadlineIso) {
  if (!deadlineIso) return null;
  const diff = new Date(deadlineIso) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export function formatEur(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Text ──────────────────────────────────────────────────────────────────────
export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}
