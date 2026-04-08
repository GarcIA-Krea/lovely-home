import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { error } = await supabase.from('reservations').insert([body]);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { action } = body;
        
        if (action === 'update_status') {
            const { id, status } = body;
            const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
            if (error) throw error;
        } else if (action === 'clear_expired') {
            const { expiredIds } = body;
            const { error } = await supabase.from('reservations').delete().in('id', expiredIds);
            if (error) throw error;
        } else {
            throw new Error('Invalid action');
        }
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
