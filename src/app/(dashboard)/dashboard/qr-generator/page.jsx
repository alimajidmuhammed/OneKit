'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQRCode } from '@/lib/hooks/useQRCode';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { formatDate, getWhatsAppLink } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import styles from './qr-generator.module.css';

const QR_TEMPLATES = [
    // Modern & Gradient
    { id: 'modern', name: 'Modern', preview: '🔳', colors: ['#5B6EF2', '#7C3AED'] },
    { id: 'gradient', name: 'Gradient', preview: '🌈', colors: ['#EC4899', '#8B5CF6'] },
    { id: 'ocean', name: 'Ocean', preview: '🌊', colors: ['#0EA5E9', '#06B6D4'] },
    { id: 'forest', name: 'Forest', preview: '🌲', colors: ['#22C55E', '#10B981'] },
    // Vibrant
    { id: 'neon', name: 'Neon', preview: '💡', colors: ['#00FF88', '#00D4FF'] },
    { id: 'sunset', name: 'Sunset', preview: '🌅', colors: ['#F97316', '#EF4444'] },
    { id: 'candy', name: 'Candy', preview: '🍬', colors: ['#F472B6', '#FB7185'] },
    { id: 'aurora', name: 'Aurora', preview: '🌌', colors: ['#A855F7', '#2DD4BF'] },
    // Professional
    { id: 'corporate', name: 'Corporate', preview: '🏢', colors: ['#1E40AF', '#075985'] },
    { id: 'elegant', name: 'Elegant', preview: '💎', colors: ['#6366F1', '#4F46E5'] },
    { id: 'business', name: 'Business', preview: '👔', colors: ['#334155', '#1E293B'] },
    // Minimal
    { id: 'minimal', name: 'Minimal', preview: '⬜', colors: ['#000000', '#FFFFFF'] },
    { id: 'light', name: 'Light', preview: '☁️', colors: ['#64748B', '#94A3B8'] },
    { id: 'dark', name: 'Dark', preview: '🌙', colors: ['#1F2937', '#111827'] },
    // Fun & Creative
    { id: 'fire', name: 'Fire', preview: '🔥', colors: ['#DC2626', '#F97316'] },
    { id: 'gold', name: 'Gold', preview: '✨', colors: ['#F59E0B', '#D97706'] },
];

const SOCIAL_PLATFORMS = [
    // Social Media
    { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'instagram.com/username' },
    { id: 'facebook', name: 'Facebook', icon: '👤', placeholder: 'facebook.com/username' },
    { id: 'twitter', name: 'X / Twitter', icon: '🐦', placeholder: 'x.com/username' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'tiktok.com/@username' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', placeholder: 'youtube.com/@channel' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'linkedin.com/in/username' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻', placeholder: 'snapchat.com/add/username' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌', placeholder: 'pinterest.com/username' },
    { id: 'threads', name: 'Threads', icon: '🧵', placeholder: 'threads.net/@username' },
    // Messaging
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', placeholder: '+964XXXXXXXXXX' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 't.me/username' },
    { id: 'viber', name: 'Viber', icon: '📱', placeholder: '+964XXXXXXXXXX' },
    // Contact & Business
    { id: 'email', name: 'Email', icon: '📧', placeholder: 'your@email.com' },
    { id: 'phone', name: 'Phone', icon: '📞', placeholder: '+964XXXXXXXXXX' },
    { id: 'website', name: 'Website', icon: '🌐', placeholder: 'yourwebsite.com' },
    { id: 'maps', name: 'Google Maps', icon: '📍', placeholder: 'maps.google.com/...' },
    // Apps
    { id: 'appstore', name: 'App Store', icon: '🍎', placeholder: 'apps.apple.com/app/...' },
    { id: 'playstore', name: 'Play Store', icon: '🤖', placeholder: 'play.google.com/store/apps/...' },
];

export default function QRGeneratorPage() {
    const { qrCodes, loading, createQRCode, deleteQRCode, saving } = useQRCode();
    const {
        hasAccess,
        getAccessStatus,
        trialDaysRemaining,
        trialHoursRemaining,
        loading: subLoading
    } = useSubscription();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [deleteId, setDeleteId] = useState(null);

    const accessStatus = getAccessStatus('qr-generator');
    const canAccess = hasAccess('qr-generator');
    const isTrialActive = accessStatus?.type === 'trial';
    const isTrialExpired = accessStatus?.type === 'expired';

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createQRCode(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/qr-generator/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteQRCode(deleteId);
        setDeleteId(null);
    };

    const canCreate = canAccess;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>QR Code Generator</h1>
                    <p>Create beautiful QR codes with your social links</p>
                </div>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Create New QR
                    </button>
                )}
            </div>

            {/* Trial Banner */}
            {isTrialActive && (
                <div className={styles.trialBanner}>
                    <div className={styles.trialIcon}>⏱️</div>
                    <div className={styles.trialInfo}>
                        <strong>Free Trial Active</strong>
                        <p>
                            {trialDaysRemaining > 0
                                ? `${trialDaysRemaining} day${trialDaysRemaining > 1 ? 's' : ''} remaining`
                                : `${trialHoursRemaining} hour${trialHoursRemaining > 1 ? 's' : ''} remaining`
                            }
                        </p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to QR Generator')}
                        target="_blank"
                        className={styles.subscribeBtn}
                    >
                        Subscribe Now
                    </a>
                </div>
            )}

            {isTrialExpired && (
                <div className={styles.expiredBanner}>
                    <div className={styles.expiredIcon}>⚠️</div>
                    <div className={styles.expiredInfo}>
                        <strong>Trial Expired</strong>
                        <p>Subscribe to continue creating and editing QR codes</p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to QR Generator')}
                        target="_blank"
                        className={styles.subscribeBtn}
                    >
                        Subscribe via WhatsApp
                    </a>
                </div>
            )}

            {/* QR Codes Grid */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your QR codes...</span>
                </div>
            ) : qrCodes.length > 0 ? (
                <div className={styles.qrGrid}>
                    {qrCodes.map((qr) => (
                        <div key={qr.id} className={styles.qrCard}>
                            <div className={styles.qrPreview}>
                                <div className={styles.qrCodePlaceholder} style={{
                                    background: `linear-gradient(135deg, ${QR_TEMPLATES.find(t => t.id === qr.template_id)?.colors[0] || '#5B6EF2'}, ${QR_TEMPLATES.find(t => t.id === qr.template_id)?.colors[1] || '#7C3AED'})`
                                }}>
                                    <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
                                        <rect x="3" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="3" y="14" width="7" height="7" rx="1" />
                                        <rect x="14" y="14" width="3" height="3" />
                                        <rect x="18" y="18" width="3" height="3" />
                                        <rect x="14" y="18" width="3" height="3" />
                                        <rect x="18" y="14" width="3" height="3" />
                                    </svg>
                                </div>
                            </div>
                            <div className={styles.qrInfo}>
                                <h3>{qr.name}</h3>
                                <span className={styles.qrMeta}>
                                    {QR_TEMPLATES.find(t => t.id === qr.template_id)?.name || 'Modern'} •
                                    Created {formatDate(qr.created_at)}
                                </span>
                                <span className={styles.viewCount}>{qr.view_count || 0} scans</span>
                            </div>
                            <div className={styles.qrActions}>
                                {canAccess && (
                                    <Link href={`/dashboard/qr-generator/${qr.id}`} className={styles.editBtn}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Edit
                                    </Link>
                                )}
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleteId(qr.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                            <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <h3>No QR codes yet</h3>
                    <p>Create your first QR code with social links</p>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        Create Your First QR Code
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New QR Code</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>QR Code Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., My Business Card"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Choose Theme</label>
                                <div className={styles.templatesGrid}>
                                    {QR_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.templateSelected : ''}`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <div className={styles.templatePreview} style={{
                                                background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                                            }}>
                                                {template.preview}
                                            </div>
                                            <span className={styles.templateName}>{template.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                            >
                                {saving ? 'Creating...' : 'Create QR Code'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Delete QR Code</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this QR code? This action cannot be undone.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button className={styles.dangerBtn} onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
