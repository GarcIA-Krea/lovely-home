import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
    const isLoginPath = request.nextUrl.pathname === '/admin/login';
    const isApiLoginPath = request.nextUrl.pathname.startsWith('/api/admin/');

    // Protect all /admin routes except /admin/login and /api/admin/*
    if (isAdminPath && !isLoginPath && !isApiLoginPath) {
        const token = request.cookies.get('admin_token');
        
        if (!token || token.value !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }
    
    // Redirect /admin to /admin/dashboard if logged in
    if (request.nextUrl.pathname === '/admin') {
        const token = request.cookies.get('admin_token');
        if (token && token.value === 'true') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
