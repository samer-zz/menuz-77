import { useCart } from '../lib/cart';
import { money } from '../lib/format';

export function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const cart = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-navy-850 border border-white/10 p-5 rise">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">🛒 سلة الطلبات <span className="text-brand-400">({cart.count})</span></h2>
          <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white/10 font-black">✕</button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <div className="text-5xl mb-3">🧺</div>
            <p className="font-bold">سلتك فارغة</p>
            <p className="text-xs mt-1">أضف أصنافاً من المنيو ثم أكمل الطلب</p>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {cart.lines.map((l) => (
                <li key={l.item_id} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{l.name_ar}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{money(l.unit_price)} ريال × {l.quantity} = <span className="text-brand-400 font-black">{money(l.unit_price * l.quantity)} ريال</span></p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => cart.setQty(l.item_id, l.quantity - 1)} className="h-8 w-8 rounded-lg bg-white/10 font-black">−</button>
                      <span className="min-w-6 text-center font-black text-sm">{l.quantity}</span>
                      <button onClick={() => cart.setQty(l.item_id, l.quantity + 1)} className="h-8 w-8 rounded-lg bg-brand-500 text-white font-black">+</button>
                      <button onClick={() => cart.remove(l.item_id)} className="h-8 w-8 rounded-lg bg-red-500/15 text-red-400 font-black">🗑</button>
                    </div>
                  </div>
                  <input
                    value={l.note}
                    onChange={(e) => cart.setNote(l.item_id, e.target.value)}
                    placeholder="ملاحظة للصنف (اختياري) — مثال: بدون بصل"
                    className="field mt-2 !py-2 !text-xs"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-500/10 border border-brand-500/30 px-4 py-3">
              <span className="font-bold text-slate-200">المجموع الفرعي</span>
              <span className="text-xl font-black text-brand-400">{money(cart.subtotal)} ريال</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={onClose} className="btn-ghost">متابعة التصفح</button>
              <button onClick={onCheckout} className="btn-primary">إتمام الطلب ←</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
