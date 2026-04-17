-- Add iCal sync columns to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS airbnb_ical_url TEXT,
ADD COLUMN IF NOT EXISTS booking_ical_url TEXT;

-- Add external_id to reservations to prevent duplicates during sync
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Add index on external_id for faster lookup during sync
CREATE INDEX IF NOT EXISTS idx_reservations_external_id ON reservations (external_id);

-- Optional: Add a column to track last sync time per property
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;
