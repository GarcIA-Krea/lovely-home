import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const properties = [
    {
        name: 'Amarilo 201',
        slug: 'amarilo-201',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 290000,
        currency: 'COP',
        max_guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        description: 'Descubre la perfección en un apartamento lindo, cómodo y acogedor de dos habitaciones. Diseñado para tu estilo de vida práctico.',
        main_image_url: '/images/property-3.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.95,
    },
    {
        name: 'Amarilo 202',
        slug: 'amarilo-202',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 190000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: 'Estudio optimizado con diseño moderno, ideal para nómadas digitales y parejas.',
        main_image_url: '/images/property-2.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.88,
    },
    {
        name: 'Amarilo 301',
        slug: 'amarilo-301',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 340000,
        currency: 'COP',
        max_guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        description: 'Penthouse exclusivo con terraza privada y vistas espectaculares a las montañas de Medellín.',
        main_image_url: '/images/property-card.jpg',
        is_superhost: true,
        is_new: true,
        cancel_before: '7 days',
        rating: 4.98,
    },
    {
        name: 'Aruna 201',
        slug: 'aruna-201',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 240000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: 'Estilo Boho Chic rústico con hamaca y una vista increíble que invita a la desconexión.',
        main_image_url: '/images/medellin-sunset.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.92,
    },
    {
        name: 'Aruna 202',
        slug: 'aruna-202',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 210000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: 'Encanto rústico y minimalista, optimizado para el descanso en una zona privilegiada.',
        main_image_url: '/images/property-2.jpg',
        is_superhost: false,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.85,
    }
];

const amenities = [
    { icon: 'wifi', name: 'Fast Wifi', description: '500 Mbps verified speed' },
    { icon: 'desktop_mac', name: 'Dedicated Workspace', description: 'Ergonomic chair and large desk' },
    { icon: 'cleaning_services', name: 'Weekly Cleaning', description: 'Professional service included' },
    { icon: 'kitchen', name: 'Full Kitchen', description: 'Equipped with essentials' },
];

async function seed() {
    console.log('🚀 Starting seeding...');

    for (const property of properties) {
        const { data: propData, error: propError } = await supabase
            .from('properties')
            .upsert(property, { onConflict: 'slug' })
            .select()
            .single();

        if (propError) {
            console.error(`❌ Error seeding property ${property.name}:`, propError.message);
            continue;
        }

        console.log(`✅ Seeded property: ${property.name}`);

        // Seed amenities for each property
        const propertyAmenities = amenities.map(a => ({ ...a, property_id: propData.id }));
        const { error: amenError } = await supabase.from('amenities').upsert(propertyAmenities);

        if (amenError) {
            console.error(`❌ Error seeding amenities for ${property.name}:`, amenError.message);
        }
    }

    console.log('🏁 Seeding finished!');
}

seed();
