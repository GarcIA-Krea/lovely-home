import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendReservationNotification } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data: inserted, error } = await supabase
            .from('reservations')
            .insert([body])
            .select('id, guest_name, guest_email, check_in, check_out, total_price, currency')
            .single();
        if (error) throw error;

        // Notificar reserva manual
        if (inserted) {
            const nights = inserted.check_in && inserted.check_out
                ? Math.ceil((new Date(inserted.check_out).getTime() - new Date(inserted.check_in).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
            sendReservationNotification('manual_reservation', {
                reservationId: inserted.id,
                guestName: inserted.guest_name || body.guest_name || 'Huésped',
                guestEmail: inserted.guest_email || body.guest_email || '',
                propertyName: body.property_name || 'Propiedad',
                checkIn: inserted.check_in,
                checkOut: inserted.check_out,
                nights,
                totalPrice: inserted.total_price || 0,
                currency: inserted.currency || 'COP',
                platform: 'direct',
            }).catch(err => console.error('[AdminReservations] Error en notificación:', err));
        }

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
