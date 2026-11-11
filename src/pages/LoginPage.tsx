import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { MenuzIcon, MenuzFull } from '../components/Logo';

export function LoginPage() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      nav('/admin', { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'بيانات الدخول غير صحيحة');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-menuz min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8 rise">
          <div className="flex flex-col items-center text-center">
            <MenuzIcon size={76} />
            <MenuzFull className="mt-3 w-56" />
            <p className="mt-2 text-xs font-bold text-brand-400">امسح.. اطلب.. واستمتع</p>
            <h1 className="mt-3 text-xl font-black text-white">دخول لوحة التحكم</h1>
            <p className="mt-1 text-xs text-slate-400">لإدارة المنيو والعروض والطلبات</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400">البريد الإلكتروني</label>
              <input className="field mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">كلمة المرور</label>
              <input className="field mt-1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
            </div>
            {err && <p className="rounded-xl bg-red-500/15 border border-red-500/40 px-4 py-2.5 text-sm font-bold text-red-300">⚠️ {err}</p>}
            <button disabled={busy} className="btn-primary w-full !py-3.5 disabled:opacity-50">
              {busy ? 'جارٍ الدخول…' : '🔐 تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="text-sm font-bold text-white">ليس لديك حساب؟</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              لطلب إنشاء حساب أو الخدمة تواصل مع مدير النظام:
            </p>
            <a href="tel:776951100" className="mt-2 inline-block rounded-xl bg-brand-500 px-5 py-2.5 font-black text-white" dir="ltr">776951100</a>
            <p className="mt-2 text-[11px] text-slate-500">شركة سامرز للحلول الذكية</p>
          </div>

          <button onClick={() => nav('/')} className="mt-4 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-300 transition">
            ← العودة إلى المنيو
          </button>
        </div>
      </div>
    </div>
  );
}
