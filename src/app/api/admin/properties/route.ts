import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(req: Request) {
    try {
        const { id, price_per_night, airbnb_url, booking_url, airbnb_ical_url, booking_ical_url } = body;

        if (!id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('properties')
            .update({ 
                price_per_night, 
                airbnb_url, 
                booking_url,
                airbnb_ical_url,
                booking_ical_url
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        console.error('API update error:', e);
        return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
    }
}
