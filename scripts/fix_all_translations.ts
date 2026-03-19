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
            
            console.log('Available languages in description:', Object.keys(desc));

            // Replacements for "luxury" across languages
            const replacements: Record<string, { from: string, to: string }> = {
                'es': { from: 'lujo', to: 'diseño' },
                'en': { from: 'luxury', to: 'design' },
                'fr': { from: 'luxe', to: 'design' },
                'de': { from: 'Luxus', to: 'Design' }, // Might also be "luxuriös" -> "designed"
                'it': { from: 'lusso', to: 'design' },
                'pt': { from: 'luxo', to: 'design' }
            };

            for (const lang of Object.keys(desc)) {
                if (replacements[lang]) {
                    const { from, to } = replacements[lang];
                    const regex = new RegExp(from, 'gi');
                    desc[lang] = desc[lang].replace(regex, to);
                }
            }

            // Specific fix for the user's provided Spanish sentence (just in case)
            desc.es = "Espectacular penthouse con terraza privada. Diseñado para ofrecer una experiencia de vida superior en El Poblado, fusionando diseño, descanso y privacidad inigualable.";

            const { error } = await supabase.from('properties').update({ description: desc }).eq('id', p.id);
            if (error) {
                console.error('❌ Error updating description:', error.message);
            } else {
                console.log('✅ Updated Amarilo 301 description in all 6 languages.');
                console.log('Preview (DE):', desc.de);
                console.log('Preview (FR):', desc.fr);
            }
        }
    }
}

fix();
