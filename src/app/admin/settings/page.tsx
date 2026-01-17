// @ts-nocheck
'use client';

import { useState } from 'react';
import { APP_CONFIG } from '@/lib/utils/constants';
import styles from './settings.module.css';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: APP_CONFIG.name,
        tagline: APP_CONFIG.tagline,
        whatsappNumber: APP_CONFIG.whatsapp.number,
        defaultMessage: APP_CONFIG.whatsapp.defaultMessage,
        monthlyPrice: APP_CONFIG.pricing.monthly,
        yearlyPrice: APP_CONFIG.pricing.yearly,
        currency: APP_CONFIG.pricing.currency,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
        setLoading(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Settings</h1>
                <p>Configure your platform settings</p>
            </div>

            <div className={styles.content}>
                {success && (
                    <div className={styles.successMessage}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Settings saved successfully!
                    </div>
                )}

                {/* General Settings */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>General</h2>
                        <p>Basic platform information</p>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tagline</label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* WhatsApp Settings */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>WhatsApp Integration</h2>
                        <p>Configure WhatsApp for payment communication</p>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>WhatsApp Number</label>
                            <input
                                type="text"
                                value={settings.whatsappNumber}
                                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                placeholder="+964XXXXXXXXXX"
                            />
                            <span className={styles.formHelper}>Include country code (e.g., +964)</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Default Message</label>
                            <textarea
                                value={settings.defaultMessage}
                                onChange={(e) => setSettings({ ...settings, defaultMessage: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Settings */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Pricing</h2>
                        <p>Default pricing for services</p>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            >
                                <option value="IQD">IQD - Iraqi Dinar</option>
                                <option value="USD">USD - US Dollar</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Monthly Price (Default)</label>
                            <input
                                type="number"
                                value={settings.monthlyPrice}
                                onChange={(e) => setSettings({ ...settings, monthlyPrice: Number(e.target.value) })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Yearly Price (Default)</label>
                            <input
                                type="number"
                                value={settings.yearlyPrice}
                                onChange={(e) => setSettings({ ...settings, yearlyPrice: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </section>

                {/* Database Info */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Database</h2>
                        <p>Supabase connection information</p>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Project URL</span>
                            <code className={styles.infoValue}>{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}</code>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Status</span>
                            <span className={`${styles.statusBadge} ${styles.statusConnected}`}>
                                <span className={styles.statusDot}></span>
                                Connected
                            </span>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
