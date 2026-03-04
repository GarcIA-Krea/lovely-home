const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    { slug: 'amarilo-201', name: 'Amarilo 201' },
    { slug: 'amarilo-202', name: 'Amarilo 202' },
    { slug: 'amarilo-301', name: 'Amarilo 301' },
];

async function revertNames() {
    console.log('🔄 Revirtiendo nombres a Amarilo...');

    for (const item of updates) {
        const { error } = await supabase
            .from('properties')
            .update({ name: item.name })
            .eq('slug', item.slug);

        if (error) {
            console.error(`❌ Error al actualizar ${item.slug}:`, error.message);
        } else {
            console.log(`✅ Restaurado: ${item.name}`);
        }
    }

    console.log('🏁 Proceso terminado.');
}

revertNames();
