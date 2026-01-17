// @ts-nocheck
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useReferral } from '@/lib/hooks/useReferral';
import { Copy, Link, Twitter, Instagram, Send, MessageCircle, Phone } from 'lucide-react';

// Brand icons (not available in lucide-react)
const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const MessengerIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.744 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
    </svg>
);

const TelegramIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const ViberIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.182.635 6.65.573 9.708c-.062 3.058-.136 8.794 5.398 10.457v2.387s-.037.969.6 1.167c.768.238 1.22-.495 1.956-1.287l1.353-1.521c3.72.316 6.58-.407 6.903-.516.744-.252 4.952-.78 5.639-6.371.712-5.77-.341-9.41-2.235-11.035-.001 0-2.769-2.457-8.789-2.603-.001 0-.165-.003-.475.002l.474-.002zM11.5 1.562c5.467.132 7.956 2.25 7.956 2.25 1.59 1.367 2.45 4.588 1.822 9.71-.574 4.672-4.097 5.16-4.724 5.373-.266.089-2.662.69-5.753.488l-2.453 2.825c-.378.436-.763.555-1.031.488-.381-.09-.491-.501-.484-1.106l.044-3.282c-4.611-1.39-4.314-6.026-4.259-8.712.054-2.562.564-4.655 2.008-6.089C6.71 1.544 10.427 1.521 11.5 1.562z" />
    </svg>
);

export default function ReferralSection() {
    const { user } = useAuth();
    const { referralCode, referralStats, loading } = useReferral(user?.id);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (!referralCode) return;

        try {
            if (typeof window !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(referralCode).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }).catch(err => {
                    console.error('Clipboard error:', err);
                    // Fallback: create textarea and copy
                    fallbackCopy(referralCode);
                });
            } else {
                fallbackCopy(referralCode);
            }
        } catch (error) {
            console.error('Copy error:', error);
            fallbackCopy(referralCode);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
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
                    Share Your Referral Link
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <button
                        onClick={shareOnWhatsApp}
                        style={{
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
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <WhatsAppIcon size={18} /> WhatsApp
                    </button>
                    <button
                        onClick={() => {
                            const message = `Join OneKit and get started with professional business tools! Use my referral code: ${referralCode}`;
                            window.open(`https://www.messenger.com/new?text=${encodeURIComponent(message + ' ' + shareUrl)}`, '_blank');
                        }}
                        style={{
                            padding: '12px',
                            background: '#0084FF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MessengerIcon size={18} /> Messenger
                    </button>
                    <button
                        onClick={shareOnTwitter}
                        style={{
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
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Twitter size={18} /> Twitter
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <button
                        onClick={() => {
                            // Instagram doesn't have direct sharing, open profile with link in clipboard
                            navigator.clipboard.writeText(shareUrl);
                            alert('Link copied! Share it in your Instagram bio or DMs 📸');
                        }}
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Instagram size={18} /> Instagram
                    </button>
                    <button
                        onClick={() => {
                            const message = `🎁 Join OneKit with my code: ${referralCode}\n\n${shareUrl}`;
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        style={{
                            padding: '12px',
                            background: '#0088cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <TelegramIcon size={18} /> Telegram
                    </button>
                    <button
                        onClick={() => {
                            const message = `Join OneKit with my code: ${referralCode}`;
                            window.open(`viber://forward?text=${encodeURIComponent(message + ' ' + shareUrl)}`, '_blank');
                        }}
                        style={{
                            padding: '12px',
                            background: '#7360f2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <ViberIcon size={18} /> Viber
                    </button>
                </div>
            </div>

            {/* Copy Link Button */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: copied ? 'var(--success-500)' : 'var(--neutral-800)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    {copied ? <><Copy size={16} /> Link Copied!</> : <><Link size={16} /> Copy Referral Link</>}
                </button>
                <div style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                }}>
                    {shareUrl}
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
