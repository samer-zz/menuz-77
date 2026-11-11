import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchMenu, trackItemView, trackPageView, type MenuSnapshot } from '../lib/api';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import { MenuzIcon } from '../components/Logo';
import { OfferTicker } from '../components/OfferTicker';
import { CategoryBar } from '../components/CategoryBar';
import { ItemCard } from '../components/ItemCard';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { MenuFooter } from '../components/Footer';

export function MenuPage() {
  const cart = useCart();
  const [snap, setSnap] = useState<MenuSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCat, setActiveCat] = useState<string | 'all'>('all');
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const tracked = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchMenu();
        setSnap(s);
        if (!tracked.current) {
          tracked.current = true;
          trackPageView('/');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'تعذر تحميل المنيو');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const h = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const offerItemIds = useMemo(() => new Set((snap?.offers ?? []).map((o) => o.item_id).filter(Boolean) as string[]), [snap]);

  const visibleItems = useMemo(() => {
    if (!snap) return [];
    let list = snap.items;
    if (activeCat !== 'all') list = list.filter((i) => i.category_id === activeCat);
    const q = query.trim();
    if (q) list = list.filter((i) => i.name_ar.includes(q) || (i.description_ar ?? '').includes(q));
    return list;
  }, [snap, activeCat, query]);

  const grouped = useMemo(() => {
    if (!snap) return [];
    if (activeCat !== 'all' || query.trim()) return [{ cat: null as any, items: visibleItems }];
    return snap.categories
      .map((c) => ({ cat: c, items: visibleItems.filter((i) => i.category_id === c.id) }))
      .filter((g) => g.items.length);
  }, [snap, visibleItems, activeCat, query]);

  if (loading) {
    return (
      <div className="bg-menuz min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <MenuzIcon size={84} className="animate-pulse" />
        <p className="font-black text-white">جارٍ تحضير المنيو…</p>
        <p className="text-xs text-slate-400">امسح.. اطلب.. واستمتع</p>
      </div>
    );
  }

  if (error || !snap) {
    return (
      <div className="bg-menuz min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <MenuzIcon size={84} />
        <p className="font-black text-white">تعذر تحميل المنيو</p>
        <p className="text-sm text-slate-400">{error}</p>
        <button onClick={() => location.reload()} className="btn-primary">إعادة المحاولة</button>
      </div>
    );
  }

  const v = snap.venue;

  if (!v.is_active) {
    return (
      <div className="bg-menuz min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <MenuzIcon size={84} />
        <h1 className="text-xl font-black text-white">{v.name_ar}</h1>
        <p className="max-w-md rounded-2xl bg-amber-500/10 border border-amber-500/40 px-5 py-4 text-sm font-bold text-amber-200">
          ⏸️ {v.suspension_message || 'هذه الخدمة موقفة حالياً، للاستفسار يرجى التواصل مع الإدارة.'}
        </p>
        <MenuFooter venue={v} wallets={snap.wallets} />
      </div>
    );
  }

  return (
    <div className="bg-menuz min-h-screen pb-28">
      {/* ===== الترويسة ===== */}
      <header className="relative overflow-hidden">
        {v.cover_url && (
          <img src={v.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" loading="eager" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/70 to-navy-900" />
        <div className="bg-qr-dots absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-300">
            <MenuzIcon size={26} />
            <span>مينوز | MENUZ — القائمة الرقمية الذكية</span>
          </div>

          <div className="relative mx-auto mt-5 h-32 w-32">
            <div className="absolute -inset-2 rounded-full bg-brand-500/20 blur-xl" />
            {v.logo_url ? (
              <img src={v.logo_url} alt={v.name_ar} className="relative h-32 w-32 rounded-full border-4 border-brand-500/70 object-cover shadow-glow" loading="eager" />
            ) : (
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-brand-500/70 bg-navy-800 text-5xl">🍜</div>
            )}
            <div className="steam absolute -top-4 right-1/2 translate-x-1/2 text-brand-300 text-lg font-black">
              <span>~</span> <span>~</span> <span>~</span>
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-black text-white text-glow">{v.name_ar}</h1>
          {v.name_en && <p className="mt-1 text-sm font-black tracking-[0.3em] text-gold-400" dir="ltr">{v.name_en}</p>}
          {v.tagline_ar && <p className="mt-2 text-sm text-slate-300">{v.tagline_ar}</p>}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {v.show_story && v.story_ar && (
              <button onClick={() => setStoryOpen(true)} className="btn-primary !py-2.5">📖 قصتنا</button>
            )}
            {v.phone && (
              <a href={`tel:${v.phone}`} className="btn-ghost !py-2.5">📞 {v.phone}</a>
            )}
            {installPrompt && (
              <button onClick={async () => { await installPrompt.prompt(); setInstallPrompt(null); }} className="btn-ghost !py-2.5">📲 تثبيت التطبيق</button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <div className="mt-2"><OfferTicker offers={snap.offers} /></div>

        {/* بحث */}
        <div className="mt-4 relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 ابحث عن صنف… مثال: جبن"
            className="field !rounded-full !py-3 !pr-11"
          />
        </div>

        <CategoryBar categories={snap.categories} active={activeCat} onSelect={setActiveCat} />

        {/* الأصناف */}
        <div className="mt-5 space-y-8">
          {grouped.map((g, gi) => (
            <section key={g.cat?.id ?? `g${gi}`}>
              {g.cat && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{g.cat.icon ?? '🍽️'}</span>
                  <h2 className="text-xl font-black text-white">{g.cat.name_ar}</h2>
                  <span className="h-px flex-1 bg-gradient-to-l from-brand-500/50 to-transparent" />
                  <span className="text-xs text-slate-500 font-bold">{g.items.length} صنف</span>
                </div>
              )}
              <div className={v.layout_mode === 'list' ? 'grid gap-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'}>
                {g.items.map((item) => (
                  <div key={item.id} onClick={() => trackItemView(item.id)}>
                    <ItemCard item={item} hasOffer={offerItemIds.has(item.id)} layout={v.layout_mode} />
                  </div>
                ))}
              </div>
            </section>
          ))}
          {!visibleItems.length && (
            <div className="py-14 text-center text-slate-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold">لا توجد أصناف مطابقة</p>
              <p className="text-xs mt-1">جرّب كلمة أخرى أو تصفح كل الأقسام</p>
            </div>
          )}
        </div>
      </main>

      <MenuFooter venue={v} wallets={snap.wallets} />

      {/* شريط السلة السفلي */}
      {cart.count > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 sm:w-[480px] z-40 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black px-5 py-4 shadow-glow flex items-center justify-between transition active:scale-[0.98]"
        >
          <span>🛒 عرض السلة ({cart.count})</span>
          <span>{money(cart.subtotal)} ريال</span>
        </button>
      )}

      {/* نافذة قصتنا */}
      {storyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setStoryOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-navy-850 border border-white/10 p-6 rise">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white">📖 قصتنا</h2>
              <button onClick={() => setStoryOpen(false)} className="h-9 w-9 rounded-xl bg-white/10 font-black">✕</button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-loose text-slate-200">{v.story_ar}</p>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} venue={v} wallets={snap.wallets} />
    </div>
  );
}
