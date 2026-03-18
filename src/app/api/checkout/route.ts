import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { propertyId, propertyName, pricePerNight, checkIn, checkOut, nights, currency } = await req.json();

        if (!propertyId || !checkIn || !checkOut || !nights) {
            return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
        }

        const boldApiKey = process.env.BOLD_API_KEY;
        if (!boldApiKey) {
            console.error('Missing BOLD_API_KEY');
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
        }

        // Bold.co Link de Pago API
        // Documentation suggests POST to /online/link/v1
        const description = `Reserva: ${propertyName} (${nights} noches: ${checkIn} - ${checkOut})`;
        const totalAmount = pricePerNight * nights;

        const response = await fetch('https://integrations.api.bold.co/online/link/v1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `x-api-key ${boldApiKey}`
            },
            body: JSON.stringify({
                description: description,
                amount: totalAmount.toString(),
                currency: currency.toUpperCase(),
                redirection_url: `${req.headers.get('origin')}/booking/success`,
                metadata: {
                    property_id: propertyId,
                    check_in: checkIn,
                    check_out: checkOut
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Bold API Error:', data);
            throw new Error(data.message || 'Error creating Bold checkout link');
        }

        // Bold returns the link in data.payload.url or similar (standard structure)
        // Adjust based on typical Bold API response
        return NextResponse.json({ url: data.payload?.url || data.url });
    } catch (err: any) {
        console.error('Payment Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
