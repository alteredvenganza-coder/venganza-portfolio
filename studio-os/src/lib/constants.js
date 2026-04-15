// ─── Stages ──────────────────────────────────────────────────────────────────
export const STAGES = [
  'lead',
  'onboarding',
  'in_progress',
  'waiting',
  'review',
  'completed',
  'delivered',
  'archived',
];

export const STAGE_LABELS = {
  lead:        'Lead',
  onboarding:  'Onboarding',
  in_progress: 'In Progress',
  waiting:     'Waiting',
  review:      'Review',
  completed:   'Completed',
  delivered:   'Delivered',
  archived:    'Archived',
};

// Dark-theme badge tints — translucent backgrounds with vivid text
export const STAGE_BG = {
  lead:        'rgba(194,130,40,0.18)',
  onboarding:  'rgba(56,120,220,0.18)',
  in_progress: 'rgba(52,168,83,0.18)',
  waiting:     'rgba(194,160,40,0.18)',
  review:      'rgba(180,50,50,0.18)',
  completed:   'rgba(52,168,83,0.18)',
  delivered:   'rgba(56,120,220,0.18)',
  archived:    'rgba(140,136,132,0.18)',
};

export const STAGE_TEXT = {
  lead:        '#f5c563',
  onboarding:  '#7bb3ff',
  in_progress: '#6dd49e',
  waiting:     '#f5e0a0',
  review:      '#f5a0a3',
  completed:   '#6dd49e',
  delivered:   '#7bb3ff',
  archived:    '#b0acaa',
};

// ─── Project types ────────────────────────────────────────────────────────────
export const PROJECT_TYPES = ['fashion', 'branding', 'edilizia', 'app', 'premade', 'retainer', 'other'];

export const TYPE_LABELS = {
  fashion:   'Fashion',
  branding:  'Branding',
  edilizia:  'Edilizia',
  app:       'App',
  premade:   'Premade',
  retainer:  'Retainer',
  other:     'Other',
};

export const TYPE_BG = {
  fashion:   'rgba(200,60,120,0.18)',
  branding:  'rgba(56,120,220,0.18)',
  edilizia:  'rgba(52,168,83,0.18)',
  app:       'rgba(14,165,233,0.18)',
  premade:   'rgba(234,140,30,0.18)',
  retainer:  'rgba(124,58,237,0.18)',
  other:     'rgba(140,136,132,0.18)',
};

export const TYPE_TEXT = {
  fashion:   '#f5a0c8',
  branding:  '#7bb3ff',
  edilizia:  '#6dd49e',
  app:       '#67d4f8',
  premade:   '#f5c563',
  retainer:  '#c4a5ff',
  other:     '#b0acaa',
};

// ─── Payment status ───────────────────────────────────────────────────────────
export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid'];

export const PAYMENT_LABELS = {
  unpaid:  'Non pagato',
  deposit: 'Acconto pagato',
  paid:    'Saldato',
};

export const PAYMENT_BG = {
  unpaid:  'rgba(180,50,50,0.18)',
  deposit: 'rgba(194,160,40,0.18)',
  paid:    'rgba(52,168,83,0.18)',
};

export const PAYMENT_TEXT = {
  unpaid:  '#f5a0a3',
  deposit: '#f5e0a0',
  paid:    '#6dd49e',
};

// ─── localStorage keys ───────────────────────────────────────────────────────
export const STORAGE_CLIENTS  = 'venganza_clients';
export const STORAGE_PROJECTS = 'venganza_projects';
