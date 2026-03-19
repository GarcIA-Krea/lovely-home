import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
    const { data: props } = await supabase.from('properties').select('id, name, main_image_url');
    if (!props) return;

    for (const p of props) {
        const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        const esName = nameObj?.es || '';

        const { data: images } = await supabase
            .from('property_images')
            .select('id, image_url, display_order')
            .eq('property_id', p.id)
            .order('display_order');

        console.log(`\n=== ${esName} (${images?.length || 0} gallery images) ===`);
        console.log(`  Main: ${p.main_image_url}`);
        if (images) {
            images.forEach((img, i) => {
                // Extract just the filename for readability
                const parts = img.image_url.split('/');
                const filename = parts[parts.length - 1];
                console.log(`  [${i}] id=${img.id} order=${img.display_order} → ${filename}`);
            });
        }
    }
}

audit();
