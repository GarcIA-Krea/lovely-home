import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
    try {
        // A simple query to keep the Supabase project active
        const { data, error } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Database pinged successfully to prevent pausing.' });
    } catch (error: any) {
        console.error('Keepalive Ping Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
