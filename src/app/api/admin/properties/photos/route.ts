import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const propertyId = formData.get('propertyId') as string;
        const file = formData.get('file') as File;
        
        if (!propertyId || !file) {
            return NextResponse.json({ error: 'Property ID and File are required' }, { status: 400 });
        }
        
        // 1. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-photos')
            .upload(fileName, file, { contentType: file.type });
            
        if (uploadError) throw uploadError;
        
        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('property-photos')
            .getPublicUrl(fileName);
            
        // 3. Insert into property_images table
        const { data: imgData, error: dbError } = await supabase
            .from('property_images')
            .insert([{ property_id: propertyId, image_url: publicUrl }])
            .select();
            
        if (dbError) throw dbError;
        
        return NextResponse.json({ success: true, data: imgData });
    } catch (e: any) {
        console.error('Upload Error:', e);
        return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const url = searchParams.get('url');

        if (!id || !url) throw new Error('ID and URL are required');
        
        // 1. Delete from DB
        const { error: dbError } = await supabase.from('property_images').delete().eq('id', id);
        if (dbError) throw dbError;
        
        // 2. Delete from storage
        const fileName = url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('property-photos').remove([fileName]);
        }
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
