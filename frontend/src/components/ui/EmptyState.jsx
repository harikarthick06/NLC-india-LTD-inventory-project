export default function EmptyState({ icon = '📦', title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {message && <p className="max-w-sm text-xs text-slate-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
