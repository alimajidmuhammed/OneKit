'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useReferral } from '@/lib/hooks/useReferral';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegramPlane, FaViber, FaTwitter, FaCopy, FaLink } from 'react-icons/fa';

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
                        <FaWhatsapp size={18} /> WhatsApp
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
                        <FaFacebookMessenger size={18} /> Messenger
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
                        <FaTwitter size={18} /> Twitter
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
                        <FaInstagram size={18} /> Instagram
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
                        <FaTelegramPlane size={18} /> Telegram
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
                        <FaViber size={18} /> Viber
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
                    {copied ? <><FaCopy size={16} /> Link Copied!</> : <><FaLink size={16} /> Copy Referral Link</>}
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
