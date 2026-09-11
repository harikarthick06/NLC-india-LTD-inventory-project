import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService.js';
import { getErrorMessage } from '../services/api.js';
import StatCard from '../components/ui/StatCard.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingScreen from '../components/ui/LoadingScreen.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CategoryValueChart from '../components/charts/CategoryValueChart.jsx';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import StockMovementChart from '../components/charts/StockMovementChart.jsx';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/format.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [movement, setMovement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [summaryData, categoryData, movementData] = await Promise.all([
          dashboardService.summary(),
          dashboardService.categoryStats(),
          dashboardService.stockMovement(14),
        ]);
        if (!mounted) return;
        setSummary(summaryData);
        setCategoryStats(categoryData);
        setMovement(movementData);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingScreen label="Loading dashboard..." />;
  if (!summary) return <EmptyState title="Could not load dashboard data" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={formatNumber(summary.totalProducts)} icon="📦" tone="brand" />
        <StatCard label="Total Quantity" value={formatNumber(summary.totalQuantity)} icon="🧮" tone="sky" />
        <StatCard label="Total Inventory Value" value={formatCurrency(summary.totalValue)} icon="💰" tone="emerald" />
        <StatCard
          label="Low / Out of Stock"
          value={`${summary.lowStockCount} / ${summary.outOfStockCount}`}
          hint={`${summary.overstockCount} overstocked`}
          icon="⚠️"
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Inventory Value by Category" subtitle="Sum of quantity × unit price per category">
          <CategoryValueChart data={categoryStats} />
        </Card>
        <Card title="Inventory by Category" subtitle="Product count distribution">
          <CategoryPieChart data={categoryStats} />
        </Card>
      </div>

      <Card title="Stock Movement (Last 14 Days)" subtitle="Stock IN vs Stock OUT">
        <StockMovementChart data={movement} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Recent Transactions" className="xl:col-span-2" padded={false}>
          {summary.recentTransactions?.length ? (
            <ul className="divide-y divide-slate-100">
              {summary.recentTransactions.map((t) => (
                <li key={t._id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{t.product?.name || 'Unknown product'}</p>
                    <p className="text-xs text-slate-400">
                      {t.user?.name} &middot; {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{formatNumber(t.quantity)} {t.product?.unit}</span>
                    <Badge value={t.type} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No transactions yet" />
          )}
        </Card>

        <Card title="Low Stock Alerts">
          {summary.lowStockCount === 0 ? (
            <EmptyState icon="✅" title="All stock levels are healthy" />
          ) : (
            <Link
              to="/inventory?status=low_stock"
              className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100"
            >
              View {summary.lowStockCount} low-stock product(s)
              <span>→</span>
            </Link>
          )}
          {summary.outOfStockCount > 0 && (
            <Link
              to="/inventory?status=out_of_stock"
              className="mt-2 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              View {summary.outOfStockCount} out-of-stock product(s)
              <span>→</span>
            </Link>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Recent Stock Additions">
          {summary.recentStockIn?.length ? (
            <ul className="space-y-2 text-sm">
              {summary.recentStockIn.map((t) => (
                <li key={t._id} className="flex justify-between">
                  <span className="text-slate-600">{t.product?.name}</span>
                  <span className="font-medium text-emerald-600">+{formatNumber(t.quantity)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No recent additions" />
          )}
        </Card>
        <Card title="Recent Stock Removals">
          {summary.recentStockOut?.length ? (
            <ul className="space-y-2 text-sm">
              {summary.recentStockOut.map((t) => (
                <li key={t._id} className="flex justify-between">
                  <span className="text-slate-600">{t.product?.name}</span>
                  <span className="font-medium text-red-600">-{formatNumber(t.quantity)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No recent removals" />
          )}
        </Card>
      </div>
    </div>
  );
}
