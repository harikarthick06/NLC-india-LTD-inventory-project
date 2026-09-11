import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inventoryService } from '../services/inventoryService.js';
import { getErrorMessage } from '../services/api.js';
import { formatDateTime, formatNumber } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

const TYPES = ['', 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN'];

export default function TransactionsPage() {
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.listTransactions({
        type: type || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });
      setTransactions(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type, startDate, endDate, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [type, startDate, endDate]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t || 'All Types'}
              </option>
            ))}
          </select>
          <input type="date" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </Card>

      <Card padded={false}>
        {loading ? (
          <LoadingScreen />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Previous → New</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/inventory/${t.product?._id}`} className="font-medium text-slate-700 hover:text-brand-600">
                        {t.product?.name}
                      </Link>
                      <p className="font-mono text-xs text-slate-400">{t.product?.sku}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={t.type} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatNumber(t.quantity)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {t.previousQuantity} → {t.newQuantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.user?.name} <Badge value={t.user?.role} className="ml-1" />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.referenceNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={15} onPageChange={setPage} />
      </Card>
    </div>
  );
}
