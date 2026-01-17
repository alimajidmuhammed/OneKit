// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Eye, Calendar, TrendingUp, Globe, RefreshCw, Loader2 } from 'lucide-react';

// Service colors for charts
const SERVICE_COLORS = {
    'cv-maker': '#3b82f6',
    'menu-maker': '#8b5cf6',
    'qr-generator': '#10b981',
    'invoice-maker': '#f59e0b',
    'card-maker': '#ec4899',
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalVisits: 0,
        todayVisits: 0,
        weeklyVisits: 0,
        byService: [],
        byCountry: [],
        recentVisits: [],
    });
    const [dateRange, setDateRange] = useState('7d');
    const supabase = getSupabaseClient();

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = null;

            if (dateRange === '24h') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (dateRange === '7d') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateRange === '30d') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            let query = supabase
                .from('page_visits')
                .select('*')
                .order('created_at', { ascending: false });

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }

            const { data: visits, error } = await query;

            if (error) {
                console.error('Analytics fetch error:', error);
                setLoading(false);
                return;
            }

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayVisits = visits?.filter(v => new Date(v.created_at) >= todayStart).length || 0;

            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weeklyVisits = visits?.filter(v => new Date(v.created_at) >= weekStart).length || 0;

            const serviceGroups = {};
            visits?.forEach(v => {
                const service = v.service_type || 'unknown';
                if (!serviceGroups[service]) {
                    serviceGroups[service] = { service, count: 0 };
                }
                serviceGroups[service].count++;
            });
            const byService = Object.values(serviceGroups).sort((a, b) => b.count - a.count);

            const countryGroups = {};
            visits?.forEach(v => {
                const country = v.country || 'Unknown';
                if (!countryGroups[country]) {
                    countryGroups[country] = { country, count: 0 };
                }
                countryGroups[country].count++;
            });
            const byCountry = Object.values(countryGroups).sort((a, b) => b.count - a.count).slice(0, 10);

            const recentVisits = visits?.slice(0, 20) || [];

            setAnalytics({
                totalVisits: visits?.length || 0,
                todayVisits,
                weeklyVisits,
                byService,
                byCountry,
                recentVisits,
            });
        } catch (err) {
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getServiceName = (slug) => {
        const names = {
            'cv-maker': 'CV Maker',
            'menu-maker': 'Menu Maker',
            'qr-generator': 'QR Generator',
            'invoice-maker': 'Invoice Maker',
            'card-maker': 'Card Maker',
            'menu': 'Menu Page',
            'qr': 'QR Page',
        };
        return names[slug] || slug;
    };

    const maxServiceCount = Math.max(...analytics.byService.map(s => s.count), 1);

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">📊 Analytics</h1>
                    <p className="text-neutral-400">Track visitor activity across all services</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm font-medium cursor-pointer focus:outline-none focus:border-primary-500"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
                    <p className="text-neutral-400">Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <Eye size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{analytics.totalVisits.toLocaleString()}</span>
                                <span className="text-sm text-neutral-500">Total Visits</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                                <Calendar size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{analytics.todayVisits.toLocaleString()}</span>
                                <span className="text-sm text-neutral-500">Today</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                <TrendingUp size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{analytics.weeklyVisits.toLocaleString()}</span>
                                <span className="text-sm text-neutral-500">This Week</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                <Globe size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">{analytics.byCountry.length}</span>
                                <span className="text-sm text-neutral-500">Countries</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* By Service */}
                        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <h3 className="text-base font-semibold text-white mb-5">📊 Visits by Service</h3>
                            {analytics.byService.length === 0 ? (
                                <p className="text-neutral-500 text-center py-10">No data available</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {analytics.byService.map((item) => (
                                        <div key={item.service}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-white">{getServiceName(item.service)}</span>
                                                <span className="text-sm text-neutral-500">{item.count.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-neutral-800 rounded overflow-hidden">
                                                <div
                                                    className="h-full rounded transition-all duration-300"
                                                    style={{
                                                        width: `${(item.count / maxServiceCount) * 100}%`,
                                                        background: SERVICE_COLORS[item.service] || '#94a3b8'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* By Country */}
                        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <h3 className="text-base font-semibold text-white mb-5">🌍 Top Countries</h3>
                            {analytics.byCountry.length === 0 ? (
                                <p className="text-neutral-500 text-center py-10">No location data available</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {analytics.byCountry.map((item, index) => (
                                        <div
                                            key={item.country}
                                            className={`flex justify-between items-center p-3 rounded-lg ${index % 2 === 0 ? 'bg-neutral-800/50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-400">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-white">{item.country}</span>
                                            </div>
                                            <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-semibold">
                                                {item.count.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Visits Table */}
                    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                        <h3 className="text-base font-semibold text-white mb-5">🕐 Recent Visits</h3>
                        {analytics.recentVisits.length === 0 ? (
                            <p className="text-neutral-500 text-center py-10">No visits recorded yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-neutral-800">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Service</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Page</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Country</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">City</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {analytics.recentVisits.map((visit) => (
                                            <tr key={visit.id} className="hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-4 py-3 text-sm text-neutral-300">{formatDate(visit.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                                                        style={{ background: SERVICE_COLORS[visit.service_type] || '#94a3b8' }}
                                                    >
                                                        {getServiceName(visit.service_type)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-500">{visit.page_slug || '-'}</td>
                                                <td className="px-4 py-3 text-sm text-neutral-300">{visit.country || 'Unknown'}</td>
                                                <td className="px-4 py-3 text-sm text-neutral-500">{visit.city || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Setup Instructions */}
                    {analytics.totalVisits === 0 && (
                        <div className="mt-6 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <h3 className="text-base font-semibold text-amber-400 mb-3">⚠️ No Analytics Data Yet</h3>
                            <p className="text-amber-300 text-sm leading-relaxed">
                                Analytics tracking requires a <code className="px-1.5 py-0.5 bg-amber-500/20 rounded">page_visits</code> table in your Supabase database.
                                Create this table with columns: <code>id</code>, <code>service_type</code>, <code>page_slug</code>, <code>country</code>, <code>city</code>, <code>created_at</code>.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
