import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Btn from '../components/Btn';
import PricingSuggestion from '../components/PricingSuggestion';
import { PROJECT_TYPES, TYPE_LABELS, STAGES, STAGE_LABELS, PAYMENT_STATUSES, PAYMENT_LABELS } from '../lib/constants';

const EMPTY = {
  clientId:      '',
  title:         '',
  description:   '',
  type:          'fashion',
  stage:         'lead',
  deadline:      '',
  price:         '',
  retainerFee:   '',
  salesCount:    '',
  paymentStatus: 'unpaid',
  nextAction:    '',
  missingInfo:   '',
};

export default function ProjectForm({
  open,
  onClose,
  onSave,
  clients = [],
  initialValues,
  defaultClientId,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initialValues
          ? { ...EMPTY, ...initialValues, price: initialValues.price ?? '' }
          : { ...EMPTY, clientId: defaultClientId ?? '' }
      );
      setErrors({});
    }
  }, [open, initialValues, defaultClientId]);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Il titolo è obbligatorio';
    if (!form.clientId && form.type !== 'premade') e.clientId = 'Seleziona un cliente';
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      ...form,
      price:       form.price       !== '' ? Number(form.price)       : null,
      retainerFee: form.retainerFee !== '' ? Number(form.retainerFee) : null,
      salesCount:  form.salesCount  !== '' ? Number(form.salesCount)  : null,
      deadline:    form.deadline || null,
    });
  }

  const isEdit = Boolean(initialValues);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifica progetto' : 'Nuovo progetto'}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        {/* Client */}
        <Field label="Cliente" required error={errors.clientId}>
          <select
            value={form.clientId}
            onChange={e => set('clientId', e.target.value)}
          >
            <option value="">— Seleziona cliente —</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.brand ? ` · ${c.brand}` : ''}
              </option>
            ))}
          </select>
        </Field>

        {/* Title */}
        <Field label="Titolo progetto" required error={errors.title}>
          <input
            type="text"
            placeholder="Es. Brand identity autunno 2025"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            autoFocus={!defaultClientId}
          />
        </Field>

        {/* Description */}
        <Field label="Descrizione">
          <textarea
            rows={3}
            placeholder="Brief del progetto, obiettivi, note…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="resize-none sm:resize-y"
          />
        </Field>

        {/* Type + Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Tipo">
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {PROJECT_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Stage">
            <select value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Smart Pricing Suggestion — only for new projects, non-retainer */}
        {!isEdit && !['retainer', 'premade'].includes(form.type) && (
          <AnimatePresence>
            <PricingSuggestion
              key={form.type}
              type={form.type}
              clientId={form.clientId}
              onApply={price => set('price', String(price))}
            />
          </AnimatePresence>
        )}

        {/* Deadline + Price/Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {form.type !== 'premade' && (
            <Field label={form.type === 'retainer' ? 'Scadenza contratto' : 'Deadline'}>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
              />
            </Field>
          )}
          {form.type === 'retainer' ? (
            <Field label="Fee mensile (€)">
              <input type="number" placeholder="0" min="0"
                value={form.retainerFee} onChange={e => set('retainerFee', e.target.value)} />
            </Field>
          ) : form.type === 'premade' ? (
            <>
              <Field label="Prezzo unitario (€)">
                <input type="number" placeholder="0" min="0"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </Field>
              <Field label="Unità vendute">
                <input type="number" placeholder="0" min="0"
                  value={form.salesCount} onChange={e => set('salesCount', e.target.value)} />
              </Field>
            </>
          ) : (
            <Field label="Prezzo totale (€)">
              <input type="number" placeholder="0" min="0"
                value={form.price} onChange={e => set('price', e.target.value)} />
            </Field>
          )}
        </div>

        {/* Payment status */}
        <Field label="Stato pagamento">
          <select value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}>
            {PAYMENT_STATUSES.map(s => (
              <option key={s} value={s}>{PAYMENT_LABELS[s]}</option>
            ))}
          </select>
        </Field>

        {/* Next action + missing info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Prossima azione">
            <input
              type="text"
              placeholder="Cosa fare adesso?"
              value={form.nextAction}
              onChange={e => set('nextAction', e.target.value)}
            />
          </Field>
          <Field label="Info mancanti">
            <input
              type="text"
              placeholder="Cosa manca dal cliente?"
              value={form.missingInfo}
              onChange={e => set('missingInfo', e.target.value)}
            />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 sm:pt-4 border-t border-border">
          <Btn variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">Annulla</Btn>
          <Btn variant="primary" type="submit" className="w-full sm:w-auto">
            {isEdit ? 'Salva modifiche' : 'Crea progetto'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
