-- ============================================
-- LOVELY HOME - SECURITY FIX
-- ============================================

-- Supabase detected a security vulnerability because the 
-- reservations table exposes PII (guest_name, guest_email) 
-- to the public through this policy.
DROP POLICY IF EXISTS "Allow public read access to availability" ON reservations;

-- If public availability checking is needed, it should be done 
-- via a secure backend route (Next.js App Router) or a 
-- SECURITY DEFINER PostgreSQL function that only returns 
-- necessary fields (property_id, check_in, check_out), 
-- rather than allowing public SELECT on the entire table.

-- For now, dropping the policy secures the data. 
-- Authenticated admins/service_role keys can still access everything.
