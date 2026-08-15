-- 1. Prevent self-granting the admin role -------------------------------------
DROP POLICY IF EXISTS "claim own role" ON public.user_roles;
CREATE POLICY "claim own non-admin role"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role <> 'admin'::public.app_role);

CREATE POLICY "admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested text := NEW.raw_user_meta_data->>'role';
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone', COALESCE(NEW.raw_user_meta_data->>'language','en'))
  ON CONFLICT (id) DO NOTHING;
  -- Only self-service roles may come from the client sign-up payload.
  -- 'admin' is deliberately excluded and can never be self-assigned.
  IF requested IN ('farmer', 'driver', 'fleet', 'buyer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, requested::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

-- 2. Helper functions run as the caller, not as their owner --------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$function$;

CREATE OR REPLACE FUNCTION public.owns_shipment(_shipment_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = _shipment_id AND s.owner_id = auth.uid())
$function$;

-- 3. Remove public/anonymous read of sensitive simulated records ---------------
DROP POLICY IF EXISTS "demo readable" ON public.audit_logs;
DROP POLICY IF EXISTS "demo readable" ON public.drivers;
DROP POLICY IF EXISTS "demo readable" ON public.farms;
DROP POLICY IF EXISTS "demo readable" ON public.fleets;
DROP POLICY IF EXISTS "demo readable" ON public.vehicles;
DROP POLICY IF EXISTS "demo readable" ON public.gps_pings;
DROP POLICY IF EXISTS "demo readable" ON public.incidents;
DROP POLICY IF EXISTS "demo readable" ON public.maintenance;
DROP POLICY IF EXISTS "demo readable" ON public.notifications;
DROP POLICY IF EXISTS "demo readable" ON public.orders;
DROP POLICY IF EXISTS "demo readable" ON public.quality_reports;
DROP POLICY IF EXISTS "demo readable" ON public.support_tickets;
DROP POLICY IF EXISTS "demo readable" ON public.transactions;
DROP POLICY IF EXISTS "demo readable" ON public.trip_events;
DROP POLICY IF EXISTS "demo readable" ON public.trips;

REVOKE SELECT ON public.audit_logs, public.drivers, public.farms, public.fleets,
  public.vehicles, public.gps_pings, public.incidents, public.maintenance,
  public.notifications, public.orders, public.quality_reports,
  public.support_tickets, public.transactions, public.trip_events, public.trips
  FROM anon;