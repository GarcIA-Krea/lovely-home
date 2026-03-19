import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reviewContent() {
    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            id, 
            name, 
            description,
            price_per_night,
            property_images (id, image_url, display_order)
        `);
    
    if (error) {
        console.error("Error fetching:", error);
        return;
    }
    
    for (const prop of properties) {
        let parsedName = typeof prop.name === 'string' ? JSON.parse(prop.name) : prop.name;
        let parsedDesc = typeof prop.description === 'string' ? JSON.parse(prop.description) : prop.description;
        
        console.log(`\n=== PROPERTY: ${parsedName.es} ===`);
        console.log(`ID: ${prop.id}`);
        console.log(`Price: ${prop.price_per_night} COP`);
        console.log(`Description (ES): ${parsedDesc.es}`);
        console.log(`Images:`);
        prop.property_images?.sort((a: any, b: any) => a.display_order - b.display_order).forEach((img: any) => {
            console.log(`  - ID: ${img.id} | ${img.image_url} (Order: ${img.display_order})`);
        });
    }
}

reviewContent();
