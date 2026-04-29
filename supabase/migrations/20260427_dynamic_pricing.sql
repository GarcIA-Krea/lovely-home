-- ============================================
-- LOVELY HOME - DYNAMIC PRICING SCHEMA
-- ============================================

-- 1. Alter Properties Table (Add pricing boundaries and last-minute discount)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS price_min NUMERIC,
ADD COLUMN IF NOT EXISTS price_max NUMERIC,
ADD COLUMN IF NOT EXISTS last_minute_discount NUMERIC DEFAULT 0.15;

-- 2. Pricing Seasons (Temporadas Altas/Bajas)
CREATE TABLE IF NOT EXISTS public.pricing_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- ej: "Semana Santa 2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  multiplier NUMERIC(4,2) NOT NULL,      -- ej: 1.40 = +40%
  priority INTEGER DEFAULT 1,            -- Para resolver conflictos de fechas (mayor número = mayor prioridad)
  applies_to TEXT DEFAULT 'all',         -- 'all' o un property_id específico
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pricing Events (Eventos de Ciudad)
CREATE TABLE IF NOT EXISTS public.pricing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- ej: "Feria de las Flores 2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  multiplier NUMERIC(4,2) NOT NULL,      -- ej: 1.60 = +60%
  city TEXT DEFAULT 'Medellín',
  applies_to TEXT DEFAULT 'all',         -- 'all' o un property_id específico
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Day of Week Rules (Reglas por Día de la Semana)
CREATE TABLE IF NOT EXISTS public.pricing_rules_dow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,          -- 0=Domingo, 1=Lunes ... 6=Sábado
  multiplier NUMERIC(4,2) NOT NULL,      -- ej: 1.25 = +25%
  UNIQUE(property_id, day_of_week)
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.pricing_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules_dow ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the pricing API to read rules without auth)
CREATE POLICY "Allow public read access to pricing_seasons" ON public.pricing_seasons FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pricing_events" ON public.pricing_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pricing_rules_dow" ON public.pricing_rules_dow FOR SELECT USING (true);

-- 6. Insert Default Day of Week rules for existing properties
-- We will set a neutral 1.0 multiplier by default so it doesn't break current pricing
DO $$
DECLARE
    prop RECORD;
    d INTEGER;
BEGIN
    FOR prop IN SELECT id FROM public.properties LOOP
        FOR d IN 0..6 LOOP
            INSERT INTO public.pricing_rules_dow (property_id, day_of_week, multiplier)
            VALUES (prop.id, d, 1.00)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
