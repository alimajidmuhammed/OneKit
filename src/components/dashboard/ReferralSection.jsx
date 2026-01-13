'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useReferral } from '@/lib/hooks/useReferral';

export default function ReferralSection() {
    const { user } = useAuth();
    const { referralCode, referralStats, loading } = useReferral(user?.id);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;

    const shareOnWhatsApp = () => {
        const message = `Join OneKit using my referral code and get started! ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareOnTwitter = () => {
        const message = `Check out OneKit - professional business tools for everyone! Use my code: ${referralCode}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    if (loading) {
        return <div>Loading referral info...</div>;
    }

    return (
        <div style={{
            padding: '24px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)'
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
                🎁 Referral Program
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Invite friends and get <strong>1 month free</strong> for every successful referral!
            </p>

            {/* Referral Code */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Your Referral Code
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={referralCode || ''}
                        readOnly
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: '2px solid var(--primary-500)',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: '700',
                            textAlign: 'center',
                            background: 'var(--bg-secondary)',
                            color: 'var(--primary-600)'
                        }}
                    />
                    <button
                        onClick={copyToClipboard}
                        style={{
                            padding: '12px 24px',
                            background: copied ? 'var(--success-500)' : 'var(--primary-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                </div>
            </div>

            {/* Share Buttons */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Share via
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={shareOnWhatsApp}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#25D366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        💬 WhatsApp
                    </button>
                    <button
                        onClick={shareOnTwitter}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#1DA1F2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        🐦 Twitter
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-600)' }}>
                        {referralStats.totalReferrals}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Total Referrals
                    </div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-600)' }}>
                        {referralStats.pendingRewards}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Pending Rewards
                    </div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>
                        {referralStats.claimedRewards}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Claimed Rewards
                    </div>
                </div>
            </div>
        </div>
    );
}
