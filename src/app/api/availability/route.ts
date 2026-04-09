import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');
        const numGuests = parseInt(searchParams.get('num_guests') || '1');

        // 1. Fetch all properties
        const { data: properties, error: propsError } = await supabase
            .from('properties')
            .select('id, name, max_guests, price_per_night, currency, main_image_url, neighborhood')
            .order('max_guests', { ascending: true });

        if (propsError) throw propsError;

        // Filter by guest capacity
        const eligibleProperties = (properties || []).filter(p => p.max_guests >= numGuests);

        if (!checkIn || !checkOut) {
            // Return all eligible properties without availability check
            return NextResponse.json(eligibleProperties.map(p => ({ ...p, is_available: true })));
        }

        // 2. Find reservations that OVERLAP with the requested dates
        // Overlap: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
        const { data: blocked, error: resError } = await supabase
            .from('reservations')
            .select('property_id')
            .in('status', ['confirmed', 'pending'])
            .lt('check_in', checkOut)   // existing starts before requested ends
            .gt('check_out', checkIn);  // existing ends after requested starts

        if (resError) throw resError;

        const blockedIds = new Set((blocked || []).map(r => r.property_id));

        // 3. Return all eligible properties with availability flag
        const result = eligibleProperties.map(p => ({
            ...p,
            is_available: !blockedIds.has(p.id)
        }));

        return NextResponse.json(result);
    } catch (err: any) {
        console.error('Availability Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
