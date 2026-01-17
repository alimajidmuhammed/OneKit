'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/lib/auth/actions';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2, Loader2, Lock, ArrowRight } from 'lucide-react';

const PAGE_VERSION = 'v3.0.1';

function ResetPasswordForm() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Exchange code on mount
    useEffect(() => {
        const init = async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get('code');
            const errorParam = url.searchParams.get('error');

            if (code || errorParam) {
                window.history.replaceState({}, '', '/reset-password');
            }

            if (errorParam) {
                const desc = url.searchParams.get('error_description');
                setError(decodeURIComponent(desc || 'Reset link expired.'));
                return;
            }

            if (code) {
                try {
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        setError('Reset link expired. Please request a new one.');
                        return;
                    }
                    setSessionReady(true);
                } catch (e) {
                    setError('Failed to process reset link.');
                }
            } else {
                // Check for existing session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setSessionReady(true);
                } else {
                    setError('Please use the reset link from your email.');
                }
            }
        };

        init();
    }, [supabase.auth]);

    async function handleSubmit(formData: FormData) {
        setError('');
        setLoading(true);

        const result = await updatePassword(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.success) {
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-[32px] border border-neutral-100 p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
                <Link href="/" className="flex items-center justify-center gap-3 no-underline mb-8 group">
                    <div className="w-10 h-10 text-primary-600 transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                            <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">OneKit</span>
                </Link>
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-neutral-900">Success!</h2>
                    <p className="text-neutral-500">
                        Password reset successfully! Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
            <Link href="/" className="flex items-center justify-center gap-3 no-underline mb-10 group">
                <div className="w-12 h-12 text-primary-600 transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>
                <span className="text-3xl font-black bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent tracking-tight">OneKit</span>
            </Link>

            <h1 className="text-3xl font-black text-center text-neutral-900 mb-2 leading-tight">Reset Password</h1>
            <p className="text-neutral-500 text-center mb-10 font-medium">Create a strong new password for your account</p>

            {error && (
                <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-[20px] text-red-700 text-sm mb-8 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={22} className="shrink-0" />
                    <span className="font-semibold">{error}</span>
                </div>
            )}

            <form action={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2.5">
                    <label htmlFor="password" className="text-sm font-bold text-neutral-900 ml-1">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary-500" size={18} />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full pl-12 pr-4 py-4 text-neutral-900 bg-neutral-50 border-2 border-transparent rounded-2xl transition-all focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-300 font-medium"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2.5">
                    <label htmlFor="confirmPassword" className="text-sm font-bold text-neutral-900 ml-1">Confirm New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary-500" size={18} />
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="w-full pl-12 pr-4 py-4 text-neutral-900 bg-neutral-50 border-2 border-transparent rounded-2xl transition-all focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-300 font-medium"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center gap-3 w-full py-5 mt-4 bg-primary-600 text-white text-lg font-black rounded-2xl shadow-xl shadow-primary-600/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-600/30 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading || !sessionReady}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin" size={24} /> Resetting...</>
                    ) : (
                        <>Reset Password <ArrowRight size={20} /></>
                    )}
                </button>
            </form>

            <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col gap-4 text-center">
                <p className="text-sm text-neutral-500 font-medium">
                    Remembered your password?{' '}
                    <Link href="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                        Sign in
                    </Link>
                </p>
                <p className="text-[10px] text-neutral-300 font-bold tracking-widest uppercase">
                    Version {PAGE_VERSION}
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative bg-[#F8FAFC] overflow-hidden">
            {/* Artistic Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[15%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[180px]" />
            </div>

            <div className="w-full max-w-[520px] relative z-10">
                <Suspense fallback={
                    <div className="bg-white rounded-[40px] border border-neutral-100 p-16 shadow-2xl flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary-600" size={48} />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
