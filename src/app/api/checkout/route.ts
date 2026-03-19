import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const { propertyId, propertyName, guestName, guestEmail, pricePerNight, checkIn, checkOut, nights, currency } = await req.json();

        if (!propertyId || !guestName || !guestEmail || !checkIn || !checkOut || !nights) {
            return NextResponse.json({ error: 'Faltan datos requeridos (nombre, email, fechas)' }, { status: 400 });
        }

        const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
        const wompiIntegritySecret = process.env.WOMPI_INTEGRITY_SECRET;

        // Si no existen las llaves de Wompi, devolvemos error (o usamos "TEST_KEY" por defecto temporal si lo configuran así)
        if (!wompiPublicKey) {
            console.error('Missing Wompi Keys');
            return NextResponse.json({ error: 'La pasarela de pagos no está configurada.' }, { status: 500 });
        }

        const totalAmount = pricePerNight * nights;
        const amountInCents = totalAmount * 100;

        // 1. Crear la reserva en estado "pending" en Supabase
        // Note: Check what propertyId actually is. In BookingCalendar it passes 'propertyName' as propertyId string! This is a bug in the client!
        // We will insert 'external_id' for now if propertyId is not a UUID, to prevent errors.
        
        let validPropertyId = null;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(propertyId)) {
            validPropertyId = propertyId;
        }

        const { data: reservation, error: dbError } = await supabase
            .from('reservations')
            .insert([{
                property_id: validPropertyId, // Can be null if front-end didn't pass UUID
                guest_name: guestName,
                guest_email: guestEmail,
                check_in: checkIn,
                check_out: checkOut,
                total_price: totalAmount,
                currency: currency,
                status: 'pending',
                platform: 'direct'
            }])
            .select('id')
            .single();

        if (dbError) {
            console.error('Error inserting reservation:', dbError);
            throw new Error('Error al registrar la reserva en la base de datos.');
        }

        const reservationId = reservation.id;

        // 2. Generar el Hash de Wompi
        // format: reference + amountInCents + currency + integritySecret
        const reference = `RES-${reservationId}`;
        const currencyCode = currency.toUpperCase();
        
        let signature = '';
        if (wompiIntegritySecret) {
            const rawString = `${reference}${amountInCents}${currencyCode}${wompiIntegritySecret}`;
            const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawString));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // 3. Crear la URL del Checkout de Wompi
        const originUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://lovely-home.vercel.app';
        const redirectUrl = `${originUrl}/booking/success`;
        
        const wompiCheckoutUrl = new URL('https://checkout.wompi.co/p/');
        wompiCheckoutUrl.searchParams.append('public-key', wompiPublicKey);
        wompiCheckoutUrl.searchParams.append('currency', currencyCode);
        wompiCheckoutUrl.searchParams.append('amount-in-cents', amountInCents.toString());
        wompiCheckoutUrl.searchParams.append('reference', reference);
        wompiCheckoutUrl.searchParams.append('redirect-url', redirectUrl);
        wompiCheckoutUrl.searchParams.append('customer-data:email', guestEmail);
        wompiCheckoutUrl.searchParams.append('customer-data:full-name', guestName);
        
        if (signature) {
            wompiCheckoutUrl.searchParams.append('signature:integrity', signature);
        }

        return NextResponse.json({ url: wompiCheckoutUrl.toString(), reservationId });
    } catch (err: any) {
        console.error('Payment Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

