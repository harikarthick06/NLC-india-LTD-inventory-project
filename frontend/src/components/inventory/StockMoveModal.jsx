import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import FormField, { inputClass } from '../ui/FormField.jsx';
import { inventoryService } from '../../services/inventoryService.js';
import { getErrorMessage } from '../../services/api.js';

const CONFIG = {
  STOCK_IN: { title: 'Stock In', action: inventoryService.stockIn, cta: 'Add Stock', color: 'success' },
  STOCK_OUT: { title: 'Stock Out', action: inventoryService.stockOut, cta: 'Remove Stock', color: 'danger' },
};

export default function StockMoveModal({ open, onClose, onSaved, product, type }) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [saving, setSaving] = useState(false);

  if (!type) return null;
  const config = CONFIG[type];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await config.action({ productId: product._id, quantity: Number(quantity), reason, referenceNumber });
      toast.success(`${config.title} recorded for ${product.name}`);
      setQuantity('');
      setReason('');
      setReferenceNumber('');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`${config.title}: ${product?.name || ''}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Current stock: <span className="font-semibold text-slate-800">{product?.quantity}</span> {product?.unit}
        </p>
        <FormField label="Quantity" required>
          <input
            type="number"
            min="1"
            required
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus
          />
        </FormField>
        <FormField label="Reference Number">
          <input className={inputClass} value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="PO-1234" />
        </FormField>
        <FormField label="Reason">
          <textarea className={inputClass} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant={config.color} loading={saving}>
            {config.cta}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
