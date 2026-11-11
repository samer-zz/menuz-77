export function money(n: number | string): string {
  const v = Number(n) || 0;
  return v.toLocaleString('ar-EG', { maximumFractionDigits: v % 1 === 0 ? 0 : 2 });
}

export function toYemenIntl(phone: string | null | undefined): string {
  if (!phone) return '';
  let p = phone.replace(/[^\d+]/g, '');
  if (p.startsWith('+967')) p = p.slice(1);
  if (p.startsWith('00967')) p = p.slice(2);
  if (p.startsWith('967') && p.length > 9) p = p.slice(3);
  return p;
}

export function waNumber(phone: string | null | undefined): string {
  const p = toYemenIntl(phone);
  return p.startsWith('967') ? p : `967${p}`;
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function fmtDay(iso: string): string {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}
