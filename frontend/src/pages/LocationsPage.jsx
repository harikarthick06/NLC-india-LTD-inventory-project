import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { locationService } from '../services/catalogService.js';
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
  { key: 'name', label: 'Location Name', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'address', label: 'Address' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active' },
];

export default function LocationsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'manager');
  const canDelete = hasRole('admin');

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, entity: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLocations(await locationService.list());
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
      await locationService.remove(deleteTarget._id);
      toast.success('Location deleted');
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
        <p className="text-sm text-slate-500">{locations.length} locations</p>
        {canManage && <Button onClick={() => setModal({ open: true, entity: null })}>+ Add Location</Button>}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : locations.length === 0 ? (
        <EmptyState title="No locations yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <Card key={l._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">📍 {l.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{l.address || l.description || 'No address on file'}</p>
                </div>
                <Badge value={l.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Products" value={formatNumber(l.productCount)} />
                <Stat label="Quantity" value={formatNumber(l.totalQuantity)} />
                <Stat label="Value" value={formatCurrency(l.totalValue)} />
              </div>
              {canManage && (
                <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <Button size="sm" variant="secondary" onClick={() => setModal({ open: true, entity: l })}>
                    Edit
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(l)}>
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
        title="Location"
        fields={FIELDS}
        service={locationService}
        onClose={() => setModal({ open: false, entity: null })}
        onSaved={load}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Location"
        message={`Delete "${deleteTarget?.name}"? Locations with products cannot be deleted.`}
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
