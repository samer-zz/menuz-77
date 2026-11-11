import type { CartLine } from './types';
import { money, waNumber } from './format';

export interface InvoiceData {
  venueName: string;
  orderNumber: number | null;
  customerName: string;
  customerPhone: string;
  fulfilment: 'delivery' | 'pickup';
  address?: string;
  paymentMethod: 'cash' | 'wallet';
  walletName?: string;
  paymentRef?: string;
  note?: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}

/** فاتورة نصية احترافية بالعربية — تُرسل عبر واتساب أو SMS */
export function buildInvoiceText(d: InvoiceData): string {
  const L: string[] = [];
  L.push('🧾 *فاتورة طلب — ' + d.venueName + '*');
  L.push('━━━━━━━━━━━━━━━');
  if (d.orderNumber) L.push(`رقم الطلب: #${d.orderNumber}`);
  L.push(`الاسم: ${d.customerName}`);
  L.push(`الجوال: ${d.customerPhone}`);
  L.push(`الاستلام: ${d.fulfilment === 'delivery' ? 'توصيل' : 'استلام من المحل'}`);
  if (d.fulfilment === 'delivery' && d.address) L.push(`العنوان: ${d.address}`);
  L.push('━━━━━━━━━━━━━━━');
  d.lines.forEach((l, i) => {
    L.push(`${i + 1}) ${l.name_ar} × ${l.quantity} = ${money(l.unit_price * l.quantity)} ${d.currency}`);
    if (l.note) L.push(`   ملاحظة: ${l.note}`);
  });
  L.push('━━━━━━━━━━━━━━━');
  L.push(`المجموع الفرعي: ${money(d.subtotal)} ${d.currency}`);
  if (d.deliveryFee > 0) L.push(`التوصيل: ${money(d.deliveryFee)} ${d.currency}`);
  L.push(`*الإجمالي: ${money(d.total)} ${d.currency}*`);
  L.push('━━━━━━━━━━━━━━━');
  if (d.paymentMethod === 'cash') {
    L.push('💵 الدفع: نقداً عند الاستلام');
  } else {
    L.push(`📱 الدفع: محفظة ${d.walletName ?? ''}`);
    if (d.paymentRef) L.push(`رقم العملية: ${d.paymentRef}`);
  }
  if (d.note) L.push(`📝 ملاحظات: ${d.note}`);
  L.push('━━━━━━━━━━━━━━━');
  L.push('شكراً لطلبك من ' + d.venueName + ' ❤️');
  L.push('امسح.. اطلب.. واستمتع — مينوز | MENUZ');
  return L.join('\n');
}

export function whatsappUrl(venueWhatsapp: string | null, text: string): string {
  const num = waNumber(venueWhatsapp ?? '785184242');
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

export function smsUrl(venuePhone: string | null, text: string): string {
  const num = waNumber(venuePhone ?? '785184242');
  return `sms:+${num}?&body=${encodeURIComponent(text)}`;
}
