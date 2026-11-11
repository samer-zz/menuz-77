import { useMemo, useState } from 'react';
import { useCart } from '../lib/cart';
import { placeOrder } from '../lib/api';
import { buildInvoiceText, smsUrl, whatsappUrl } from '../lib/invoice';
import { money } from '../lib/format';
import type { Venue, Wallet } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  venue: Venue;
  wallets: Wallet[];
}

export function CheckoutModal({ open, onClose, venue, wallets }: Props) {
  const cart = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fulfilment, setFulfilment] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<'cash' | 'wallet'>('cash');
  const [walletId, setWalletId] = useState('');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ orderNumber: number; text: string } | null>(null);

  const deliveryFee = fulfilment === 'delivery' && venue.delivery_available ? Number(venue.delivery_fee) : 0;
  const total = cart.subtotal + deliveryFee;
  const wallet = wallets.find((w) => w.id === walletId);

  const invoiceText = useMemo(() => {
    if (!done) return '';
    return done.text;
  }, [done]);

  if (!open) return null;

  async function submit() {
    setErr('');
    if (name.trim().length < 2) return setErr('فضلاً أدخل الاسم (حرفان على الأقل)');
    const digits = phone.replace(/[^\d+]/g, '');
    if (!/^(00967|967|\+967)?7[0-9]{8}$/.test(digits)) return setErr('رقم الجوال غير صحيح — يجب أن يبدأ بـ 7 ويتكون من 9 أرقام (مثال: 785184242)');
    if (fulfilment === 'delivery' && venue.delivery_available && address.trim().length < 4) return setErr('فضلاً أدخل عنوان التوصيل');
    if (payment === 'wallet') {
      if (!walletId) return setErr('اختر المحفظة الإلكترونية');
      if (ref.trim().length < 4) return setErr('أدخل رقم العملية (4 أحرف على الأقل)');
    }
    if (!cart.lines.length) return setErr('السلة فارغة');

    setBusy(true);
    try {
      const res = await placeOrder({
        customer_name: name.trim(),
        customer_phone: digits,
        customer_address: fulfilment === 'delivery' ? address.trim() : undefined,
        customer_note: note.trim() || undefined,
        fulfilment,
        payment_method: payment,
        wallet_id: payment === 'wallet' ? walletId : undefined,
        payment_reference: payment === 'wallet' ? ref.trim() : undefined,
        send_channel: channel,
        items: cart.lines.map((l) => ({ item_id: l.item_id, quantity: l.quantity, note: l.note || undefined })),
      });
      const text = buildInvoiceText({
        venueName: venue.name_ar,
        orderNumber: res.order_number,
        customerName: name.trim(),
        customerPhone: digits,
        fulfilment,
        address: fulfilment === 'delivery' ? address.trim() : undefined,
        paymentMethod: payment,
        walletName: wallet?.name,
        paymentRef: payment === 'wallet' ? ref.trim() : undefined,
        note: note.trim() || undefined,
        lines: cart.lines,
        subtotal: Number(res.subtotal),
        deliveryFee: Number(res.delivery_fee),
        total: Number(res.total),
        currency: venue.currency,
      });
      setDone({ orderNumber: res.order_number, text });
      cart.clear();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ';
      const map: Record<string, string> = {
        MENU_CLOSED: 'المنيو موقوف حالياً — تواصل مع الإدارة',
        PHONE_INVALID: 'رقم الجوال غير صحيح',
        TOO_FAST: 'طلبت للتو — انتظر دقيقة ثم حاول مجدداً',
        WALLET_REQUIRED: 'اختر محفظة صحيحة',
        REFERENCE_REQUIRED: 'أدخل رقم العملية',
        EMPTY_CART: 'السلة فارغة',
      };
      setErr(map[msg] ?? `تعذر إرسال الطلب: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDone(null);
    setErr('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={reset} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-navy-850 border border-white/10 p-5 rise">
        {!done ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">🧾 إتمام الطلب والفاتورة</h2>
              <button onClick={reset} className="h-9 w-9 rounded-xl bg-white/10 font-black">✕</button>
            </div>

            {/* معاينة الفاتورة القابلة للتعديل */}
            <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
              <p className="text-xs font-bold text-slate-400 mb-2">📋 فاتورتك — يمكنك تعديل الكميات والملاحظات</p>
              <ul className="space-y-2">
                {cart.lines.map((l) => (
                  <li key={l.item_id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex-1 font-bold text-white">{l.name_ar}</span>
                    <span className="flex items-center gap-1">
                      <button onClick={() => cart.setQty(l.item_id, l.quantity - 1)} className="h-7 w-7 rounded-lg bg-white/10 font-black">−</button>
                      <span className="min-w-6 text-center font-black">{l.quantity}</span>
                      <button onClick={() => cart.setQty(l.item_id, l.quantity + 1)} className="h-7 w-7 rounded-lg bg-brand-500 text-white font-black">+</button>
                    </span>
                    <span className="w-24 text-left font-black text-brand-400">{money(l.unit_price * l.quantity)} ريال</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-dashed border-white/15 pt-2 space-y-1 text-sm">
                <div className="flex justify-between text-slate-300"><span>المجموع الفرعي</span><span>{money(cart.subtotal)} ريال</span></div>
                {deliveryFee > 0 && <div className="flex justify-between text-slate-300"><span>التوصيل</span><span>{money(deliveryFee)} ريال</span></div>}
                <div className="flex justify-between font-black text-white text-base"><span>الإجمالي</span><span className="text-brand-400">{money(total)} ريال</span></div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="الاسم الكريم *" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="field" placeholder="رقم الجوال * 7xxxxxxxx" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-1.5">طريقة الاستلام</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setFulfilment('delivery')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${fulfilment === 'delivery' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    🛵 توصيل {venue.delivery_available && Number(venue.delivery_fee) > 0 ? `(+${money(venue.delivery_fee)})` : ''}
                  </button>
                  <button onClick={() => setFulfilment('pickup')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${fulfilment === 'pickup' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    🏪 استلام من المحل
                  </button>
                </div>
                {fulfilment === 'delivery' && venue.delivery_available && (
                  <input className="field mt-2" placeholder="عنوان التوصيل بالتفصيل *" value={address} onChange={(e) => setAddress(e.target.value)} />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-1.5">طريقة الدفع</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPayment('cash')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${payment === 'cash' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    💵 نقداً عند الاستلام
                  </button>
                  <button onClick={() => setPayment('wallet')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${payment === 'wallet' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    📱 محفظة إلكترونية
                  </button>
                </div>
                {payment === 'wallet' && (
                  <div className="mt-2 space-y-2">
                    <select className="field" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                      <option value="">— اختر المحفظة —</option>
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} — {w.account_number}</option>
                      ))}
                    </select>
                    {wallet && (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm">
                        <p className="font-bold text-white">حوّل إلى: <span className="text-brand-400">{wallet.account_number}</span></p>
                        {wallet.account_holder && <p className="text-xs text-slate-400 mt-0.5">باسم: {wallet.account_holder}</p>}
                        {wallet.image_url && <img src={wallet.image_url} alt={wallet.name} className="mt-2 max-h-40 rounded-lg object-contain" loading="lazy" />}
                      </div>
                    )}
                    <input className="field" placeholder="رقم العملية (من رسالة المحفظة) *" value={ref} onChange={(e) => setRef(e.target.value)} />
                  </div>
                )}
              </div>

              <textarea className="field" rows={2} placeholder="ملاحظات إضافية (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />

              <div>
                <p className="text-xs font-bold text-slate-400 mb-1.5">إرسال الطلب عبر</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setChannel('whatsapp')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${channel === 'whatsapp' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    💬 واتساب
                  </button>
                  <button onClick={() => setChannel('sms')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${channel === 'sms' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                    ✉️ رسالة نصية SMS
                  </button>
                </div>
              </div>

              {err && <p className="rounded-xl bg-red-500/15 border border-red-500/40 px-4 py-2.5 text-sm font-bold text-red-300">⚠️ {err}</p>}

              <button disabled={busy} onClick={submit} className="btn-primary w-full !py-3.5 disabled:opacity-50">
                {busy ? 'جارٍ إرسال الطلب…' : '✅ تأكيد وإرسال الطلب'}
              </button>
              <p className="text-center text-[11px] text-slate-500">بالضغط على تأكيد سيُحفظ طلبك ويُجهَّز إرساله بصيغة فاتورة احترافية</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-3xl">✅</div>
              <h2 className="mt-3 text-xl font-black text-white">تم استلام طلبك! 🎉</h2>
              <p className="text-sm text-slate-400 mt-1">رقم الطلب: <span className="font-black text-brand-400">#{done.orderNumber}</span></p>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-black/40 border border-white/10 p-4 text-[13px] leading-relaxed text-slate-200 max-h-64 overflow-y-auto">{invoiceText}</pre>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={whatsappUrl(venue.whatsapp, invoiceText)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-3 text-sm transition">
                💬 إرسال عبر واتساب
              </a>
              <a href={smsUrl(venue.phone, invoiceText)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold px-4 py-3 text-sm transition">
                ✉️ إرسال عبر SMS
              </a>
            </div>
            <button onClick={reset} className="btn-ghost w-full mt-2">إغلاق</button>
          </>
        )}
      </div>
    </div>
  );
}
