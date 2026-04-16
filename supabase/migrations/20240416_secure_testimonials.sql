-- Habilitar Row Level Security para la tabla de testimonios
-- Esto soluciona la vulnerabilidad de seguridad reportada por Supabase (rls_disabled_in_public)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Permitir a cualquier persona leer los testimonios (para que se muestren en la página)
CREATE POLICY "Permitir lectura publica de testimonios"
ON testimonials
FOR SELECT
USING (true);

-- Opcional: si quisieras permitir la inserción o edición de testimonios,
-- deberías agregar políticas adicionales restringidas por autenticación o roles.
