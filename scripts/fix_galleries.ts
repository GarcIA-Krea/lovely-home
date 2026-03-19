import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const { data: props } = await supabase.from('properties').select('id, name');
    if (!props) return;

    const getPropId = (pattern: string) => {
        const p = props.find(p => {
            const n = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
            return (n?.es || '').includes(pattern);
        });
        return p?.id;
    };

    // === AMARILO 201: Insert 12 curated photos (currently 0) ===
    const am201Id = getPropId('Amarilo 201');
    if (am201Id) {
        const photos201 = [
            '/images/properties/amarillo-201/kitchen.jpg',
            '/images/properties/amarillo-201/bathroom.jpg',
            '/images/properties/amarillo-201/room.jpg',
            '/images/properties/amarillo-201/social.jpg',
            '/images/properties/amarillo-201/amarilo_201_alcoba_principal_con_closet.jpg',
            '/images/properties/amarillo-201/amarilo_201_cama_doble_principal.jpg',
            '/images/properties/amarillo-201/amarilo_201_detalle_cocina.jpg',
            '/images/properties/amarillo-201/amarilo_201_estudio_sal_n.jpg',
            '/images/properties/amarillo-201/amarilo_201_habitacion_auxiliar_con_tv.jpg',
            '/images/properties/amarillo-201/amarilo_201_portada_vista_general.jpg',
            '/images/properties/amarillo-201/amarilo_201_vista_entrada.jpg',
            '/images/properties/amarillo-201/amarilo_201_cerramiento_zona_ropas.jpg',
        ];
        const inserts = photos201.map((url, i) => ({ property_id: am201Id, image_url: url, display_order: i }));
        const { error } = await supabase.from('property_images').insert(inserts);
        console.log(`Amarilo 201: ${error ? '❌ ' + error.message : '✅ Inserted 12 photos'}`);
    }

    // === AMARILO 301: Add 8 more (currently has 4) ===
    const am301Id = getPropId('Amarilo 301');
    if (am301Id) {
        // First reorder existing 4 to positions 8-11
        const { data: existing301 } = await supabase
            .from('property_images')
            .select('id')
            .eq('property_id', am301Id)
            .order('display_order');

        if (existing301) {
            for (let i = 0; i < existing301.length; i++) {
                await supabase.from('property_images').update({ display_order: 8 + i }).eq('id', existing301[i].id);
            }
        }

        // Insert 8 new ones at positions 0-7
        const photos301 = [
            '/images/properties/amarillo-301/kitchen.jpg',
            '/images/properties/amarillo-301/bathroom.jpg',
            '/images/properties/amarillo-301/room.jpg',
            '/images/properties/amarillo-301/social.jpg',
            '/images/properties/amarillo-301/amarilo_301_cocina_y_meson_comedor_con_a_c.jpg',
            '/images/properties/amarillo-301/amarilo_301_habitacion_principal_con_poltrona_.jpg',
            '/images/properties/amarillo-301/amarilo_301_habitacion_principal_con_salida_a_la_terraza.jpg',
            '/images/properties/amarillo-301/amarilo_301_camas_semidobles_habitacion_auxiliar.jpg',
        ];
        const inserts = photos301.map((url, i) => ({ property_id: am301Id, image_url: url, display_order: i }));
        const { error } = await supabase.from('property_images').insert(inserts);
        console.log(`Amarilo 301: ${error ? '❌ ' + error.message : '✅ Inserted 8 more photos (total 12)'}`);
    }

    console.log('\n🎉 Fix complete!');
}

fix();
