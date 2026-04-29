import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendReservationNotification } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        
        const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
        
        // 1. Validar la autenticidad del Webhook si se configuró el secreto
        if (eventsSecret && payload.signature) {
            const { properties, checksum } = payload.signature;
            const timestamp = payload.timestamp;
            
            // Reconstruir el string para el hash basado en las propiedades que Wompi pide
            const rawString = properties.map((prop: string) => {
                const keys = prop.split('.');
                let value: any = payload.data;
                for (const key of keys) {
                    value = value[key];
                }
                return value.toString();
            }).join('') + timestamp.toString() + eventsSecret;
            
            const calculatedHash = crypto.createHash('sha256').update(rawString).digest('hex');
            
            if (calculatedHash !== checksum) {
                console.error('Firma de Webhook de Wompi Invalida');
                return NextResponse.json({ error: 'Invalid Webhook Signature' }, { status: 401 });
            }
        }

        // 2. Procesar el Evento
        if (payload.event === 'transaction.updated') {
            const transaction = payload.data.transaction;
            
            // Wompi uses "reference" to store our reservation ID (e.g. "RES-xxxx-xxxx")
            const reference = transaction.reference as string;
            
            if (!reference.startsWith('RES-')) {
                // Not a Lovely Home reservation or invalid format
                return NextResponse.json({ received: true });
            }

            const reservationId = reference.replace('RES-', '');
            let newReservationStatus = 'pending';

            if (transaction.status === 'APPROVED') {
                newReservationStatus = 'confirmed';
            } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(transaction.status)) {
                newReservationStatus = 'cancelled';
            }

            // 3. Actualizar la reserva en Supabase
            if (newReservationStatus !== 'pending') {
                const { data: updatedRes, error } = await supabase
                    .from('reservations')
                    .update({
                        status: newReservationStatus,
                        payment_intent_id: transaction.id
                    })
                    .eq('id', reservationId)
                    .select('guest_name, guest_email, check_in, check_out, total_price, currency, properties(name)')
                    .single();

                if (error) {
                    console.error('Error updating reservation after Wompi webhook:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }

                // 4. Disparar notificación del nuevo estado
                if (updatedRes) {
                    const nights = updatedRes.check_in && updatedRes.check_out
                        ? Math.ceil((new Date(updatedRes.check_out).getTime() - new Date(updatedRes.check_in).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                    const notifType = newReservationStatus === 'confirmed' ? 'confirmed_reservation' : 'cancelled_reservation';
                    sendReservationNotification(notifType, {
                        reservationId,
                        guestName: updatedRes.guest_name || 'Huésped',
                        guestEmail: updatedRes.guest_email || '',
                        propertyName: (updatedRes.properties as any)?.name || 'Propiedad',
                        checkIn: updatedRes.check_in,
                        checkOut: updatedRes.check_out,
                        nights,
                        totalPrice: updatedRes.total_price || 0,
                        currency: updatedRes.currency || 'COP',
                        platform: 'direct',
                    }).catch(err => console.error('[Webhook] Error en notificación:', err));
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
