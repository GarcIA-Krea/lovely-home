import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Format YYYY-MM-DD to YYYYMMDD required by basic iCal standard
const formatICalDate = (dateStr: string) => {
    return dateStr.replace(/-/g, '');
};

// Generate an active UTC timestamp for DTSTAMP
const generateDtstamp = (isoString?: string) => {
    const raw = isoString ? new Date(isoString).toISOString() : new Date().toISOString();
    return raw.replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        
        // Connect to Supabase using service role to bypass RLS and fetch all reservations for sync
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase keys not configured for calendar export');
            return new NextResponse('Configuration Error', { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Resolve which property we are trying to sync
        const { data: property, error: propError } = await supabase
            .from('properties')
            .select('id, name')
            .eq('slug', slug)
            .single();

        if (propError || !property) {
            return new NextResponse('Property not found by slug: ' + slug, { status: 404 });
        }

        // Handle JSONB translation gracefully for the meeting summary
        let propertyName = 'Lovely Home Property';
        if (typeof property.name === 'string') {
            try {
                const parsed = JSON.parse(property.name);
                propertyName = parsed.es || parsed.en || property.name;
            } catch (e) {
                propertyName = property.name;
            }
        } else if (typeof property.name === 'object' && property.name !== null) {
            propertyName = property.name.es || property.name.en || 'Property';
        }

        // 2. Fetch all active reservations for this property to block the OTA
        const { data: reservations, error: resError } = await supabase
            .from('reservations')
            .select('id, check_in, check_out, created_at')
            .eq('property_id', property.id)
            .neq('status', 'cancelled');

        if (resError) {
            console.error('Error fetching reservations:', resError);
            return new NextResponse('Error generating calendar', { status: 500 });
        }

        // 3. Build the actual .ics feed 
        const ical = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Lovely Home//Calendar Sync//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        if (reservations && reservations.length > 0) {
            for (const res of reservations) {
                if (!res.check_in || !res.check_out) continue;
                
                const start = formatICalDate(res.check_in);
                const end = formatICalDate(res.check_out);
                const dtstamp = generateDtstamp(res.created_at);
                
                ical.push('BEGIN:VEVENT');
                ical.push(`UID:res-${res.id}@lovelyhome.com.co`);
                ical.push(`DTSTAMP:${dtstamp}`);
                ical.push(`DTSTART;VALUE=DATE:${start}`);
                ical.push(`DTEND;VALUE=DATE:${end}`);
                ical.push(`SUMMARY:Reservado - ${propertyName}`);
                ical.push('STATUS:CONFIRMED');
                ical.push('END:VEVENT');
            }
        }

        ical.push('END:VCALENDAR');
        
        // iCalendar standard requires lines explicitly terminated by CRLF (\r\n)
        const icalContent = ical.join('\r\n');

        // 4. Send response with appropriate headers so Airbnb reads it as an ICS file
        return new NextResponse(icalContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${slug}.ics"`,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (e: any) {
        console.error('Unexpected error generating iCal:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
