import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContent() {
    console.log("Starting Content Curation...");

    // 1. DELETE DUPLICATE IMAGES
    const { data: images, error: fetchError } = await supabase.from('property_images').select('id, property_id, image_url');
    if (fetchError) {
        console.error("Error fetching images:", fetchError);
        return;
    }

    const seen = new Set();
    const idsToDelete: string[] = [];

    for (const img of images) {
        const uniqueKey = `${img.property_id}_${img.image_url}`;
        if (seen.has(uniqueKey)) {
            idsToDelete.push(img.id);
        } else {
            seen.add(uniqueKey);
        }
    }

    if (idsToDelete.length > 0) {
        console.log(`Found ${idsToDelete.length} duplicate images to delete.`);
        const { error: deleteError } = await supabase.from('property_images').delete().in('id', idsToDelete);
        if (deleteError) {
            console.error("Error deleting duplicates:", deleteError);
        } else {
            console.log("Deleted duplicates successfully.");
        }
    } else {
        console.log("No duplicate images found.");
    }

    // 2. UPDATE DESCRIPTIONS FOR AMARILO 201 AND 301
    const { data: properties, error: propError } = await supabase.from('properties').select('id, name, description').in('id', [
        'dfa55dd3-bb9b-42d1-ae40-a78e8f07a018', // 201
        '7ccb851d-c5ba-4b30-af25-8bc96c7ece11'  // 301
    ]);

    if (propError) {
        console.error("Error fetching props:", propError);
        return;
    }

    for (const prop of properties) {
        let is201 = prop.id === 'dfa55dd3-bb9b-42d1-ae40-a78e8f07a018';
        
        // Ensure proper parsing
        let descObj = typeof prop.description === 'string' ? JSON.parse(prop.description) : prop.description;

        if (is201) {
            descObj.es = "Exclusivo apartamento con estilo moderno e iluminación natural superior. Ideal para ejecutivos o parejas que buscan confort sin igual en el corazón vibrante de la ciudad.";
            descObj.en = "Exclusive modern apartment with superior natural lighting. Ideal for executives or couples seeking unparalleled comfort in the vibrant heart of the city.";
        } else {
            descObj.es = "Espectacular penthouse con terraza privada. Diseñado para ofrecer una experiencia de vida superior en El Poblado, fusionando lujo, descanso y privacidad inigualable.";
            descObj.en = "Spectacular penthouse with a private terrace. Designed to offer a superior living experience in El Poblado, merging luxury, relaxation, and unmatched privacy.";
        }

        const finalDesc = typeof prop.description === 'string' ? JSON.stringify(descObj) : descObj;

        const { error: updateError } = await supabase.from('properties').update({ description: finalDesc }).eq('id', prop.id);
        
        if (updateError) {
            console.error(`Error updating prop ${prop.id}:`, updateError);
        } else {
            console.log(`Successfully updated description for ${is201 ? 'Amarilo 201' : 'Amarilo 301'}.`);
        }
    }
    
    console.log("Content Curation Complete!");
}

fixContent();
