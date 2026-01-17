// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

/**
 * FastPayCheckout - Migrated to Tailwind CSS for Phase 2b
 * Secure payment modal for FastPay IQ integration.
 */
export default function FastPayCheckout({ serviceId, serviceName, planType, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [status, setStatus] = useState('pending'); // pending, approved, expired

    // 1. Initialize Payment
    useEffect(() => {
        const initPayment = async () => {
            try {
                const response = await fetch('/api/payments/fastpay/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ service_id: serviceId, plan_type: planType }),
                });

                const data = await response.json();

                if (data.success) {
                    setQrData(data);
                    setLoading(false);
                } else {
                    setError(data.error || 'Failed to initialize payment');
                    setLoading(false);
                }
            } catch (err) {
                setError('Connection error');
                setLoading(false);
            }
        };

        initPayment();
    }, [serviceId, planType]);

    // 2. Poll for validation
    useEffect(() => {
        if (!qrData?.orderId || status === 'approved') return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/payments/fastpay/validate?orderId=${qrData.orderId}`);
                const data = await response.json();

                if (data.success && data.status === 'approved') {
                    setStatus('approved');
                    clearInterval(interval);
                    setTimeout(() => onSuccess(), 2000);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [qrData, status, onSuccess]);

    if (status === 'approved') {
        return (
            <div className="bg-white rounded-3xl p-8 max-w-[450px] w-full shadow-2xl border border-neutral-100 animate-in fade-in slide-in-from-bottom-5">
                <div className="text-center py-8">
                    <div className="w-16 h-16 text-green-500 mx-auto mb-6 animate-scale-in">
                        <CheckCircle size={64} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h2>
                    <p className="text-neutral-500 mb-6">Your subscription is now active. High-five! 🙌</p>
                    <p className="text-xs text-neutral-400 font-medium animate-pulse">Redirecting to your tool...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 max-w-[450px] w-full shadow-2xl border border-neutral-100 animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center mb-6">
                <img
                    src="/fastpay-logo.png"
                    alt="FastPay"
                    className="h-12 mx-auto mb-4"
                    onError={(e) => e.target.style.display = 'none'}
                />
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Pay with FastPay</h2>
                <p className="text-sm text-neutral-500">Subscribe to <strong className="text-neutral-900">{serviceName}</strong> ({planType})</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 mb-6 min-h-[350px] flex flex-col justify-center items-center border border-neutral-100/50">
                {loading ? (
                    <div className="text-center text-neutral-600">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-sm font-medium">Generating secure payment QR...</p>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <div className="w-12 h-12 text-red-100 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                        <p className="text-red-600 font-medium mb-6">{error}</p>
                        <button
                            onClick={onCancel}
                            className="bg-primary-900 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-primary-800 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="relative w-[200px] h-[200px] mx-auto mb-6 bg-white p-2 rounded-xl shadow-md border border-neutral-100">
                            <img src={qrData.qrUrl} alt="FastPay QR" className="w-full h-full object-contain" />
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                                FASTPAY QR
                            </div>
                        </div>
                        <div className="mb-6">
                            <ol className="list-decimal pl-5 text-sm space-y-2 text-neutral-600 font-medium">
                                <li>Open your <strong className="text-neutral-900">FastPay App</strong></li>
                                <li>Tap on <strong className="text-neutral-900">Scan QR</strong></li>
                                <li>Scan the code above</li>
                                <li>Confirm the payment of <strong className="text-neutral-900">{qrData.amount.toLocaleString()} IQD</strong></li>
                            </ol>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 italic">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-shadow"></div>
                            Waiting for payment confirmation...
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center">
                <button
                    onClick={onCancel}
                    className="text-neutral-400 hover:text-red-500 text-sm font-medium underline transition-colors decoration-dotted underline-offset-4"
                    disabled={loading}
                >
                    Cancel Payment
                </button>
            </div>
        </div>
    );
}
