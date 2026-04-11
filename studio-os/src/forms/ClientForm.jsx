import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Btn from '../components/Btn';

const EMPTY = {
  name:     '',
  brand:    '',
  email:    '',
  phone:    '',
  language: '',
  notes:    '',
};

export default function ClientForm({ open, onClose, onSave, initialValues }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...EMPTY, ...initialValues } : EMPTY);
      setErrors({});
    }
  }, [open, initialValues]);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  }

  const isEdit = Boolean(initialValues);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifica cliente' : 'Nuovo cliente'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name + Brand */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome" required error={errors.name}>
            <input
              type="text"
              placeholder="Mario Rossi"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Brand / Studio">
            <input
              type="text"
              placeholder="Nome del brand"
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
            />
          </Field>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              placeholder="mail@esempio.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </Field>
          <Field label="Telefono">
            <input
              type="tel"
              placeholder="+39 333 000 0000"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </Field>
        </div>

        {/* Language */}
        <Field label="Lingua">
          <select value={form.language} onChange={e => set('language', e.target.value)}>
            <option value="">— Seleziona —</option>
            <option value="Italiano">Italiano</option>
            <option value="English">English</option>
            <option value="Español">Español</option>
            <option value="Français">Français</option>
            <option value="Deutsch">Deutsch</option>
          </select>
        </Field>

        {/* Notes */}
        <Field label="Note">
          <textarea
            rows={3}
            placeholder="Note libere sul cliente…"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="resize-y"
          />
        </Field>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Btn variant="secondary" type="button" onClick={onClose}>Annulla</Btn>
          <Btn variant="primary" type="submit">
            {isEdit ? 'Salva modifiche' : 'Aggiungi cliente'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
