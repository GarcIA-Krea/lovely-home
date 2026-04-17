import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Basic iCal Parser
 * Extracts VEVENT blocks and handles simple DATE/DATETIME values
 */
function parseICal(icsContent: string) {
    const events: any[] = [];
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;

    while ((match = veventRegex.exec(icsContent)) !== null) {
        const block = match[1];
        const event: any = {};

        // Extract UID
        const uidMatch = block.match(/UID:(.+)/);
        if (uidMatch) event.uid = uidMatch[1].trim();

        // Extract Summary
        const summaryMatch = block.match(/SUMMARY:(.+)/);
        if (summaryMatch) event.summary = summaryMatch[1].trim();

        // Extract DTSTART
        const startMatch = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/);
        if (startMatch) event.start = formatICalDate(startMatch[1]);

        // Extract DTEND
        const endMatch = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/);
        if (endMatch) event.end = formatICalDate(endMatch[1]);

        if (event.start && event.end) {
            events.push(event);
        }
    }
    return events;
}

function formatICalDate(icalStr: string) {
    // Format: YYYYMMDD or YYYYMMDDTHHMMSSZ
    const y = icalStr.slice(0, 4);
    const m = icalStr.slice(4, 6);
    const d = icalStr.slice(6, 8);
    return `${y}-${m}-${d}`;
}

export async function POST() {
    try {
        // 1. Get properties with iCal URLs
        const { data: properties, error: propError } = await supabase
            .from('properties')
            .select('id, airbnb_ical_url, booking_ical_url')
            .or('airbnb_ical_url.neq.null,booking_ical_url.neq.null');

        if (propError) {
            console.error('Supabase property fetch error:', propError);
            throw propError;
        }

        if (!properties || properties.length === 0) {
            return NextResponse.json({ success: true, syncedCount: 0, message: 'No properties to sync' });
        }

        let totalSynced = 0;

        // 2. Process each property
        for (const prop of properties) {
            const syncUrls = [
                { url: prop.airbnb_ical_url, platform: 'airbnb' },
                { url: prop.booking_ical_url, platform: 'booking' }
            ].filter(s => s.url && s.url.startsWith('http'));

            for (const { url, platform } of syncUrls) {
                try {
                    const response = await fetch(url as string);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const icsContent = await response.text();
                    const events = parseICal(icsContent);

                    if (events.length === 0) continue;

                    for (const event of events) {
                        // UPSERT into reservations
                        const { error: upsertError } = await supabase
                            .from('reservations')
                            .upsert({
                                external_id: event.uid || `${prop.id}-${event.start}-${event.end}`,
                                property_id: prop.id,
                                guest_name: event.summary || 'Reserva OTA',
                                guest_email: 'sync@ota.com',
                                check_in: event.start,
                                check_out: event.end,
                                platform: platform,
                                status: 'confirmed',
                                currency: 'COP',
                                total_price: 0 
                            }, {
                                onConflict: 'external_id'
                            });

                        if (!upsertError) totalSynced++;
                    }
                } catch (err: any) {
                    console.error(`Error syncing ${platform} for property ${prop.id}:`, err.message);
                }
            }

            // Update last_sync_at for the property (if the column exists)
            try {
                await supabase
                    .from('properties')
                    .update({ last_sync_at: new Date().toISOString() })
                    .eq('id', prop.id);
            } catch (e) {
                // Ignore if column doesn't exist yet
            }
        }

        return NextResponse.json({ success: true, syncedCount: totalSynced });

    } catch (error: any) {
        console.error('Sync Global Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
