import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supplierService } from '../services/catalogService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EntityFormModal from '../components/catalog/EntityFormModal.jsx';

const FIELDS = [
  { key: 'name', label: 'Supplier Name', required: true },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'gstNumber', label: 'GST / Registration Number' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active' },
];

export default function SuppliersPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'manager');
  const canDelete = hasRole('admin');

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, entity: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSuppliers(await supplierService.list());
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
      await supplierService.remove(deleteTarget._id);
      toast.success('Supplier deleted');
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
        <p className="text-sm text-slate-500">{suppliers.length} suppliers</p>
        {canManage && <Button onClick={() => setModal({ open: true, entity: null })}>+ Add Supplier</Button>}
      </div>

      <Card padded={false}>
        {loading ? (
          <LoadingScreen />
        ) : suppliers.length === 0 ? (
          <EmptyState title="No suppliers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Email / Phone</th>
                  <th className="px-4 py-3">GST No.</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.contactPerson || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <p>{s.email || '-'}</p>
                      <p className="text-xs">{s.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.gstNumber || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.productCount}</td>
                    <td className="px-4 py-3">
                      <Badge value={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="secondary" onClick={() => setModal({ open: true, entity: s })}>
                            Edit
                          </Button>
                          {canDelete && (
                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(s)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EntityFormModal
        open={modal.open}
        entity={modal.entity}
        title="Supplier"
        fields={FIELDS}
        service={supplierService}
        onClose={() => setModal({ open: false, entity: null })}
        onSaved={load}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Supplier"
        message={`Delete "${deleteTarget?.name}"? Suppliers with linked products cannot be deleted.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
