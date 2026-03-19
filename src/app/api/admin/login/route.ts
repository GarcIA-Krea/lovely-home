import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const correctPassword = process.env.ADMIN_PASSWORD;

        if (!correctPassword) {
            console.error('ADMIN_PASSWORD not configured in environment variables');
            return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
        }

        if (password === correctPassword) {
            const cookieStore = await cookies();
            cookieStore.set({
                name: 'admin_token',
                value: 'true',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    } catch (e: any) {
        return NextResponse.json({ error: 'Error del servidor: ' + e.message }, { status: 500 });
    }
}
