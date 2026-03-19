import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const { data: props } = await supabase.from('properties').select('id, name, description');
    if (!props) return;

    for (const p of props) {
        const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        if (nameObj?.es?.includes('Amarilo 301')) {
            const desc = typeof p.description === 'string' ? JSON.parse(p.description) : p.description;
            console.log('Current English description:', desc.en);
            
            // Replace "luxury" with "design" in English
            if (desc.en) {
                desc.en = desc.en.replace(/luxury/gi, 'design');
            }
            
            // If there are other languages, we could check them too, but English is the primary one mentioned.
            // Let's ensure Spanish is also correct just in case
            if (desc.es) {
                desc.es = desc.es.replace(/lujo/gi, 'diseño');
                // Ensure it matches the user's provided sentence
                desc.es = "Espectacular penthouse con terraza privada. Diseñado para ofrecer una experiencia de vida superior en El Poblado, fusionando diseño, descanso y privacidad inigualable.";
            }

            const { error } = await supabase.from('properties').update({ description: desc }).eq('id', p.id);
            if (error) {
                console.error('❌ Error updating description:', error.message);
            } else {
                console.log('✅ Updated Amarilo 301 description in all languages.');
                console.log('New English:', desc.en);
            }
        }
    }
}

fix();
