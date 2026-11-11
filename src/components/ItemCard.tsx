import { useState } from 'react';
import type { MenuItem } from '../lib/types';
import { money } from '../lib/format';
import { useCart } from '../lib/cart';

export function Badge({ item, hasOffer }: { item: MenuItem; hasOffer: boolean }) {
  if (!item.is_available)
    return <span className="absolute top-3 right-3 rounded-full bg-slate-800/90 border border-white/15 px-3 py-1 text-xs font-black text-slate-300">🚫 غير متوفر</span>;
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1 items-start">
      {item.is_popular && <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-white shadow-glow">🔥 الأكثر طلباً</span>}
      {item.is_new && <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">🆕 جديد</span>}
      {hasOffer && <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-navy-900">⏰ عرض محدود</span>}
    </div>
  );
}

export function ItemCard({ item, hasOffer, layout }: { item: MenuItem; hasOffer: boolean; layout: string }) {
  const cart = useCart();
  const [imgOk, setImgOk] = useState(true);
  const line = cart.lines.find((l) => l.item_id === item.id);
  const qty = line?.quantity ?? 0;
  const disabled = !item.is_available;

  if (layout === 'list') {
    return (
      <article className={`card rise overflow-hidden flex ${disabled ? 'opacity-60' : ''}`}>
        <div className="relative w-28 h-28 shrink-0 bg-navy-700">
          {item.image_url && imgOk ? (
            <img src={item.image_url} alt={item.name_ar} loading="lazy" onError={() => setImgOk(false)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">🍜</div>
          )}
          <Badge item={item} hasOffer={hasOffer} />
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="font-black text-white">{item.name_ar}</h3>
            {item.description_ar && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.description_ar}</p>}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-brand-400">{money(item.price)} <span className="text-xs font-bold">ريال</span></span>
              {item.old_price && Number(item.old_price) > Number(item.price) && (
                <span className="text-xs text-slate-500 line-through">{money(item.old_price)}</span>
              )}
            </div>
            {qty === 0 ? (
              <button disabled={disabled} onClick={() => cart.add(item)} className="btn-primary !px-4 !py-2 !text-xs disabled:opacity-40">
                {disabled ? 'غير متوفر' : '+ أضف'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => cart.setQty(item.id, qty - 1)} className="h-9 w-9 rounded-xl bg-white/10 font-black">−</button>
                <span className="min-w-6 text-center font-black">{qty}</span>
                <button onClick={() => cart.setQty(item.id, qty + 1)} className="h-9 w-9 rounded-xl bg-brand-500 font-black text-white">+</button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`card rise group overflow-hidden transition hover:-translate-y-1 hover:border-brand-500/40 ${disabled ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[4/3] bg-navy-700 overflow-hidden">
        {item.image_url && imgOk ? (
          <img src={item.image_url} alt={item.name_ar} loading="lazy" onError={() => setImgOk(false)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">🍜</div>
        )}
        <Badge item={item} hasOffer={hasOffer} />
      </div>
      <div className="p-4">
        <h3 className="font-black text-white leading-snug">{item.name_ar}</h3>
        {item.description_ar && <p className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-8">{item.description_ar}</p>}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-brand-400">{money(item.price)} <span className="text-xs font-bold">ريال</span></span>
            {item.old_price && Number(item.old_price) > Number(item.price) && (
              <span className="text-xs text-slate-500 line-through">{money(item.old_price)}</span>
            )}
          </div>
          {qty === 0 ? (
            <button disabled={disabled} onClick={() => cart.add(item)} className="btn-primary !px-4 !py-2 !text-xs disabled:opacity-40">
              {disabled ? 'غير متوفر' : '+ أضف'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => cart.setQty(item.id, qty - 1)} className="h-9 w-9 rounded-xl bg-white/10 font-black">−</button>
              <span className="min-w-6 text-center font-black">{qty}</span>
              <button onClick={() => cart.setQty(item.id, qty + 1)} className="h-9 w-9 rounded-xl bg-brand-500 font-black text-white">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
