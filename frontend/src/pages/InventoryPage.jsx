import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../services/productService.js';
import { categoryService, supplierService, locationService } from '../services/catalogService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { formatCurrency, formatDate } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ProductFormModal from '../components/inventory/ProductFormModal.jsx';
import StockMoveModal from '../components/inventory/StockMoveModal.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'overstock', label: 'Overstock' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'sku', label: 'SKU' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unitPrice', label: 'Unit Price' },
];

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManage = hasRole('admin', 'manager');
  const canDelete = hasRole('admin');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formModal, setFormModal] = useState({ open: false, product: null });
  const [stockModal, setStockModal] = useState({ open: false, product: null, type: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([categoryService.list(), supplierService.list(), locationService.list()])
      .then(([c, s, l]) => {
        setCategories(c);
        setSuppliers(s);
        setLocations(l);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        category: category || undefined,
        location: location || undefined,
        sortBy,
        sortDir,
        page,
        limit: 10,
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, category, location, sortBy, sortDir, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => setPage(1), [debouncedSearch, status, category, location, sortBy, sortDir]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.remove(deleteTarget._id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const sortIndicator = (field) => (sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : '');

  const activeFilterSummary = useMemo(() => {
    const parts = [];
    if (status) parts.push(STATUS_OPTIONS.find((s) => s.value === status)?.label);
    if (category) parts.push(categories.find((c) => c._id === category)?.name);
    if (location) parts.push(locations.find((l) => l._id === location)?.name);
    return parts.join(' · ');
  }, [status, category, location, categories, locations]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Search by name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
          {canManage && (
            <Button onClick={() => setFormModal({ open: true, product: null })}>+ Add Product</Button>
          )}
        </div>
        {activeFilterSummary && <p className="mt-2 text-xs text-slate-500">Filtering by: {activeFilterSummary}</p>}
      </Card>

      <Card padded={false}>
        {loading ? (
          <LoadingScreen label="Loading inventory..." />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('sku')}>SKU {sortIndicator('sku')}</th>
                  <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('name')}>Product {sortIndicator('name')}</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('quantity')}>Quantity {sortIndicator('quantity')}</th>
                  <th className="px-4 py-3">Min Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="cursor-pointer px-4 py-3" onClick={() => toggleSort('unitPrice')}>Unit Price {sortIndicator('unitPrice')}</th>
                  <th className="px-4 py-3">Inventory Value</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <Link to={`/inventory/${p._id}`} className="font-medium text-slate-800 hover:text-brand-600">
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-400">{p.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.location?.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {p.quantity} <span className="text-xs text-slate-400">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.minStockLevel}</td>
                    <td className="px-4 py-3">
                      <Badge value={p.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(p.unitPrice)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(p.totalValue)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Stock In"
                          className="rounded-md px-1.5 py-1 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => setStockModal({ open: true, product: p, type: 'STOCK_IN' })}
                        >
                          ⬆
                        </button>
                        <button
                          title="Stock Out"
                          className="rounded-md px-1.5 py-1 text-red-600 hover:bg-red-50"
                          onClick={() => setStockModal({ open: true, product: p, type: 'STOCK_OUT' })}
                        >
                          ⬇
                        </button>
                        <Link title="View" to={`/inventory/${p._id}`} className="rounded-md px-1.5 py-1 text-slate-500 hover:bg-slate-100">
                          👁
                        </Link>
                        {canManage && (
                          <button
                            title="Edit"
                            className="rounded-md px-1.5 py-1 text-slate-500 hover:bg-slate-100"
                            onClick={() => setFormModal({ open: true, product: p })}
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            title="Delete"
                            className="rounded-md px-1.5 py-1 text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteTarget(p)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={10} onPageChange={setPage} />
      </Card>

      <ProductFormModal
        open={formModal.open}
        product={formModal.product}
        categories={categories}
        suppliers={suppliers}
        locations={locations}
        onClose={() => setFormModal({ open: false, product: null })}
        onSaved={fetchProducts}
      />

      <StockMoveModal
        open={stockModal.open}
        product={stockModal.product}
        type={stockModal.type}
        onClose={() => setStockModal({ open: false, product: null, type: null })}
        onSaved={fetchProducts}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
