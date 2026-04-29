import { createClient } from '@supabase/supabase-js';

// Usamos el cliente con Service Role para leer todas las reglas de precio
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface PriceBreakdown {
    date: string;
    basePrice: number;
    finalPrice: number;
    multiplierDow: number;
    multiplierSeason: number;
    multiplierEvent: number;
    discountLastMinute: number;
    note: string;
}

export interface PricingResult {
    total: number;
    nights: number;
    averagePerNight: number;
    breakdown: PriceBreakdown[];
    currency: string;
}

/**
 * Calcula el precio dinámico para un rango de fechas de una propiedad.
 */
export async function calculateDynamicPrice(
    propertyId: string,
    checkInStr: string,
    checkOutStr: string
): Promise<PricingResult> {
    // 1. Obtener la propiedad y sus límites
    const { data: property, error: propError } = await supabase
        .from('properties')
        .select('price_per_night, price_min, price_max, last_minute_discount, currency')
        .eq('id', propertyId)
        .single();

    if (propError || !property) {
        throw new Error('Propiedad no encontrada o error al obtener datos.');
    }

    const basePrice = Number(property.price_per_night);
    const minPrice = property.price_min ? Number(property.price_min) : basePrice * 0.5; // Por defecto no bajar del 50%
    const maxPrice = property.price_max ? Number(property.price_max) : basePrice * 3.0; // Por defecto no subir del 300%
    const lastMinuteDiscountRate = property.last_minute_discount ? Number(property.last_minute_discount) : 0.15; // 15% por defecto

    // 2. Obtener todas las reglas aplicables
    const [dowRulesRes, seasonsRes, eventsRes] = await Promise.all([
        supabase.from('pricing_rules_dow').select('*').eq('property_id', propertyId),
        supabase.from('pricing_seasons').select('*').or(`applies_to.eq.all,applies_to.eq.${propertyId}`),
        supabase.from('pricing_events').select('*').eq('is_active', true).or(`applies_to.eq.all,applies_to.eq.${propertyId}`)
    ]);

    const dowRules = dowRulesRes.data || [];
    const seasons = seasonsRes.data || [];
    const events = eventsRes.data || [];

    // 3. Generar array de noches
    const checkInDate = new Date(checkInStr + 'T12:00:00');
    const checkOutDate = new Date(checkOutStr + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const nightsCount = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nightsCount <= 0) {
        throw new Error('Las fechas son inválidas.');
    }

    let total = 0;
    const breakdown: PriceBreakdown[] = [];

    // Iterar por cada noche
    for (let i = 0; i < nightsCount; i++) {
        const currentDate = new Date(checkInDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
        const daysUntilCheckin = Math.round((currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let currentPrice = basePrice;
        let note = 'Tarifa base';

        // A. Día de la semana
        const dowRule = dowRules.find((r: any) => r.day_of_week === dayOfWeek);
        const multiplierDow = dowRule ? Number(dowRule.multiplier) : 1.0;
        currentPrice *= multiplierDow;
        if (multiplierDow !== 1.0) note = 'Ajuste día de semana';

        // B. Temporadas
        // Buscar temporadas que incluyan esta fecha (ordenadas por prioridad desc)
        const applicableSeasons = seasons.filter((s: any) => {
            const start = new Date(s.start_date + 'T12:00:00');
            const end = new Date(s.end_date + 'T12:00:00');
            return currentDate >= start && currentDate <= end;
        }).sort((a: any, b: any) => b.priority - a.priority);

        let multiplierSeason = 1.0;
        if (applicableSeasons.length > 0) {
            multiplierSeason = Number(applicableSeasons[0].multiplier);
            currentPrice = basePrice * multiplierDow * multiplierSeason;
            note = `Temporada: ${applicableSeasons[0].name}`;
        }

        // C. Eventos (Mayor prioridad absoluta)
        const applicableEvents = events.filter((e: any) => {
            const start = new Date(e.start_date + 'T12:00:00');
            const end = new Date(e.end_date + 'T12:00:00');
            return currentDate >= start && currentDate <= end;
        });

        let multiplierEvent = 1.0;
        if (applicableEvents.length > 0) {
            // Si hay evento, ignoramos la temporada y aplicamos multiplicador del evento
            multiplierEvent = Number(applicableEvents[0].multiplier);
            currentPrice = basePrice * multiplierDow * multiplierEvent;
            note = `Evento: ${applicableEvents[0].name}`;
        }

        // D. Last Minute Discount (Hoy o Mañana)
        let discountLastMinute = 0;
        // Solo aplica si no hay un evento especial (no hacemos descuento si hay demanda pico)
        if (daysUntilCheckin <= 2 && applicableEvents.length === 0) {
            discountLastMinute = lastMinuteDiscountRate;
            currentPrice = currentPrice * (1 - discountLastMinute);
            if (note === 'Tarifa base' || note === 'Ajuste día de semana') {
                note += ' (Descuento Último Minuto)';
            }
        }

        // E. Limitar entre piso y techo absoluto
        if (currentPrice < minPrice) currentPrice = minPrice;
        if (currentPrice > maxPrice) currentPrice = maxPrice;

        total += currentPrice;
        
        breakdown.push({
            date: currentDate.toISOString().split('T')[0],
            basePrice,
            finalPrice: currentPrice,
            multiplierDow,
            multiplierSeason,
            multiplierEvent,
            discountLastMinute,
            note
        });
    }

    return {
        total,
        nights: nightsCount,
        averagePerNight: total / nightsCount,
        breakdown,
        currency: property.currency
    };
}
