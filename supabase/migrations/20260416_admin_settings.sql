-- Create the admin_settings table to safely store dynamic admin configurations
CREATE TABLE public.admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) to ensure it's not publicly accessible
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Add policies so ONLY authenticated server side (Service Role) can access this table.
-- By default anon key is denied all access since no policy grants it to anon.
-- We can explicitly create a policy for service role, though service role bypasses RLS anyway.

-- Seed the initial admin password from the previous .env file
INSERT INTO public.admin_settings (key_name, value) 
VALUES ('admin_password', 'LovelyAdmin2024')
ON CONFLICT (key_name) DO NOTHING;
