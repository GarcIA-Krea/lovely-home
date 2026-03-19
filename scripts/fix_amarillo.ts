import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAmarillo() {
    console.log("Fetching properties to fix 'Amarillo'...");
    const { data: properties, error } = await supabase.from('properties').select('id, name, description');
    
    if (error) {
        console.error("Error fetching properties:", error);
        return;
    }
    
    let updatedCount = 0;

    for (const prop of properties) {
        let changed = false;
        
        // Sometimes JSON columns end up being strings in Supabase if inserted wrong
        let nameObj = typeof prop.name === 'string' ? JSON.parse(prop.name) : prop.name;
        let descObj = typeof prop.description === 'string' ? JSON.parse(prop.description) : prop.description;

        for (const lang of Object.keys(nameObj)) {
            if (typeof nameObj[lang] === 'string' && nameObj[lang].includes('Amarillo')) {
                nameObj[lang] = nameObj[lang].replace(/Amarillo/g, 'Amarilo');
                changed = true;
            }
        }
        
        for (const lang of Object.keys(descObj)) {
            if (typeof descObj[lang] === 'string' && descObj[lang].includes('Amarillo')) {
                descObj[lang] = descObj[lang].replace(/Amarillo/g, 'Amarilo');
                changed = true;
            }
        }

        if (changed) {
            console.log(`Updating property ID: ${prop.id}`);
            
            // Re-stringify if they were initially strings, else leave as objects
            const finalName = typeof prop.name === 'string' ? JSON.stringify(nameObj) : nameObj;
            const finalDesc = typeof prop.description === 'string' ? JSON.stringify(descObj) : descObj;

            const { error: updateError } = await supabase
                .from('properties')
                .update({ name: finalName, description: finalDesc })
                .eq('id', prop.id);
                
            if (updateError) {
                console.error("Error updating:", updateError);
            } else {
                updatedCount++;
            }
        }
    }
    
    console.log(`Fix complete. Updated ${updatedCount} properties.`);
}

fixAmarillo();
