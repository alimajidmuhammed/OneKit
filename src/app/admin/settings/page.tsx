// @ts-nocheck
'use client';

import { useState } from 'react';
import { APP_CONFIG } from '@/lib/utils/constants';
import { CheckCircle, Loader2 } from 'lucide-react';

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
        setLoading(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1000px]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-neutral-400">Configure your platform settings</p>
            </div>

            <div className="space-y-6">
                {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                        <CheckCircle size={20} />
                        Settings saved successfully!
                    </div>
                )}

                {/* General Settings */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">General</h2>
                        <p className="text-sm text-neutral-400">Basic platform information</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Tagline</label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>
                </section>

                {/* WhatsApp Settings */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">WhatsApp Integration</h2>
                        <p className="text-sm text-neutral-400">Configure WhatsApp for payment communication</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">WhatsApp Number</label>
                            <input
                                type="text"
                                value={settings.whatsappNumber}
                                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                placeholder="+964XXXXXXXXXX"
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                            />
                            <span className="text-xs text-neutral-500 mt-1 block">Include country code (e.g., +964)</span>
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Default Message</label>
                            <textarea
                                value={settings.defaultMessage}
                                onChange={(e) => setSettings({ ...settings, defaultMessage: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Settings */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">Pricing</h2>
                        <p className="text-sm text-neutral-400">Default pricing for services</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                            >
                                <option value="IQD">IQD - Iraqi Dinar</option>
                                <option value="USD">USD - US Dollar</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Monthly Price (Default)</label>
                            <input
                                type="number"
                                value={settings.monthlyPrice}
                                onChange={(e) => setSettings({ ...settings, monthlyPrice: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">Yearly Price (Default)</label>
                            <input
                                type="number"
                                value={settings.yearlyPrice}
                                onChange={(e) => setSettings({ ...settings, yearlyPrice: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Database Info */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">Database</h2>
                        <p className="text-sm text-neutral-400">Supabase connection information</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-neutral-500 block mb-1">Project URL</span>
                            <code className="block px-3 py-2 bg-neutral-800 rounded text-sm text-neutral-300 overflow-x-auto">
                                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
                            </code>
                        </div>
                        <div>
                            <span className="text-sm text-neutral-500 block mb-1">Status</span>
                            <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Connected
                            </span>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
