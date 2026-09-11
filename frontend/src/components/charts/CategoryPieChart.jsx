import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2f78b8', '#5495cf', '#82b4dd', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9', '#f97316', '#64748b'];

export default function CategoryPieChart({ data }) {
  if (!data?.length) return <p className="py-10 text-center text-sm text-slate-400">No category data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="productCount" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
