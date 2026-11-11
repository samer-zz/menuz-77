import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../lib/auth';
import {
  deleteCategory, deleteItem, deleteOffer, deleteProfile, deleteWallet,
  fetchCategoriesAdmin, fetchItemsAdmin, fetchOffersAdmin, fetchOrderItems,
  fetchOrders, fetchProfiles, fetchStats, fetchVenueRow, fetchWalletsAdmin,
  saveCategory, saveItem, saveOffer, saveWallet, updateOrderStatus, updateProfile, updateVenue,
} from '../lib/api';
import { uploadImage } from '../lib/image';
import { fmtDate, fmtDay, money } from '../lib/format';
import { BarChart, StatCard } from '../components/Charts';
import { MenuzIcon } from '../components/Logo';
import type { AdminStats, Category, MenuItem, Offer, OrderItemRow, OrderRow, Profile, Venue, Wallet } from '../lib/types';

type Tab = 'dash' | 'cats' | 'items' | 'offers' | 'wallets' | 'orders' | 'venue' | 'users' | 'qr';

const STATUS_AR: Record<string, string> = {
  pending: '⏳ قيد الانتظار', confirmed: '✅ مؤكد', preparing: '👨‍🍳 قيد التحضير',
  delivering: '🛵 قيد التوصيل', completed: '🎉 مكتمل', cancelled: '🚫 ملغي',
};

export function AdminPage() {
  const { user, profile, role, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dash');

  if (loading) return <div className="bg-menuz min-h-screen flex items-center justify-center"><MenuzIcon size={72} className="animate-pulse" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!profile || !profile.is_active) {
    return (
      <div className="bg-menuz min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <MenuzIcon size={72} />
        <p className="font-black text-white">حسابك غير مفعّل أو غير موجود</p>
        <p className="text-sm text-slate-400">تواصل مع مدير النظام: <a className="text-brand-400 font-bold" href="tel:776951100">776951100</a></p>
        <button onClick={signOut} className="btn-ghost">تسجيل الخروج</button>
      </div>
    );
  }

  const isSuper = role === 'super_admin';
  const tabs: { id: Tab; label: string; superOnly?: boolean }[] = [
    { id: 'dash', label: '📊 الإحصائيات' },
    { id: 'cats', label: '🗂️ الأقسام' },
    { id: 'items', label: '🍜 الأصناف' },
    { id: 'offers', label: '🔥 العروض' },
    { id: 'wallets', label: '👛 المحافظ' },
    { id: 'orders', label: '🧾 الطلبات' },
    { id: 'venue', label: '🏪 بيانات الجهة', superOnly: true },
    { id: 'users', label: '👥 المستخدمون', superOnly: true },
    { id: 'qr', label: '📷 QR Code' },
  ];

  return (
    <div className="bg-menuz min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-900/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <MenuzIcon size={40} />
            <div>
              <p className="font-black text-white leading-tight">لوحة تحكم مينوز</p>
              <p className="text-[11px] text-slate-400">{profile.full_name ?? user.email} — {isSuper ? 'مدير النظام (سامرز)' : 'مسؤول الجهة'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="btn-ghost !px-3 !py-2 !text-xs">👁️ معاينة المنيو</a>
            <button onClick={signOut} className="btn-ghost !px-3 !py-2 !text-xs">🚪 خروج</button>
          </div>
        </div>
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {tabs.filter((t) => !t.superOnly || isSuper).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${tab === t.id ? 'bg-brand-500 text-white shadow-glow' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'dash' && <DashTab />}
        {tab === 'cats' && <CatsTab />}
        {tab === 'items' && <ItemsTab />}
        {tab === 'offers' && <OffersTab />}
        {tab === 'wallets' && <WalletsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'venue' && isSuper && <VenueTab />}
        {tab === 'users' && isSuper && <UsersTab />}
        {tab === 'qr' && <QrTab />}
      </main>
    </div>
  );
}

/* ================= الإحصائيات ================= */
function DashTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [days, setDays] = useState(30);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchStats(days).then(setStats).catch((e) => setErr(e instanceof Error ? e.message : 'خطأ'));
  }, [days]);

  if (err) return <p className="text-red-300 font-bold">⚠️ {err}</p>;
  if (!stats) return <p className="text-slate-400 font-bold">جارٍ تحميل الإحصائيات…</p>;

  const daily = stats.daily.map((d) => ({ label: fmtDay(d.day), value: d.views }));
  const hours = Array.from({ length: 24 }, (_, h) => {
    const found = stats.peak_hours.find((p) => p.hour === h);
    return { label: `${h}:00`, value: found?.count ?? 0 };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-400">الفترة:</span>
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-xs font-black ${days === d ? 'bg-brand-500 text-white' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
            {d === 7 ? 'أسبوع' : d === 30 ? 'شهر' : '90 يوم'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon="👀" label="مسحات اليوم" value={stats.views_today} />
        <StatCard icon="📅" label="مسحات الأسبوع" value={stats.views_week} />
        <StatCard icon="🗓️" label="مسحات الشهر" value={stats.views_month} />
        <StatCard icon="🧾" label="طلبات اليوم" value={stats.orders_today} />
        <StatCard icon="💰" label="إيراد الفترة" value={`${money(stats.revenue_period)} ر`} />
        <StatCard icon="⏳" label="طلبات معلقة" value={stats.pending_orders} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4"><BarChart data={daily} label="المسحات يومياً" /></div>
        <div className="card p-4"><BarChart data={hours} label="أوقات الذروة (حسب الساعة — بتوقيت عدن)" color="#16407F" /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="font-black text-white mb-3">👁️ الأصناف الأكثر مشاهدة</p>
          {stats.top_items.length ? (
            <ul className="space-y-2">
              {stats.top_items.map((t, i) => (
                <li key={t.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="font-bold text-slate-200">{i + 1}. {t.name_ar}</span>
                  <span className="font-black text-brand-400">{t.views} مشاهدة</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">لا توجد بيانات مشاهدة بعد</p>}
        </div>
        <div className="card p-4">
          <p className="font-black text-white mb-3">🛒 الأكثر طلباً</p>
          {stats.top_ordered.length ? (
            <ul className="space-y-2">
              {stats.top_ordered.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="font-bold text-slate-200">{i + 1}. {t.name_ar}</span>
                  <span className="font-black text-brand-400">{t.qty} قطعة — {money(t.revenue)} ر</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">لا توجد طلبات بعد</p>}
        </div>
      </div>
    </div>
  );
}

/* ================= الأقسام ================= */
function CatsTab() {
  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Category>>({ name_ar: '', icon: '🍽️', sort_order: 0, is_active: true });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = () => fetchCategoriesAdmin().then(setRows);
  useEffect(() => { load(); }, []);

  async function save() {
    setMsg('');
    if (!form.name_ar?.trim()) return setMsg('أدخل اسم القسم');
    try {
      await saveCategory({ ...form, name_ar: form.name_ar.trim() });
      setForm({ name_ar: '', icon: '🍽️', sort_order: rows.length + 1, is_active: true });
      setEditing(null);
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'خطأ'); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="card p-4 h-fit">
        <p className="font-black text-white">{editing ? 'تعديل قسم' : 'إضافة قسم جديد'}</p>
        <div className="mt-3 space-y-2">
          <input className="field" placeholder="اسم القسم *" value={form.name_ar ?? ''} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="field" placeholder="أيقونة (إيموجي)" value={form.icon ?? ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <input className="field" type="number" placeholder="الترتيب" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-orange-500" />
            ظاهر في المنيو
          </label>
          {msg && <p className="text-sm font-bold text-red-300">⚠️ {msg}</p>}
          <button onClick={save} className="btn-primary w-full">{editing ? 'حفظ التعديل' : '➕ إضافة القسم'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ name_ar: '', icon: '🍽️', sort_order: 0, is_active: true }); }} className="btn-ghost w-full">إلغاء</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((c) => (
          <div key={c.id} className="card p-3 flex items-center gap-3">
            <span className="text-2xl">{c.icon ?? '🍽️'}</span>
            <div className="flex-1">
              <p className="font-black text-white">{c.name_ar}</p>
              <p className="text-xs text-slate-500">ترتيب {c.sort_order} — {c.is_active ? 'ظاهر' : 'مخفي'}</p>
            </div>
            <button onClick={() => { setEditing(c.id); setForm({ ...c }); }} className="btn-ghost !px-3 !py-2 !text-xs">✏️ تعديل</button>
            <button onClick={async () => { if (confirm('حذف القسم وكل أصنافه؟')) { await deleteCategory(c.id); load(); } }} className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs font-black text-red-300">🗑 حذف</button>
          </div>
        ))}
        {!rows.length && <p className="text-slate-500 font-bold">لا توجد أقسام بعد</p>}
      </div>
    </div>
  );
}

/* ================= الأصناف ================= */
function ItemsTab() {
  const [rows, setRows] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<MenuItem>>({ name_ar: '', price: 0, is_available: true, is_popular: false, is_new: false, sort_order: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => { setRows(await fetchItemsAdmin()); setCats(await fetchCategoriesAdmin()); };
  useEffect(() => { load(); }, []);

  async function save() {
    setMsg('');
    if (!form.name_ar?.trim()) return setMsg('أدخل اسم الصنف');
    if (!form.category_id) return setMsg('اختر القسم');
    if (!(Number(form.price) > 0)) return setMsg('أدخل سعراً صحيحاً');
    setBusy(true);
    try {
      await saveItem({ ...form, name_ar: form.name_ar.trim() });
      setForm({ name_ar: '', price: 0, is_available: true, is_popular: false, is_new: false, sort_order: 0 });
      setEditing(null);
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'خطأ'); }
    finally { setBusy(false); }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, 'items');
      setForm((f) => ({ ...f, image_url: url }));
    } catch (e) { setMsg(e instanceof Error ? e.message : 'فشل رفع الصورة'); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="card p-4 h-fit">
        <p className="font-black text-white">{editing ? 'تعديل صنف' : 'إضافة صنف جديد'}</p>
        <div className="mt-3 space-y-2">
          <input className="field" placeholder="اسم الصنف *" value={form.name_ar ?? ''} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <textarea className="field" rows={2} placeholder="الوصف (اختياري)" value={form.description_ar ?? ''} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
          <select className="field" value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">— اختر القسم —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input className="field" type="number" placeholder="السعر *" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <input className="field" type="number" placeholder="السعر قبل الخصم" value={form.old_price ?? ''} onChange={(e) => setForm({ ...form, old_price: e.target.value === '' ? null : Number(e.target.value) })} />
            <input className="field" type="number" placeholder="الترتيب" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">صورة الصنف (تُضغط تلقائياً)</label>
            <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="field mt-1 !py-2 text-xs" />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-28 w-full rounded-xl object-cover" />}
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-300">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.is_available ?? true} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="h-4 w-4 accent-orange-500" /> متوفر</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.is_popular ?? false} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="h-4 w-4 accent-orange-500" /> 🔥 الأكثر طلباً</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.is_new ?? false} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="h-4 w-4 accent-orange-500" /> 🆕 جديد</label>
          </div>
          {msg && <p className="text-sm font-bold text-red-300">⚠️ {msg}</p>}
          <button disabled={busy} onClick={save} className="btn-primary w-full disabled:opacity-50">{busy ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديل' : '➕ إضافة الصنف'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ name_ar: '', price: 0, is_available: true, is_popular: false, is_new: false, sort_order: 0 }); }} className="btn-ghost w-full">إلغاء</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((it) => (
          <div key={it.id} className="card p-3 flex items-center gap-3">
            {it.image_url ? <img src={it.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-2xl">🍜</span>}
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">{it.name_ar}</p>
              <p className="text-xs text-slate-500">{cats.find((c) => c.id === it.category_id)?.name_ar ?? ''} — <span className="text-brand-400 font-black">{money(it.price)} ريال</span> — {it.is_available ? 'متوفر' : '🚫 غير متوفر'}</p>
            </div>
            <button onClick={() => { setEditing(it.id); setForm({ ...it }); }} className="btn-ghost !px-3 !py-2 !text-xs">✏️</button>
            <button onClick={async () => { if (confirm('حذف الصنف؟')) { await deleteItem(it.id); load(); } }} className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs font-black text-red-300">🗑</button>
          </div>
        ))}
        {!rows.length && <p className="text-slate-500 font-bold">لا توجد أصناف بعد</p>}
      </div>
    </div>
  );
}

/* ================= العروض ================= */
function OffersTab() {
  const [rows, setRows] = useState<Offer[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<Partial<Offer>>({ title_ar: '', is_active: true, sort_order: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => { setRows(await fetchOffersAdmin()); setItems(await fetchItemsAdmin()); };
  useEffect(() => { load(); }, []);

  async function save() {
    setMsg('');
    if (!form.title_ar?.trim()) return setMsg('أدخل عنوان العرض');
    if (!form.starts_at) return setMsg('حدد تاريخ بدء العرض');
    setBusy(true);
    try {
      await saveOffer({ ...form, title_ar: form.title_ar.trim() });
      setForm({ title_ar: '', is_active: true, sort_order: 0 });
      setEditing(null);
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'خطأ'); }
    finally { setBusy(false); }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, 'offers');
      setForm((f) => ({ ...f, image_url: url }));
    }
    catch (e) { setMsg(e instanceof Error ? e.message : 'فشل رفع الصورة'); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="card p-4 h-fit">
        <p className="font-black text-white">{editing ? 'تعديل عرض' : 'إضافة عرض جديد'}</p>
        <p className="mt-1 text-xs text-slate-500">يختفي العرض تلقائياً بعد انتهاء الوقت ⏰</p>
        <div className="mt-3 space-y-2">
          <input className="field" placeholder="عنوان العرض *" value={form.title_ar ?? ''} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} />
          <textarea className="field" rows={2} placeholder="وصف العرض" value={form.description_ar ?? ''} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
          <select className="field" value={form.item_id ?? ''} onChange={(e) => setForm({ ...form, item_id: e.target.value || null })}>
            <option value="">— ربط بصنف (اختياري) —</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name_ar}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400">يبدأ في</label>
              <input className="field mt-1 !py-2 text-xs" type="datetime-local" value={form.starts_at ? form.starts_at.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, starts_at: new Date(e.target.value).toISOString() })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400">ينتهي في</label>
              <input className="field mt-1 !py-2 text-xs" type="datetime-local" value={form.ends_at ? form.ends_at.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">صورة العرض (اختياري)</label>
            <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="field mt-1 !py-2 text-xs" />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-28 w-full rounded-xl object-cover" />}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-orange-500" />
            العرض مفعّل
          </label>
          {msg && <p className="text-sm font-bold text-red-300">⚠️ {msg}</p>}
          <button disabled={busy} onClick={save} className="btn-primary w-full disabled:opacity-50">{busy ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديل' : '➕ إضافة العرض'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ title_ar: '', is_active: true, sort_order: 0 }); }} className="btn-ghost w-full">إلغاء</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((o) => (
          <div key={o.id} className="card p-3 flex items-center gap-3">
            {o.image_url ? <img src={o.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-2xl">🔥</span>}
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">{o.title_ar}</p>
              <p className="text-xs text-slate-500">{fmtDate(o.starts_at)} ← {o.ends_at ? fmtDate(o.ends_at) : 'بدون انتهاء'} — {o.is_active ? 'مفعّل' : 'موقوف'}</p>
            </div>
            <button onClick={() => { setEditing(o.id); setForm({ ...o }); }} className="btn-ghost !px-3 !py-2 !text-xs">✏️</button>
            <button onClick={async () => { if (confirm('حذف العرض؟')) { await deleteOffer(o.id); load(); } }} className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs font-black text-red-300">🗑</button>
          </div>
        ))}
        {!rows.length && <p className="text-slate-500 font-bold">لا توجد عروض بعد</p>}
      </div>
    </div>
  );
}

/* ================= المحافظ ================= */
function WalletsTab() {
  const [rows, setRows] = useState<Wallet[]>([]);
  const [form, setForm] = useState<Partial<Wallet>>({ name: '', account_number: '', is_active: true, sort_order: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => fetchWalletsAdmin().then(setRows);
  useEffect(() => { load(); }, []);

  async function save() {
    setMsg('');
    if (!form.name?.trim() || !form.account_number?.trim()) return setMsg('أدخل اسم المحفظة ورقمها');
    setBusy(true);
    try {
      await saveWallet({ ...form });
      setForm({ name: '', account_number: '', is_active: true, sort_order: 0 });
      setEditing(null);
      await load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'خطأ'); }
    finally { setBusy(false); }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, 'wallets');
      setForm((f) => ({ ...f, image_url: url }));
    }
    catch (e) { setMsg(e instanceof Error ? e.message : 'فشل رفع الصورة'); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="card p-4 h-fit">
        <p className="font-black text-white">{editing ? 'تعديل محفظة' : 'إضافة محفظة'}</p>
        <div className="mt-3 space-y-2">
          <input className="field" placeholder="اسم المحفظة * (جيب، جوالي…)" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field" placeholder="رقم المحفظة *" value={form.account_number ?? ''} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
          <input className="field" placeholder="اسم صاحب الحساب (اختياري)" value={form.account_holder ?? ''} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} />
          <div>
            <label className="text-xs font-bold text-slate-400">صورة المحفظة / QR (اختياري)</label>
            <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="field mt-1 !py-2 text-xs" />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-28 w-full rounded-xl object-contain bg-white/5" />}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-orange-500" />
            ظاهرة للزبائن
          </label>
          {msg && <p className="text-sm font-bold text-red-300">⚠️ {msg}</p>}
          <button disabled={busy} onClick={save} className="btn-primary w-full disabled:opacity-50">{busy ? 'جارٍ الحفظ…' : editing ? 'حفظ التعديل' : '➕ إضافة المحفظة'}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ name: '', account_number: '', is_active: true, sort_order: 0 }); }} className="btn-ghost w-full">إلغاء</button>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((w) => (
          <div key={w.id} className="card p-3 flex items-center gap-3">
            {w.image_url ? <img src={w.image_url} alt="" className="h-14 w-14 rounded-xl object-contain bg-white/5" /> : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/15 text-2xl">📱</span>}
            <div className="flex-1">
              <p className="font-black text-white">{w.name}</p>
              <p className="text-xs text-slate-500" dir="ltr">{w.account_number}</p>
            </div>
            <button onClick={() => { setEditing(w.id); setForm({ ...w }); }} className="btn-ghost !px-3 !py-2 !text-xs">✏️</button>
            <button onClick={async () => { if (confirm('حذف المحفظة؟')) { await deleteWallet(w.id); load(); } }} className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs font-black text-red-300">🗑</button>
          </div>
        ))}
        {!rows.length && <p className="text-slate-500 font-bold">لا توجد محافظ بعد</p>}
      </div>
    </div>
  );
}

/* ================= الطلبات ================= */
function OrdersTab() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);

  const load = () => fetchOrders(100).then(setRows);
  useEffect(() => { load(); }, []);

  async function toggle(id: string) {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    setItems(await fetchOrderItems(id));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-black text-white">🧾 الطلبات ({rows.length})</p>
        <button onClick={load} className="btn-ghost !px-3 !py-2 !text-xs">🔄 تحديث</button>
      </div>
      {rows.map((o) => (
        <div key={o.id} className="card p-3">
          <button onClick={() => toggle(o.id)} className="flex w-full items-center gap-3 text-right">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 font-black text-brand-400">#{o.order_number}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-black text-white truncate">{o.customer_name} — <span dir="ltr">{o.customer_phone}</span></span>
              <span className="block text-xs text-slate-500">{fmtDate(o.created_at)} — {o.fulfilment === 'delivery' ? '🛵 توصيل' : '🏪 استلام'} — {o.payment_method === 'cash' ? '💵 نقدي' : '📱 محفظة'}</span>
            </span>
            <span className="font-black text-brand-400">{money(o.total)} ر</span>
            <span className="text-xs font-bold text-slate-300">{STATUS_AR[o.status] ?? o.status}</span>
          </button>
          {openId === o.id && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <ul className="space-y-1 text-sm">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between text-slate-300">
                    <span>{it.name_ar} × {it.quantity}</span>
                    <span className="font-bold">{money(it.unit_price * it.quantity)} ر</span>
                  </li>
                ))}
              </ul>
              {o.customer_address && <p className="mt-2 text-xs text-slate-400">📍 {o.customer_address}</p>}
              {o.payment_reference && <p className="text-xs text-slate-400">🔢 رقم العملية: <b dir="ltr">{o.payment_reference}</b></p>}
              {o.customer_note && <p className="text-xs text-slate-400">📝 {o.customer_note}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.keys(STATUS_AR).map((s) => (
                  <button
                    key={s}
                    onClick={async () => { await updateOrderStatus(o.id, s); load(); }}
                    className={`rounded-full px-3 py-1.5 text-xs font-black ${o.status === s ? 'bg-brand-500 text-white' : 'bg-white/5 border border-white/10 text-slate-300'}`}
                  >
                    {STATUS_AR[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      {!rows.length && <p className="text-slate-500 font-bold">لا توجد طلبات بعد — ستظهر هنا طلبات الزبائن فور وصولها</p>}
    </div>
  );
}

/* ================= بيانات الجهة (مدير النظام فقط) ================= */
function VenueTab() {
  const [v, setV] = useState<Venue | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchVenueRow().then(setV); }, []);

  async function save() {
    if (!v) return;
    setBusy(true);
    setMsg('');
    try {
      await updateVenue(v);
      setMsg('✅ تم الحفظ بنجاح');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'خطأ'); }
    finally { setBusy(false); }
  }

  async function onImage(kind: 'logo_url' | 'cover_url', file: File | undefined) {
    if (!file || !v) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, 'venue');
      setV({ ...v, [kind]: url });
    } catch (e) { setMsg(e instanceof Error ? e.message : 'فشل رفع الصورة'); }
    finally { setBusy(false); }
  }

  if (!v) return <p className="text-slate-400 font-bold">جارٍ التحميل…</p>;

  return (
    <div className="card p-5 max-w-2xl">
      <p className="font-black text-white">🏪 بيانات الجهة <span className="text-xs text-slate-500">(مدير النظام فقط)</span></p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-slate-400">اسم الجهة (عربي) *</label>
          <input className="field mt-1" value={v.name_ar} onChange={(e) => setV({ ...v, name_ar: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">الاسم بالإنجليزية</label>
          <input className="field mt-1" value={v.name_en ?? ''} onChange={(e) => setV({ ...v, name_en: e.target.value })} dir="ltr" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-400">الشعار الترويسي</label>
          <input type="file" accept="image/*" onChange={(e) => onImage('logo_url', e.target.files?.[0])} className="field mt-1 !py-2 text-xs" />
          {v.logo_url && <img src={v.logo_url} alt="" className="mt-2 h-24 w-24 rounded-full object-cover border-2 border-brand-500/50" />}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-400">صورة الغلاف</label>
          <input type="file" accept="image/*" onChange={(e) => onImage('cover_url', e.target.files?.[0])} className="field mt-1 !py-2 text-xs" />
          {v.cover_url && <img src={v.cover_url} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">رقم الطلب</label>
          <input className="field mt-1" value={v.phone ?? ''} onChange={(e) => setV({ ...v, phone: e.target.value })} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">واتساب</label>
          <input className="field mt-1" value={v.whatsapp ?? ''} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">إنستغرام</label>
          <input className="field mt-1" value={v.instagram ?? ''} onChange={(e) => setV({ ...v, instagram: e.target.value })} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">فيسبوك (رابط)</label>
          <input className="field mt-1" value={v.facebook ?? ''} onChange={(e) => setV({ ...v, facebook: e.target.value })} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">تيك توك (رابط)</label>
          <input className="field mt-1" value={v.tiktok ?? ''} onChange={(e) => setV({ ...v, tiktok: e.target.value })} dir="ltr" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">العملة</label>
          <input className="field mt-1" value={v.currency} onChange={(e) => setV({ ...v, currency: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">رسوم التوصيل</label>
          <input className="field mt-1" type="number" value={v.delivery_fee} onChange={(e) => setV({ ...v, delivery_fee: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">طريقة العرض</label>
          <select className="field mt-1" value={v.layout_mode} onChange={(e) => setV({ ...v, layout_mode: e.target.value })}>
            <option value="grid">شبكة (بطاقات)</option>
            <option value="list">قائمة</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400">الخط</label>
          <select className="field mt-1" value={v.font_family} onChange={(e) => setV({ ...v, font_family: e.target.value })}>
            <option>Cairo</option><option>Tajawal</option><option>IBM Plex Sans Arabic</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-400">الشعار الترويسي</label>
          <input className="field mt-1" value={v.tagline_ar ?? ''} onChange={(e) => setV({ ...v, tagline_ar: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-400">قصة المحل (قصتنا)</label>
          <textarea className="field mt-1" rows={4} value={v.story_ar ?? ''} onChange={(e) => setV({ ...v, story_ar: e.target.value })} />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-4 text-sm font-bold text-slate-300">
          <label className="flex items-center gap-2"><input type="checkbox" checked={v.delivery_available} onChange={(e) => setV({ ...v, delivery_available: e.target.checked })} className="h-4 w-4 accent-orange-500" /> خدمة توصيل</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={v.show_story} onChange={(e) => setV({ ...v, show_story: e.target.checked })} className="h-4 w-4 accent-orange-500" /> إظهار زر قصتنا</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={v.is_active} onChange={(e) => setV({ ...v, is_active: e.target.checked })} className="h-4 w-4 accent-orange-500" /> المنيو مفعّل</label>
        </div>
        {!v.is_active && (
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-amber-300">رسالة الإيقاف (تظهر للزبائن)</label>
            <input className="field mt-1" value={v.suspension_message ?? ''} onChange={(e) => setV({ ...v, suspension_message: e.target.value })} />
          </div>
        )}
      </div>
      {msg && <p className="mt-3 text-sm font-bold text-emerald-300">{msg}</p>}
      <button disabled={busy} onClick={save} className="btn-primary mt-4 w-full disabled:opacity-50">{busy ? 'جارٍ الحفظ…' : '💾 حفظ بيانات الجهة'}</button>
    </div>
  );
}

/* ================= المستخدمون (مدير النظام فقط) ================= */
function UsersTab() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [msg, setMsg] = useState('');

  const load = () => fetchProfiles().then(setRows);
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="card p-4">
        <p className="font-black text-white">👥 حسابات الدخول</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          لإنشاء حساب عميل جديد: أنشئ المستخدم أولاً من لوحة Supabase ← Authentication ← Users، ثم أضف صفاً هنا من جدول <code dir="ltr">profiles</code> بنفس الـ ID والدور <code dir="ltr">client_admin</code>.
          لطلب إنشاء حساب تواصل مع مدير النظام: <a href="tel:776951100" className="font-black text-brand-400" dir="ltr">776951100</a>
        </p>
      </div>
      {rows.map((p) => (
        <div key={p.id} className="card p-3 flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-xl">{p.role === 'super_admin' ? '👑' : '🏪'}</span>
          <div className="flex-1 min-w-40">
            <p className="font-black text-white">{p.full_name ?? 'بدون اسم'}</p>
            <p className="text-xs text-slate-500" dir="ltr">{p.id.slice(0, 8)}… — {p.role === 'super_admin' ? 'مدير النظام' : 'مسؤول الجهة'} — {p.is_active ? 'مفعّل' : 'موقوف'}</p>
          </div>
          <select
            className="field !w-auto !py-2 !text-xs"
            value={p.role}
            onChange={async (e) => { await updateProfile(p.id, { role: e.target.value as any }); load(); }}
          >
            <option value="client_admin">مسؤول الجهة</option>
            <option value="super_admin">مدير النظام</option>
          </select>
          <button
            onClick={async () => { await updateProfile(p.id, { is_active: !p.is_active }); load(); }}
            className="btn-ghost !px-3 !py-2 !text-xs"
          >
            {p.is_active ? '⏸ إيقاف' : '▶ تفعيل'}
          </button>
          <button
            onClick={async () => { if (confirm('حذف هذا الحساب؟ (سيُمنع من الدخول)')) { await deleteProfile(p.id); load(); } }}
            className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs font-black text-red-300"
          >
            🗑
          </button>
        </div>
      ))}
      {msg && <p className="text-sm font-bold text-red-300">{msg}</p>}
    </div>
  );
}

/* ================= QR ================= */
function QrTab() {
  const [url, setUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const u = `${window.location.origin}/`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 420, margin: 2, color: { dark: '#060D1F', light: '#ffffff' } }).then(setDataUrl);
  }, []);

  return (
    <div className="card p-5 max-w-md mx-auto text-center">
      <p className="font-black text-white">📷 رمز QR للمنيو</p>
      <p className="mt-1 text-xs text-slate-400">اطبعه وضعه على الطاولات — الزبون يمسحه فيفتح المنيو مباشرة</p>
      <p className="mt-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-brand-300" dir="ltr">{url}</p>
      {dataUrl && <img src={dataUrl} alt="QR" className="mx-auto mt-4 h-56 w-56 rounded-2xl bg-white p-2" />}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={dataUrl} download="menuz-qr.png" className="btn-primary !py-2.5">⬇ تحميل PNG</a>
        <button onClick={() => window.print()} className="btn-ghost !py-2.5">🖨️ طباعة</button>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <MenuzIcon size={24} /> مينوز | MENUZ — امسح.. اطلب.. واستمتع
      </div>
    </div>
  );
}
