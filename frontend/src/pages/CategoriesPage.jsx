import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryService } from '../services/catalogService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatNumber } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EntityFormModal from '../components/catalog/EntityFormModal.jsx';

const FIELDS = [
  { key: 'name', label: 'Category Name', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active' },
];

export default function CategoriesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'manager');
  const canDelete = hasRole('admin');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, entity: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await categoryService.list());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await categoryService.remove(deleteTarget._id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{categories.length} categories</p>
        {canManage && <Button onClick={() => setModal({ open: true, entity: null })}>+ Add Category</Button>}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.description || 'No description'}</p>
                </div>
                <Badge value={c.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Products" value={formatNumber(c.productCount)} />
                <Stat label="Quantity" value={formatNumber(c.totalQuantity)} />
                <Stat label="Value" value={formatCurrency(c.totalValue)} />
              </div>
              {canManage && (
                <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <Button size="sm" variant="secondary" onClick={() => setModal({ open: true, entity: c })}>
                    Edit
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <EntityFormModal
        open={modal.open}
        entity={modal.entity}
        title="Category"
        fields={FIELDS}
        service={categoryService}
        onClose={() => setModal({ open: false, entity: null })}
        onSaved={load}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Categories with products cannot be deleted.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-sm font-semibold text-slate-800">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}
