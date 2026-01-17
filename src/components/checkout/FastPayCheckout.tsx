'use client';

import { useState, useEffect } from 'react';
import styles from './FastPayCheckout.module.css';

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
            <div className={styles.container}>
                <div className={styles.successState}>
                    <div className={styles.successIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h2>Payment Successful!</h2>
                    <p>Your subscription is now active. High-five! 🙌</p>
                    <p className={styles.redirecting}>Redirecting to your tool...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img src="/fastpay-logo.png" alt="FastPay" className={styles.logo} onError={(e) => e.target.style.display = 'none'} />
                <h2>Pay with FastPay</h2>
                <p>Subscribe to <strong>{serviceName}</strong> ({planType})</p>
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Generating secure payment QR...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <p>❌ {error}</p>
                        <button onClick={onCancel} className={styles.backBtn}>Go Back</button>
                    </div>
                ) : (
                    <div className={styles.qrContainer}>
                        <div className={styles.qrWrapper}>
                            <img src={qrData.qrUrl} alt="FastPay QR" className={styles.qrImage} />
                            <div className={styles.qrOverlay}>
                                <span>FastPay QR</span>
                            </div>
                        </div>
                        <div className={styles.instructions}>
                            <ol>
                                <li>Open your <strong>FastPay App</strong></li>
                                <li>Tap on <strong>Scan QR</strong></li>
                                <li>Scan the code above</li>
                                <li>Confirm the payment of <strong>{qrData.amount.toLocaleString()} IQD</strong></li>
                            </ol>
                        </div>
                        <div className={styles.pollingHint}>
                            <div className={styles.pulse} />
                            Waiting for payment confirmation...
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button onClick={onCancel} className={styles.cancelBtn} disabled={loading}>
                    Cancel Payment
                </button>
            </div>
        </div>
    );
}
