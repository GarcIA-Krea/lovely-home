import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const isAdmin = cookieStore.get('admin_token')?.value === 'true';

        if (!isAdmin) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase keys not configured for admin API');
            return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch the current dynamic password
        const { data: setting, error } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key_name', 'admin_password')
            .single();

        let correctPassword = process.env.ADMIN_PASSWORD; // Fallback

        if (setting && setting.value) {
            correctPassword = setting.value;
        }

        if (currentPassword !== correctPassword) {
            return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 });
        }

        // Update the password in Supabase
        const { error: updateError } = await supabase
            .from('admin_settings')
            .upsert({ 
                key_name: 'admin_password', 
                value: newPassword,
                updated_at: new Date().toISOString()
            });

        if (updateError) {
            console.error('Error updating password:', updateError.message);
            return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: 'Error del servidor: ' + e.message }, { status: 500 });
    }
}
