import type { Category } from '../lib/types';

interface Props {
  categories: Category[];
  active: string | 'all';
  onSelect: (id: string | 'all') => void;
}

export function CategoryBar({ categories, active, onSelect }: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-navy-900/85 backdrop-blur-xl border-b border-white/5">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onSelect('all')}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
            active === 'all' ? 'bg-brand-500 text-white shadow-glow' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          🍽️ الكل
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              active === c.id ? 'bg-brand-500 text-white shadow-glow' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            {c.icon ? <span className="ml-1">{c.icon}</span> : null}
            {c.name_ar}
          </button>
        ))}
      </div>
    </div>
  );
}
