export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
      <span>
        Showing <span className="font-medium text-slate-700">{start}</span>–
        <span className="font-medium text-slate-700">{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          className="rounded-md px-2.5 py-1 hover:bg-slate-100 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <span className="px-2 text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          className="rounded-md px-2.5 py-1 hover:bg-slate-100 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
