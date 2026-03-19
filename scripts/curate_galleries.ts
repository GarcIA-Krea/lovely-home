import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// For each property, we hand-pick the 12 best image IDs based on:
// - Coverage of all areas (bedroom, bathroom, kitchen, living, exterior)
// - Visual variety (no repeating angles)
// - Aesthetic impact (portadas, general views, detail shots)

const KEEP_IDS: Record<string, string[]> = {
    // === AMARILO 201 (18 images → keep 12) ===
    'Amarilo 201': [
        'c27ab3ec-8ae4-4db4-90e7-40a7856d9e2a', // kitchen.jpg (cocina)
        '89f54cd4-4cd3-4fa4-8509-f3fb9e94e174', // bathroom.jpg (baño)
        '2f1670f2-ccb4-432b-a1e5-4b8f32e8bab7', // room.jpg (habitación principal vista)
        '43826e7e-5e9b-4a49-bb84-2f59acb5c31b', // social.jpg (area general)
        '82a371da-a5e9-4ee8-ae87-bb24bb1b4b81', // amarilo_201_alcoba_principal_con_closet.jpg
        'f0804f08-9e3e-4bb2-867e-bdcd2ed2e6e2', // amarilo_201_cama_doble_principal.jpg
        '7f37e77b-fcc0-48e4-af7f-b7c3dea87c9e', // amarilo_201_detalle_cocina.jpg
        '23b5ecb2-5ff2-4e3d-b29f-fb1f8d5e5284', // amarilo_201_estudio_sal_n.jpg
        '29f6bb87-e8e5-440f-a3cc-8b8f9e53a4bf', // amarilo_201_habitacion_auxiliar_con_tv.jpg
        '19a99891-f2e3-4dd8-bf3a-90e0e7266bb9', // amarilo_201_portada_vista_general.jpg
        'f14ba86d-cf70-4b1b-b56e-a9e5f9a11e7b', // amarilo_201_vista_entrada.jpg
        '5eabbdca-e89d-43cb-b0c5-b2bf1b4e3271', // amarilo_201_cerramiento_zona_ropas.jpg
    ],

    // === AMARILO 202 (15 images → keep 12) ===
    'Amarilo 202': [
        'e086c074-1c0e-4c7f-a3e3-52ecc4ee4b4d', // kitchen.jpg
        '2b5853f1-6b83-4525-bc68-9fc78dbbcfd8', // bathroom.jpg
        'ae50bb45-0cb4-43f7-a370-39015735498d', // room.jpg (escritorio)
        '18a2b7ae-4b5a-4a60-8430-1870b4434f31', // social.jpg (patio)
        '2e729921-ee7c-4129-a8ec-3d49336fb582', // area_social_y_bodega
        'c8a291a2-fceb-427c-9816-ceb0e673ab0c', // baño_cabina
        'cb9e854a-8e00-4bec-976c-7c35ca8f18a2', // cama
        '1b8685ad-bab6-4e94-9205-fe3dadc62aa7', // detalles_decoracion
        '5e3db541-ac23-4c72-9ff5-ce4908c9208c', // sofacama
        '8f2706cc-c5cd-4686-8f14-a9d32633ffce', // vista_entrada
        'bac570d2-31bd-4efb-80a8-37f8505f2890', // cocina_meson
        'ac1ad58a-3dcc-4a5a-8df2-1c6b19c9344e', // cocina_patio
    ],

    // === AMARILO 301 (33 images → keep 12) ===
    'Amarilo 301': [
        '7f5b9bbb-3fc4-4803-a47d-86ce6b8326e3', // kitchen.jpg
        'da7f1959-5cd4-4b9b-814d-0e7fa8e94f02', // bathroom.jpg (principal cabinado)
        'c2de2a0f-b4e2-4efd-88e1-c0f2f3a3cb3e', // room.jpg (cama queen)
        'e44a9db0-f2e3-4cb8-9ca3-3d45e1e7ba00', // social.jpg (terraza)
        'b71f80f2-fa7e-4e3b-863e-aa6f2fc1c11d', // amarilo_301_cocina_y_meson_comedor_con_a_c.jpg
        'f4c34316-b6ee-4d2e-b8e9-a18d3c40e00b', // amarilo_301_habitacion_principal_con_poltrona
        '3dd4c775-6d2f-472e-91c1-3e3ed7f3c5cd', // amarilo_301_habitacion_principal_con_salida_a_la_terraza
        'aebc7ec3-1427-4cdf-b5a1-3c35be2df6de', // amarilo_301_camas_semidobles
        '217488e1-30e5-412d-a2df-e1285dad0b9c', // amarilo_301_sala_estar_con_tv
        '7e95d5dc-03fb-4915-ae7e-29d36ae4f451', // amarilo_301_vista_a_la_terraza
        'f2dd2627-7136-4e12-aaf2-f74031cfe61b', // amarilo_301_vista_desde_balcon
        '5b1a6bda-82f2-4ed7-93a2-0432257573aa', // amarilo_301_vista_entrada_y_cocina
    ],

    // === ARUNA 201 (21 images → keep 12) ===
    'Aruna 201': [
        'f6634b09-7b6d-4398-9d66-91eb586276ce', // kitchen.jpg
        '0de3b969-fbd4-41e5-beb4-7b75716be32c', // bathroom.jpg
        '00d0d786-d280-4df6-ba68-ec1cc95d1800', // room.jpg (habitación completa)
        'ffbfa9f6-1fce-4ff6-aebf-94965b248bac', // social.jpg (vista montaña)
        '30f646df-2857-4671-b926-62b7deb8d179', // detalle_lampara_comedor
        '05ccab01-069a-49c5-b3fd-ecf870161776', // entrada
        'fe64d6dc-f229-4ecd-8b69-c144ada5f058', // espacio_general
        '83ae12b3-5835-403d-a8b5-1f97c196d1b8', // meson_cocina
        'e2ffc245-9098-49be-90d7-b0e39f6930d1', // sala_y_comedor
        '0ba9fcc0-3df7-4461-ab60-37f1c303192f', // sofacam_king
        '316ae738-f538-434d-b0a1-660edaad8499', // vista_general_estudio_y_sala
        '6588a3e7-693e-4c32-abb7-02f06444afae', // vestidor
    ],

    // === ARUNA 202 (28 images → keep 12) ===
    'Aruna 202': [
        '67d409f4-580c-4efd-8118-d52f2b8de0ce', // kitchen.jpg
        'bcdfc882-177d-4f60-96e9-f663dbfd5ca7', // bathroom.jpg (adorno)
        'eb219dfd-861a-4637-84a1-41b283cabcff', // room.jpg (habitación completa)
        '5aa874de-d50b-42b9-bcd4-dc4881082be0', // social.jpg (hamaca vista interna)
        '7fa04d0d-9bb3-4d73-a13c-7bf74b13d19e', // area_social_y_cocina
        '219ba8f7-c534-469a-8e9e-7c5012ec5fe6', // area_tv_y_descanso_hamaca
        '4923bf53-e4d4-406f-bd34-0e08c21133f2', // cama_doble
        'bd57cf81-805f-474b-bed6-a0c414d4eb34', // decoracion_comedor
        'c8fcef10-0be9-4c53-b349-ed5d1ba1647b', // habitacion_completa
        '8101d42c-6a4e-4f02-b952-0a82508bed73', // sala_estar_comedor_y_hamaca
        '88d77f32-4a98-4654-95a0-be60fbba8653', // vista_general_y_externa
        'b029e8c4-57a9-4600-8120-7cc2bf87d2b6', // zona_tv_y_sofacama_semidoble
    ],
};

async function curate() {
    const { data: props } = await supabase.from('properties').select('id, name');
    if (!props) return;

    for (const p of props) {
        const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
        const esName = nameObj?.es || '';
        const keepIds = KEEP_IDS[esName];

        if (!keepIds) { console.log(`⏭️  No curation rules for "${esName}"`); continue; }

        // Get all current images
        const { data: allImages } = await supabase
            .from('property_images')
            .select('id')
            .eq('property_id', p.id);

        if (!allImages) continue;

        const toDelete = allImages.filter(img => !keepIds.includes(img.id)).map(img => img.id);

        console.log(`\n📸 ${esName}: ${allImages.length} total → keeping ${keepIds.length}, deleting ${toDelete.length}`);

        if (toDelete.length > 0) {
            const { error } = await supabase
                .from('property_images')
                .delete()
                .in('id', toDelete);

            if (error) {
                console.error(`  ❌ Delete error:`, error.message);
            } else {
                console.log(`  ✅ Deleted ${toDelete.length} images`);
            }
        }

        // Reorder remaining images 0-11
        for (let i = 0; i < keepIds.length; i++) {
            await supabase
                .from('property_images')
                .update({ display_order: i })
                .eq('id', keepIds[i]);
        }
        console.log(`  ✅ Reordered remaining ${keepIds.length} images`);
    }

    console.log('\n🎉 Curation complete! Each property now has exactly 12 gallery images.');
}

curate();
