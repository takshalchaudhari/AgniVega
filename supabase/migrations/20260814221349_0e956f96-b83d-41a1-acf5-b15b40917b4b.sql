CREATE OR REPLACE FUNCTION public.owns_shipment(_shipment_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = _shipment_id AND s.owner_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION public.owns_shipment(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_shipment(text) TO authenticated, service_role;

CREATE POLICY "own shipment trips" ON public.trips FOR ALL TO authenticated
  USING (public.owns_shipment(shipment_id)) WITH CHECK (public.owns_shipment(shipment_id));
CREATE POLICY "own shipment quality" ON public.quality_reports FOR ALL TO authenticated
  USING (public.owns_shipment(shipment_id)) WITH CHECK (public.owns_shipment(shipment_id));
CREATE POLICY "own shipment listings" ON public.listings FOR ALL TO authenticated
  USING (shipment_id IS NULL OR public.owns_shipment(shipment_id))
  WITH CHECK (shipment_id IS NULL OR public.owns_shipment(shipment_id));
CREATE POLICY "trip events by owner" ON public.trip_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.owns_shipment(t.shipment_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.owns_shipment(t.shipment_id)));
CREATE POLICY "gps by owner" ON public.gps_pings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.owns_shipment(t.shipment_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND public.owns_shipment(t.shipment_id)));