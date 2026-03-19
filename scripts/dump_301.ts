import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: props, error: propsError } = await supabase.from('properties').select('id, name, description');
    if (propsError || !props) {
        console.error('Error fetching properties:', propsError?.message);
        return;
    }

    for (const p of props) {
        const nameData = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        if (nameData?.es?.includes('Amarilo 301')) {
            const desc = typeof p.description === 'string' ? JSON.parse(p.description) : p.description;
            console.log(JSON.stringify(desc, null, 2));
        }
    }
}

run();
