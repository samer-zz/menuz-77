import { supabase, sessionId } from './supabase';
import type { AdminStats, Category, MenuItem, Offer, OrderItemRow, OrderRow, Profile, Venue, Wallet } from './types';

export interface MenuSnapshot {
  venue: Venue;
  categories: Category[];
  items: MenuItem[];
  offers: Offer[];
  wallets: Wallet[];
  server_time: string;
}

export async function fetchMenu(): Promise<MenuSnapshot> {
  const { data, error } = await supabase.rpc('menu_snapshot');
  if (error) throw error;
  return data as MenuSnapshot;
}

export async function trackPageView(path = '/') {
  try {
    await supabase.rpc('track_event', {
      p_type: 'page_view',
      p_item_id: null,
      p_session: sessionId(),
      p_path: path,
      p_user_agent: navigator.userAgent.slice(0, 300),
    });
  } catch { /* تجاهل — التتبع لا يجب أن يكسر التجربة */ }
}

export async function trackItemView(itemId: string) {
  try {
    await supabase.rpc('track_event', {
      p_type: 'item_view',
      p_item_id: itemId,
      p_session: sessionId(),
      p_path: '/item',
      p_user_agent: navigator.userAgent.slice(0, 300),
    });
  } catch { /* تجاهل */ }
}

export interface PlaceOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  customer_note?: string;
  fulfilment: 'delivery' | 'pickup';
  payment_method: 'cash' | 'wallet';
  wallet_id?: string;
  payment_reference?: string;
  send_channel?: 'whatsapp' | 'sms';
  items: { item_id: string; quantity: number; note?: string }[];
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data, error } = await supabase.rpc('place_order', {
    payload: { ...payload, user_agent: navigator.userAgent.slice(0, 300) },
  });
  if (error) throw error;
  return data as {
    ok: boolean; order_id: string; order_number: number; subtotal: number;
    delivery_fee: number; total: number; items: unknown[]; customer_name: string;
    customer_phone: string; fulfilment: string; payment_method: string; created_at: string;
  };
}

export async function fetchStats(days = 30): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_stats', { p_days: days });
  if (error) throw error;
  return data as AdminStats;
}

export async function fetchOrders(limit = 100): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as OrderRow[];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as OrderItemRow[];
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(id: string, patch: Partial<Profile>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteProfile(id: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchVenueRow(): Promise<Venue> {
  const { data, error } = await supabase.from('venue').select('*').eq('id', 1).single();
  if (error) throw error;
  return data as Venue;
}

export async function updateVenue(patch: Partial<Venue>) {
  const { error } = await supabase.from('venue').update(patch).eq('id', 1);
  if (error) throw error;
}

export async function fetchCategoriesAdmin(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data as Category[];
}

export async function saveCategory(row: Partial<Category>) {
  if (row.id) {
    const { error } = await supabase.from('categories').update(row).eq('id', row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('categories').insert(row);
    if (error) throw error;
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchItemsAdmin(): Promise<MenuItem[]> {
  const { data, error } = await supabase.from('items').select('*').order('sort_order');
  if (error) throw error;
  return data as MenuItem[];
}

export async function saveItem(row: Partial<MenuItem>) {
  if (row.id) {
    const { error } = await supabase.from('items').update(row).eq('id', row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('items').insert(row);
    if (error) throw error;
  }
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchOffersAdmin(): Promise<Offer[]> {
  const { data, error } = await supabase.from('offers').select('*').order('sort_order');
  if (error) throw error;
  return data as Offer[];
}

export async function saveOffer(row: Partial<Offer>) {
  if (row.id) {
    const { error } = await supabase.from('offers').update(row).eq('id', row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('offers').insert(row);
    if (error) throw error;
  }
}

export async function deleteOffer(id: string) {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchWalletsAdmin(): Promise<Wallet[]> {
  const { data, error } = await supabase.from('wallets').select('*').order('sort_order');
  if (error) throw error;
  return data as Wallet[];
}

export async function saveWallet(row: Partial<Wallet>) {
  if (row.id) {
    const { error } = await supabase.from('wallets').update(row).eq('id', row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('wallets').insert(row);
    if (error) throw error;
  }
}

export async function deleteWallet(id: string) {
  const { error } = await supabase.from('wallets').delete().eq('id', id);
  if (error) throw error;
}

export async function currentRole(): Promise<string> {
  const { data, error } = await supabase.rpc('current_role_name');
  if (error) return '';
  return (data as string) ?? '';
}
