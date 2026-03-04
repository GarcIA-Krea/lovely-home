-- ============================================
-- LOVELY HOME - SUPABASE DATABASE SCHEMA
-- ============================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    neighborhood TEXT NOT NULL DEFAULT 'El Poblado',
    city TEXT NOT NULL DEFAULT 'Medellín',
    price_per_night NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'COP',
    max_guests INTEGER NOT NULL DEFAULT 2,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    beds INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    main_image_url TEXT,
    is_superhost BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    cancel_before TEXT DEFAULT 'Flexible',
    rating NUMERIC(3,2) DEFAULT 4.90,
    review_count INTEGER DEFAULT 0,
    airbnb_url TEXT,
    booking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AMENITIES TABLE
CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    icon TEXT NOT NULL, -- Material Symbol name
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GALLERY IMAGES
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
-- For now, we allow public read access (anon) for the landing page
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public read access to amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Allow public read access to property_images" ON property_images FOR SELECT USING (true);

-- TRIGGERS FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
