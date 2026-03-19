import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping: property folder name -> all local images (relative to /images/properties/)
const localPhotos: Record<string, string[]> = {
    'amarillo-201': [
        '/images/properties/amarillo-201.jpg',
        '/images/properties/amarillo-201/bathroom.jpg',
        '/images/properties/amarillo-201/kitchen.jpg',
        '/images/properties/amarillo-201/room.jpg',
        '/images/properties/amarillo-201/social.jpg',
    ],
    'amarillo-202': [
        '/images/properties/amarillo-202.jpg',
        '/images/properties/amarillo-202/bathroom.jpg',
        '/images/properties/amarillo-202/kitchen.jpg',
        '/images/properties/amarillo-202/room.jpg',
        '/images/properties/amarillo-202/social.jpg',
    ],
    'amarillo-301': [
        '/images/properties/amarillo-301.jpg',
        '/images/properties/amarillo-301/bathroom.jpg',
        '/images/properties/amarillo-301/kitchen.jpg',
        '/images/properties/amarillo-301/room.jpg',
        '/images/properties/amarillo-301/social.jpg',
    ],
    'aruna-201': [
        '/images/properties/aruna-201.jpg',
        '/images/properties/aruna-201/bathroom.jpg',
        '/images/properties/aruna-201/kitchen.jpg',
        '/images/properties/aruna-201/room.jpg',
        '/images/properties/aruna-201/social.jpg',
    ],
    'aruna-202': [
        '/images/properties/aruna-202.jpg',
        '/images/properties/aruna-202/bathroom.jpg',
        '/images/properties/aruna-202/kitchen.jpg',
        '/images/properties/aruna-202/room.jpg',
        '/images/properties/aruna-202/social.jpg',
    ],
};

// Mapping from folder name key to the property name patterns we search for
const folderToNamePattern: Record<string, string> = {
    'amarillo-201': 'Amarilo 201',
    'amarillo-202': 'Amarilo 202',
    'amarillo-301': 'Amarilo 301',
    'aruna-201': 'Aruna 201',
    'aruna-202': 'Aruna 202',
};

async function run() {
    // 1. Fix Amarilo 301 stats
    const { data: props } = await supabase.from('properties').select('id, name, main_image_url');
    if (!props) { console.error('Could not fetch properties'); return; }

    for (const p of props) {
        const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        const esName = nameObj?.es || '';

        if (esName.includes('Amarilo 301')) {
            console.log(`\n🔧 Fixing Amarilo 301 stats...`);
            const { error } = await supabase
                .from('properties')
                .update({ bedrooms: 2, bathrooms: 2, max_guests: 6 })
                .eq('id', p.id);
            if (error) console.error('Error:', error.message);
            else console.log('  ✅ Updated to 2 beds, 2 baths, 6 guests');
        }
    }

    // 2. For each property, add missing photos
    const { data: existingImages } = await supabase
        .from('property_images')
        .select('property_id, image_url');

    const existingSet = new Set(
        (existingImages || []).map(img => `${img.property_id}::${img.image_url}`)
    );

    for (const [folder, photoUrls] of Object.entries(localPhotos)) {
        const namePattern = folderToNamePattern[folder];
        const prop = props.find(p => {
            const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
            return (nameObj?.es || '').includes(namePattern);
        });

        if (!prop) {
            console.log(`\n⚠️  No property found for "${namePattern}"`);
            continue;
        }

        const nameObj = typeof prop.name === 'string' ? JSON.parse(prop.name) : prop.name;
        console.log(`\n📸 ${nameObj?.es} — checking ${photoUrls.length} local photos...`);

        // Get current max display_order
        const { data: currentImages } = await supabase
            .from('property_images')
            .select('display_order')
            .eq('property_id', prop.id)
            .order('display_order', { ascending: false })
            .limit(1);

        let nextOrder = (currentImages?.[0]?.display_order ?? -1) + 1;

        const toInsert: { property_id: string; image_url: string; display_order: number }[] = [];

        for (const url of photoUrls) {
            const key = `${prop.id}::${url}`;
            if (existingSet.has(key)) {
                console.log(`  ⏭️  Already exists: ${url}`);
            } else {
                // Also skip if the URL matches the main_image_url (it's already shown as main)
                // But we WANT it in the gallery too for the modal
                toInsert.push({ property_id: prop.id, image_url: url, display_order: nextOrder++ });
                console.log(`  ➕ Will add: ${url}`);
            }
        }

        if (toInsert.length > 0) {
            const { error } = await supabase.from('property_images').insert(toInsert);
            if (error) console.error(`  ❌ Insert error:`, error.message);
            else console.log(`  ✅ Added ${toInsert.length} new photos`);
        } else {
            console.log(`  ✅ All photos already present`);
        }
    }

    console.log('\n🎉 Done!');
}

run();
