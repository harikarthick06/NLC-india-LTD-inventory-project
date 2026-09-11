import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import FormField, { inputClass } from '../ui/FormField.jsx';
import { productService } from '../../services/productService.js';
import { getErrorMessage } from '../../services/api.js';

const UNITS = ['pcs', 'box', 'kg', 'litre', 'meter', 'set', 'pair', 'roll'];

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  category: '',
  subcategory: '',
  brand: '',
  supplier: '',
  location: '',
  quantity: 0,
  minStockLevel: 10,
  maxStockLevel: 500,
  unit: 'pcs',
  unitPrice: 0,
};

export default function ProductFormModal({ open, onClose, onSaved, product, categories, suppliers, locations }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category?._id || product.category,
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        supplier: product.supplier?._id || product.supplier,
        location: product.location?._id || product.location,
        quantity: product.quantity,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        unit: product.unit,
        unitPrice: product.unitPrice,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [product, open]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        minStockLevel: Number(form.minStockLevel),
        maxStockLevel: Number(form.maxStockLevel),
        unitPrice: Number(form.unitPrice),
      };
      if (isEdit) {
        delete payload.quantity; // quantity changes go through Stock In/Out/Adjust
        await productService.update(product._id, payload);
        toast.success('Product updated');
      } else {
        await productService.create(payload);
        toast.success('Product created');
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="lg">
      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="SKU" required>
          <input className={inputClass} required value={form.sku} onChange={set('sku')} placeholder="NLC-BRG-001" />
        </FormField>
        <FormField label="Product Name" required>
          <input className={inputClass} required value={form.name} onChange={set('name')} />
        </FormField>

        <FormField label="Category" required>
          <select className={inputClass} required value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Subcategory">
          <input className={inputClass} value={form.subcategory} onChange={set('subcategory')} />
        </FormField>

        <FormField label="Brand">
          <input className={inputClass} value={form.brand} onChange={set('brand')} />
        </FormField>
        <FormField label="Supplier" required>
          <select className={inputClass} required value={form.supplier} onChange={set('supplier')}>
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Location" required>
          <select className={inputClass} required value={form.location} onChange={set('location')}>
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Unit">
          <select className={inputClass} value={form.unit} onChange={set('unit')}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </FormField>

        {!isEdit && (
          <FormField label="Initial Quantity">
            <input type="number" min="0" className={inputClass} value={form.quantity} onChange={set('quantity')} />
          </FormField>
        )}
        <FormField label="Unit Price (₹)" required>
          <input type="number" min="0" step="0.01" required className={inputClass} value={form.unitPrice} onChange={set('unitPrice')} />
        </FormField>

        <FormField label="Minimum Stock Level">
          <input type="number" min="0" className={inputClass} value={form.minStockLevel} onChange={set('minStockLevel')} />
        </FormField>
        <FormField label="Maximum Stock Level">
          <input type="number" min="0" className={inputClass} value={form.maxStockLevel} onChange={set('maxStockLevel')} />
        </FormField>

        <div className="sm:col-span-2">
          <FormField label="Description">
            <textarea className={inputClass} rows={2} value={form.description} onChange={set('description')} />
          </FormField>
        </div>
      </form>

      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" form="product-form" loading={saving}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </Modal>
  );
}
