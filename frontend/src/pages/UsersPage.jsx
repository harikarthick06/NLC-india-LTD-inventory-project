import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

const ROLES = ['admin', 'manager', 'staff'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await userService.list());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (u, role) => {
    try {
      await userService.update(u.id, { role });
      toast.success(`${u.name} is now ${role}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleActive = async (u) => {
    try {
      await userService.update(u.id, { isActive: !u.isActive });
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget.id);
      toast.success('User deleted');
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
      <p className="text-sm text-slate-500">{users.length} users</p>

      <Card padded={false}>
        {loading ? (
          <LoadingScreen />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.name} {u.id === currentUser.id && <span className="text-xs text-slate-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        disabled={u.id === currentUser.id}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={u.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          onClick={() => toggleActive(u)}
                          disabled={u.id === currentUser.id}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.id === currentUser.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
