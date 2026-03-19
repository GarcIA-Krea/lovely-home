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
            const desc = {
                es: "Espectacular penthouse con terraza privada. Diseñado para ofrecer una experiencia de vida superior en El Poblado, fusionando diseño, descanso y privacidad inigualable.",
                en: "Spectacular penthouse with a private terrace. Designed to offer a superior living experience in El Poblado, merging design, relaxation, and unmatched privacy.",
                pt: "Espetacular cobertura com terraço privativo. Projetada para oferecer uma experiência de vida superior em El Poblado, fundindo design, descanso e privacidade incomparável.",
                de: "Spektakuläres Penthouse mit privater Terrasse. Entwickelt, um ein überlegenes Lebenserlebnis in El Poblado zu bieten, das Design, Ruhe und unvergleichliche Privatsphäre vereint.",
                fr: "Penthouse spectaculaire avec terrasse privée. Conçu pour offrir une expérience de vie supérieure à El Poblado, fusionnant design, repos et intimité inégalée.",
                it: "Spettacolare attico con terrazza privata. Progettato per offrire un'esperienza di vita superiore a El Poblado, fondendo design, riposo e privacy impareggiabile."
            };

            const { error } = await supabase.from('properties').update({ description: desc }).eq('id', p.id);
            if (error) {
                console.error('❌ Error updating description:', error.message);
            } else {
                console.log('✅ Synchronized Amarilo 301 description across all 6 languages.');
                console.log(JSON.stringify(desc, null, 2));
            }
        }
    }
}

fix();
