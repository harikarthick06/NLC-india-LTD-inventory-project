import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function StockMovementChart({ data }) {
  if (!data?.length) return <p className="py-10 text-center text-sm text-slate-400">No movement data yet.</p>;

  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="STOCK_IN" name="Stock In" stackId="1" stroke="#10b981" fill="#a7f3d0" />
        <Area type="monotone" dataKey="STOCK_OUT" name="Stock Out" stackId="2" stroke="#ef4444" fill="#fecaca" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
