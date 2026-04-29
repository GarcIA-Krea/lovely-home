import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        
        if (type === 'seasons') {
            const { data, error } = await supabase.from('pricing_seasons').select('*').order('start_date', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data);
        }
        
        if (type === 'events') {
            const { data, error } = await supabase.from('pricing_events').select('*').order('start_date', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data);
        }

        if (type === 'dow') {
            const { searchParams } = new URL(req.url);
            const propertyId = searchParams.get('property_id');
            const { data, error } = await supabase.from('pricing_rules_dow').select('*').eq('property_id', propertyId);
            if (error) throw error;
            return NextResponse.json(data);
        }

        if (type === 'properties') {
            const { data, error } = await supabase.from('properties').select('id, name, price_per_night, price_min, price_max, last_minute_discount').order('name', { ascending: true });
            if (error) throw error;
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const body = await req.json();

        if (type === 'seasons') {
            const { error } = await supabase.from('pricing_seasons').insert([body]);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (type === 'events') {
            const { error } = await supabase.from('pricing_events').insert([body]);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (type === 'dow') {
            // Upsert DOW rule
            const { error } = await supabase.from('pricing_rules_dow').upsert([body], { onConflict: 'property_id,day_of_week' });
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (type === 'properties') {
            // Update property limits
            const { id, ...updates } = body;
            const { error } = await supabase.from('properties').update(updates).eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

        if (type === 'seasons') {
            const { error } = await supabase.from('pricing_seasons').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (type === 'events') {
            const { error } = await supabase.from('pricing_events').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Tipo inválido para borrar' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
