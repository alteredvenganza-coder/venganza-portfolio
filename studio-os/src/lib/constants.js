// ─── Stages ──────────────────────────────────────────────────────────────────
export const STAGES = [
  'lead',
  'onboarding',
  'in_progress',
  'waiting',
  'review',
  'completed',
];

export const STAGE_LABELS = {
  lead:        'Lead',
  onboarding:  'Onboarding',
  in_progress: 'In Progress',
  waiting:     'Waiting',
  review:      'Review',
  completed:   'Completed',
};

// Warm, light background tints — no dark/gray
export const STAGE_BG = {
  lead:        '#fdf3e3',
  onboarding:  '#e8f0fe',
  in_progress: '#e6f4ea',
  waiting:     '#fff8e1',
  review:      '#fce8e6',
  completed:   '#e6f4ea',
};

export const STAGE_TEXT = {
  lead:        '#7a4f10',
  onboarding:  '#1a56db',
  in_progress: '#276749',
  waiting:     '#7a6010',
  review:      '#7b1f24',
  completed:   '#276749',
};

// ─── Project types ────────────────────────────────────────────────────────────
export const PROJECT_TYPES = ['fashion', 'branding', 'edilizia', 'other'];

export const TYPE_LABELS = {
  fashion:   'Fashion',
  branding:  'Branding',
  edilizia:  'Edilizia',
  other:     'Other',
};

export const TYPE_BG = {
  fashion:   '#fce8f3',
  branding:  '#e8f0fe',
  edilizia:  '#e8f4e8',
  other:     '#f3efe8',
};

export const TYPE_TEXT = {
  fashion:   '#7b1f5a',
  branding:  '#1a56db',
  edilizia:  '#276749',
  other:     '#6b6460',
};

// ─── Payment status ───────────────────────────────────────────────────────────
export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid'];

export const PAYMENT_LABELS = {
  unpaid:  'Non pagato',
  deposit: 'Acconto pagato',
  paid:    'Saldato',
};

export const PAYMENT_BG = {
  unpaid:  '#fce8e6',
  deposit: '#fff8e1',
  paid:    '#e6f4ea',
};

export const PAYMENT_TEXT = {
  unpaid:  '#7b1f24',
  deposit: '#7a6010',
  paid:    '#276749',
};

// ─── localStorage keys ───────────────────────────────────────────────────────
export const STORAGE_CLIENTS  = 'venganza_clients';
export const STORAGE_PROJECTS = 'venganza_projects';
