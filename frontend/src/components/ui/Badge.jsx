const STATUS_STYLES = {
  in_stock: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  low_stock: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  out_of_stock: 'bg-red-50 text-red-700 ring-red-600/20',
  overstock: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  admin: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  manager: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  staff: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  STOCK_IN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  STOCK_OUT: 'bg-red-50 text-red-700 ring-red-600/20',
  ADJUSTMENT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  RETURN: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

const LABELS = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  overstock: 'Overstock',
  STOCK_IN: 'Stock In',
  STOCK_OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment',
  RETURN: 'Return',
};

export default function Badge({ value, className = '' }) {
  const style = STATUS_STYLES[value] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  const label = LABELS[value] || value;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style} ${className}`}>
      {label}
    </span>
  );
}
