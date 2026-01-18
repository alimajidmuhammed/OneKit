// @ts-nocheck
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import ReferralSection from '@/components/dashboard/ReferralSection';
import { User, Mail, Phone, Shield, Lock, Trash2, Gift, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';


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

    const handleReset = () => {
        setFormData({
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
        });
        setError('');
        setSuccess(false);
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

            // Account deleted successfully - redirect immediately
            // Don't wait for signOut since user is already deleted from auth
            try {
                const { getSupabaseClient } = await import('@/lib/supabase/client');
                const supabase = getSupabaseClient();
                await supabase.auth.signOut();
            } catch (signOutError) {
                // Ignore signOut errors - user is already deleted
                console.log('SignOut after delete:', signOutError);
            }

            // Redirect to home page
            alert('Your account has been deleted successfully.');
            window.location.href = '/';
        } catch (error) {
            // Only show error if it's not a network error after deletion
            if (error.message && !error.message.includes('fetch')) {
                alert('Failed to delete account: ' + error.message);
            } else {
                // If we got here with a fetch error, account might still be deleted
                // Try to redirect anyway
                window.location.href = '/';
            }
        } finally {
            setDeleteLoading(false);
        }
    };



    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
                <p className="text-neutral-500">Manage your account settings and profile</p>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                        <h2 className="text-xl font-bold text-neutral-900">Profile Information</h2>
                        <p className="text-sm text-neutral-500">Update your personal information</p>
                    </div>

                    <div className="p-8">
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Profile updated successfully!
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-brand-gradient flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-xl overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-xl font-bold text-neutral-900">{profile?.full_name || 'Your Name'}</span>
                                    <span className="block text-neutral-500">{user?.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="full_name" className="block text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 ml-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-5 py-3.5 bg-neutral-100 border border-neutral-100 rounded-2xl text-neutral-400 cursor-not-allowed"
                                    />
                                    <span className="block text-xs text-neutral-400 ml-1">Email cannot be changed</span>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+964 XXX XXX XXXX"
                                        className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-neutral-700 ml-1">Account Type</label>
                                    <input
                                        type="text"
                                        value={profile?.role?.replace('_', ' ') || 'User'}
                                        disabled
                                        className="w-full px-5 py-3.5 bg-neutral-100 border border-neutral-100 rounded-2xl text-neutral-400 capitalize cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-8 py-3.5 rounded-2xl font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-all"
                                    disabled={loading}
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-900 hover:bg-primary-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                        <h2 className="text-xl font-bold text-neutral-900">Security</h2>
                        <p className="text-sm text-neutral-500">Manage your password and security settings</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-neutral-50 rounded-2xl gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-neutral-900">Password</h3>
                                <p className="text-sm text-neutral-500">Change your password to keep your account secure</p>
                            </div>
                            <button
                                className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold hover:bg-neutral-50 transition-colors shadow-sm"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                Change Password
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-neutral-50 rounded-2xl gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-neutral-900">Two-Factor Authentication</h3>
                                <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
                            </div>
                            <span className="px-4 py-1.5 bg-neutral-200 text-neutral-500 text-xs font-bold rounded-full uppercase tracking-widest">Coming Soon</span>
                        </div>
                    </div>
                </section>

                {/* Referral Program */}
                <section className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                        <h2 className="text-xl font-bold text-neutral-900">🎁 Referral Program</h2>
                        <p className="text-sm text-neutral-500">Invite friends and earn rewards</p>
                    </div>
                    <div className="p-8">
                        <ReferralSection />
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50/30 border border-red-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-red-100 bg-red-50/50">
                        <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
                        <p className="text-sm text-red-700/70">Irreversible and destructive actions</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-red-100 rounded-2xl gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-red-900">Delete Account</h3>
                                <p className="text-sm text-red-700/70">Permanently delete your account and all associated data</p>
                            </div>
                            <button
                                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-3xl w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-neutral-100">
                        <h2 className="text-2xl font-black text-neutral-900 mb-2">Change Password</h2>
                        <p className="text-neutral-500 mb-6 font-medium">
                            Enter your new password below
                        </p>

                        {passwordError && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-xl mb-4 text-sm font-medium border border-red-100 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-xl mb-4 text-sm font-medium border border-green-100 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                Password changed successfully!
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}
                                    className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 py-3 bg-primary-900 text-white rounded-xl font-bold hover:bg-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin" /> Changing...
                                        </span>
                                    ) : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-3xl w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-red-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                        <h2 className="text-2xl font-black text-red-600 mb-2 flex items-center gap-2">
                            <AlertTriangle className="fill-red-100" /> Delete Account
                        </h2>
                        <p className="text-neutral-500 mb-6 font-medium leading-relaxed">
                            This action <strong className="text-red-600">CANNOT</strong> be undone. All your data will be permanently deleted.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                                Type <code className="bg-neutral-100 px-2 py-0.5 rounded text-red-600 font-mono text-xs border border-neutral-200">DELETE</code> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE"
                                className="w-full px-4 py-3 bg-white border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-red-600 placeholder:text-red-200"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmation !== 'DELETE'}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={18} className="animate-spin" /> Deleting...
                                    </span>
                                ) : 'Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
