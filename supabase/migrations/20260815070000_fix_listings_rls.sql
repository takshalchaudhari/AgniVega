-- Migration: Secure listings table RLS
-- Restricts public read access strictly to demo dataset rows.
-- Real farm listings (dataset = 'real') remain protected and accessible only to verified shipment owners and admins.

DROP POLICY IF EXISTS "listings public read" ON public.listings;

CREATE POLICY "listings public read" ON public.listings
  FOR SELECT TO anon, authenticated
  USING (dataset = 'demo');
