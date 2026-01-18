'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth/actions';
import { LayoutGrid, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    async function handleSubmit(formData: FormData) {
        setError('');
        setLoading(true);

        const result = await signIn(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.success) {
            router.push(result.redirect || '/dashboard');
        }
    }

    return (
        <div className="bg-white rounded-[32px] border border-neutral-100 p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Link href="/" className="flex items-center justify-center gap-2.5 no-underline mb-10 group">
                <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-all duration-500">
                    <img src="/onekit-logo.png" alt="OneKit" className="h-5 w-5 invert" />
                </div>
                <span className="text-2xl font-black text-neutral-900 tracking-tighter">OneKit</span>
            </Link>

            <h1 className="text-2xl font-extrabold text-center text-neutral-900 mb-2">Welcome back</h1>
            <p className="text-neutral-500 text-center mb-8">Sign in to your account to continue</p>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="flex flex-col gap-5">
                <input type="hidden" name="redirect" value={redirect} />

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-semibold text-neutral-900 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center ml-1">
                        <label htmlFor="password" className="text-sm font-semibold text-neutral-900">Password</label>
                        <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline decoration-primary-200 underline-offset-4 font-medium">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-primary-500 text-white text-base font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary-500/30 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin" size={20} /> Signing in...</>
                    ) : (
                        'Sign in to Account'
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                <p className="text-sm text-neutral-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary-600 font-bold hover:underline decoration-primary-200 underline-offset-4">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 relative bg-neutral-50 overflow-hidden">
            {/* Background Decorative Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(91,110,242,0.12),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(249,115,22,0.08),transparent)]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <Suspense fallback={
                    <div className="bg-white rounded-[32px] border border-neutral-100 p-10 shadow-2xl flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary-600 my-10" size={40} />
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
