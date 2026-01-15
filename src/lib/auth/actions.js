'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Sign in with email and password
 */
export async function signIn(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const redirectTo = formData.get('redirect') || '/dashboard';

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, redirect: redirectTo };
}

/**
 * Sign up with email and password
 */
export async function signUp(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName') || '';

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // If email confirmation is required
    if (data.user && !data.session) {
        return { success: true, emailConfirmation: true, email };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

/**
 * Sign out
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(formData) {
    const email = formData.get('email');

    if (!email) {
        return { error: 'Email is required' };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, email };
}

/**
 * Update password (for reset password flow)
 */
export async function updatePassword(formData) {
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!password) {
        return { error: 'Password is required' };
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    const supabase = await createClient();

    // Check if user has a valid session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Session expired. Please request a new reset link.' };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return { error: error.message };
    }

    // Sign out after password reset
    await supabase.auth.signOut();

    return { success: true };
}

/**
 * Get current user (for server components)
 */
export async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get current session (for server components)
 */
export async function getSession() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
