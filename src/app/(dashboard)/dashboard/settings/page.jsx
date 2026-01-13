'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import ReferralSection from '@/components/dashboard/ReferralSection';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { user, profile, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { error } = await updateProfile(formData);
            if (error) {
                setError(error.message || 'Failed to update profile');
            } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Settings</h1>
                <p>Manage your account settings and profile</p>
            </div>

            <div className={styles.content}>
                {/* Profile Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Profile Information</h2>
                        <p>Update your personal information</p>
                    </div>

                    {success && (
                        <div className={styles.successMessage}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Profile updated successfully!
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorMessage}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} />
                                ) : (
                                    <span>{profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div className={styles.avatarInfo}>
                                <span className={styles.avatarName}>{profile?.full_name || 'Your Name'}</span>
                                <span className={styles.avatarEmail}>{user?.email}</span>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="full_name">Full Name</label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={user?.email || ''}
                                    disabled
                                    className={styles.disabledInput}
                                />
                                <span className={styles.formHelper}>Email cannot be changed</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+964 XXX XXX XXXX"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Account Type</label>
                                <input
                                    type="text"
                                    value={profile?.role?.replace('_', ' ') || 'User'}
                                    disabled
                                    className={`${styles.disabledInput} ${styles.capitalize}`}
                                />
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Security Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Security</h2>
                        <p>Manage your password and security settings</p>
                    </div>

                    <div className={styles.securityOptions}>
                        <div className={styles.securityItem}>
                            <div className={styles.securityInfo}>
                                <h3>Password</h3>
                                <p>Change your password to keep your account secure</p>
                            </div>
                            <button className={styles.securityBtn}>Change Password</button>
                        </div>

                        <div className={styles.securityItem}>
                            <div className={styles.securityInfo}>
                                <h3>Two-Factor Authentication</h3>
                                <p>Add an extra layer of security to your account</p>
                            </div>
                            <span className={styles.comingSoon}>Coming Soon</span>
                        </div>
                    </div>
                </section>

                {/* Referral Program */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>🎁 Referral Program</h2>
                        <p>Invite friends and earn rewards</p>
                    </div>
                    <ReferralSection />
                </section>

                {/* Danger Zone */}
                <section className={`${styles.section} ${styles.dangerSection}`}>
                    <div className={styles.sectionHeader}>
                        <h2>Danger Zone</h2>
                        <p>Irreversible and destructive actions</p>
                    </div>

                    <div className={styles.dangerOptions}>
                        <div className={styles.dangerItem}>
                            <div className={styles.dangerInfo}>
                                <h3>Delete Account</h3>
                                <p>Permanently delete your account and all associated data</p>
                            </div>
                            <button className={styles.dangerBtn}>Delete Account</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
