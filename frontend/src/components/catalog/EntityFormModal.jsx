import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import FormField, { inputClass } from '../ui/FormField.jsx';
import { getErrorMessage } from '../../services/api.js';

/**
 * Generic add/edit modal for simple catalog entities (Category, Supplier, Location).
 * `fields` describes the form: [{ key, label, required, type }]
 */
export default function EntityFormModal({ open, onClose, onSaved, entity, title, fields, service }) {
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, f.default ?? '']));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!entity;

  useEffect(() => {
    if (entity) {
      setForm(Object.fromEntries(fields.map((f) => [f.key, entity[f.key] ?? f.default ?? ''])));
    } else {
      setForm(emptyForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, open]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await service.update(entity._id, form);
        toast.success(`${title} updated`);
      } else {
        await service.create(form);
        toast.success(`${title} created`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`${isEdit ? 'Edit' : 'Add'} ${title}`}>
      <form id={`${title}-form`} onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <FormField key={f.key} label={f.label} required={f.required}>
            {f.type === 'textarea' ? (
              <textarea className={inputClass} rows={2} required={f.required} value={form[f.key]} onChange={set(f.key)} />
            ) : f.type === 'select' ? (
              <select className={inputClass} value={form[f.key]} onChange={set(f.key)}>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                className={inputClass}
                required={f.required}
                value={form[f.key]}
                onChange={set(f.key)}
              />
            )}
          </FormField>
        ))}
      </form>
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" form={`${title}-form`} loading={saving}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
