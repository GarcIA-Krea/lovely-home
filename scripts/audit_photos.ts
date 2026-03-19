import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
    // 1. Fix Amarilo 301 stats
    const { data: props } = await supabase.from('properties').select('id, name, bedrooms, bathrooms, max_guests');
    if (!props) return;

    for (const p of props) {
        const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        const esName = nameObj?.es || '';
        console.log(`${esName}: beds=${p.bedrooms}, baths=${p.bathrooms}, guests=${p.max_guests}`);
    }

    // 2. Fetch current images per property
    const { data: images } = await supabase
        .from('property_images')
        .select('id, property_id, image_url, display_order')
        .order('property_id')
        .order('display_order');

    console.log('\n--- Current Images in DB ---');
    if (images) {
        const grouped: Record<string, string[]> = {};
        for (const img of images) {
            if (!grouped[img.property_id]) grouped[img.property_id] = [];
            grouped[img.property_id].push(img.image_url);
        }
        for (const [pid, urls] of Object.entries(grouped)) {
            const prop = props.find(p => p.id === pid);
            const nameObj = typeof prop?.name === 'string' ? JSON.parse(prop.name) : prop?.name;
            console.log(`\n${nameObj?.es || pid} (${urls.length} images):`);
            urls.forEach((u, i) => console.log(`  [${i}] ${u}`));
        }
    }
}

audit();
