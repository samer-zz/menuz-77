export function BarChart({ data, label, color = '#ff7a1a' }: { data: { label: string; value: number }[]; label: string; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-300">{d.value || ''}</span>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: `linear-gradient(180deg, ${color}, ${color}55)` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-slate-500 truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">{sub}</span>}
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400 font-bold">{label}</p>
    </div>
  );
}
