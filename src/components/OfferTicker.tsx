import type { Offer } from '../lib/types';

export function OfferTicker({ offers }: { offers: Offer[] }) {
  if (!offers.length) return null;
  const items = [...offers, ...offers];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-l from-brand-600/25 via-navy-800 to-navy-800">
      <div className="bg-stripes absolute inset-0 opacity-40" />
      <div className="relative flex items-center gap-3 px-4 py-3">
        <span className="shrink-0 rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-white shadow-glow">
          🔥 عروض اليوم
        </span>
        <div className="overflow-hidden flex-1" dir="ltr">
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
            {items.map((o, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm font-bold text-amber-100" dir="rtl">
                <span className="text-brand-400">✦</span> {o.title_ar}
                {o.description_ar ? <span className="font-normal text-slate-300">— {o.description_ar}</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
