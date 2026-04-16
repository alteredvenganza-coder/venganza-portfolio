import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ── Translations ─────────────────────────────────────────────────────────────
const translations = {
  IT: {
    // Nav
    'nav.dashboard':    'Dashboard',
    'nav.clients':      'Clienti',
    'nav.pricing':      'Prezzi',
    'nav.cashflow':     'Finanze',
    'nav.sendFile':     'Invia File',
    'nav.calendar':     'Calendario',

    // Common labels
    'label.checklist':       'Checklist',
    'label.deadline':        'Deadline',
    'label.payment':         'Pagamento',
    'label.contractSent':    'Contratto inviato',
    'label.currentStage':    'Stage attuale',
    'label.settings':        'Impostazioni',
    'label.goals':           'Obiettivi',
    'label.language':        'Lingua',

    // Buttons
    'btn.edit':     'Modifica',
    'btn.delete':   'Elimina',
    'btn.pause':    'Pausa',
    'btn.resume':   'Riprendi',
    'btn.save':     'Salva',
    'btn.cancel':   'Annulla',
    'btn.login':    'Accedi',
    'btn.set':      'Imposta',
    'btn.remove':   'Rimuovi',

    // Payment status
    'payment.unpaid':  'Non pagato',
    'payment.deposit': 'Acconto pagato',
    'payment.paid':    'Saldato',

    // Stage names
    'stage.lead':        'Lead',
    'stage.onboarding':  'Onboarding',
    'stage.in_progress': 'In Progress',
    'stage.waiting':     'Waiting',
    'stage.review':      'Review',
    'stage.completed':   'Completed',
    'stage.delivered':   'Delivered',
    'stage.archived':    'Archived',

    // Brief section
    'brief.notes':        'Note / Brief',
    'brief.images':       'Immagini & Reference',
    'brief.steps':        'Step del progetto',
    'brief.analyzeAI':    'Analizza con AI',
    'brief.useTemplate':  'Usa template',

    // Empty states
    'empty.noProjects': 'Nessun progetto',
    'empty.noClients':  'Nessun cliente',
    'empty.noResults':  'Nessun risultato per',

    // Dashboard stats
    'stats.toCollect':    'Da incassare',
    'stats.overdue':      'Progetti in ritardo',
    'stats.nextActions':  'Prossime azioni',

    // Search
    'search.placeholder': 'Cerca clienti, progetti\u2026',
    'search.clients':     'Clienti',
    'search.projects':    'Progetti',

    // Settings sections
    'settings.pushNotifications':   'Notifiche push',
    'settings.pushDesc':            'Ricevi una notifica sul telefono ogni mattina con deadline urgenti e progetti in scadenza.',
    'settings.webhook':             'Webhook \u2192 Microsoft To Do / Zapier',
    'settings.appBackground':       'Sfondo app',
    'settings.appBackgroundDesc':   'Imposta una tua foto come sfondo \u2014 vision board, obiettivo, mood.',
    'settings.revolutApi':          'Revolut Business API',
    'settings.setupInstructions':   'Istruzioni setup env vars Vercel',

    // Misc
    'misc.loading': 'Caricamento\u2026',
    'misc.saved':   'Salvato',
    'misc.error':   'Errore',
  },

  EN: {
    // Nav
    'nav.dashboard':    'Dashboard',
    'nav.clients':      'Clients',
    'nav.pricing':      'Pricing',
    'nav.cashflow':     'Finances',
    'nav.sendFile':     'Send File',
    'nav.calendar':     'Calendar',

    // Common labels
    'label.checklist':       'Checklist',
    'label.deadline':        'Deadline',
    'label.payment':         'Payment',
    'label.contractSent':    'Contract sent',
    'label.currentStage':    'Current stage',
    'label.settings':        'Settings',
    'label.goals':           'Goals',
    'label.language':        'Language',

    // Buttons
    'btn.edit':     'Edit',
    'btn.delete':   'Delete',
    'btn.pause':    'Pause',
    'btn.resume':   'Resume',
    'btn.save':     'Save',
    'btn.cancel':   'Cancel',
    'btn.login':    'Log in',
    'btn.set':      'Set',
    'btn.remove':   'Remove',

    // Payment status
    'payment.unpaid':  'Unpaid',
    'payment.deposit': 'Deposit paid',
    'payment.paid':    'Paid in full',

    // Stage names
    'stage.lead':        'Lead',
    'stage.onboarding':  'Onboarding',
    'stage.in_progress': 'In Progress',
    'stage.waiting':     'Waiting',
    'stage.review':      'Review',
    'stage.completed':   'Completed',
    'stage.delivered':   'Delivered',
    'stage.archived':    'Archived',

    // Brief section
    'brief.notes':        'Notes / Brief',
    'brief.images':       'Images & References',
    'brief.steps':        'Project steps',
    'brief.analyzeAI':    'Analyze with AI',
    'brief.useTemplate':  'Use template',

    // Empty states
    'empty.noProjects': 'No projects',
    'empty.noClients':  'No clients',
    'empty.noResults':  'No results for',

    // Dashboard stats
    'stats.toCollect':    'To collect',
    'stats.overdue':      'Overdue projects',
    'stats.nextActions':  'Next actions',

    // Search
    'search.placeholder': 'Search clients, projects\u2026',
    'search.clients':     'Clients',
    'search.projects':    'Projects',

    // Settings sections
    'settings.pushNotifications':   'Push notifications',
    'settings.pushDesc':            'Receive a daily notification on your phone with urgent deadlines and expiring projects.',
    'settings.webhook':             'Webhook \u2192 Microsoft To Do / Zapier',
    'settings.appBackground':       'App background',
    'settings.appBackgroundDesc':   'Set a photo as background \u2014 vision board, goal, mood.',
    'settings.revolutApi':          'Revolut Business API',
    'settings.setupInstructions':   'Vercel env vars setup instructions',

    // Misc
    'misc.loading': 'Loading\u2026',
    'misc.saved':   'Saved',
    'misc.error':   'Error',
  },
};

// ── Context ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'venganza_lang';
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'IT';
    } catch {
      return 'IT';
    }
  });

  const setLang = useCallback((l) => {
    const next = l === 'EN' ? 'EN' : 'IT';
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations.IT?.[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
