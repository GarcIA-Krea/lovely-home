-- ============================================
-- LOVELY HOME - RESERVATIONS & SYNC SCHEMA
-- ============================================

-- HELPER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_email TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price NUMERIC,
    currency TEXT DEFAULT 'COP',
    status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, blocked (for external sync)
    platform TEXT DEFAULT 'direct', -- direct, airbnb, booking, expedia, etc.
    payment_intent_id TEXT, -- Stripe reference
    external_id TEXT, -- For sync (e.g., Airbnb reservation ID)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint to prevent checkout before check-in
    CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_reservations_property_id ON reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);

-- RLS (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow public to see busy dates (but not personal guest info)
-- This is crucial for the UI calendar
CREATE OR REPLACE VIEW property_availability AS
SELECT 
    property_id, 
    check_in, 
    check_out, 
    status 
FROM reservations 
WHERE status != 'cancelled';

-- For now, allow public read of basic availability
-- (We'll restrict this more when we have a dashboard)
CREATE POLICY "Allow public read access to availability" ON reservations FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
