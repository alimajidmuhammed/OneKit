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

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        // Validation
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordLoading(true);

        try {
            const { getSupabaseClient } = await import('@/lib/supabase/client');
            const supabase = getSupabaseClient();

            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setPasswordSuccess(true);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess(false);
            }, 2000);
        } catch (error) {
            setPasswordError(error.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            alert('Please type DELETE to confirm');
            return;
        }

        if (!confirm('This action CANNOT be undone. Are you absolutely sure?')) {
            return;
        }

        setDeleteLoading(true);

        try {
            // Call secure API endpoint for account deletion
            const response = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmation: 'DELETE' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account');
            }

            // Sign out and redirect
            const { getSupabaseClient } = await import('@/lib/supabase/client');
            const supabase = getSupabaseClient();
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (error) {
            alert('Failed to delete account: ' + error.message);
        } finally {
            setDeleteLoading(false);
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
                            <button
                                className={styles.securityBtn}
                                onClick={() => setShowPasswordModal(true)}
                            >
                                Change Password
                            </button>
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
                            <button
                                className={styles.dangerBtn}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-elevated)',
                        padding: '32px',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>Change Password</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Enter your new password below
                        </p>

                        {passwordError && (
                            <div style={{
                                padding: '12px',
                                background: 'var(--error-50)',
                                color: 'var(--error-700)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '14px'
                            }}>
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div style={{
                                padding: '12px',
                                background: 'var(--success-50)',
                                color: 'var(--success-700)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '14px'
                            }}>
                                ✅ Password changed successfully!
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 characters)"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'var(--neutral-200)',
                                        color: 'var(--text-primary)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                                        opacity: passwordLoading ? 0.6 : 1
                                    }}
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-elevated)',
                        padding: '32px',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '450px',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700', color: 'var(--error-600)' }}>
                            ⚠️ Delete Account
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            This action <strong>CANNOT</strong> be undone. All your data will be permanently deleted.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Type <code style={{ background: 'var(--neutral-200)', padding: '2px 8px', borderRadius: '4px' }}>DELETE</code> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid var(--error-500)',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--neutral-200)',
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--error-600)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: (deleteLoading || deleteConfirmation !== 'DELETE') ? 'not-allowed' : 'pointer',
                                    opacity: (deleteLoading || deleteConfirmation !== 'DELETE') ? 0.4 : 1
                                }}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
