import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, MenuItem } from './types';

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (item: MenuItem) => void;
  setQty: (itemId: string, qty: number) => void;
  setNote: (itemId: string, note: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartState>(() => ({
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.unit_price * l.quantity, 0),
    add(item: MenuItem) {
      if (!item.is_available) return;
      setLines((prev) => {
        const found = prev.find((l) => l.item_id === item.id);
        if (found) return prev.map((l) => (l.item_id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
        return [...prev, { item_id: item.id, name_ar: item.name_ar, unit_price: Number(item.price), quantity: 1, note: '' }];
      });
    },
    setQty(itemId, qty) {
      setLines((prev) =>
        qty <= 0 ? prev.filter((l) => l.item_id !== itemId) : prev.map((l) => (l.item_id === itemId ? { ...l, quantity: qty } : l)),
      );
    },
    setNote(itemId, note) {
      setLines((prev) => prev.map((l) => (l.item_id === itemId ? { ...l, note } : l)));
    },
    remove(itemId) {
      setLines((prev) => prev.filter((l) => l.item_id !== itemId));
    },
    clear() {
      setLines([]);
    },
  }), [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart خارج CartProvider');
  return v;
}
