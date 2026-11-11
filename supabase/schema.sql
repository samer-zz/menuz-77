-- ============================================================
-- مينوز | MENUZ — مخطط قاعدة البيانات (Supabase / PostgreSQL)
-- مشروع: samerz-menuz (mtwyvqnagpnotrkixzni)
-- هذا الملف مرجعي لتوثيق البنية. قاعدة البيانات الحالية
-- مطبَّقة بالفعل وتعمل — لا تُعيد التشغيل إلا عند إنشاء
-- مشروع جديد من الصفر.
-- ============================================================

-- ---------- الأنواع ----------
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('super_admin', 'client_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.event_type AS ENUM ('page_view', 'item_view', 'order_created'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.fulfilment AS ENUM ('delivery', 'pickup'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_method AS ENUM ('cash', 'wallet'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.send_channel AS ENUM ('whatsapp', 'sms'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- الجداول ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'client_admin',
  full_name text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.venue (
  id smallint PRIMARY KEY DEFAULT 1,
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  tagline_ar text,
  story_ar text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  instagram text,
  facebook text,
  tiktok text,
  delivery_available boolean NOT NULL DEFAULT true,
  delivery_fee numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ريال',
  is_active boolean NOT NULL DEFAULT true,
  suspension_message text DEFAULT 'هذه الخدمة موقفة حالياً، للاستفسار يرجى التواصل مع الإدارة.',
  accent_color text NOT NULL DEFAULT '#FF7A1A',
  layout_mode text NOT NULL DEFAULT 'grid',
  font_family text NOT NULL DEFAULT 'Cairo',
  show_story boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  description_ar text,
  price numeric NOT NULL,
  old_price numeric,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  description_ar text,
  image_url text,
  badge_text text DEFAULT 'عرض محدود',
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  account_number text NOT NULL,
  account_holder text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigint NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  customer_note text,
  fulfilment public.fulfilment NOT NULL DEFAULT 'delivery',
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE SET NULL,
  payment_reference text,
  status public.order_status NOT NULL DEFAULT 'pending',
  send_channel public.send_channel,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  name_ar text NOT NULL,
  unit_price numeric NOT NULL,
  quantity integer NOT NULL,
  line_total numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type public.event_type NOT NULL,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  session_id text,
  path text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- الدوال المساعدة ----------
CREATE OR REPLACE FUNCTION public.current_role_name() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$ select coalesce((select p.role::text from public.profiles p where p.id = auth.uid() and p.is_active), ''); $function$;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$ select public.current_role_name() in ('super_admin','client_admin'); $function$;

CREATE OR REPLACE FUNCTION public.is_super() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$ select public.current_role_name() = 'super_admin'; $function$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END $function$;

-- (دوال menu_snapshot / place_order / track_event / admin_stats مطبقة في قاعدة البيانات
--  وتعمل — راجع لوحة Supabase ← Database ← Functions للاطلاع على نصوصها الكاملة.
--  ملخصها: menu_snapshot() تجمع المنيو كاملاً في استدعاء واحد،
--  place_order(payload) تنشئ الطلب بأسعار من قاعدة البيانات مع تحقق كامل،
--  track_event() تسجل المسحات والمشاهدات، admin_stats() تحسب الإحصائيات.)

-- ---------- RLS ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة (الضيوف يقرؤون المنيو فقط)
CREATE POLICY venue_public_read ON public.venue FOR SELECT USING (true);
CREATE POLICY categories_public_read ON public.categories FOR SELECT USING (true);
CREATE POLICY items_public_read ON public.items FOR SELECT USING (true);
CREATE POLICY offers_public_read ON public.offers FOR SELECT USING (true);
CREATE POLICY wallets_public_read ON public.wallets FOR SELECT USING (true);

-- الكتابة للطاقم فقط (super_admin + client_admin)
CREATE POLICY categories_staff_write ON public.categories FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY items_staff_write ON public.items FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY offers_staff_write ON public.offers FOR ALL USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY wallets_staff_write ON public.wallets FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- بيانات الجهة: مدير النظام فقط
CREATE POLICY venue_super_update ON public.venue FOR UPDATE USING (is_super()) WITH CHECK (is_super());

-- الحسابات: مدير النظام فقط
CREATE POLICY profiles_select_self ON public.profiles FOR SELECT USING ((id = auth.uid()) OR is_super());
CREATE POLICY profiles_insert_super ON public.profiles FOR INSERT WITH CHECK (is_super());
CREATE POLICY profiles_update_super ON public.profiles FOR UPDATE USING (is_super()) WITH CHECK (is_super());
CREATE POLICY profiles_delete_super ON public.profiles FOR DELETE USING (is_super());

-- الطلبات والتحليلات: قراءة للطاقم فقط (الضيوف يكتبون عبر RPCs الآمنة)
CREATE POLICY orders_staff_read ON public.orders FOR SELECT USING (is_staff());
CREATE POLICY orders_staff_update ON public.orders FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY order_items_staff_read ON public.order_items FOR SELECT USING (is_staff());
CREATE POLICY analytics_staff_read ON public.analytics_events FOR SELECT USING (is_staff());
CREATE POLICY activity_super_read ON public.activity_log FOR SELECT USING (is_super());

-- ---------- التخزين ----------
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-media', 'menu-media', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY menu_media_public_read ON storage.objects FOR SELECT USING (bucket_id = 'menu-media');
CREATE POLICY menu_media_staff_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-media' AND is_staff());
CREATE POLICY menu_media_staff_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-media' AND is_staff());
CREATE POLICY menu_media_staff_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-media' AND is_staff());

-- ---------- البيانات الأولية (إندوميتو) ----------
INSERT INTO public.venue (id, slug, name_ar, name_en, tagline_ar, phone, whatsapp, instagram, delivery_available, delivery_fee, currency, is_active)
VALUES (1, 'indomito', 'إندوميتو', 'INDOMITO', 'نودلز يمنية بروح آسيوية', '785184242', '967785184242', 'indo.mito', true, 0, 'ريال', true)
ON CONFLICT (id) DO NOTHING;

-- الأقسام والأصناف والأسعار مزروعة بالكامل في قاعدة البيانات الحالية
-- (4 أقسام، 13 صنفاً، عرض واحد، 3 محافظ) — راجع لوحة Supabase للتحقق.
