import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="btn-secondary h-9 w-9 p-0 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="w-9 h-9 flex items-center justify-center text-sm text-navy-800/40">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            className={`h-9 w-9 rounded-xl text-sm font-display font-semibold transition-all
              ${p === page
                ? 'bg-navy-800 text-white shadow-sm'
                : 'bg-white border border-navy-800/10 text-navy-700 hover:border-navy-800/30'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="btn-secondary h-9 w-9 p-0 justify-center disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronRight size={15} />
      </button>
    </div>
  );
}