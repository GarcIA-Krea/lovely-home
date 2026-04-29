import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Robust iCal Parser
 * Handles multiple DTSTART formats including TZID variants from Airbnb/Booking
 */
function parseICal(icsContent: string) {
    const events: any[] = [];
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;

    while ((match = veventRegex.exec(icsContent)) !== null) {
        const block = match[1];
        const event: any = {};

        // Extract UID
        const uidMatch = block.match(/^UID:(.+)/m);
        if (uidMatch) event.uid = uidMatch[1].trim();

        // Extract Summary
        const summaryMatch = block.match(/^SUMMARY:(.+)/m);
        if (summaryMatch) event.summary = summaryMatch[1].trim();

        // Robust DTSTART: handles VALUE=DATE, TZID=..., and plain formats
        const startMatch = block.match(/^DTSTART[^:]*:(\d{8})/m);
        if (startMatch) event.start = formatICalDate(startMatch[1]);

        // Robust DTEND: same approach
        const endMatch = block.match(/^DTEND[^:]*:(\d{8})/m);
        if (endMatch) event.end = formatICalDate(endMatch[1]);

        if (event.start && event.end) {
            events.push(event);
        }
    }
    return events;
}

function formatICalDate(icalStr: string) {
    // Extracts YYYY-MM-DD from YYYYMMDD...
    const y = icalStr.slice(0, 4);
    const m = icalStr.slice(4, 6);
    const d = icalStr.slice(6, 8);
    return `${y}-${m}-${d}`;
}

export async function POST() {
    try {
        // 1. Get ALL properties (filter in JS to avoid PostgREST .or() null syntax issues)
        const { data: allProperties, error: propError } = await supabase
            .from('properties')
            .select('id, airbnb_ical_url, booking_ical_url');

        if (propError) {
            console.error('Supabase property fetch error:', propError);
            throw propError;
        }

        // Filter for properties that have at least one valid iCal URL
        const properties = (allProperties || []).filter(
            p => (p.airbnb_ical_url && p.airbnb_ical_url.startsWith('http')) ||
                 (p.booking_ical_url && p.booking_ical_url.startsWith('http'))
        );

        if (properties.length === 0) {
            return NextResponse.json({ 
                success: true, 
                syncedCount: 0, 
                message: 'No properties with iCal URLs found. Add Airbnb or Booking iCal URLs in Properties settings.' 
            });
        }

        let totalSynced = 0;
        const errors: string[] = [];

        // 2. Process each property
        for (const prop of properties) {
            const syncUrls = [
                { url: prop.airbnb_ical_url, platform: 'airbnb' },
                { url: prop.booking_ical_url, platform: 'booking' }
            ].filter(s => s.url && s.url.startsWith('http'));

            for (const { url, platform } of syncUrls) {
                try {
                    const response = await fetch(url as string, {
                        headers: { 'User-Agent': 'LovelyHome-Sync/1.0' },
                        cache: 'no-store'
                    });

                    if (!response.ok) {
                        errors.push(`${platform} HTTP error for property ${prop.id}: status ${response.status}`);
                        continue;
                    }

                    const icsContent = await response.text();

                    // Validate it's actually iCal
                    if (!icsContent.includes('BEGIN:VCALENDAR')) {
                        errors.push(`${platform} URL for property ${prop.id} did not return valid iCal data`);
                        continue;
                    }

                    const events = parseICal(icsContent);
                    const currentICalIds = new Set<string>();

                    // Fetch existing confirmed reservations for this property & platform
                    const { data: existingDB } = await supabase
                        .from('reservations')
                        .select('external_id')
                        .eq('property_id', prop.id)
                        .eq('platform', platform)
                        .eq('status', 'confirmed');
                    
                    const existingIds = new Set(existingDB?.map(r => r.external_id) || []);

                    for (const event of events) {
                        const externalId = event.uid || `${prop.id}-${event.start}-${event.end}`;
                        currentICalIds.add(externalId);

                        // Manual upsert: check-then-insert/update to bypass unique constraint dependency
                        const { data: existing } = await supabase
                            .from('reservations')
                            .select('id')
                            .eq('external_id', externalId)
                            .maybeSingle();

                        if (existing) {
                            // Update existing record
                            const { error: updateError } = await supabase
                                .from('reservations')
                                .update({
                                    guest_name: event.summary || 'Reserva OTA',
                                    check_in: event.start,
                                    check_out: event.end,
                                    platform: platform,
                                    status: 'confirmed',
                                })
                                .eq('external_id', externalId);
                            if (!updateError) totalSynced++;
                            else errors.push(`Update error: ${updateError.message}`);
                        } else {
                            // Insert new record
                            const { error: insertError } = await supabase
                                .from('reservations')
                                .insert({
                                    external_id: externalId,
                                    property_id: prop.id,
                                    guest_name: event.summary || 'Reserva OTA',
                                    guest_email: 'sync@ota.com',
                                    check_in: event.start,
                                    check_out: event.end,
                                    platform: platform,
                                    status: 'confirmed',
                                    currency: 'COP',
                                    total_price: 0
                                });
                            if (!insertError) totalSynced++;
                            else errors.push(`Insert error: ${insertError.message}`);
                        }
                    }

                    // 3. Detect Cancellations (Exists in DB as confirmed, but missing in fresh iCal)
                    const cancelledIds = [...existingIds].filter(id => !currentICalIds.has(id));
                    
                    if (cancelledIds.length > 0) {
                        const { error: cancelError } = await supabase
                            .from('reservations')
                            .update({ status: 'cancelled' })
                            .in('external_id', cancelledIds);
                            
                        if (cancelError) {
                            errors.push(`Cancellation error for ${platform}: ${cancelError.message}`);
                        } else {
                            console.log(`Automatically cancelled ${cancelledIds.length} reservations for ${platform} (Property: ${prop.id})`);
                        }
                    }
                } catch (err: any) {
                    errors.push(`Sync error (${platform}, property ${prop.id}): ${err.message}`);
                    console.error(`Sync error:`, err.message);
                }
            }

            // Update last_sync_at
            await supabase
                .from('properties')
                .update({ last_sync_at: new Date().toISOString() })
                .eq('id', prop.id);
        }

        return NextResponse.json({ 
            success: true, 
            syncedCount: totalSynced,
            propertiesProcessed: properties.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Sync Global Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
