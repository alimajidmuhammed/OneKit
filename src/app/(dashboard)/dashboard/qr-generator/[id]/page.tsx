'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQRCode } from '@/lib/hooks/useQRCode';
import { useTrial } from '@/lib/hooks/useTrial';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { APP_CONFIG } from '@/lib/utils/constants';
import {
    ChevronLeft, Check, Loader2, X, Download, QrCode, User,
    Link2, Palette, Plus, ChevronUp, ChevronDown, Trash2,
    Upload as UploadIcon, Sparkles, RotateCcw, ExternalLink,
    ArrowLeft, Globe, MapPin, Phone, Mail, Instagram,
    Facebook, Twitter, Linkedin, Youtube, Music2,
    MessageSquare, Eye, Layout, Type, MousePointer2,
    Image as ImageIcon, MoreVertical, GripVertical, CheckCircle2
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

// Protocol Icons Catalog
const PRESET_ICONS = {
    instagram: { name: 'Instagram', color: '#E4405F', icon: <Instagram size={18} /> },
    facebook: { name: 'Facebook', color: '#1877F2', icon: <Facebook size={18} /> },
    whatsapp: { name: 'WhatsApp', color: '#25D366', icon: <MessageSquare size={18} /> },
    telegram: { name: 'Telegram', color: '#26A5E4', icon: <MessageSquare size={18} /> },
    youtube: { name: 'YouTube', color: '#FF0000', icon: <Youtube size={18} /> },
    tiktok: { name: 'TikTok', color: '#000000', icon: <Music2 size={18} /> },
    twitter: { name: 'X', color: '#000000', icon: <Twitter size={18} /> },
    linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: <Linkedin size={18} /> },
    email: { name: 'Email', color: '#EA4335', icon: <Mail size={18} /> },
    phone: { name: 'Phone', color: '#34B7F1', icon: <Phone size={18} /> },
    website: { name: 'Website', color: '#5B6EF2', icon: <Globe size={18} /> },
    location: { name: 'Location', color: '#EA4335', icon: <MapPin size={18} /> },
    github: { name: 'GitHub', color: '#181717', icon: <Globe size={18} /> },
    pinterest: { name: 'Pinterest', color: '#BD081C', icon: <X size={18} /> },
    spotify: { name: 'Spotify', color: '#1DB954', icon: <Music2 size={18} /> },
    custom: { name: 'Custom', color: '#6B7280', icon: <ImageIcon size={18} /> },
};

// Curated Design Matrix
const THEMES = [
    { id: 'aurora', name: 'Aurora', colors: ['#6366f1', '#a855f7'], textColor: '#ffffff', description: 'Northern light gradient' },
    { id: 'sunset', name: 'Sunset', colors: ['#f43f5e', '#fb923c'], textColor: '#ffffff', description: 'Warm evening glow' },
    { id: 'ocean', name: 'Ocean', colors: ['#0ea5e9', '#2dd4bf'], textColor: '#ffffff', description: 'Deep sea depth' },
    { id: 'midnight', name: 'Midnight', colors: ['#0f172a', '#1e293b'], textColor: '#ffffff', description: 'Premium nocturnal' },
    { id: 'glass', name: 'Frost', colors: ['#ffffff', '#f8fafc'], textColor: '#0f172a', description: 'Glassmorphism 2.0' },
    { id: 'cyber', name: 'Neon', colors: ['#000000', '#0a0a0a'], textColor: '#22c55e', description: 'Digital hacker' },
];

const BUTTON_STYLES = [
    { id: 'filled', name: 'Massive', icon: <Layout size={14} />, description: 'Solid background' },
    { id: 'glass', name: 'Ethereal', icon: <Sparkles size={14} />, description: 'Translucent blur' },
    { id: 'outline', name: 'Linear', icon: <Type size={14} />, description: 'Border focus' },
    { id: 'gradient', name: 'Iridescent', icon: <Palette size={14} />, description: 'Dynamic flow' },
];

const SECTIONS = [
    { id: 'identity', label: 'Identity', icon: <User size={18} /> },
    { id: 'protocol', label: 'Protocol', icon: <Link2 size={18} /> },
    { id: 'visuals', label: 'Visuals', icon: <Palette size={18} /> },
];

export default function QREditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { fetchQRCode, updateQRCode, saving } = useQRCode();
    const { isTrialActive, isTrialExpired } = useTrial('qr-generator');
    const { uploadImage, uploading: uploadingLogo } = useImageUpload();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    const lastSavedStateRef = useRef<string | null>(null);

    const [qr, setQR] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('identity');
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [isLogoStudioOpen, setIsLogoStudioOpen] = useState(false);
    const [logoSettings, setLogoSettings] = useState({ zoom: 1, x: 0, y: 0, rotation: 0 });
    const [previewScale, setPreviewScale] = useState(1);
    const [downloading, setDownloading] = useState(false);
    const [editingLinkIcon, setEditingLinkIcon] = useState(null);

    useEffect(() => {
        isMounted.current = true;
        const loadQR = async () => {
            const data = await fetchQRCode(id);
            if (data) {
                if (!data.links) data.links = [];
                if (!data.bio) data.bio = '';
                if (!data.display_name) data.display_name = data.name;
                if (!data.button_style) data.button_style = 'filled';
                if (data.theme?.logo_settings) {
                    setLogoSettings(data.theme.logo_settings);
                }
                setQR(data);
                if (data.theme?.logo_settings) {
                    setLogoSettings(data.theme.logo_settings);
                }
            } else {
                router.push('/dashboard/qr-generator');
            }
            setLoading(false);
        };
        loadQR();

        return () => {
            isMounted.current = false;
        };
    }, [id, fetchQRCode, router]);

    const handleSave = useCallback(async () => {
        if (!qr || saveStatus === 'saving') return;

        const stateToSave = {
            name: qr.name,
            display_name: qr.display_name,
            bio: qr.bio,
            logo_url: qr.logo_url,
            template_id: qr.template_id,
            links: qr.links,
            button_style: qr.button_style,
            theme: {
                ...(qr.theme || {}),
                logo_settings: logoSettings
            },
        };

        const stateToSaveStr = JSON.stringify(stateToSave);
        if (stateToSaveStr === lastSavedStateRef.current) return;

        setSaveStatus('saving');

        try {
            const { error } = await updateQRCode(id, stateToSave);

            if (!isMounted.current) return;

            if (error) {
                console.error('Save error:', error);
                setSaveStatus('idle');
                return;
            }

            lastSavedStateRef.current = stateToSaveStr;
            setHasChanges(false);
            setSaveStatus('saved');
            const statusTimer = setTimeout(() => {
                if (isMounted.current) setSaveStatus('idle');
            }, 3000);

            return () => clearTimeout(statusTimer);
        } catch (error) {
            if (!isMounted.current) return;
            console.error('Save error:', error);
            setSaveStatus('idle');
        }
    }, [id, qr, logoSettings, saveStatus, updateQRCode]);

    // Auto-save effect
    useEffect(() => {
        if (!hasChanges || !qr) return;
        const timer = setTimeout(() => handleSave(), 2000);
        return () => clearTimeout(timer);
    }, [hasChanges, qr, handleSave]);

    const updateField = (field, value) => {
        setQR(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updateTheme = (themeId) => {
        const theme = THEMES.find(t => t.id === themeId);
        setQR(prev => ({
            ...prev,
            template_id: themeId,
            theme: {
                ...(prev.theme || {}),
                primaryColor: theme?.colors?.[0] || '#6366f1',
                secondaryColor: theme?.colors?.[1] || '#a855f7',
                textColor: theme?.textColor || '#ffffff',
            }
        }));
        setHasChanges(true);
    };

    const updateTextColor = (color) => {
        setQR(prev => ({
            ...prev,
            theme: { ...(prev.theme || {}), textColor: color }
        }));
        setHasChanges(true);
    };

    const handleLogoSettingChange = (field, value) => {
        setLogoSettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    // Protocol Management
    const addLink = () => {
        setQR(prev => ({
            ...prev,
            links: [...(prev.links || []), {
                id: Date.now(),
                title: '',
                url: '',
                icon: 'website',
                customIcon: null,
            }]
        }));
        setHasChanges(true);
    };

    const updateLink = (index, field, value) => {
        setQR(prev => {
            const links = [...(prev.links || [])];
            links[index] = { ...links[index], [field]: value };
            return { ...prev, links };
        });
        setHasChanges(true);
    };

    const removeLink = (index) => {
        setQR(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
        setHasChanges(true);
    };

    const moveLink = (index, direction) => {
        setQR(prev => {
            const links = [...(prev.links || [])];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= links.length) return prev;
            [links[index], links[newIndex]] = [links[newIndex], links[index]];
            return { ...prev, links };
        });
        setHasChanges(true);
    };

    // Terminal Intelligence: Logo Upload
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediate Visual Feedback
        const reader = new FileReader();
        reader.onload = (event) => {
            updateField('logo_url', event.target.result);
        };
        reader.readAsDataURL(file);

        const publicUrl = await uploadImage(file, { folder: 'qr-logos', type: 'logo' });
        if (publicUrl) updateField('logo_url', publicUrl);
    };

    const handleCustomIconUpload = async (e, linkIndex) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            updateLink(linkIndex, 'customIcon', event.target.result);
            updateLink(linkIndex, 'icon', 'custom');
            setEditingLinkIcon(null);
        };
        reader.readAsDataURL(file);

        const publicUrl = await uploadImage(file, { folder: 'qr-logos', type: 'logo' });
        if (publicUrl) updateLink(linkIndex, 'customIcon', publicUrl);
    };

    const getQRCodeUrl = () => {
        const pageUrl = `${APP_CONFIG.url}/qr/${qr?.slug}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pageUrl)}`;
    };

    const downloadQRCodeAsPNG = async () => {
        if (!qr) return;
        setDownloading(true);
        try {
            const response = await fetch(getQRCodeUrl());
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${qr.slug}-protocol.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download QR code:', error);
        } finally {
            setDownloading(false);
        }
    };

    const themeStyles = qr ? {
        background: THEMES.find(t => t.id === qr.template_id)?.id === 'glass' ? '#ffffff' : `linear-gradient(135deg, ${qr.theme?.primaryColor || '#6366f1'}, ${qr.theme?.secondaryColor || '#a855f7'})`,
        color: qr.theme?.textColor || '#ffffff',
    } : {};

    if (loading || !qr) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={24} className="text-primary-600 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-neutral-900 mb-2">Syncing Your Digital Protocol</h2>
                <p className="text-neutral-500 font-medium">Preparing your OneKit 3.0 workspace...</p>
            </div>
        );
    }

    const canEdit = isTrialActive || !isTrialExpired;
    const logoStyle = {
        transform: `scale(${logoSettings.zoom}) translate(${logoSettings.x}%, ${logoSettings.y}%) rotate(${logoSettings.rotation}deg)`,
        transition: 'transform 0.1s ease-out'
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900 overflow-hidden">
            {/* OneKit 3.0: Workspace Header */}
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-neutral-200/50 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] flex-shrink-0">
                <div className="flex items-center gap-3 lg:gap-6">
                    <button
                        onClick={() => router.push('/dashboard/qr-generator')}
                        className="group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 bg-white border border-neutral-200 rounded-2xl text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h1 className="text-sm lg:text-base font-black text-neutral-900 uppercase tracking-tight truncate max-w-[150px] lg:max-w-none">
                                {qr.name}
                            </h1>
                        </div>
                        <p className="hidden lg:block text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Protocol Node v3.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                    {saveStatus !== 'idle' && (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${saveStatus === 'saving' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                            {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Syncing...' : 'Encrypted'}</span>
                        </div>
                    )}

                    <button
                        onClick={downloadQRCodeAsPNG}
                        disabled={downloading}
                        className="group relative flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-black text-xs shadow-2xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                        <div className="relative flex items-center gap-3">
                            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            <span className="hidden sm:inline">EXPORT PROTOCOL</span>
                        </div>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* OneKit 3.0: Sidebar Navigation */}
                <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-neutral-200/50 p-6 overflow-y-auto scrollbar-hide">
                    <div className="mb-10">
                        <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">Discovery Engine</h2>
                        <nav className="space-y-2">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${activeSection === section.id ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/20' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                                >
                                    <div className={`transition-transform duration-500 ${activeSection === section.id ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
                                        {section.icon}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{section.label}</span>
                                    {activeSection === section.id && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_#6366f1]" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto">
                        <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
                            <h3 className="text-xs font-black text-neutral-900 mb-2 relative">Pro Protocol</h3>
                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 relative">Unlock custom IR codes and unlimited dynamic routing.</p>
                            <button className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-neutral-300 transition-all active:scale-95">Upgrade</button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 lg:p-10 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-10 pb-20">
                        {/* Mobile Navigation */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === section.id ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white text-neutral-500 border border-neutral-200'}`}
                                >
                                    {section.icon}
                                    {section.label}
                                </button>
                            ))}
                        </div>

                        {/* Identity Tab */}
                        {activeSection === 'identity' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900 leading-tight">Identity Matrix</h2>
                                        <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">Define your digital presence</p>
                                    </div>
                                    {qr.logo_url && (
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-full text-sm font-semibold hover:bg-primary-100 transition-colors"
                                            onClick={() => setIsLogoStudioOpen(!isLogoStudioOpen)}
                                        >
                                            <Sparkles size={14} /> Logo Studio
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>

                                {/* Logo Studio Control Panel */}
                                {isLogoStudioOpen && qr.logo_url && (
                                    <div className="mt-6 bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400">
                                                    <Sparkles size={16} />
                                                </div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Logo Studio</h4>
                                            </div>
                                            <button onClick={() => setIsLogoStudioOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                                    <span>Magnification</span>
                                                    <span className="text-primary-400">{Math.round(logoSettings.zoom * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0.5" max="3" step="0.01"
                                                    value={logoSettings.zoom}
                                                    onChange={(e) => handleLogoSettingChange('zoom', parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-primary-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Latitude (X)</label>
                                                    <input
                                                        type="range" min="-100" max="100"
                                                        value={logoSettings.x}
                                                        onChange={(e) => handleLogoSettingChange('x', parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-primary-500"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Longitude (Y)</label>
                                                    <input
                                                        type="range" min="-100" max="100"
                                                        value={logoSettings.y}
                                                        onChange={(e) => handleLogoSettingChange('y', parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-primary-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setLogoSettings({ zoom: 1, x: 0, y: 0, rotation: 0 })}
                                                className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Reset Architecture
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Identity Fields */}
                                <div className="space-y-6 mt-10">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 ml-1 block">Display Designation</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                            value={qr.display_name || ''}
                                            onChange={(e) => updateField('display_name', e.target.value)}
                                            placeholder="Identity Name"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 ml-1 block">Narrative Directive (Bio)</label>
                                        <textarea
                                            className="w-full px-5 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all min-h-[120px] resize-none"
                                            value={qr.bio || ''}
                                            onChange={(e) => updateField('bio', e.target.value.slice(0, 150))}
                                            placeholder="Provide a brief context (Max 150 characters)"
                                        />
                                        <div className="flex justify-end mt-2 px-2">
                                            <span className="text-[10px] font-black text-neutral-300 uppercase">{(qr.bio || '').length} / 150 Channels</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Protocol Management (Links) */}
                        {activeSection === 'protocol' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-xl font-black text-neutral-900 leading-tight">Protocol Discovery</h2>
                                        <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">Map your digital routing nodes</p>
                                    </div>
                                    <button
                                        onClick={addLink}
                                        className="group flex items-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all font-black text-xs shadow-xl shadow-primary-500/20 active:scale-95"
                                    >
                                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                        ADD NODE
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(!qr.links || qr.links.length === 0) ? (
                                        <div className="bg-white rounded-[32px] p-20 border-2 border-dashed border-neutral-200 flex flex-col items-center text-center">
                                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-6">
                                                <Link2 size={40} />
                                            </div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-2">No active protocols</h3>
                                            <p className="text-sm text-neutral-400 mb-8 max-w-xs">Initialize your first digital node to start building your profile.</p>
                                            <button onClick={addLink} className="px-8 py-3 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Deploy Node</button>
                                        </div>
                                    ) : (
                                        qr.links.map((link, index) => (
                                            <div key={link.id} className="group bg-white rounded-[32px] p-6 border border-neutral-200/50 shadow-premium-layered hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-100 group-hover:bg-primary-500 transition-colors duration-500" />

                                                <div className="flex flex-col lg:flex-row gap-6">
                                                    {/* Control Cluster */}
                                                    <div className="flex items-center lg:flex-col gap-2">
                                                        <div className="p-2 text-neutral-300 cursor-grab active:cursor-grabbing">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="flex lg:flex-col gap-1">
                                                            <button onClick={() => moveLink(index, -1)} disabled={index === 0} className="p-2 bg-neutral-50 text-neutral-400 rounded-lg hover:bg-primary-50 hover:text-primary-600 disabled:opacity-20 transition-all">
                                                                <ChevronUp size={16} />
                                                            </button>
                                                            <button onClick={() => moveLink(index, 1)} disabled={index === qr.links.length - 1} className="p-2 bg-neutral-50 text-neutral-400 rounded-lg hover:bg-primary-50 hover:text-primary-600 disabled:opacity-20 transition-all">
                                                                <ChevronDown size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Node Identity */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setEditingLinkIcon(editingLinkIcon === index ? null : index)}
                                                            className="w-20 h-20 rounded-[24px] flex items-center justify-center text-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl relative overflow-hidden group/icon"
                                                            style={{ background: PRESET_ICONS[link.icon]?.color || '#6B7280' }}
                                                        >
                                                            <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/10 transition-colors" />
                                                            {link.customIcon ? (
                                                                <img src={link.customIcon} alt="icon" className="w-10 h-10 rounded-xl object-cover" />
                                                            ) : (
                                                                <div className="scale-125">{PRESET_ICONS[link.icon]?.icon || PRESET_ICONS.website.icon}</div>
                                                            )}
                                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                                                                <Plus size={10} />
                                                            </div>
                                                        </button>

                                                        {/* Protocol Portal (Icon Picker) */}
                                                        {editingLinkIcon === index && (
                                                            <div className="absolute top-24 left-0 w-[320px] bg-white rounded-[32px] p-6 border border-neutral-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-300">
                                                                <div className="grid grid-cols-5 gap-3 mb-6">
                                                                    {Object.entries(PRESET_ICONS).map(([key, icon]) => (
                                                                        <button
                                                                            key={key}
                                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shadow-md group/btn"
                                                                            style={{ background: icon.color }}
                                                                            onClick={() => {
                                                                                updateLink(index, 'icon', key);
                                                                                updateLink(index, 'customIcon', null);
                                                                                setEditingLinkIcon(null);
                                                                            }}
                                                                        >
                                                                            {icon.icon}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <label className="flex items-center justify-center gap-3 py-4 bg-neutral-50 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-100 transition-all border border-dashed border-neutral-200">
                                                                    <UploadIcon size={16} /> CUSTOM ICON
                                                                    <input type="file" accept="image/*" onChange={(e) => handleCustomIconUpload(e, index)} className="hidden" />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Node Parameters */}
                                                    <div className="flex-1 space-y-4">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            <input
                                                                type="text"
                                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                                                value={link.title}
                                                                onChange={(e) => updateLink(index, 'title', e.target.value)}
                                                                placeholder="Node Title"
                                                            />
                                                            <input
                                                                type="text"
                                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                                                value={link.url}
                                                                onChange={(e) => updateLink(index, 'url', e.target.value)}
                                                                placeholder="Routing Address (URL)"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => removeLink(index)}
                                                        className="lg:ml-auto p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all self-start"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Visual Matrix (Design) */}
                        {activeSection === 'visuals' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-neutral-200 shadow-premium-layered">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100">
                                            <Palette size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-neutral-900 leading-tight">Visual Matrix</h2>
                                            <p className="text-sm text-neutral-400 font-medium">Calibrate high-fidelity aesthetics</p>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 block">Spectrum Profiles (Themes)</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {THEMES.map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => updateTheme(theme.id)}
                                                        className={`group relative flex flex-col items-start p-5 rounded-[32px] border-2 transition-all duration-500 ${qr.template_id === theme.id ? 'border-neutral-900 ring-4 ring-neutral-900/5' : 'border-neutral-100 hover:border-neutral-200'}`}
                                                    >
                                                        <div
                                                            className="w-full h-24 rounded-2xl mb-4 transition-transform duration-700 group-hover:scale-[1.02]"
                                                            style={{ background: theme.id === 'glass' ? '#ffffff' : `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`, border: theme.id === 'glass' ? '1px solid #e5e7eb' : 'none' }}
                                                        />
                                                        <span className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-1">{theme.name}</span>
                                                        <span className="text-[10px] text-neutral-400 font-medium leading-none">{theme.description}</span>
                                                        {qr.template_id === theme.id && <CheckCircle2 size={20} className="absolute top-4 right-4 text-white drop-shadow-lg" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 block">Interaction Archetypes (Buttons)</label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {BUTTON_STYLES.map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => updateField('button_style', style.id)}
                                                        className={`p-6 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center gap-3 ${qr.button_style === style.id ? 'border-neutral-900 bg-neutral-900 text-white shadow-xl shadow-neutral-900/20' : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'}`}
                                                    >
                                                        <div className={`transition-transform duration-500 ${qr.button_style === style.id ? 'scale-110' : ''}`}>
                                                            {style.icon}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{style.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 block">Chromatic Precision (Text)</label>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 flex items-center gap-4 bg-white border border-neutral-200 rounded-[24px] p-4 group focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
                                                    <input
                                                        type="color"
                                                        value={qr.theme?.textColor || '#ffffff'}
                                                        onChange={(e) => updateTextColor(e.target.value)}
                                                        className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={qr.theme?.textColor || '#ffffff'}
                                                        onChange={(e) => updateTextColor(e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-sm font-black text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Perspective Preview Container */}
                <div className="hidden lg:flex flex-col w-[480px] bg-neutral-50 border-l border-neutral-200/50 p-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                                <Eye size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">High-Fidelity Preview</span>
                        </div>
                        <a href={`/qr/${qr.slug}`} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors">
                            LIVE PROTOCOL <ExternalLink size={14} />
                        </a>
                    </div>

                    <div className="flex-1 flex items-center justify-center perspective-[2000px] relative">
                        {/* Interactive Scale Controller */}
                        <div className="absolute top-0 right-0 flex flex-col gap-2 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white z-50">
                            <button onClick={() => setPreviewScale(p => Math.min(1.2, p + 0.1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronUp size={16} /></button>
                            <span className="text-[10px] font-black text-center text-neutral-500 py-1">{Math.round(previewScale * 100)}%</span>
                            <button onClick={() => setPreviewScale(p => Math.max(0.5, p - 0.1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronDown size={16} /></button>
                        </div>

                        <div
                            className="w-[320px] bg-neutral-900 rounded-[50px] p-5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:rotate-y-12"
                            style={{ transform: `scale(${previewScale}) rotateY(15deg) rotateX(5deg)` }}
                        >
                            <div className="w-24 h-1.5 bg-neutral-800 rounded-full mx-auto mb-5" />
                            <div
                                className="rounded-[35px] overflow-hidden h-[600px] relative shadow-inner"
                                style={themeStyles}
                            >
                                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                                <div className="h-full px-6 py-12 flex flex-col items-center overflow-y-auto scrollbar-hide">
                                    {/* Logo Matrix */}
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden group/p">
                                            {qr.logo_url ? (
                                                <img src={qr.logo_url} alt="" className="w-full h-full object-cover" style={logoStyle} />
                                            ) : (
                                                <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-black text-white italic">
                                                    {(qr.display_name || 'Q').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black mb-2 text-center drop-shadow-md" style={{ color: qr.theme?.textColor }}>{qr.display_name || 'Protocol Node'}</h2>
                                    {qr.bio && <p className="text-xs text-center leading-relaxed mb-10 opacity-80 font-medium" style={{ color: qr.theme?.textColor }}>{qr.bio}</p>}

                                    <div className="w-full space-y-3">
                                        {qr.links?.map((link, i) => {
                                            const btnStyle: Record<string, string> = {
                                                filled: 'bg-white/10 backdrop-blur-md border border-white/20',
                                                glass: 'bg-white/5 backdrop-blur-xl border border-white/10 saturate-150',
                                                outline: 'bg-transparent border-2 border-white/30',
                                                gradient: 'bg-gradient-to-r from-white/20 to-transparent border border-white/20'
                                            };
                                            return (
                                                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] ${btnStyle[qr.button_style || 'filled']}`}>
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: PRESET_ICONS[link.icon]?.color || '#6B7280' }}>
                                                        {link.customIcon ? <img src={link.customIcon} alt="" className="w-6 h-6 rounded-lg object-cover" /> : <div className="text-white scale-110">{PRESET_ICONS[link.icon]?.icon}</div>}
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-widest truncate" style={{ color: qr.theme?.textColor }}>{link.title || 'Untitled Node'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Protocol Control Block */}
                    <div className="mt-8 p-6 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered flex items-center gap-6 group">
                        <div className="w-24 h-24 bg-white p-2 rounded-2xl border border-neutral-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <img src={getQRCodeUrl()} alt="QR" className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Protocol Routing</p>
                            <button
                                onClick={downloadQRCodeAsPNG}
                                disabled={downloading}
                                className="flex items-center gap-3 px-5 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-neutral-900/10 active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={16} />}
                                Download QR
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
}
