import type { Venue, Wallet } from '../lib/types';
import { MenuzIcon, SamerzLogo } from './Logo';
import { waNumber } from '../lib/format';

export function MenuFooter({ venue, wallets }: { venue: Venue; wallets: Wallet[] }) {
  const ig = venue.instagram ? `https://instagram.com/${venue.instagram.replace('@', '')}` : '';
  const fb = venue.facebook ?? '';
  const tt = venue.tiktok ?? '';
  return (
    <footer className="mt-12 border-t border-white/10 bg-navy-950/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* المحافظ */}
          <section>
            <h3 className="font-black text-white flex items-center gap-2"><span>👛</span> المحافظ الإلكترونية</h3>
            <div className="mt-3 space-y-2">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                  {w.image_url ? (
                    <img src={w.image_url} alt={w.name} className="h-12 w-12 rounded-xl object-contain bg-white/5" loading="lazy" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-xl">📱</span>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-black text-white">{w.name}</p>
                    <p className="text-xs text-slate-400" dir="ltr">{w.account_number}</p>
                    {w.account_holder && <p className="text-[11px] text-slate-500">باسم: {w.account_holder}</p>}
                  </div>
                  <a href={`tel:${w.account_number}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">اتصال</a>
                </div>
              ))}
              {!wallets.length && <p className="text-sm text-slate-500">لا توجد محافظ مضافة بعد</p>}
            </div>
          </section>

          {/* التواصل */}
          <section>
            <h3 className="font-black text-white flex items-center gap-2"><span>📞</span> التواصل والتوصيل</h3>
            <div className="mt-3 space-y-2 text-sm">
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition">
                  <span>📱</span> للطلب: <b dir="ltr">{venue.phone}</b>
                </a>
              )}
              {venue.whatsapp && (
                <a href={`https://wa.me/${waNumber(venue.whatsapp)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 hover:bg-white/10 transition">
                  <span>💬</span> واتساب: <b dir="ltr">{venue.whatsapp}</b>
                </a>
              )}
              {venue.delivery_available && (
                <p className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5 text-emerald-300 font-bold">🛵 يوجد خدمة توصيل</p>
              )}
              <div className="flex gap-2 pt-1">
                {ig && <a href={ig} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/10 transition">📸 إنستغرام</a>}
                {fb && <a href={fb} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/10 transition">👍 فيسبوك</a>}
                {tt && <a href={tt} target="_blank" rel="noreferrer" className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/10 transition">🎵 تيك توك</a>}
              </div>
            </div>
          </section>

          {/* عن مينوز */}
          <section>
            <div className="flex items-center gap-3">
              <MenuzIcon size={52} />
              <div>
                <p className="font-black text-white">مينوز | MENUZ</p>
                <p className="text-xs text-brand-400 font-bold">امسح.. اطلب.. واستمتع</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
              نصنع مستقبل الضيافة اليمنية.. نحن فريق تقني يمني في شركة سامرز للحلول الذكية متخصص في تطوير حلول برمجية بسيطة وعالمية المستوى، نهدف للارتقاء بقطاع الضيافة المحلي عبر التكنولوجيا الحديثة.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
              <SamerzLogo size={44} />
              <div>
                <p className="text-sm font-black text-white">شركة سامرز للحلول الذكية</p>
                <a href="tel:776951100" className="text-xs text-brand-400 font-bold" dir="ltr">776951100</a>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-center">
          <p className="text-xs text-slate-500">فكرة وتصميم وبرمجة شركة سامرز للحلول الذكية 776951100 — جميع الحقوق محفوظة © 2027</p>
          <a href="/admin" className="mt-2 inline-block text-[11px] text-slate-600 hover:text-slate-400 transition">دخول الإدارة</a>
        </div>
      </div>
    </footer>
  );
}
