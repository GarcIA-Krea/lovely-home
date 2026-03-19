import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFinalPolish() {
    // 1. Fetch all properties
    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, name, description, max_guests');

    if (error || !properties) {
        console.error('Error fetching properties:', error);
        return;
    }

    for (const prop of properties) {
        const nameStr = typeof prop.name === 'string' ? prop.name : JSON.stringify(prop.name);
        const nameObj = typeof prop.name === 'string' ? JSON.parse(prop.name) : prop.name;
        const esName = nameObj?.es || '';
        console.log(`\n--- ${esName} (id: ${prop.id}) ---`);
        console.log(`  Current max_guests: ${prop.max_guests}`);

        // Determine new max_guests
        let newMaxGuests = prop.max_guests;
        if (esName.includes('Amarilo')) {
            newMaxGuests = 4;
        } else if (esName.includes('Aruna') && esName.includes('201')) {
            newMaxGuests = 4;
        } else if (esName.includes('Aruna') && esName.includes('202')) {
            newMaxGuests = 3; // 2+1
        }

        // Fix description: replace "lujo" with "diseño"
        let descObj = typeof prop.description === 'string' ? JSON.parse(prop.description) : prop.description;
        let changed = false;

        for (const lang of Object.keys(descObj)) {
            if (typeof descObj[lang] === 'string' && descObj[lang].toLowerCase().includes('lujo')) {
                descObj[lang] = descObj[lang].replace(/lujo/gi, 'diseño');
                changed = true;
                console.log(`  Fixed "lujo" → "diseño" in [${lang}]`);
            }
        }

        const updates: any = {};
        if (newMaxGuests !== prop.max_guests) {
            updates.max_guests = newMaxGuests;
            console.log(`  Updating max_guests: ${prop.max_guests} → ${newMaxGuests}`);
        }
        if (changed) {
            updates.description = descObj;
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', prop.id);
            
            if (updateError) {
                console.error(`  Error updating ${esName}:`, updateError.message);
            } else {
                console.log(`  ✅ Updated successfully`);
            }
        } else {
            console.log(`  No changes needed.`);
        }
    }

    console.log('\n🎉 Final polish complete!');
}

fixFinalPolish();
