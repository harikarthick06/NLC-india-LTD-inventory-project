export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
