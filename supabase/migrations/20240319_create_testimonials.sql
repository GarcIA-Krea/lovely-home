-- Creación de la tabla de Testimonios
CREATE TABLE testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    quote TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar los testimonios iniciales
INSERT INTO testimonials (name, city, quote, avatar_url) VALUES 
('Daniel', 'Germany', '¡Pasamos dos semanas en Medellín con cuatro personas y el lugar fue perfecto! El lugar estaba muy limpio y equipado con todo lo que necesitábamos. La ubicación era muy segura y excelente para explorar El Poblado a pie...', ''),
('Char', 'Netherlands', 'Tuve una estancia encantadora en casa de María, hasta el punto de que quería extenderme y quedarme más tiempo... La ubicación era increíble, fácilmente transitable a donde está la acción...', ''),
('Abel', 'USA', 'Great place, really comfortable and clean. Highly recommend for anyone looking for a well-located stay in Medellin.', ''),
('Owen', 'USA', 'The place was amazing, the view is incredible. Maria was a great host and very helpful during our stay. Clean, modern, and in a fantastic neighborhood.', ''),
('Kieran', 'USA', 'Gemas: María, su madre y este lugar son simplemente extraordinarios. Todo fue impecable, desde la comunicación hasta el confort del apartamento. Definitivamente regresaremos.', ''),
('Thais Venancio', 'Brazil', 'Excelente estadia, apartamento limpo e bem localizado. Maria foi muito atenciosa e prestativa em todos los momentos.', ''),
('Le''', 'USA', 'Maria was super helpful and the place was great. The location is perfect for exploring the city and the apartment has everything you need.', ''),
('Angie', 'USA', 'El lugar era impresionante y estaba limpio. Se pareció a las fotos, nos sentimos como en casa y no queríamos irnos. También tienes una vista increíble por la noche. María fue muy dulce, receptiva y amable.', ''),
('Gian', 'USA', 'The location is perfect, the apartment is beautiful. Great value for money and Maria is an excellent host who goes above and beyond.', ''),
('Marco', 'Italy', 'Excelente ubicación, todo muy limpio. Maria siempre estuvo disponible para ayudarnos con cualquier cosa. Muy recomendable para familias o grupos pequeños.', '');
