import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24-preview' as any,
});

export async function POST(req: Request) {
    try {
        const { propertyId, propertyName, pricePerNight, checkIn, checkOut, nights, currency } = await req.json();

        if (!propertyId || !checkIn || !checkOut || !nights) {
            return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Reserva: ${propertyName}`,
                            description: `Estadía desde ${checkIn} hasta ${checkOut} (${nights} noches)`,
                        },
                        unit_amount: pricePerNight * 100, // Stripe expects amounts in cents/centavos
                    },
                    quantity: nights,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/`,
            metadata: {
                propertyId,
                propertyName,
                checkIn,
                checkOut,
                nights,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
