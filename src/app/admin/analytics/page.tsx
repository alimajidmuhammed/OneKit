// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import styles from '../page.module.css';

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
    const [dateRange, setDateRange] = useState('7d'); // '24h', '7d', '30d', 'all'
    const supabase = getSupabaseClient();

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Calculate date range
            const now = new Date();
            let startDate = null;

            if (dateRange === '24h') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            } else if (dateRange === '7d') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateRange === '30d') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }

            // Fetch all visits
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

            // Calculate today's visits
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayVisits = visits?.filter(v => new Date(v.created_at) >= todayStart).length || 0;

            // Calculate weekly visits
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const weeklyVisits = visits?.filter(v => new Date(v.created_at) >= weekStart).length || 0;

            // Group by service
            const serviceGroups = {};
            visits?.forEach(v => {
                const service = v.service_type || 'unknown';
                if (!serviceGroups[service]) {
                    serviceGroups[service] = { service, count: 0 };
                }
                serviceGroups[service].count++;
            });
            const byService = Object.values(serviceGroups).sort((a, b) => b.count - a.count);

            // Group by country
            const countryGroups = {};
            visits?.forEach(v => {
                const country = v.country || 'Unknown';
                if (!countryGroups[country]) {
                    countryGroups[country] = { country, count: 0 };
                }
                countryGroups[country].count++;
            });
            const byCountry = Object.values(countryGroups).sort((a, b) => b.count - a.count).slice(0, 10);

            // Recent visits (last 20)
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
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>📊 Analytics</h1>
                    <p className={styles.subtitle}>Track visitor activity across all services</p>
                </div>
                <div className={styles.headerActions}>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#eff6ff' }}>
                                👁️
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{analytics.totalVisits.toLocaleString()}</span>
                                <span className={styles.statLabel}>Total Visits</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>
                                📅
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{analytics.todayVisits.toLocaleString()}</span>
                                <span className={styles.statLabel}>Today</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                                📈
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{analytics.weeklyVisits.toLocaleString()}</span>
                                <span className={styles.statLabel}>This Week</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
                                🌍
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{analytics.byCountry.length}</span>
                                <span className={styles.statLabel}>Countries</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        {/* By Service */}
                        <div className={styles.card}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                                📊 Visits by Service
                            </h3>
                            {analytics.byService.length === 0 ? (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No data available</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {analytics.byService.map((item) => (
                                        <div key={item.service}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{getServiceName(item.service)}</span>
                                                <span style={{ fontSize: '14px', color: '#64748b' }}>{item.count.toLocaleString()}</span>
                                            </div>
                                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${(item.count / maxServiceCount) * 100}%`,
                                                    background: SERVICE_COLORS[item.service] || '#94a3b8',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* By Country */}
                        <div className={styles.card}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                                🌍 Top Countries
                            </h3>
                            {analytics.byCountry.length === 0 ? (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No location data available</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {analytics.byCountry.map((item, index) => (
                                        <div
                                            key={item.country}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                background: index % 2 === 0 ? '#f8fafc' : 'white',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#64748b'
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.country}</span>
                                            </div>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: '#eff6ff',
                                                color: '#3b82f6',
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                fontWeight: '600'
                                            }}>
                                                {item.count.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Visits Table */}
                    <div className={styles.card}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                            🕐 Recent Visits
                        </h3>
                        {analytics.recentVisits.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No visits recorded yet</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Service</th>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Page</th>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Country</th>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>City</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.recentVisits.map((visit, index) => (
                                            <tr key={visit.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 8px', fontSize: '14px' }}>{formatDate(visit.created_at)}</td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        background: SERVICE_COLORS[visit.service_type] || '#94a3b8',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {getServiceName(visit.service_type)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>{visit.page_slug || '-'}</td>
                                                <td style={{ padding: '12px 8px', fontSize: '14px' }}>{visit.country || 'Unknown'}</td>
                                                <td style={{ padding: '12px 8px', fontSize: '14px', color: '#64748b' }}>{visit.city || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Setup Instructions */}
                    {analytics.totalVisits === 0 && (
                        <div className={styles.card} style={{ background: '#fffbeb', border: '1px solid #fbbf24' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
                                ⚠️ No Analytics Data Yet
                            </h3>
                            <p style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.6' }}>
                                Analytics tracking requires a <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>page_visits</code> table in your Supabase database.
                                Create this table with columns: <code>id</code>, <code>service_type</code>, <code>page_slug</code>, <code>country</code>, <code>city</code>, <code>created_at</code>.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
