import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/format.js';

export default function CategoryValueChart({ data }) {
  if (!data?.length) return <p className="py-10 text-center text-sm text-slate-400">No category data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Bar dataKey="totalValue" fill="#2f78b8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
