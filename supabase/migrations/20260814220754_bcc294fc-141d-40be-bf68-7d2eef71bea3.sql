CREATE TYPE public.app_role AS ENUM ('farmer','driver','fleet','buyer','admin');
CREATE TYPE public.dataset_kind AS ENUM ('real','demo');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "claim own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone', COALESCE(NEW.raw_user_meta_data->>'language','en'))
  ON CONFLICT (id) DO NOTHING;
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.crops (
  id text PRIMARY KEY,
  name text NOT NULL, name_hi text NOT NULL, name_mr text NOT NULL,
  category text NOT NULL, emoji text NOT NULL DEFAULT '🌾',
  unit text NOT NULL DEFAULT 'quintal',
  base_price numeric NOT NULL,
  shelf_life_days int NOT NULL DEFAULT 7,
  perishability text NOT NULL DEFAULT 'medium',
  season text NOT NULL DEFAULT 'year-round',
  description text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.crops TO anon, authenticated;
GRANT ALL ON public.crops TO service_role;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crops public read" ON public.crops FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.mandis (
  id text PRIMARY KEY, name text NOT NULL, district text NOT NULL,
  state text NOT NULL DEFAULT 'Maharashtra',
  lat double precision NOT NULL, lng double precision NOT NULL,
  open_days text NOT NULL DEFAULT 'Mon-Sat', capacity_tons int NOT NULL DEFAULT 500
);
GRANT SELECT ON public.mandis TO anon, authenticated;
GRANT ALL ON public.mandis TO service_role;
ALTER TABLE public.mandis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mandis public read" ON public.mandis FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.market_prices (
  id bigserial PRIMARY KEY,
  crop_id text NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  mandi_id text NOT NULL REFERENCES public.mandis(id) ON DELETE CASCADE,
  price_per_quintal numeric NOT NULL,
  recorded_on date NOT NULL DEFAULT current_date,
  arrivals_tons numeric NOT NULL DEFAULT 0,
  UNIQUE (crop_id, mandi_id, recorded_on)
);
GRANT SELECT ON public.market_prices TO anon, authenticated;
GRANT ALL ON public.market_prices TO service_role;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices public read" ON public.market_prices FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.weather_snapshots (
  id bigserial PRIMARY KEY, district text NOT NULL, recorded_on date NOT NULL DEFAULT current_date,
  temp_c numeric NOT NULL, humidity int NOT NULL, rain_mm numeric NOT NULL DEFAULT 0,
  condition text NOT NULL, spoilage_risk text NOT NULL DEFAULT 'low',
  UNIQUE (district, recorded_on)
);
GRANT SELECT ON public.weather_snapshots TO anon, authenticated;
GRANT ALL ON public.weather_snapshots TO service_role;
ALTER TABLE public.weather_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather public read" ON public.weather_snapshots FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.fleets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid, name text NOT NULL, city text NOT NULL DEFAULT 'Pune',
  contact text, rating numeric NOT NULL DEFAULT 4.5,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vehicles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fleet_id text REFERENCES public.fleets(id) ON DELETE CASCADE,
  reg_no text NOT NULL, vehicle_type text NOT NULL DEFAULT 'truck',
  capacity_tons numeric NOT NULL CHECK (capacity_tons > 0 AND capacity_tons <= 12),
  refrigerated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'available',
  lat double precision NOT NULL DEFAULT 18.5204, lng double precision NOT NULL DEFAULT 73.8567,
  odometer_km numeric NOT NULL DEFAULT 0,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.drivers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid, fleet_id text REFERENCES public.fleets(id) ON DELETE SET NULL,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL,
  name text NOT NULL, phone text, license_no text NOT NULL DEFAULT '',
  license_expiry date, verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'off_duty', rating numeric NOT NULL DEFAULT 4.6,
  total_trips int NOT NULL DEFAULT 0, earnings numeric NOT NULL DEFAULT 0,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.farms (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid, farmer_name text NOT NULL, name text NOT NULL,
  village text NOT NULL, district text NOT NULL, state text NOT NULL DEFAULT 'Maharashtra',
  lat double precision NOT NULL, lng double precision NOT NULL,
  area_acres numeric NOT NULL DEFAULT 2,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shipments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id uuid, farm_id text REFERENCES public.farms(id) ON DELETE SET NULL,
  crop_id text NOT NULL REFERENCES public.crops(id),
  mandi_id text NOT NULL REFERENCES public.mandis(id),
  quantity_tons numeric NOT NULL CHECK (quantity_tons > 0),
  harvest_date date NOT NULL DEFAULT current_date,
  quality_grade text NOT NULL DEFAULT 'A',
  priority text NOT NULL DEFAULT 'normal',
  pooled boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'created',
  distance_km numeric NOT NULL DEFAULT 0,
  eta_minutes int NOT NULL DEFAULT 0,
  transport_cost numeric NOT NULL DEFAULT 0,
  pool_savings numeric NOT NULL DEFAULT 0,
  expected_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.quality_reports (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shipment_id text REFERENCES public.shipments(id) ON DELETE CASCADE,
  grade text NOT NULL, moisture_pct numeric, notes text NOT NULL DEFAULT '',
  photo_url text, verified boolean NOT NULL DEFAULT false,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trips (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shipment_id text REFERENCES public.shipments(id) ON DELETE CASCADE,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL,
  driver_id text REFERENCES public.drivers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OFFERED',
  load_tons numeric NOT NULL DEFAULT 0,
  distance_km numeric NOT NULL DEFAULT 0,
  eta_minutes int NOT NULL DEFAULT 0,
  payout numeric NOT NULL DEFAULT 0,
  progress numeric NOT NULL DEFAULT 0,
  started_at timestamptz, completed_at timestamptz,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trip_events (
  id bigserial PRIMARY KEY,
  trip_id text NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  status text NOT NULL, note text NOT NULL DEFAULT '',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gps_pings (
  id bigserial PRIMARY KEY,
  trip_id text REFERENCES public.trips(id) ON DELETE CASCADE,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE CASCADE,
  lat double precision NOT NULL, lng double precision NOT NULL,
  speed_kmph numeric NOT NULL DEFAULT 0,
  idempotency_key text UNIQUE,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.listings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  shipment_id text REFERENCES public.shipments(id) ON DELETE SET NULL,
  crop_id text NOT NULL REFERENCES public.crops(id),
  farm_id text REFERENCES public.farms(id) ON DELETE SET NULL,
  mandi_id text REFERENCES public.mandis(id),
  quantity_tons numeric NOT NULL CHECK (quantity_tons >= 0),
  price_per_quintal numeric NOT NULL,
  grade text NOT NULL DEFAULT 'A',
  available boolean NOT NULL DEFAULT true,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  buyer_id uuid, buyer_name text NOT NULL DEFAULT 'Buyer',
  listing_id text REFERENCES public.listings(id) ON DELETE SET NULL,
  crop_id text REFERENCES public.crops(id),
  quantity_tons numeric NOT NULL CHECK (quantity_tons > 0),
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vehicle_id text REFERENCES public.vehicles(id) ON DELETE CASCADE,
  kind text NOT NULL, status text NOT NULL DEFAULT 'open',
  cost numeric NOT NULL DEFAULT 0, notes text NOT NULL DEFAULT '',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.incidents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  kind text NOT NULL, severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  trip_id text REFERENCES public.trips(id) ON DELETE SET NULL,
  reporter_role text NOT NULL DEFAULT 'driver', reporter_id uuid,
  description text NOT NULL DEFAULT '',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.support_tickets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid, role text NOT NULL DEFAULT 'farmer',
  subject text NOT NULL, body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid, role text NOT NULL DEFAULT 'farmer',
  title text NOT NULL, body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid, role text NOT NULL DEFAULT 'farmer',
  kind text NOT NULL, amount numeric NOT NULL, note text NOT NULL DEFAULT '',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id bigserial PRIMARY KEY,
  actor text NOT NULL DEFAULT 'system', action text NOT NULL,
  entity text NOT NULL DEFAULT '', detail text NOT NULL DEFAULT '',
  dataset public.dataset_kind NOT NULL DEFAULT 'real',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.system_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode public.dataset_kind NOT NULL DEFAULT 'real',
  demo_status text NOT NULL DEFAULT 'stopped',
  demo_tick int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.system_state (id) VALUES (1);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fleets','vehicles','drivers','farms','shipments','quality_reports','trips','trip_events','gps_pings','listings','orders','maintenance','incidents','support_tickets','notifications','transactions','audit_logs']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "demo readable" ON public.%I FOR SELECT TO anon, authenticated USING (dataset = ''demo'')', t);
    EXECUTE format('CREATE POLICY "demo writable" ON public.%I FOR UPDATE TO authenticated USING (dataset = ''demo'') WITH CHECK (dataset = ''demo'')', t);
    EXECUTE format('CREATE POLICY "demo insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (dataset = ''demo'')', t);
    EXECUTE format('CREATE POLICY "admin all" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t);
  END LOOP;
END $$;

ALTER TABLE public.system_state ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.system_state TO authenticated;
GRANT SELECT ON public.system_state TO anon;
GRANT ALL ON public.system_state TO service_role;
CREATE POLICY "system state read" ON public.system_state FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "system state admin write" ON public.system_state FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

CREATE POLICY "own farms" ON public.farms FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own shipments" ON public.shipments FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own orders" ON public.orders FOR ALL TO authenticated USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "own tickets" ON public.support_tickets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own transactions" ON public.transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own fleets" ON public.fleets FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own driver row" ON public.drivers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "listings public read" ON public.listings FOR SELECT TO anon, authenticated USING (dataset = 'demo');