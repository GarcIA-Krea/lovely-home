import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const properties = [
    {
        name: {
            es: 'Amarillo 201',
            en: 'Amarillo 201',
            pt: 'Amarillo 201',
            de: 'Amarillo 201',
            fr: 'Amarillo 201',
            it: 'Amarillo 201'
        },
        slug: 'amarilo-201',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 220000,
        currency: 'COP',
        max_guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        description: {
            es: 'Exclusivo apartamento en primer piso con estilo moderno y terraza privada, ideal para familias.',
            en: 'Exclusive first-floor apartment with modern style and private terrace, ideal for families.',
            pt: 'Exclusivo apartamento no térreo com estilo moderno e terraço privado, ideal para famílias.',
            de: 'Exklusive Erdgeschosswohnung im modernen Stil mit privater Terrasse, ideal für Familien.',
            fr: 'Exclusif appartement au rez-de-chaussée de style moderne avec terrasse privée, idéal pour les familles.',
            it: 'Esclusivo appartamento al piano terra in stile moderno con terrazza privata, ideale per famiglie.'
        },
        main_image_url: '/images/properties/amarillo-201.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.95,
        review_count: 28,
        airbnb_url: 'https://www.airbnb.com/rooms/582735734447538451',
        booking_url: null,
        gallery: [
            '/images/properties/amarillo-201/kitchen.jpg',
            '/images/properties/amarillo-201/bathroom.jpg',
            '/images/properties/amarillo-201/room.jpg',
            '/images/properties/amarillo-201/social.jpg'
        ]
    },
    {
        name: {
            es: 'Amarillo 202',
            en: 'Amarillo 202',
            pt: 'Amarillo 202',
            de: 'Amarillo 202',
            fr: 'Amarillo 202',
            it: 'Amarillo 202'
        },
        slug: 'amarilo-202',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 240000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: {
            es: 'Apartamento luminoso y acogedor, perfecto para parejas o nómadas digitales buscando confort en El Poblado.',
            en: 'Bright and cozy apartment, perfect for couples or digital nomads looking for comfort in El Poblado.',
            pt: 'Apartamento iluminado e aconchegante, perfeito para casais ou nômades digitais buscando conforto em El Poblado.',
            de: 'Helle und gemütliche Wohnung, perfekt für Paare oder digitale Nomaden, die Komfort in El Poblado suchen.',
            fr: 'Appartement lumineux et chaleureux, parfait pour les couples ou les nomades numériques cherchant le confort à El Poblado.',
            it: 'Appartamento luminoso e accogliente, perfetto per coppie o nomadi digitali alla ricerca di comfort a El Poblado.'
        },
        main_image_url: '/images/properties/amarillo-202.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.88,
        review_count: 15,
        airbnb_url: 'https://www.airbnb.com/rooms/579184333630363462',
        booking_url: null,
        gallery: [
            '/images/properties/amarillo-202/kitchen.jpg',
            '/images/properties/amarillo-202/bathroom.jpg',
            '/images/properties/amarillo-202/room.jpg',
            '/images/properties/amarillo-202/social.jpg'
        ]
    },
    {
        name: {
            es: 'Amarillo 301',
            en: 'Amarillo 301',
            pt: 'Amarillo 301',
            de: 'Amarillo 301',
            fr: 'Amarillo 301',
            it: 'Amarillo 301'
        },
        slug: 'amarilo-301',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 210000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: {
            es: 'Encanto rústico y minimalista, optimizado para el máximo descanso y desconexión.',
            en: 'Rustic and minimalist charm, optimized for maximum rest and disconnection.',
            pt: 'Encanto rústico e minimalista, otimizado para o máximo descanso e desconexão.',
            de: 'Rustikaler und minimalistischer Charme, optimiert für maximale Ruhe und Entspannung.',
            fr: 'Charme rustique et minimaliste, optimisé pour un repos et une déconnexion maximum.',
            it: 'Fascino rustico e minimalista, ottimizzato per il massimo riposo e disconnessione.'
        },
        main_image_url: '/images/properties/amarillo-301.jpg',
        is_superhost: false,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.85,
        review_count: 32,
        airbnb_url: 'https://www.airbnb.com/rooms/695080063524735408',
        booking_url: null,
        gallery: [
            '/images/properties/amarillo-301/kitchen.jpg',
            '/images/properties/amarillo-301/bathroom.jpg',
            '/images/properties/amarillo-301/room.jpg',
            '/images/properties/amarillo-301/social.jpg'
        ]
    },
    {
        name: {
            es: 'Aruna 201',
            en: 'Aruna 201',
            pt: 'Aruna 201',
            de: 'Aruna 201',
            fr: 'Aruna 201',
            it: 'Aruna 201'
        },
        slug: 'aruna-201',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 240000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: {
            es: 'Apartamento luminoso y acogedor, perfecto para parejas o nómadas digitales buscando confort en El Poblado.',
            en: 'Bright and cozy apartment, perfect for couples or digital nomads looking for comfort in El Poblado.',
            pt: 'Apartamento iluminado e aconchegante, perfeito para casais ou nômades digitais buscando conforto em El Poblado.',
            de: 'Helle und gemütliche Wohnung, perfekt für Paare oder digitale Nomaden, die Komfort in El Poblado suchen.',
            fr: 'Appartement lumineux et chaleureux, parfait pour les couples ou les nomades numériques cherchant le confort à El Poblado.',
            it: 'Appartamento luminoso e accogliente, perfetto per coppie o nomadi digitali alla ricerca di comfort a El Poblado.'
        },
        main_image_url: '/images/properties/aruna-201.jpg',
        is_superhost: true,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.88,
        review_count: 45,
        airbnb_url: 'https://www.airbnb.com/rooms/45238915',
        booking_url: 'https://www.booking.com/hotel/co/marias-home.es.html',
        gallery: [
            '/images/properties/aruna-201/kitchen.jpg',
            '/images/properties/aruna-201/bathroom.jpg',
            '/images/properties/aruna-201/room.jpg',
            '/images/properties/aruna-201/social.jpg'
        ]
    },
    {
        name: {
            es: 'Aruna 202',
            en: 'Aruna 202',
            pt: 'Aruna 202',
            de: 'Aruna 202',
            fr: 'Aruna 202',
            it: 'Aruna 202'
        },
        slug: 'aruna-202',
        location: 'Medellín, Colombia',
        neighborhood: 'El Poblado',
        price_per_night: 210000,
        currency: 'COP',
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        description: {
            es: 'Encanto rústico y minimalista, optimizado para el máximo descanso y desconexión.',
            en: 'Rustic and minimalist charm, optimized for maximum rest and disconnection.',
            pt: 'Encanto rústico e minimalista, otimizado para o máximo descanso e desconexão.',
            de: 'Rustikaler und minimalistischer Charme, optimiert für maximale Ruhe und Entspannung.',
            fr: 'Charme rustique et minimaliste, optimisé pour un repos et une déconnexion maximum.',
            it: 'Fascino rustico e minimalista, ottimizzato per il massimo riposo e disconnessione.'
        },
        main_image_url: '/images/properties/aruna-202.jpg',
        is_superhost: false,
        is_new: false,
        cancel_before: 'Flexible',
        rating: 4.85,
        review_count: 19,
        airbnb_url: 'https://www.airbnb.com/rooms/15942882',
        booking_url: 'https://www.booking.com/hotel/co/hermosa-vista-mejor-ubicacion.es.html',
        gallery: [
            '/images/properties/aruna-202/kitchen.jpg',
            '/images/properties/aruna-202/bathroom.jpg',
            '/images/properties/aruna-202/room.jpg',
            '/images/properties/aruna-202/social.jpg'
        ]
    },
];

const amenitiesList = [
    { 
        icon: 'wifi', 
        name: { es: 'Wifi Rápido', en: 'Fast Wifi', pt: 'Wifi Rápido', de: 'Schnelles WLAN', fr: 'WiFi Rapide', it: 'WiFi Veloce' },
        description: '500 Mbps verified speed' 
    },
    { 
        icon: 'desktop_mac', 
        name: { es: 'Espacio de Trabajo', en: 'Dedicated Workspace', pt: 'Espaço de Trabalho', de: 'Arbeitsbereich', fr: 'Espace de Travail', it: 'Spazio di Lavoro' },
        description: 'Ergonomic chair and large desk' 
    },
    { 
        icon: 'cleaning_services', 
        name: { es: 'Limpieza Semanal', en: 'Weekly Cleaning', pt: 'Limpeza Semanal', de: 'Wöchentliche Reinigung', fr: 'Ménage Hebdomadaire', it: 'Pulizia Settimanale' },
        description: 'Professional service included' 
    },
    { 
        icon: 'kitchen', 
        name: { es: 'Cocina Equipada', en: 'Full Kitchen', pt: 'Cozinha Completa', de: 'Voll ausgestattete Küche', fr: 'Cuisine Équipée', it: 'Cucina Completa' },
        description: 'Equipped with essentials' 
    },
];

async function seed() {
    console.log('🚀 Starting seeding...');

    for (const property of properties) {
        const { gallery, ...propertyData } = property;

        const { data: propData, error: propError } = await supabase
            .from('properties')
            .upsert(propertyData, { onConflict: 'slug' })
            .select()
            .single();

        if (propError) {
            console.error(`❌ Error seeding property ${property.name}:`, propError.message);
            continue;
        }

        console.log(`✅ Seeded property: ${property.name}`);

        // Seed amenities for each property
        const propertyAmenities = amenitiesList.map(a => ({ ...a, property_id: propData.id }));
        const { error: amenError } = await supabase.from('amenities').upsert(propertyAmenities);

        if (amenError) {
            console.error(`❌ Error seeding amenities for ${property.name}:`, amenError.message);
        }

        // Seed gallery images
        if (gallery && gallery.length > 0) {
            const galleryImages = gallery.map((url, index) => ({
                property_id: propData.id,
                image_url: url,
                display_order: index
            }));

            const { error: galleryError } = await supabase.from('property_images').upsert(galleryImages);
            if (galleryError) {
                console.error(`❌ Error seeding gallery for ${property.name}:`, galleryError.message);
            } else {
                console.log(`🖼️  Seeded gallery for: ${property.name}`);
            }
        }
    }

    console.log('🏁 Seeding finished!');
}

seed();
