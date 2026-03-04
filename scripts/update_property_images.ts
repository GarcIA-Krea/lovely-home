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

const updates = [
    {
        oldName: 'Amarilo 201',
        newName: 'Amarillo 201',
        slug: 'amarilo-201',
        main_image_url: '/images/properties/amarillo-201.jpg'
    },
    {
        oldName: 'Amarilo 202',
        newName: 'Amarillo 202',
        slug: 'amarilo-202',
        main_image_url: '/images/properties/amarillo-202.jpg'
    },
    {
        oldName: 'Amarilo 301',
        newName: 'Amarillo 301',
        slug: 'amarilo-301',
        main_image_url: '/images/properties/amarillo-301.jpg'
    },
    {
        oldName: 'Aruna 201',
        newName: 'Aruna 201',
        slug: 'aruna-201',
        main_image_url: '/images/properties/aruna-201.jpg'
    },
    {
        oldName: 'Aruna 202',
        newName: 'Aruna 202',
        slug: 'aruna-202',
        main_image_url: '/images/properties/aruna-202.jpg'
    },
];

async function update() {
    console.log('🚀 Starting property updates...');

    for (const item of updates) {
        const { error } = await supabase
            .from('properties')
            .update({
                name: item.newName,
                main_image_url: item.main_image_url
            })
            .eq('slug', item.slug);

        if (error) {
            console.error(`❌ Error updating ${item.oldName}:`, error.message);
        } else {
            console.log(`✅ Updated ${item.oldName} -> ${item.newName} with image ${item.main_image_url}`);
        }
    }

    console.log('🏁 Updates finished!');
}

update();
