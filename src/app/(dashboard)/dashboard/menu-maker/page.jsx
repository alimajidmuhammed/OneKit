'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMenu } from '@/lib/hooks/useMenu';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { formatDate, getWhatsAppLink } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import styles from './menu-maker.module.css';

const MENU_TEMPLATES = [
    // Classic styles
    { id: 'classic', name: 'Classic', preview: '📋', description: 'Traditional menu layout' },
    { id: 'elegant', name: 'Elegant', preview: '🍽️', description: 'Fancy restaurant style' },
    { id: 'vintage', name: 'Vintage', preview: '📜', description: 'Retro classic look' },
    // Modern styles
    { id: 'modern', name: 'Modern', preview: '✨', description: 'Clean and minimal' },
    { id: 'minimalist', name: 'Minimalist', preview: '⬜', description: 'Ultra clean design' },
    { id: 'bold', name: 'Bold', preview: '🔥', description: 'Strong typography' },
    // Cuisine themed
    { id: 'italian', name: 'Italian', preview: '🍝', description: 'Trattoria vibes' },
    { id: 'asian', name: 'Asian', preview: '🍜', description: 'Oriental inspired' },
    { id: 'mexican', name: 'Mexican', preview: '🌮', description: 'Vibrant & colorful' },
    { id: 'sushi', name: 'Sushi', preview: '🍣', description: 'Japanese style' },
    { id: 'indian', name: 'Indian', preview: '🍛', description: 'Spice themed' },
    { id: 'arabic', name: 'Arabic', preview: '🧆', description: 'Middle Eastern' },
    // Casual & Specialty
    { id: 'casual', name: 'Casual', preview: '🍔', description: 'Fun and friendly' },
    { id: 'cafe', name: 'Cafe', preview: '☕', description: 'Coffee shop vibes' },
    { id: 'bakery', name: 'Bakery', preview: '🥐', description: 'Sweet & cozy' },
    { id: 'pizza', name: 'Pizzeria', preview: '🍕', description: 'Pizza parlor style' },
    { id: 'bar', name: 'Bar & Grill', preview: '🍺', description: 'Pub atmosphere' },
    // Dark mode
    { id: 'dark', name: 'Dark Mode', preview: '🌙', description: 'Dark themed menu' },
];

export default function MenuMakerPage() {
    const { menus, loading, createMenu, deleteMenu, saving } = useMenu();
    const {
        hasAccess,
        getAccessStatus,
        isInTrialPeriod,
        trialDaysRemaining,
        trialHoursRemaining,
        loading: subLoading
    } = useSubscription();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [deleteId, setDeleteId] = useState(null);

    const accessStatus = getAccessStatus('menu-maker');
    const canAccess = hasAccess('menu-maker');
    const isTrialActive = accessStatus?.type === 'trial';
    const isTrialExpired = accessStatus?.type === 'expired';

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createMenu(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/menu-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteMenu(deleteId);
        setDeleteId(null);
    };

    const canCreate = canAccess;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Menu Maker</h1>
                    <p>Create beautiful digital menus for your restaurant</p>
                </div>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Create New Menu
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
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to Menu Maker')}
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
                        <p>Subscribe to continue creating and editing menus</p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to Menu Maker')}
                        target="_blank"
                        className={styles.subscribeBtn}
                    >
                        Subscribe via WhatsApp
                    </a>
                </div>
            )}

            {/* Menus Grid */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your menus...</span>
                </div>
            ) : menus.length > 0 ? (
                <div className={styles.menusGrid}>
                    {menus.map((menu) => (
                        <div key={menu.id} className={styles.menuCard}>
                            <div className={styles.menuPreview}>
                                <div className={styles.menuPlaceholder}>
                                    <span>{MENU_TEMPLATES.find(t => t.id === menu.template_id)?.preview || '📋'}</span>
                                    {menu.is_published && (
                                        <div className={styles.publishedBadge}>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" fill="currentColor" />
                                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            Live
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.menuInfo}>
                                <h3>{menu.name}</h3>
                                <span className={styles.menuMeta}>
                                    {MENU_TEMPLATES.find(t => t.id === menu.template_id)?.name || 'Classic'} •
                                    Updated {formatDate(menu.updated_at)}
                                </span>
                                <span className={styles.viewCount}>{menu.view_count || 0} views</span>
                            </div>
                            <div className={styles.menuActions}>
                                {canAccess && (
                                    <Link href={`/dashboard/menu-maker/${menu.id}`} className={styles.editBtn}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Edit
                                    </Link>
                                )}
                                {menu.is_published && (
                                    <Link href={`/menu/${menu.slug}`} target="_blank" className={styles.viewBtn}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </Link>
                                )}
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleteId(menu.id)}
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
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3>No menus yet</h3>
                    <p>Create your first digital menu for your restaurant or cafe</p>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        Create Your First Menu
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Menu</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Restaurant / Business Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Tony's Pizza"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Choose Template</label>
                                <div className={styles.templatesGrid}>
                                    {MENU_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.templateSelected : ''}`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <span className={styles.templatePreview}>{template.preview}</span>
                                            <span className={styles.templateName}>{template.name}</span>
                                            <span className={styles.templateDesc}>{template.description}</span>
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
                                {saving ? 'Creating...' : 'Create Menu'}
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
                            <h2>Delete Menu</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this menu? All categories and items will be permanently deleted.</p>
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
