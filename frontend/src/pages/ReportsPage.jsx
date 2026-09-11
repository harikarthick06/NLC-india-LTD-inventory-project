import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reportService } from '../services/reportService.js';
import { categoryService, supplierService, locationService } from '../services/catalogService.js';
import { getErrorMessage } from '../services/api.js';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format.js';

import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';

const REPORTS = [
  { key: 'inventorySummary', label: 'Inventory Summary', filters: ['category', 'supplier', 'location'] },
  { key: 'lowStock', label: 'Low Stock Report', filters: ['category', 'location'] },
  { key: 'outOfStock', label: 'Out of Stock Report', filters: ['category', 'location'] },
  { key: 'valuation', label: 'Inventory Valuation Report', filters: ['category'] },
  { key: 'category', label: 'Category Report', filters: [] },
  { key: 'supplier', label: 'Supplier Report', filters: [] },
  { key: 'stockMovement', label: 'Stock Movement Report', filters: ['date'] },
];

export default function ReportsPage() {
  const [activeKey, setActiveKey] = useState(REPORTS[0].key);
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const active = REPORTS.find((r) => r.key === activeKey);

  useEffect(() => {
    Promise.all([categoryService.list(), supplierService.list(), locationService.list()]).then(
      ([c, s, l]) => {
        setCategories(c);
        setSuppliers(s);
        setLocations(l);
      }
    );
  }, []);

  const runReport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await reportService.fetch(activeKey, filters);
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters({});
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const downloadCsv = () => window.open(reportService.downloadCsvUrl(activeKey, filters), '_blank');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <Card padded={false} className="lg:col-span-1">
        <nav className="divide-y divide-slate-100">
          {REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveKey(r.key)}
              className={`block w-full px-4 py-3 text-left text-sm ${
                activeKey === r.key ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </Card>

      <div className="space-y-4 lg:col-span-3">
        <Card title={active.label}>
          <div className="flex flex-wrap items-center gap-2">
            {active.filters.includes('category') && (
              <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={filters.category || ''} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {active.filters.includes('supplier') && (
              <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={filters.supplier || ''} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}>
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            {active.filters.includes('location') && (
              <select className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={filters.location || ''} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
            {active.filters.includes('date') && (
              <>
                <input type="date" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                <span className="text-xs text-slate-400">to</span>
                <input type="date" className="rounded-lg border border-slate-300 px-2 py-2 text-sm" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </>
            )}
            <Button onClick={runReport} loading={loading}>
              Generate
            </Button>
            <Button variant="secondary" onClick={downloadCsv}>
              Download CSV
            </Button>
          </div>
        </Card>

        <Card padded={result ? false : true}>
          {loading ? (
            <LoadingScreen />
          ) : !result ? (
            <EmptyState icon="📊" title="Run a report" message="Choose filters and click Generate to preview the report here." />
          ) : (
            <ReportResult reportKey={activeKey} result={result} />
          )}
        </Card>
      </div>
    </div>
  );
}

function ReportResult({ reportKey, result }) {
  if (Array.isArray(result)) {
    return <GenericTable rows={result} />;
  }
  if (result.products) {
    return (
      <div>
        {result.totals && <TotalsBar totals={result.totals} />}
        {result.totalValue !== undefined && (
          <div className="border-b border-slate-100 px-5 py-3 text-sm">
            Total Value: <span className="font-semibold text-brand-700">{formatCurrency(result.totalValue)}</span>
          </div>
        )}
        <GenericTable rows={result.products} />
      </div>
    );
  }
  return <GenericTable rows={[result]} />;
}

function TotalsBar({ totals }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 px-5 py-3 text-sm">
      <span>Products: <strong>{formatNumber(totals.totalProducts)}</strong></span>
      <span>Quantity: <strong>{formatNumber(totals.totalQuantity)}</strong></span>
      <span>Value: <strong>{formatCurrency(totals.totalValue)}</strong></span>
    </div>
  );
}

function GenericTable({ rows }) {
  if (!rows.length) return <EmptyState title="No data for this report" />;
  const columns = Object.keys(rows[0]).filter((k) => !['_id', '__v'].includes(k));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2.5">
                {c.replace(/([A-Z])/g, ' $1')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c} className="px-4 py-2.5 text-slate-600">
                  {renderCell(c, row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(key, value) {
  if (value && typeof value === 'object' && value.name) return value.name;
  if (key === 'status') return <Badge value={value} />;
  if (key === 'type') return <Badge value={value} />;
  if (/value|price/i.test(key) && typeof value === 'number') return formatCurrency(value);
  if (/date/i.test(key) && typeof value === 'string' && !Number.isNaN(Date.parse(value))) return formatDateTime(value);
  if (typeof value === 'number') return formatNumber(value);
  return String(value ?? '-');
}
