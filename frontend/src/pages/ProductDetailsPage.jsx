import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { productService } from '../services/productService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDateTime } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StockMoveModal from '../components/inventory/StockMoveModal.jsx';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState({ open: false, type: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getById(id);
      setData(res);
    } catch (err) {
      toast.error(getErrorMessage(err));
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingScreen label="Loading product..." />;
  if (!data) return <EmptyState title="Product not found" />;

  const { product, transactions } = data;
  const chartData = [...transactions]
    .reverse()
    .map((t) => ({ date: formatDateTime(t.createdAt).split(',')[0], quantity: t.newQuantity }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/inventory" className="text-sm text-brand-600 hover:underline">
            ← Back to Inventory
          </Link>
          <h2 className="mt-1 text-xl font-semibold text-slate-800">{product.name}</h2>
          <p className="font-mono text-xs text-slate-400">{product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" onClick={() => setStockModal({ open: true, type: 'STOCK_IN' })}>
            Stock In
          </Button>
          <Button variant="danger" onClick={() => setStockModal({ open: true, type: 'STOCK_OUT' })}>
            Stock Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Product Information" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="Description" value={product.description} full />
            <Field label="Category" value={product.category?.name} />
            <Field label="Subcategory" value={product.subcategory || '-'} />
            <Field label="Brand" value={product.brand || '-'} />
            <Field label="Location" value={product.location?.name} />
            <Field label="Unit" value={product.unit} />
            <Field label="Status" value={<Badge value={product.status} />} />
          </dl>
        </Card>

        <Card title="Stock Summary">
          <div className="space-y-3">
            <Metric label="Current Quantity" value={`${product.quantity} ${product.unit}`} />
            <Metric label="Minimum Level" value={product.minStockLevel} />
            <Metric label="Maximum Level" value={product.maxStockLevel} />
            <Metric label="Unit Price" value={formatCurrency(product.unitPrice)} />
            <Metric label="Inventory Value" value={formatCurrency(product.totalValue)} emphasize />
          </div>
        </Card>
      </div>

      <Card title="Supplier Information">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
          <Field label="Supplier" value={product.supplier?.name} />
          <Field label="Contact Person" value={product.supplier?.contactPerson || '-'} />
          <Field label="Email" value={product.supplier?.email || '-'} />
          <Field label="Phone" value={product.supplier?.phone || '-'} />
        </dl>
      </Card>

      <Card title="Stock Movement History">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#2f78b8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">Not enough history to chart yet.</p>
        )}
      </Card>

      <Card title="Transaction History" padded={false}>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions recorded for this product" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Quantity</th>
                  <th className="px-4 py-2.5">Previous → New</th>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="px-4 py-2.5 text-slate-500">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <Badge value={t.type} />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{t.quantity}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {t.previousQuantity} → {t.newQuantity}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{t.user?.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{t.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <StockMoveModal
        open={stockModal.open}
        type={stockModal.type}
        product={product}
        onClose={() => setStockModal({ open: false, type: null })}
        onSaved={load}
      />
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-700">{value || '-'}</dd>
    </div>
  );
}

function Metric({ label, value, emphasize }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={emphasize ? 'text-base font-semibold text-brand-700' : 'text-sm font-medium text-slate-700'}>{value}</span>
    </div>
  );
}
