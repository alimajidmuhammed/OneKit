'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth/actions';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

function RegisterForm() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError('');
        setLoading(true);

        const result = await signUp(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.emailConfirmation) {
            setEmail(result.email);
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div className="bg-white rounded-[32px] border border-neutral-100 p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-500" size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-center text-neutral-900 mb-2">Check your email</h1>
                <p className="text-neutral-500 text-center mb-8 leading-relaxed">
                    We've sent a confirmation link to <strong className="text-neutral-900">{email}</strong>.
                    Please click the link to verify your account.
                </p>
                <Link
                    href="/login"
                    className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-base font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    Return to login
                </Link>
            </div>
        );
    }

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

            <h1 className="text-2xl font-extrabold text-center text-neutral-900 mb-2">Create an account</h1>
            <p className="text-neutral-500 text-center mb-8">Get started with OneKit today</p>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                </div>
            )}

            <form action={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="text-sm font-semibold text-neutral-900 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="w-full pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400"
                            style={{ paddingLeft: '3rem' }}
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                        />
                    </div>
                </div>

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

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-semibold text-neutral-900 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400 text-sm"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-900 ml-1">Confirm</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="w-full pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400 text-sm"
                                style={{ paddingLeft: '3rem' }}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-base font-bold rounded-xl shadow-lg shadow-primary-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-900/30 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin" size={20} /> Creating account...</>
                    ) : (
                        'Create account'
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                <p className="text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-600 font-bold hover:underline decoration-primary-200 underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 relative bg-neutral-50 overflow-hidden">
            {/* Background Decorative Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(91,110,242,0.12),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(249,115,22,0.08),transparent)]" />
            </div>

            <div className="w-full max-w-[500px] relative z-10">
                <RegisterForm />
            </div>
        </div>
    );
}
