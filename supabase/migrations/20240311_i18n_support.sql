-- ============================================
-- LOVELY HOME - I18N SUPPORT (JSONB)
-- ============================================

-- 1. ADAPT PROPERTIES TABLE
-- Rename old text columns to keep data during transition if needed, 
-- or just alter them to JSONB if we are re-seeding anyway.
-- We will re-seed, so we'll drop and recreate or alter.

ALTER TABLE properties 
ALTER COLUMN name TYPE JSONB USING jsonb_build_object('es', name),
ALTER COLUMN description TYPE JSONB USING jsonb_build_object('es', description);

-- 2. ADAPT AMENITIES TABLE
ALTER TABLE amenities 
ALTER COLUMN name TYPE JSONB USING jsonb_build_object('es', name);

-- 3. ADAPT TESTIMONIALS (Optional, but good for consistency)
-- Testimonials might stay in their original language as per user request ("las reseñas se quedan en su idioma"),
-- but we could still wrap them in JSONB if we wanted to translate the "city" or "label".
-- The user said: "las reseñas si las pusieron en español las dejamos en español... la página propiamente dicha sí es muy importante que haya por lo menos inglés y español".
-- So we won't translate the quote, maybe just the UI elements around it.

COMMENT ON COLUMN properties.name IS 'Stored as JSONB: {"es": "...", "en": "...", ...}';
COMMENT ON COLUMN properties.description IS 'Stored as JSONB: {"es": "...", "en": "...", ...}';
COMMENT ON COLUMN amenities.name IS 'Stored as JSONB: {"es": "...", "en": "...", ...}';
