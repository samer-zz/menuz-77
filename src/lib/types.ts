export type Role = 'super_admin' | 'client_admin';

export interface Venue {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string | null;
  tagline_ar: string | null;
  story_ar: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  delivery_available: boolean;
  delivery_fee: number;
  currency: string;
  is_active: boolean;
  suspension_message: string | null;
  accent_color: string;
  layout_mode: string;
  font_family: string;
  show_story: boolean;
  updated_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_ar: string;
  description_ar: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  sort_order: number;
}

export interface Offer {
  id: string;
  title_ar: string;
  description_ar: string | null;
  image_url: string | null;
  badge_text: string | null;
  item_id: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Wallet {
  id: string;
  name: string;
  account_number: string;
  account_holder: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  customer_note: string | null;
  fulfilment: 'delivery' | 'pickup';
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: 'cash' | 'wallet';
  wallet_id: string | null;
  payment_reference: string | null;
  status: string;
  send_channel: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_id: string | null;
  name_ar: string;
  unit_price: number;
  quantity: number;
  line_total: number | null;
  note: string | null;
}

export interface CartLine {
  item_id: string;
  name_ar: string;
  unit_price: number;
  quantity: number;
  note: string;
}

export interface AdminStats {
  views_today: number;
  views_week: number;
  views_month: number;
  sessions_today: number;
  item_views: number;
  orders_today: number;
  orders_period: number;
  revenue_period: number;
  pending_orders: number;
  top_items: { id: string; name_ar: string; views: number }[];
  top_ordered: { name_ar: string; qty: number; revenue: number }[];
  peak_hours: { hour: number; count: number }[];
  daily: { day: string; views: number; orders: number }[];
  recent_orders: { order_number: number; customer_name: string; total: number; status: string; created_at: string }[];
}
