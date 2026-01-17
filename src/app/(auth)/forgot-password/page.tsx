'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth/actions';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError('');
        setLoading(true);

        const result = await requestPasswordReset(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.success) {
            setEmail(result.email);
            setSuccess(true);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 relative bg-neutral-50 overflow-hidden">
            {/* Background Decorative Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(91,110,242,0.12),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_100%_100%,rgba(249,115,22,0.08),transparent)]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                {success ? (
                    <div className="bg-white rounded-[32px] border border-neutral-100 p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-center text-neutral-900 mb-2">Check your email</h1>
                        <p className="text-neutral-500 text-center mb-8 leading-relaxed">
                            We've sent a password reset link to <strong className="text-neutral-900">{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link
                            href="/login"
                            className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-base font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            Return to login
                        </Link>
                    </div>
                ) : (
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

                        <h1 className="text-2xl font-extrabold text-center text-neutral-900 mb-2">Forgot password?</h1>
                        <p className="text-neutral-500 text-center mb-8">No worries, we'll send you reset instructions.</p>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6 animate-in fade-in zoom-in duration-300">
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <form action={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="text-sm font-semibold text-neutral-900 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full pl-11 pr-4 py-3 text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-neutral-400"
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-base font-bold rounded-xl shadow-lg shadow-primary-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-900/30 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={20} /> Sending...</>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 mt-8 text-neutral-500 hover:text-primary-600 text-sm font-semibold transition-colors group"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
