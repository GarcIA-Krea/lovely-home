import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function logNames() {
    console.log("Fetching property names...");
    const { data: properties, error } = await supabase.from('properties').select('id, name');
    
    if (error) {
        console.error("Error fetching properties:", error);
        return;
    }
    
    for (const prop of properties) {
        console.log(`ID: ${prop.id}`);
        console.log(`Name object:`, JSON.stringify(prop.name, null, 2));
    }
}

logNames();
