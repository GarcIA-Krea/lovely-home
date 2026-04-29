import { NextResponse } from 'next/server';
import { calculateDynamicPrice } from '@/lib/pricingEngine';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const propertyId = searchParams.get('property_id');
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');

        if (!propertyId || !checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'Faltan parámetros: property_id, check_in, check_out' },
                { status: 400 }
            );
        }

        const pricingResult = await calculateDynamicPrice(propertyId, checkIn, checkOut);
        
        return NextResponse.json(pricingResult);
    } catch (e: any) {
        console.error('API Pricing Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
