import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, FileText, PartyPopper, CreditCard, PenLine } from 'lucide-react';
import Btn from './Btn';
import { formatEur } from '../lib/utils';
import { PAYMENT_LABELS } from '../lib/constants';

function buildMailto(to, subject, body) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const SIGNATURE = `\n\n\u2014 Altered Venganza\nhello@altered-venganza.com`;

function templateMateriali(clientName, projectTitle, missingInfo) {
  const materials = missingInfo || 'i materiali concordati';
  const subject = `${projectTitle} \u2014 Materiali necessari`;
  const body =
    `Ciao ${clientName},\n\n` +
    `spero che tu stia bene! Ti scrivo riguardo al progetto "${projectTitle}".\n\n` +
    `Per poter procedere con il lavoro, avremmo bisogno dei seguenti materiali:\n` +
    `${materials}\n\n` +
    `Se hai domande o dubbi, non esitare a scrivermi.\n\n` +
    `Grazie mille!` +
    SIGNATURE;
  return { subject, body };
}

function templateConsegna(clientName, projectTitle, deliveryUrl) {
  const link = deliveryUrl || '[inserisci link consegna]';
  const subject = `${projectTitle} \u2014 Il tuo progetto \u00e8 pronto!`;
  const body =
    `Ciao ${clientName},\n\n` +
    `sono felice di comunicarti che il progetto "${projectTitle}" \u00e8 completato!\n\n` +
    `Puoi scaricare i file dal seguente link:\n` +
    `${link}\n\n` +
    `Il link sar\u00e0 disponibile per 7 giorni. Se hai bisogno di modifiche o hai domande, scrivimi pure.\n\n` +
    `Grazie per aver scelto Altered Venganza!` +
    SIGNATURE;
  return { subject, body };
}

function templatePagamento(clientName, projectTitle, remaining, paymentStatus) {
  const amount = remaining != null ? formatEur(remaining) : '[importo]';
  const status = PAYMENT_LABELS[paymentStatus] ?? paymentStatus ?? 'in attesa';
  const subject = `${projectTitle} \u2014 Promemoria pagamento`;
  const body =
    `Ciao ${clientName},\n\n` +
    `ti scrivo un gentile promemoria riguardo al saldo per il progetto "${projectTitle}".\n\n` +
    `Importo: \u20AC${amount}\n` +
    `Stato attuale: ${status}\n\n` +
    `Se hai gi\u00e0 provveduto al pagamento, ignora questo messaggio. Altrimenti, ti sarei grato se potessi procedere al saldo.\n\n` +
    `Per qualsiasi domanda, sono a disposizione.\n\n` +
    `Grazie!` +
    SIGNATURE;
  return { subject, body };
}

function templateCustom(clientName, projectTitle) {
  const subject = projectTitle;
  const body =
    `Ciao ${clientName},\n\n\n` +
    SIGNATURE;
  return { subject, body };
}

const TEMPLATES = [
  { id: 'materiali',    label: 'Richiedi materiali',     icon: FileText },
  { id: 'consegna',     label: 'Consegna progetto',      icon: PartyPopper },
  { id: 'pagamento',    label: 'Reminder pagamento',     icon: CreditCard },
  { id: 'personalizzato', label: 'Messaggio personalizzato', icon: PenLine },
];

export default function EmailButton({ client, project }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!client?.email) return null;

  const clientName = client.name || 'Cliente';
  const projectTitle = project.title || 'Progetto';

  function getMailto(templateId) {
    let data;
    switch (templateId) {
      case 'materiali':
        data = templateMateriali(clientName, projectTitle, project.missingInfo);
        break;
      case 'consegna': {
        // Try to find a delivery URL from project files
        const deliveryFile = (project.files ?? []).find(f => f.url);
        data = templateConsegna(clientName, projectTitle, deliveryFile?.url);
        break;
      }
      case 'pagamento': {
        const remaining = project.price != null
          ? project.price - (project.paidAmount ?? 0)
          : null;
        data = templatePagamento(clientName, projectTitle, remaining, project.paymentStatus);
        break;
      }
      case 'personalizzato':
      default:
        data = templateCustom(clientName, projectTitle);
        break;
    }
    return buildMailto(client.email, data.subject, data.body);
  }

  function handleSelect(templateId) {
    const url = getMailto(templateId);
    window.open(url, '_blank');
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Btn
        variant="secondary"
        size="sm"
        onClick={() => setOpen(prev => !prev)}
      >
        <Mail size={13} /> <span className="hidden sm:inline">Email</span>
      </Btn>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-56 glass-strong rounded-lg border border-white/15 shadow-xl overflow-hidden"
          >
            <div className="py-1">
              <p className="px-3 py-1.5 text-[10px] font-mono text-subtle uppercase tracking-wider">
                Invia email
              </p>
              {TEMPLATES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-white/10 transition-colors text-left"
                >
                  <Icon size={14} className="text-muted shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
