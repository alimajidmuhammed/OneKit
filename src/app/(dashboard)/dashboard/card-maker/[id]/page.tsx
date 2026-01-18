'use client';

import { useState, useEffect, useRef, useCallback, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessCard } from '@/lib/hooks/useBusinessCard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import {
    Type, Share2, Layers,
    Check, X, ChevronRight, Download, Save, RefreshCw, Layout,
    Upload, Trash2, Languages, Plus, Info, ChevronLeft, Loader2, Palette, Eye, Settings, QrCode,
    User, Mail, Phone, Globe, MapPin, Linkedin, Instagram, Twitter, Github,
    Briefcase, Building, PenLine, RotateCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { BusinessCardPDF } from '@/components/pdf/BusinessCardPDF';
import { PDFDownloadButton } from '@/components/ui/PDFDownloadButton';

const SECTIONS = [
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'general', label: 'General', icon: '👤' },
    { id: 'visibility', label: 'Visibility', icon: '👁️' },
    { id: 'fonts', label: 'Fonts', icon: 'Type' },
    { id: 'toolkit', label: 'Toolkit', icon: '🛠️' },
    { id: 'qr', label: 'QR Code', icon: '📱' },
    { id: 'social', label: 'Social', icon: '🌐' },
    { id: 'content', label: 'Content', icon: '📝' },
];

const CARD_TEMPLATES = [
    { id: 'modern', name: 'Vanguard', primary: '#111827', accent: '#3b82f6', text: '#ffffff', layout: 'horizontal' },
    { id: 'minimal', name: 'Zenith', primary: '#ffffff', accent: '#1e293b', text: '#111827', layout: 'horizontal' },
    { id: 'creative', name: 'Aether', primary: '#4f46e5', accent: '#f472b6', text: '#ffffff', layout: 'horizontal' },
    { id: 'corporate', name: 'Summit', primary: '#1e3a8a', accent: '#facc15', text: '#ffffff', layout: 'horizontal' },
    { id: 'glass', name: 'Prism', primary: '#ffffff', accent: '#ffffff', text: '#ffffff', layout: 'horizontal', effect: 'glass' },
    { id: 'luxury', name: 'Onyx Elite', primary: '#111111', accent: '#d4af37', text: '#ffffff', layout: 'horizontal' },
    { id: 'tech', name: 'Cyber', primary: '#030712', accent: '#22d3ee', text: '#ffffff', layout: 'horizontal', effect: 'tech' },
    { id: 'royal', name: 'Sultan', primary: '#1a1a1a', accent: '#d4af37', text: '#ffffff', layout: 'horizontal', rtl: true, pattern: 'islamic' },
    { id: 'erbil', name: 'Hawler (Hewlêr)', primary: '#ea580c', accent: '#ffffff', text: '#ffffff', layout: 'horizontal', rtl: true, pattern: 'geometric' },
    { id: 'baghdad', name: 'Assyri', primary: '#0c4a6e', accent: '#facc15', text: '#ffffff', layout: 'horizontal', rtl: true },
    { id: 'kurdistan', name: 'Kurdistan Pride', primary: '#166534', accent: '#fbbf24', text: '#ffffff', layout: 'horizontal', rtl: true },
    { id: 'cairo', name: 'Pharaoh', primary: '#111827', accent: '#10b981', text: '#ffffff', layout: 'horizontal', rtl: true, pattern: 'islamic' },
    { id: 'artistic', name: 'Flux', primary: '#fafafa', accent: '#6366f1', text: '#111827', layout: 'horizontal' },
    { id: 'noir', name: 'Void', primary: '#000000', accent: '#ffffff', text: '#ffffff', layout: 'horizontal' },
    { id: 'vertical', name: 'Apex Vertical', primary: '#111827', accent: '#10b981', text: '#ffffff', layout: 'vertical' },
    // New Templates
    { id: 'horizon', name: 'Horizon', primary: '#f8fafc', accent: '#6366f1', text: '#1e293b', layout: 'horizontal' },
    { id: 'kyoto', name: 'Kyoto', primary: '#ffffff', accent: '#b91c1c', text: '#111827', layout: 'horizontal', pattern: 'geometric' },
    { id: 'sahara', name: 'Sahara', primary: '#78350f', accent: '#fbbf24', text: '#ffffff', layout: 'horizontal', pattern: 'islamic' },
    { id: 'genesis', name: 'Genesis', primary: '#000000', accent: '#ffffff', text: '#ffffff', layout: 'horizontal', effect: 'glass' },
    { id: 'metro', name: 'Metro', primary: '#2563eb', accent: '#ffffff', text: '#ffffff', layout: 'horizontal' },
    { id: 'botanical', name: 'Botanical', primary: '#064e3b', accent: '#34d399', text: '#ffffff', layout: 'horizontal' },
    { id: 'industrial', name: 'Industrial', primary: '#475569', accent: '#f97316', text: '#ffffff', layout: 'horizontal' },
    { id: 'midnight', name: 'Midnight Gold', primary: '#1e1b4b', accent: '#eab308', text: '#ffffff', layout: 'horizontal' },
    { id: 'neon', name: 'Neon City', primary: '#0f172a', accent: '#f43f5e', text: '#ffffff', layout: 'horizontal', effect: 'tech' },
    { id: 'retro', name: 'Retro Wave', primary: '#4c1d95', accent: '#ec4899', text: '#ffffff', layout: 'horizontal', pattern: 'geometric' },
    { id: 'eco', name: 'Eco Harmony', primary: '#14532d', accent: '#dcfce7', text: '#ffffff', layout: 'horizontal' },
    { id: 'infinity', name: 'Infinity', primary: '#020617', accent: '#8b5cf6', text: '#ffffff', layout: 'horizontal', effect: 'glass' },
    { id: 'gilded', name: 'Gilded Royal', primary: '#450a0a', accent: '#d4af37', text: '#ffffff', layout: 'horizontal', pattern: 'islamic' },
    { id: 'marble', name: 'Marble Modern', primary: '#f1f5f9', accent: '#334155', text: '#111827', layout: 'horizontal' },
];

const FONTS = {
    english: [
        { name: 'Outfit', value: 'var(--font-outfit)' },
        { name: 'Inter', value: 'Inter, sans-serif' },
        { name: 'Lora', value: 'Lora, serif' },
        { name: 'Montserrat', value: 'Montserrat, sans-serif' },
        { name: 'Playfair Display', value: 'Playfair Display, serif' },
        { name: 'Roboto', value: 'Roboto, sans-serif' },
        { name: 'Poppins', value: 'Poppins, sans-serif' },
        { name: 'Kanit', value: 'Kanit, sans-serif' }
    ],
    arabic: [
        { name: 'Cairo', value: 'Cairo, sans-serif' },
        { name: 'Amiri', value: 'Amiri, serif' },
        { name: 'Almarai', value: 'Almarai, sans-serif' },
        { name: 'Tajawal', value: 'Tajawal, sans-serif' },
        { name: 'Vazirmatn', value: 'Vazirmatn, sans-serif' },
        { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic, sans-serif' }
    ],
    kurdish: [
        { name: 'Vazirmatn', value: 'Vazirmatn, sans-serif' },
        { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic, sans-serif' },
        { name: 'Rabar', value: 'Rabar, sans-serif' },
        { name: 'Ali-K', value: 'Ali-K, sans-serif' }
    ]
};

const ICON_MAP = {
    User: User, Mail: Mail, Phone: Phone, Globe: Globe, MapPin: MapPin,
    Linkedin: Linkedin, Instagram: Instagram, Twitter: Twitter, Github: Github,
    Briefcase: Briefcase, Building: Building
};

// Helper function to adjust color brightness
const adjustColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const CardFace = ({ side, card, template, exportMode = false }) => {
    const isFront = side === 'front';
    const isMinimal = template.id === 'minimal';
    const isGlass = template.effect === 'glass' && !exportMode; // Disable glass on export for better clarity
    const isTech = template.effect === 'tech';
    const isVertical = template.layout === 'vertical';
    const isRTL = template.rtl || false;
    const pattern = template.pattern;

    const design = card.content.design || {};
    const primaryColor = design.primaryColor || template.primary;
    const accentColor = design.accentColor || template.accent;
    const textColor = design.textColor || template.text;
    const secondaryColor = design.secondaryColor || '#000000';
    const isGradient = design.isGradient || false;
    const logoUrl = design.logoUrl || '';

    // Hyper-Customization properties
    const logoSize = design.logoSize || 100;
    const logoX = design.logoX || 0;
    const logoY = design.logoY || 0;
    const visibility = design.visibility || {
        fullName: 'front',
        jobTitle: 'front',
        companyName: 'back',
        notes: 'back',
        email: 'front',
        phone: 'front',
        website: 'front',
        location: 'front',
        logo: 'both'
    };

    // Helper to check visibility
    const isVisible = (field) => {
        const status = visibility[field] || 'none';
        if (status === 'both') return true;
        return status === side;
    };

    // Fonts
    const fonts = design.fonts || {
        en: 'var(--font-outfit)',
        ar: 'Cairo, sans-serif',
        ku: 'Vazirmatn, sans-serif'
    };

    const bgStyle = isGradient
        ? { background: `linear-gradient(${design.gradientAngle || 135}deg, ${primaryColor}, ${secondaryColor})` }
        : { background: primaryColor };

    if (isGlass) {
        bgStyle.background = isFront
            ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)';
    }

    const IconWrapper = ({ name, ...props }) => {
        const Icon = ICON_MAP[name] || Info;
        return <Icon size={14} {...props} />;
    };

    const contactIcons = design.icons || {
        email: 'Mail',
        phone: 'Phone',
        website: 'Globe',
        location: 'MapPin'
    };

    // Helper to determine font family
    const getFontFamily = (text) => {
        if (!text) return fonts.en;
        const arabicRegex = /[\u0600-\u06FF]/;
        const kurdishRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
        if (kurdishRegex.test(text)) return fonts.ku;
        if (arabicRegex.test(text)) return fonts.ar;
        return fonts.en;
    };

    const logoStyle = {
        height: '40px',
        width: 'auto',
        maxWidth: '200px',
        objectFit: 'contain' as const,
        transform: isFront
            ? `scale(${logoSize / 100}) translate(${logoX}px, ${logoY}px)`
            : `scale(${logoSize / 100})`, // Center by default on back, ignore offsets
        transformOrigin: isFront ? (isRTL ? 'right center' : 'left center') : 'center center',
        transition: 'transform 0.1s ease-out'
    };

    return (
        <div
            className={`absolute w-full h-full rounded-[20px] shadow-2xl overflow-hidden bg-white ${isRTL ? 'rtl text-right' : ''}`}
            style={{
                ...bgStyle,
                color: textColor,
                border: isMinimal ? '1px solid #e2e8f0' : (isGlass ? '1px solid rgba(255,255,255,0.2)' : 'none'),
                padding: '0',
                fontFamily: fonts.en,
                backfaceVisibility: exportMode ? 'visible' : 'hidden',
                WebkitBackfaceVisibility: exportMode ? 'visible' : 'hidden',
                transformStyle: 'preserve-3d',
                transform: exportMode ? 'none' : (isFront ? 'translateZ(1px)' : 'rotateY(180deg) translateZ(1px)'),
                ...(isGlass && {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }),
                ...(isTech && {
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }),
                ...(pattern === 'geometric' && {
                    backgroundImage: `linear-gradient(30deg, #ffffff11 12%, transparent 12.5%, transparent 87%, #ffffff11 87.5%, #ffffff11),
                        linear-gradient(150deg, #ffffff11 12%, transparent 12.5%, transparent 87%, #ffffff11 87.5%, #ffffff11),
                        linear-gradient(30deg, #ffffff11 12%, transparent 12.5%, transparent 87%, #ffffff11 87.5%, #ffffff11),
                        linear-gradient(150deg, #ffffff11 12%, transparent 12.5%, transparent 87%, #ffffff11 87.5%, #ffffff11),
                        linear-gradient(60deg, #ffffff11 25%, transparent 25.5%, transparent 75%, #ffffff11 75%, #ffffff11),
                        linear-gradient(60deg, #ffffff11 25%, transparent 25.5%, transparent 75%, #ffffff11 75%, #ffffff11)`,
                    backgroundSize: '80px 140px'
                }),
                ...(pattern === 'islamic' && {
                    backgroundImage: `radial-gradient(circle at center, transparent 0%, transparent 100%),
                        url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4h2c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                })
            }}
            data-card-face={side}
        >
            {isFront ? (
                <div style={{ padding: '40px', height: '100%', position: 'relative', display: 'flex', flexDirection: isVertical ? 'column' : 'column', justifyContent: 'space-between' }}>
                    <div style={{ zIndex: 2 }}>
                        {logoUrl && isVisible('logo') && (
                            <div style={{ marginBottom: '20px', height: '40px', display: 'flex', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
                                <img src={logoUrl} alt="Logo" style={logoStyle} />
                            </div>
                        )}
                        {isVisible('fullName') && (
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '900',
                                marginBottom: '4px',
                                letterSpacing: isRTL ? 'normal' : '-0.02em',
                                color: textColor,
                                fontFamily: getFontFamily(card.content.fullName)
                            }}>
                                {card.content.fullName || 'FULL NAME'}
                            </h2>
                        )}
                        {isVisible('jobTitle') && (
                            <p style={{
                                color: accentColor,
                                fontWeight: '700',
                                textTransform: isRTL ? 'none' : 'uppercase',
                                letterSpacing: isRTL ? 'normal' : '0.15em',
                                fontSize: '11px',
                                fontFamily: getFontFamily(card.content.jobTitle)
                            }}>
                                {card.content.jobTitle || 'JOB TITLE'}
                            </p>
                        )}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isVertical ? '1fr' : 'repeat(2, 1fr)',
                        gap: '16px',
                        fontSize: '11px',
                        opacity: 0.9,
                        zIndex: 2,
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}>
                        {card.content.email && isVisible('email') && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconWrapper name={contactIcons.email} size={12} /> <span style={{ fontFamily: getFontFamily(card.content.email) }}>{card.content.email}</span></div>}
                        {card.content.phone && isVisible('phone') && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconWrapper name={contactIcons.phone} size={12} /> <span style={{ fontFamily: getFontFamily(card.content.phone) }}>{card.content.phone}</span></div>}
                        {card.content.location && isVisible('location') && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconWrapper name={contactIcons.location} size={12} /> <span style={{ fontFamily: getFontFamily(card.content.location) }}>{card.content.location}</span></div>}
                        {card.content.website && isVisible('website') && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconWrapper name={contactIcons.website} size={12} /> <span style={{ fontFamily: getFontFamily(card.content.website) }}>{card.content.website.replace(/^https?:\/\//, '')}</span></div>}
                    </div>

                    {!isMinimal && !pattern && !isGlass && !isTech && (
                        <div style={{
                            position: 'absolute',
                            bottom: '40px',
                            [isRTL ? 'left' : 'right']: '40px',
                            opacity: 0.05,
                            color: textColor
                        }}>
                            <h1 style={{ fontSize: '56px', fontWeight: '900' }}>ONEKIT</h1>
                        </div>
                    )}

                    <div style={{
                        position: 'absolute',
                        top: 0,
                        [isRTL ? 'left' : 'right']: 0,
                        width: isVertical ? '100%' : '6px',
                        height: isVertical ? '6px' : '100%',
                        background: accentColor
                    }} />
                </div>
            ) : (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                        {logoUrl && isVisible('logo') ? (
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                <img src={logoUrl} alt="Logo" style={{ ...logoStyle, maxHeight: '80px', maxWidth: '300px' }} />
                            </div>
                        ) : (
                            !logoUrl && isVisible('logo') && <Layout size={48} color={accentColor} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '24px' }} />
                        )}
                        {isVisible('companyName') && (
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '900',
                                letterSpacing: isRTL ? 'normal' : '0.1em',
                                marginBottom: '12px',
                                color: textColor,
                                fontFamily: getFontFamily(card.content.companyName)
                            }}>
                                {card.content.companyName || 'ONEKIT'}
                            </h1>
                        )}
                        <div style={{ height: '3px', width: '48px', background: accentColor, margin: '24px auto' }} />
                        {isVisible('notes') && (
                            <p style={{
                                fontSize: '13px',
                                color: textColor,
                                opacity: 0.7,
                                lineHeight: '1.6',
                                maxWidth: '350px',
                                fontWeight: '500',
                                fontFamily: getFontFamily(card.content.notes)
                            }}>
                                {card.content.notes || 'Empowering your brand with premium digital experiences.'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* QR Code Rendering */}
            {card.content.design?.qr?.enabled && card.content.design.qr.value && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${card.content.design.qr.x}px), calc(-50% + ${card.content.design.qr.y}px))`,
                    zIndex: 10
                }}>
                    <div style={{
                        padding: card.content.design.qr.borderStyle !== 'none' ? `${card.content.design.qr.borderWidth}px` : '0',
                        background: card.content.design.qr.borderStyle === 'gradient'
                            ? `linear-gradient(135deg, ${card.content.design.qr.borderColor}, ${adjustColor(card.content.design.qr.borderColor, 40)})`
                            : card.content.design.qr.borderStyle !== 'none'
                                ? card.content.design.qr.borderColor
                                : 'transparent',
                        borderRadius: card.content.design.qr.borderStyle === 'rounded' ? '12px' : '0'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '8px',
                            borderRadius: card.content.design.qr.borderStyle === 'rounded' ? '8px' : '0'
                        }}>
                            <QRCodeSVG
                                value={card.content.design.qr.value}
                                size={card.content.design.qr.size}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function BusinessCardEditor({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { user } = useAuth();
    const { fetchCard, updateCard, saving } = useBusinessCard();
    const { uploadImage, uploading: uploadingLogo } = useImageUpload();

    // State
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('branding');
    const [isFlipped, setIsFlipped] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const isMounted = useRef(true);

    // Initial Load
    useEffect(() => {
        isMounted.current = true;
        const loadCard = async () => {
            const data = await fetchCard(id);
            if (data) {
                const defaultContent = {
                    fullName: '',
                    jobTitle: '',
                    email: '',
                    phone: '',
                    website: '',
                    location: '',
                    companyName: '',
                    socials: { linkedin: '', instagram: '', twitter: '', github: '' },
                    notes: '',
                    design: {
                        primaryColor: '',
                        accentColor: '',
                        textColor: '',
                        secondaryColor: '',
                        isGradient: false,
                        gradientAngle: 135,
                        icons: {
                            email: 'Mail',
                            phone: 'Phone',
                            website: 'Globe',
                            location: 'MapPin'
                        },
                        logoUrl: '',
                        logoSize: 100,
                        logoX: 0,
                        logoY: 0,
                        visibility: {
                            fullName: 'front',
                            jobTitle: 'front',
                            companyName: 'back',
                            notes: 'back',
                            email: 'front',
                            phone: 'front',
                            website: 'front',
                            location: 'front',
                            logo: 'both'
                        },
                        fonts: {
                            en: 'var(--font-outfit)',
                            ar: 'Cairo, sans-serif',
                            ku: 'Vazirmatn, sans-serif'
                        },
                        qr: {
                            enabled: false,
                            value: '',
                            size: 80,
                            x: 0,
                            y: 0,
                            borderStyle: 'none',
                            borderColor: '#000000',
                            borderWidth: 2
                        }
                    }
                };
                setCard({
                    ...data,
                    content: {
                        ...defaultContent,
                        ...data.content,
                        design: {
                            ...defaultContent.design,
                            ...(data.content.design || {}),
                            visibility: {
                                ...defaultContent.design.visibility,
                                ...(data.content.design?.visibility || {})
                            },
                            fonts: {
                                ...defaultContent.design.fonts,
                                ...(data.content.design?.fonts || {})
                            },
                            icons: {
                                ...defaultContent.design.icons,
                                ...(data.content.design?.icons || {})
                            }
                        }
                    }
                });
            } else {
                router.push('/dashboard/card-maker');
            }
            setLoading(false);
        };
        loadCard();
        return () => { isMounted.current = false; };
    }, [id]);

    // Auto-save logic
    const handleSave = useCallback(async () => {
        if (!card || !isMounted.current || !hasChanges) return;
        const { error } = await updateCard(id, { template_id: card.template_id, content: card.content });
        if (!error) setHasChanges(false);
    }, [card, id, updateCard, hasChanges]);

    useEffect(() => {
        if (!hasChanges) return;
        const timeout = setTimeout(handleSave, 3000);
        return () => clearTimeout(timeout);
    }, [hasChanges, handleSave]);

    const updateContent = (updates) => {
        setCard(prev => {
            const newContent = { ...prev.content, ...updates };
            // If we are updating design, deep merge it
            if (updates.design) {
                newContent.design = {
                    ...prev.content.design,
                    ...updates.design,
                    visibility: {
                        ...(prev.content.design?.visibility || {}),
                        ...(updates.design.visibility || {})
                    },
                    qr: {
                        ...(prev.content.design?.qr || {}),
                        ...(updates.design.qr || {})
                    }
                };
            }
            return { ...prev, content: newContent };
        });
        setHasChanges(true);
    };

    const [exporting, setExporting] = useState(false);
    const exportRef = useRef(null);
    const previewRef = useRef(null);

    const handleExport = async (format) => {
        if (!previewRef.current) return;
        setExporting(true);
        try {
            // Wait for fonts to be ready
            if (document.fonts) {
                await document.fonts.ready;
            }
            // Small extra delay for custom font internal rendering
            await new Promise(r => setTimeout(r, 1000));

            // Find the actual card face element from the preview flipper
            const flipper = previewRef.current;
            const cardFace = flipper.querySelector(`[data-card-face="${isFlipped ? 'back' : 'front'}"]`);

            if (!cardFace) {
                console.error('Could not find card face element');
                return;
            }

            // Capture the visible card at its natural size with high-res scaling
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardFace, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: null
            });

            if (format === 'pdf') {
                const pdf = new jsPDF('l', 'mm', [88.9, 50.8]); // 3.5in x 2in in mm
                pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 88.9, 50.8);
                pdf.save(`${card.name}_${isFlipped ? 'back' : 'front'}.pdf`);
            } else {
                const link = document.createElement('a');
                link.download = `${card.name}_${isFlipped ? 'back' : 'front'}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 1.0);
                link.click();
            }
        } catch (e) {
            console.error('Export error:', e);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-neutral-900 text-white gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span>Loading Editor...</span>
        </div>
    );
    if (!card) return null;

    const currentTemplate = CARD_TEMPLATES.find(t => t.id === card.template_id) || CARD_TEMPLATES[0];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-neutral-50/50 text-neutral-900 overflow-hidden">
            {/* Glass Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/card-maker')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all border border-neutral-200/50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-neutral-900 tracking-tight leading-none">{card.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Editor Standard
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95"
                    >
                        <RotateCcw size={14} className={isFlipped ? "rotate-180 transition-transform duration-500" : "transition-transform duration-500"} />
                        <span>Flip Canvas</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${hasChanges ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-neutral-50 text-neutral-300 border border-neutral-100'
                            }`}
                    >
                        {false ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Controls */}
                <aside className="w-[420px] bg-white border-r border-neutral-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-6 border-b border-neutral-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                        <h2 className="text-sm font-black text-neutral-900 tracking-wide uppercase mb-1">Configuration Matrix</h2>
                        <p className="text-xs font-medium text-neutral-400">Customize your digital asset parameters.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
                        <div className="flex flex-wrap gap-2 p-6 pb-2 sticky top-[73px] bg-white z-10 border-b border-neutral-50 transition-all">
                            {SECTIONS.map(s => (
                                <button
                                    key={s.id}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeSection === s.id
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg shadow-neutral-900/10'
                                        : 'bg-white text-neutral-400 border-neutral-100 hover:border-primary-200 hover:text-primary-600'}`}
                                    onClick={() => setActiveSection(s.id)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-6">
                            {activeSection === 'branding' && (
                                <div>
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Select Blueprint</label>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {CARD_TEMPLATES.map(t => (
                                            <button
                                                key={t.id}
                                                className={`group relative p-4 rounded-[20px] cursor-pointer transition-all flex flex-col items-center gap-3 border-2 ${card.template_id === t.id
                                                    ? 'border-primary-600 bg-primary-50/50 shadow-premium-layered'
                                                    : 'border-neutral-100 bg-white hover:border-primary-200 hover:-translate-y-0.5'}`}
                                                onClick={() => {
                                                    setCard(prev => ({
                                                        ...prev,
                                                        template_id: t.id,
                                                        content: {
                                                            ...prev.content,
                                                            design: {
                                                                ...prev.content.design,
                                                                primaryColor: t.primary,
                                                                accentColor: t.accent,
                                                                textColor: t.text
                                                            }
                                                        }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                            >
                                                <div className="w-full aspect-[1.58] rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 overflow-hidden relative" style={{ background: t.primary }}>
                                                    <div className="w-1/3 h-0.5 rounded-full" style={{ background: t.accent }} />
                                                    {card.template_id === t.id && (
                                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm"><Check size={14} strokeWidth={3} /></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${card.template_id === t.id ? 'text-primary-700' : 'text-neutral-400 group-hover:text-neutral-900'}`}>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">Visual Identity</label>
                                    <p className="text-[10px] font-medium text-neutral-400 mb-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex gap-2">
                                        <Info size={14} className="shrink-0 text-primary-500" />
                                        <span>Upload a transparent PNG for best results. Max 5MB.</span>
                                    </p>

                                    <div className="flex flex-col gap-4 mb-6">
                                        <div
                                            className="w-full aspect-video bg-neutral-50/50 border-2 border-dashed border-neutral-200 rounded-2xl flex items-center justify-center overflow-hidden relative cursor-pointer hover:border-primary-500 hover:bg-white transition-all group"
                                            onClick={() => document.getElementById('logoInput').click()}
                                        >
                                            {card.content.design.logoUrl ? (
                                                <>
                                                    <img src={card.content.design.logoUrl} alt="Logo Preview" className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-105 transition-transform" />
                                                    <button
                                                        className="absolute top-3 right-3 bg-white text-red-500 p-2 rounded-xl border border-neutral-100 shadow-sm z-10 hover:bg-red-50 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateContent({ design: { ...card.content.design, logoUrl: '' } });
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                                        <Upload size={20} />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-300 group-hover:text-primary-500 transition-colors">{uploadingLogo ? 'Processing...' : 'Click to Upload'}</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="logoInput"
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadImage(file, {
                                                        folder: 'card-logos',
                                                        type: 'logo',
                                                        skipOptimization: true,
                                                        maxSizeMB: 5
                                                    });
                                                    if (url) updateContent({ design: { ...card.content.design, logoUrl: url } });
                                                }
                                            }}
                                        />
                                    </div>

                                    {card.content.design.logoUrl && (
                                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mt-4">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                    <label>Logo Size</label>
                                                    <span className="text-primary-600">{card.content.design.logoSize || 100}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="600"
                                                    value={card.content.design.logoSize || 100}
                                                    onChange={(e) => updateContent({ design: { ...card.content.design, logoSize: parseInt(e.target.value) } })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                    <label>Nudging X</label>
                                                    <span className="text-primary-600">{card.content.design.logoX || 0}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-200"
                                                    max="200"
                                                    value={card.content.design.logoX || 0}
                                                    onChange={(e) => updateContent({ design: { ...card.content.design, logoX: parseInt(e.target.value) } })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                    <label>Nudging Y</label>
                                                    <span className="text-primary-600">{card.content.design.logoY || 0}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-200"
                                                    max="200"
                                                    value={card.content.design.logoY || 0}
                                                    onChange={(e) => updateContent({ design: { ...card.content.design, logoY: parseInt(e.target.value) } })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">Color Palette</label>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Primary</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        className="w-full h-12 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                                                        value={card.content.design.primaryColor || currentTemplate.primary}
                                                        onChange={(e) => updateContent({ design: { ...card.content.design, primaryColor: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Accent</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        className="w-full h-12 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                                                        value={card.content.design.accentColor || currentTemplate.accent}
                                                        onChange={(e) => updateContent({ design: { ...card.content.design, accentColor: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Text</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        className="w-full h-12 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                                                        value={card.content.design.textColor || currentTemplate.text}
                                                        onChange={(e) => updateContent({ design: { ...card.content.design, textColor: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            {card.content.design.isGradient && (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Gradient End</label>
                                                    <div className="relative">
                                                        <input
                                                            type="color"
                                                            className="w-full h-12 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                                                            value={card.content.design.secondaryColor}
                                                            onChange={(e) => updateContent({ design: { ...card.content.design, secondaryColor: e.target.value } })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-600 cursor-pointer mt-2 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg"
                                            onClick={() => updateContent({ design: { ...card.content.design, isGradient: !card.content.design.isGradient } })}
                                        >
                                            {card.content.design.isGradient ? <X size={14} /> : <Plus size={14} />}
                                            {card.content.design.isGradient ? 'Disable Background Gradient' : 'Enable Background Gradient'}
                                        </button>

                                        {card.content.design.isGradient && (
                                            <div className="mb-5 mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                                <label className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                                                    <span>Gradient Angle</span>
                                                    <span className="text-primary-600">{card.content.design.gradientAngle}°</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="360"
                                                    value={card.content.design.gradientAngle}
                                                    onChange={(e) => updateContent({ design: { ...card.content.design, gradientAngle: parseInt(e.target.value) } })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'fonts' && (
                                <div>
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">Typography</label>
                                    <p className="text-[10px] font-medium text-neutral-400 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                        Choose custom fonts for each language to match your brand identity.
                                    </p>

                                    {['english', 'arabic', 'kurdish'].map(lang => (
                                        <div key={lang} className="mb-6">
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">{lang} Font</label>
                                            <select
                                                value={card.content.design.fonts[lang === 'english' ? 'en' : (lang === 'arabic' ? 'ar' : 'ku')]}
                                                onChange={(e) => updateContent({
                                                    design: {
                                                        ...card.content.design,
                                                        fonts: {
                                                            ...card.content.design.fonts,
                                                            [lang === 'english' ? 'en' : (lang === 'arabic' ? 'ar' : 'ku')]: e.target.value
                                                        }
                                                    }
                                                })}
                                                className="w-full h-11 px-3 bg-white border border-neutral-200 text-neutral-900 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-medium appearance-none cursor-pointer"
                                            >
                                                {FONTS[lang].map(f => (
                                                    <option key={f.value} value={f.value}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeSection === 'visibility' && (
                                <div>
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">Component Visibility</label>
                                    <p className="text-[10px] font-medium text-neutral-400 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                        Control where each element appears on your card (Front, Back, or Both).
                                    </p>

                                    <div className="grid gap-3">
                                        {[
                                            { id: 'fullName', label: 'Full Name' },
                                            { id: 'jobTitle', label: 'Job Title' },
                                            { id: 'companyName', label: 'Company Name' },
                                            { id: 'notes', label: 'Notes / Slogan' },
                                            { id: 'logo', label: 'Brand Logo' },
                                            { id: 'email', label: 'Email Address' },
                                            { id: 'phone', label: 'Phone Number' },
                                            { id: 'website', label: 'Website' },
                                            { id: 'location', label: 'Location' }
                                        ].map(item => (
                                            <div key={item.id} className="bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
                                                <label className="block text-[10px] font-bold text-neutral-900 mb-2">{item.label}</label>
                                                <div className="flex gap-2">
                                                    {['front', 'back', 'both', 'none'].map(mode => (
                                                        <button
                                                            key={mode}
                                                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${card.content.design.visibility[item.id] === mode
                                                                ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20'
                                                                : 'bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-white hover:border-primary-200 hover:text-primary-600'}`}
                                                            onClick={() => updateContent({
                                                                design: {
                                                                    ...card.content.design,
                                                                    visibility: { ...card.content.design.visibility, [item.id]: mode }
                                                                }
                                                            })}
                                                        >
                                                            {mode === 'both' ? 'Both' : (mode === 'none' ? 'Hide' : mode)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'general' && (
                                <div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.fullName}
                                            placeholder="e.g. John Doe"
                                            onChange={(e) => updateContent({ fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Job Title</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.jobTitle}
                                            placeholder="e.g. Senior Developer"
                                            onChange={(e) => updateContent({ jobTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.companyName}
                                            placeholder="e.g. OneKit Studio"
                                            onChange={(e) => updateContent({ companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Location</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.location}
                                            placeholder="e.g. London, UK"
                                            onChange={(e) => updateContent({ location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            {activeSection === 'toolkit' && (
                                <div>
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">Icon Toolkit</label>
                                    <p className="text-[10px] font-medium text-neutral-400 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                        Choose professional icons to represent your contact details.
                                    </p>

                                    {['email', 'phone', 'website', 'location'].map(field => (
                                        <div key={field} className="mb-8">
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-3">
                                                {field} Icon
                                            </label>
                                            <div className="grid grid-cols-4 gap-2 p-2 bg-neutral-50 rounded-xl border border-neutral-100 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                {Object.keys(ICON_MAP).map(iconName => {
                                                    const Icon = ICON_MAP[iconName];
                                                    return (
                                                        <button
                                                            key={iconName}
                                                            title={iconName}
                                                            className={`aspect-square flex items-center justify-center text-lg rounded-lg cursor-pointer transition-all ${card.content.design.icons[field] === iconName
                                                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                                                : 'bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50 hover:border-primary-200 hover:text-primary-600'}`}
                                                            onClick={() => updateContent({
                                                                design: {
                                                                    ...card.content.design,
                                                                    icons: { ...card.content.design.icons, [field]: iconName }
                                                                }
                                                            })}
                                                        >
                                                            <Icon size={18} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeSection === 'qr' && (
                                <div>
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 mb-4 block">QR Code Settings</label>

                                    {/* Enable Toggle */}
                                    <div className="mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                        <label className="flex items-center gap-3 text-sm font-bold text-neutral-900 cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={card.content.design?.qr?.enabled || false}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: {
                                                                ...(card.content.design?.qr || {}),
                                                                enabled: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </div>
                                            <span>Enable QR Code</span>
                                        </label>
                                    </div>

                                    {card.content.design?.qr?.enabled && (
                                        <>
                                            {/* QR Value */}
                                            <div className="mb-5">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">QR Content</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                                    value={card.content.design.qr.value || ''}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: { ...card.content.design.qr, value: e.target.value }
                                                        }
                                                    })}
                                                    placeholder="https://onekit.com"
                                                />
                                            </div>

                                            {/* Size Slider */}
                                            <div className="mb-5">
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    <label>Size</label>
                                                    <span className="text-primary-600">{card.content.design.qr.size || 80}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="40"
                                                    max="150"
                                                    value={card.content.design.qr.size || 80}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: { ...card.content.design.qr, size: parseInt(e.target.value) }
                                                        }
                                                    })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            {/* X Position */}
                                            <div className="mb-5">
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    <label>Horizontal Position</label>
                                                    <span className="text-primary-600">{card.content.design.qr.x || 0}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-250"
                                                    max="250"
                                                    value={card.content.design.qr.x || 0}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: { ...card.content.design.qr, x: parseInt(e.target.value) }
                                                        }
                                                    })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            {/* Y Position */}
                                            <div className="mb-5">
                                                <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                    <label>Vertical Position</label>
                                                    <span className="text-primary-600">{card.content.design.qr.y || 0}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="-250"
                                                    max="250"
                                                    value={card.content.design.qr.y || 0}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: { ...card.content.design.qr, y: parseInt(e.target.value) }
                                                        }
                                                    })}
                                                    className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            {/* Border Style */}
                                            <div className="mb-5">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Border Style</label>
                                                <select
                                                    value={card.content.design.qr.borderStyle || 'none'}
                                                    onChange={(e) => updateContent({
                                                        design: {
                                                            ...card.content.design,
                                                            qr: { ...card.content.design.qr, borderStyle: e.target.value }
                                                        }
                                                    })}
                                                    className="w-full h-11 px-3 bg-white border border-neutral-200 text-neutral-900 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-medium appearance-none cursor-pointer"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="solid">Solid</option>
                                                    <option value="rounded">Rounded</option>
                                                    <option value="gradient">Gradient</option>
                                                </select>
                                            </div>

                                            {card.content.design.qr.borderStyle !== 'none' && (
                                                <>
                                                    {/* Border Color */}
                                                    <div className="mb-5">
                                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Border Color</label>
                                                        <div className="relative">
                                                            <input
                                                                type="color"
                                                                className="w-full h-12 p-1 bg-white border border-neutral-200 rounded-xl cursor-pointer"
                                                                value={card.content.design.qr.borderColor || '#000000'}
                                                                onChange={(e) => updateContent({
                                                                    design: {
                                                                        ...card.content.design,
                                                                        qr: { ...card.content.design.qr, borderColor: e.target.value }
                                                                    }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Border Width */}
                                                    <div className="mb-5">
                                                        <div className="flex justify-between items-center mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                            <label>Border Width</label>
                                                            <span className="text-primary-600">{card.content.design.qr.borderWidth || 2}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="8"
                                                            value={card.content.design.qr.borderWidth || 2}
                                                            onChange={(e) => updateContent({
                                                                design: {
                                                                    ...card.content.design,
                                                                    qr: { ...card.content.design.qr, borderWidth: parseInt(e.target.value) }
                                                                }
                                                            })}
                                                            className="w-full accent-primary-600 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeSection === 'social' && (
                                <div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.email}
                                            onChange={(e) => updateContent({ email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.phone}
                                            onChange={(e) => updateContent({ phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Website</label>
                                        <input
                                            type="url"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.website}
                                            onChange={(e) => updateContent({ website: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">LinkedIn URL</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300"
                                            value={card.content.socials.linkedin}
                                            onChange={(e) => updateContent({ socials: { ...card.content.socials, linkedin: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeSection === 'content' && (
                                <div>
                                    <div className="mb-5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Biography / Notes</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium placeholder:text-neutral-300 resize-none"
                                            value={card.content.notes}
                                            onChange={(e) => updateContent({ notes: e.target.value })}
                                            placeholder="Brief background or tagline..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                </aside>

                {/* Preview Workspace */}
                <main className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] bg-neutral-50 relative overflow-hidden">
                    <div className="absolute top-6 right-6 flex gap-3 z-10">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-xl border border-neutral-200/60 rounded-full text-neutral-600 text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <RotateCcw size={16} /> Flip Card
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full text-white text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Design'}
                        </button>
                    </div>

                    <div className="w-full max-w-[700px] aspect-[1.75/1] relative mx-auto drop-shadow-2xl" style={{ perspective: '2000px' }}>
                        <div
                            ref={previewRef}
                            className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            }}
                        >
                            <CardFace side="front" card={card} template={currentTemplate} />
                            <CardFace side="back" card={card} template={currentTemplate} />
                        </div>
                    </div>

                    <div className="mt-10 flex bg-white/80 backdrop-blur-xl p-1.5 rounded-full border border-neutral-200/60 shadow-xl shadow-black/5">
                        <div className="mr-auto flex gap-2">
                            <PDFDownloadButton
                                document={<BusinessCardPDF card={card} />}
                                fileName={`business-card-${card.name?.replace(/\s+/g, '-') || 'new'}.pdf`}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-neutral-600 text-sm font-bold hover:bg-neutral-100 transition-colors"
                                label="HQ PDF"
                            />
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-neutral-600 text-sm font-bold hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                onClick={() => handleExport('jpg')}
                                disabled={exporting}
                            >
                                <Download size={16} /> {exporting ? '...' : 'JPG'}
                            </button>
                        </div>
                        <div className="w-px h-8 bg-neutral-200 mx-2 self-center" />
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isFlipped ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900'}`}
                            onClick={() => setIsFlipped(false)}
                        >
                            Front
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isFlipped ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900'}`}
                            onClick={() => setIsFlipped(true)}
                        >
                            Back
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

