// Native fetch is available in Node 18+
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function addColumns() {
    const sql = `
        ALTER TABLE properties ADD COLUMN IF NOT EXISTS airbnb_url TEXT;
        ALTER TABLE properties ADD COLUMN IF NOT EXISTS booking_url TEXT;
    `;

    try {
        const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'apikey': key
            },
            body: JSON.stringify({ sql })
        });

        if (response.ok) {
            console.log('✅ Columns added successfully via RPC.');
        } else {
            const err = await response.text();
            console.error('❌ Failed to add columns via RPC (maybe rpc not enabled):', err);

            // Fallback: If RPC fails, we just document it.
            console.log('💡 Note: You might need to add these columns manually in the Supabase Dashboard SQL Editor:');
            console.log(sql);
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

addColumns();
