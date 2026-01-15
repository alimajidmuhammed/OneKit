import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Placeholder values for build time - replace with actual values in .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export async function updateSession(request) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes configuration
    const protectedRoutes = ['/dashboard', '/services', '/admin', '/profile', '/settings'];
    // Note: /reset-password is NOT in authRoutes because authenticated users need to access it
    // (PKCE code exchange creates session before reaching the page)
    const authRoutes = ['/login', '/register', '/forgot-password'];

    const adminRoutes = ['/admin'];

    const pathname = request.nextUrl.pathname;

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users from auth routes (except reset-password)
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone();
        const redirect = url.searchParams.get('redirect') || '/dashboard';
        url.pathname = redirect;
        url.searchParams.delete('redirect');
        return NextResponse.redirect(url);
    }


    // Check admin access with database role verification
    if (isAdminRoute && user) {
        // Fetch user role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Block non-admins from accessing admin routes
        if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }


    return supabaseResponse;
}
