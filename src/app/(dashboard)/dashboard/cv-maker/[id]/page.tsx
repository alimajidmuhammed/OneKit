// @ts-nocheck
'use client';

import { use, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCV } from '@/lib/hooks/useCV';
import { useAuth } from '@/components/auth/AuthProvider';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import {
    Mail, Phone, MapPin, Linkedin, Globe, FileText,
    Image as ImageIcon, Plus, X, Download, Wand2, Loader2,
    ArrowLeft, Upload, ChevronDown, User, CheckCircle,
    AlertCircle, RotateCcw, RotateCw, Trash2, Edit3,
    Sparkles, Layout, Type, Palette, Languages, Award,
    Users, Briefcase, GraduationCap, Info, ExternalLink,
    Maximize2, MousePointer2, Save, FileType, FileImage
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import './cv-templates.css';

/**
 * CV_TEMPLATES - OneKit 3.0 Curated Blueprint Collection
 */
const CV_TEMPLATES = [
    { id: 'professional', name: 'Professional', description: 'Institutional standard', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#1e3a8a', accent: '#f0f4ff' } },
    { id: 'milano', name: 'Milano', description: 'Modern Minimalist', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#0f172a', accent: '#f8fafc' } },
    { id: 'sydney', name: 'Sydney', description: 'Creative Columnar', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#4f46e5', accent: '#eef2ff' } },
    { id: 'london', name: 'London', description: 'Executive Classic', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#1e293b', accent: '#f1f5f9' } },
    { id: 'paris', name: 'Paris', description: 'Elegant Serif', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#be185d', accent: '#fdf2f8' } },
    { id: 'tokyo', name: 'Tokyo', description: 'Nocturnal Digital', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#3b82f6', accent: '#0f172a' } },
    { id: 'dubai', name: 'Dubai', description: 'Premium Gilded', hasPhoto: true, baseTemplate: 'dubai', colors: { primary: '#d4af37', accent: '#1a1a2e' } },
    { id: 'zurich', name: 'Zurich', description: 'Swiss Neutral', hasPhoto: false, baseTemplate: 'milano', colors: { primary: '#000000', accent: '#ffffff' } },
    // Kurdish & Arabic RTL Blueprints
    { id: 'erbil', name: 'ھەولێر', description: 'Northern Heritage', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#ea580c', accent: '#fff7ed' }, rtl: true },
    { id: 'sulaymaniyah', name: 'سلێمانی', description: 'Cultural Pulse', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#1e3a8a', accent: '#f0f4ff' }, rtl: true },
    { id: 'baghdad', name: 'بەغداد', description: 'Mesopotamian Core', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#0c4a6e', accent: '#f0f9ff' }, rtl: true },
    { id: 'riyadh', name: 'الرياض', description: 'Gilded Peninsula', hasPhoto: true, baseTemplate: 'dubai', colors: { primary: '#1c1917', accent: '#d4af37' }, rtl: true },
];

/**
 * SECTIONS - OneKit 3.0 Component Topology
 */
const SECTIONS = [
    { id: 'personal', label: 'Identity', icon: <User size={18} /> },
    { id: 'summary', label: 'Manifesto', icon: <FileText size={18} /> },
    { id: 'experience', label: 'Campaigns', icon: <Briefcase size={18} /> },
    { id: 'education', label: 'Academic', icon: <GraduationCap size={18} /> },
    { id: 'skills', label: 'Capabilities', icon: <Sparkles size={18} /> },
    { id: 'certifications', label: 'Credentials', icon: <Award size={18} /> },
    { id: 'organizations', label: 'Guilds', icon: <Users size={18} /> },
    { id: 'languages', label: 'Dialects', icon: <Languages size={18} /> },
    { id: 'design', label: 'Visuals', icon: <Palette size={18} /> },
];

const Icons = {
    email: Mail, phone: Phone, location: MapPin, linkedin: Linkedin,
    website: Globe, pdf: FileType, jpg: FileImage, add: Plus,
    close: X, download: Download, magic: Wand2, spinner: Loader2,
    back: ArrowLeft, upload: Upload, chevronDown: ChevronDown,
    User: User, success: CheckCircle, error: AlertCircle,
    rotateCw: RotateCw, trash: Trash2, edit: Edit3
};

/**
 * CVContent Sub-component - Ported for high-fidelity preview
 */
const CVContent = ({ cv, currentTemplate, photoStyle, isExport = false, contentRef, photoUploadPreview = null }) => {
    const getSkillLevel = (level) => {
        const l = level?.toLowerCase();
        const levels = {
            beginner: 25, intermediate: 50, advanced: 75, expert: 100,
            native: 100, fluent: 85, basic: 30
        };
        return levels[l] || 50;
    };

    const order = cv.section_order || ['personal', 'summary', 'experience', 'education', 'skills', 'certifications', 'organizations', 'languages', 'design'];

    const renderSection = (id) => {
        switch (id) {
            case 'summary':
                return cv.summary && (
                    <div className="cvSection" key="summary">
                        <h3>{currentTemplate.baseTemplate === 'sydney' ? 'Manifesto' : 'Professional Summary'}</h3>
                        <p className="whitespace-pre-wrap">{cv.summary}</p>
                    </div>
                );
            case 'experience':
                return cv.experience?.length > 0 && (
                    <div className="cvSection" key="experience">
                        <h3>{currentTemplate.rtl ? 'پاشخان و ئەزموون' : 'Experience History'}</h3>
                        {cv.experience.map((exp, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{exp.position || 'Campaign Lead'}</strong>
                                    <span>{exp.startDate} — {exp.endDate || 'Ongoing'}</span>
                                </div>
                                <p className="company">{exp.company}</p>
                                {exp.description && <p className="whitespace-pre-wrap">{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                );
            case 'education':
                return cv.education?.length > 0 && (
                    <div className="cvSection" key="education">
                        <h3>{currentTemplate.rtl ? 'پەروەردە و خوێندن' : 'Academic Foundation'}</h3>
                        {cv.education.map((edu, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{edu.degree} in {edu.field}</strong>
                                    <span>{edu.endDate}</span>
                                </div>
                                <p>{edu.institution}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'skills':
                return cv.skills?.length > 0 && (
                    <div className="cvSection" key="skills">
                        <h3>{currentTemplate.rtl ? 'لێهاتووییەکان' : 'Core Capabilities'}</h3>
                        {currentTemplate.baseTemplate === 'sydney' ? (
                            <div className="skillList">
                                {cv.skills.map((skill, i) => (
                                    <div key={i} className="skillItem">
                                        <span className="skillName">{skill.name}</span>
                                        <div className="skillBar">
                                            <div className="skillFill" style={{ width: `${getSkillLevel(skill.level)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="skillTags">
                                {cv.skills.map((skill, i) => (
                                    <span key={i} className="skillTag">{skill.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'languages':
                return cv.languages?.length > 0 && (
                    <div className="cvSection" key="languages">
                        <h3>{currentTemplate.rtl ? 'زمانەکان' : 'Linguistic Dialogs'}</h3>
                        {currentTemplate.baseTemplate === 'sydney' ? (
                            <div className="skillList">
                                {cv.languages.map((lang, i) => (
                                    <div key={i} className="skillItem">
                                        <span className="skillName">{lang.name}</span>
                                        <div className="skillBar">
                                            <div className="skillFill" style={{ width: `${getSkillLevel(lang.level)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="skillTags">
                                {cv.languages.map((lang, i) => (
                                    <span key={i} className="skillTag">{lang.name} ({lang.level})</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'certifications':
                return cv.certifications?.length > 0 && (
                    <div className="cvSection" key="certifications">
                        <h3>{currentTemplate.rtl ? 'بڕوانامەکان' : 'Institutional Credentials'}</h3>
                        {cv.certifications.map((cert, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{cert.name}</strong>
                                    <span>{cert.date}</span>
                                </div>
                                <p>{cert.issuer}{cert.credentialId ? ` • Node: ${cert.credentialId}` : ''}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'organizations':
                return cv.organizations?.length > 0 && (
                    <div className="cvSection" key="organizations">
                        <h3>{currentTemplate.rtl ? 'ڕێکخراوەکان' : 'Guild Affiliations'}</h3>
                        {cv.organizations.map((org, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{org.name}</strong>
                                    <span>{org.startDate} — {org.endDate || 'Active'}</span>
                                </div>
                                <p>{org.role}</p>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={contentRef}
            className={`cvPreview template_${currentTemplate.baseTemplate || cv.template_id} ${isExport ? 'exportItem' : ''}`}
            style={{
                '--template-primary': cv.custom_colors?.primary || currentTemplate.colors.primary,
                '--template-accent': cv.custom_colors?.accent || currentTemplate.colors.accent,
                ...(currentTemplate.rtl ? { direction: 'rtl', textAlign: 'right' as const } : {}),
                ...(isExport ? { transform: 'none', width: '794px', height: 'auto', fontSize: '12px', minHeight: '1123px' } : {})
            } as React.CSSProperties}
        >
            {currentTemplate.baseTemplate === 'sydney' ? (
                <div className="cvInner">
                    <div className="cvSidebar">
                        {(cv.personal_info?.photo || photoUploadPreview) && (
                            <div className="cvPhoto">
                                <img src={photoUploadPreview || cv.personal_info.photo} alt="Profile" style={photoStyle} crossOrigin="anonymous" />
                            </div>
                        )}
                        <div className="sidebarName">{cv.personal_info?.fullName || 'Identity Pending'}</div>
                        <div className="sidebarTitle">{cv.personal_info?.jobTitle || 'Role Selection'}</div>

                        <div className="sidebarSection">
                            <h4>Protocol</h4>
                            <div className="contactList">
                                {cv.personal_info?.email && <div className="contactItem"><span className="icon"><Icons.email size={12} /></span> {cv.personal_info.email}</div>}
                                {cv.personal_info?.phone && <div className="contactItem"><span className="icon"><Icons.phone size={12} /></span> {cv.personal_info.phone}</div>}
                                {cv.personal_info?.location && <div className="contactItem"><span className="icon"><Icons.location size={12} /></span> {cv.personal_info.location}</div>}
                                {cv.personal_info?.linkedin && <div className="contactItem"><span className="icon"><Icons.linkedin size={12} /></span> {cv.personal_info.linkedin}</div>}
                            </div>
                        </div>

                        {/* Order-aware Sidebar Sections */}
                        {order.map(id => (id === 'skills' || id === 'languages') && renderSection(id))}
                    </div>
                    <div className="cvMain">
                        {order.map(id => (id !== 'personal' && id !== 'design' && id !== 'skills' && id !== 'languages') && renderSection(id))}
                    </div>
                </div>
            ) : (
                <div className="cvInner">
                    <div className="cvHeader">
                        {(cv.personal_info?.photo || photoUploadPreview) && (
                            <div className="cvPhoto">
                                <img src={photoUploadPreview || cv.personal_info.photo} alt="Profile" style={photoStyle} crossOrigin="anonymous" />
                            </div>
                        )}
                        <div className="cvHeaderText">
                            <h1>{cv.personal_info?.fullName || 'Identity Pending'}</h1>
                            <p className="jobTitle">{cv.personal_info?.jobTitle || 'Role Selection'}</p>
                            <div className="contactInfo">
                                {cv.personal_info?.email && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.email size={10} /></span>
                                        <span>{cv.personal_info.email}</span>
                                    </div>
                                )}
                                {cv.personal_info?.phone && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.phone size={10} /></span>
                                        <span>{cv.personal_info.phone}</span>
                                    </div>
                                )}
                                {cv.personal_info?.location && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.location size={10} /></span>
                                        <span>{cv.personal_info.location}</span>
                                    </div>
                                )}
                                {cv.personal_info?.linkedin && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.linkedin size={10} /></span>
                                        <span>{cv.personal_info.linkedin}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {order.map(id => (id !== 'personal' && id !== 'design') && renderSection(id))}
                </div>
            )}
        </div>
    );
};

export default function CVEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { user } = useAuth();
    const { fetchCV, updateCV, saving } = useCV();
    const { uploadImage, uploading: uploadingPhoto } = useImageUpload();

    // Refs for interaction & export
    const containerRef = useRef(null);
    const previewRef = useRef(null);
    const exportRef = useRef(null);
    const photoRef = useRef(null);
    const isMounted = useRef(true);

    // OneKit 3.0 State Engine
    const [cv, setCV] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('personal');
    const [hasChanges, setHasChanges] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const [mobileView, setMobileView] = useState('edit'); // 'edit' or 'preview'
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [generatingStyle, setGeneratingStyle] = useState(false);
    const [sectionOrder, setSectionOrder] = useState(['personal', 'summary', 'experience', 'education', 'skills', 'certifications', 'organizations', 'languages', 'design']);
    const [draggedSection, setDraggedSection] = useState(null);
    const [styleRationale, setStyleRationale] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'

    // Advanced Photo Studio State
    const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
    const [photoZoom, setPhotoZoom] = useState(1);
    const [photoRotation, setPhotoRotation] = useState(0);
    const [studioPhotoPosition, setStudioPhotoPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Photo Upload State
    const [photoUploadPreview, setPhotoUploadPreview] = useState(null);
    const [photoUploadError, setPhotoUploadError] = useState(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    /**
     * updateScale - Ensures document preview is perfectly sized within workspace
     */
    const updateScale = useCallback(() => {
        if (!containerRef.current || !previewRef.current) return;
        const container = containerRef.current;
        const preview = previewRef.current;

        const padding = 80; // More luxurious padding for 3.0
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;

        const scaleW = availableWidth / preview.offsetWidth;
        const scaleH = availableHeight / preview.offsetHeight;

        const newScale = Math.min(scaleW, scaleH, 1);
        setPreviewScale(newScale);
    }, []);

    useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [updateScale, cv?.template_id]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    /**
     * Initial Load Routine
     */
    useEffect(() => {
        const loadCV = async () => {
            const data = await fetchCV(id);
            if (data) {
                if (data.personal_info) {
                    if (!data.personal_info.photoPosition) data.personal_info.photoPosition = { x: 0, y: 0 };
                    if (data.personal_info.photoZoom === undefined) data.personal_info.photoZoom = 1;
                    if (data.personal_info.photoRotation === undefined) data.personal_info.photoRotation = 0;
                }
                if (!data.skills) data.skills = [];
                if (!data.languages) data.languages = [];
                if (data.personal_info?.nested_data) {
                    data.summary = data.personal_info.nested_data.summary || data.summary;
                    data.custom_colors = data.personal_info.nested_data.custom_colors || data.custom_colors;
                }
                setCV(data);
                if (data.section_order?.length > 0) setSectionOrder(data.section_order);
                if (data.personal_info) {
                    setPhotoZoom(data.personal_info.photoZoom || 1);
                    setPhotoRotation(data.personal_info.photoRotation || 0);
                    setStudioPhotoPosition(data.personal_info.photoPosition || { x: 0, y: 0 });
                }
            } else {
                router.push('/dashboard/cv-maker');
            }
            setLoading(false);
        };
        loadCV();
    }, [id]);

    /**
     * handleSave - OneKit 3.0 Persistence Pipeline
     */
    const handleSave = useCallback(async () => {
        if (!cv || !isMounted.current) return;
        setSaveStatus('saving');
        try {
            const { error } = await updateCV(id, {
                template_id: cv.template_id,
                personal_info: {
                    ...cv.personal_info,
                    nested_data: {
                        summary: cv.summary,
                        custom_colors: cv.custom_colors
                    }
                },
                experience: cv.experience,
                education: cv.education,
                skills: cv.skills,
                languages: cv.languages,
                certifications: cv.certifications,
                organizations: cv.organizations,
                section_order: sectionOrder
            });
            if (error) throw new Error(error);
            setHasChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Save Failure:', err);
            setSaveStatus('idle');
        }
    }, [cv, id, updateCV, sectionOrder]);

    useEffect(() => {
        if (!hasChanges || !cv || isUploadingPhoto) return;
        const timeoutId = setTimeout(() => handleSave(), 3000);
        return () => clearTimeout(timeoutId);
    }, [cv, hasChanges, handleSave, isUploadingPhoto]);

    /**
     * UI Action Handlers
     */
    const changeTemplate = (templateId) => {
        const template = CV_TEMPLATES.find(t => t.id === templateId);
        setCV(prev => ({
            ...prev,
            template_id: templateId,
            custom_colors: template.colors
        }));
        setHasChanges(true);
        setShowTemplates(false);
    };

    const updateField = (field, value) => {
        setCV(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updatePersonalInfo = (field, value) => {
        setCV(prev => ({
            ...prev,
            personal_info: { ...prev.personal_info, [field]: value }
        }));
        setHasChanges(true);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        setPhotoUploadError(null);
        setIsUploadingPhoto(true);
        try {
            const localPreview = URL.createObjectURL(file);
            setPhotoUploadPreview(localPreview);
            setIsPhotoStudioOpen(true);
            const publicUrl = await uploadImage(file, { folder: 'cv-photos', type: 'photo' });
            if (publicUrl) {
                updatePersonalInfo('photo', publicUrl);
                setPhotoUploadPreview(null);
                setHasChanges(true);
                URL.revokeObjectURL(localPreview);
            } else throw new Error('Network error during upload.');
        } catch (error) {
            setPhotoUploadError(error.message);
            setIsPhotoStudioOpen(false);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const applyPhotoEdits = () => {
        updatePersonalInfo('photoZoom', photoZoom);
        updatePersonalInfo('photoRotation', photoRotation);
        updatePersonalInfo('photoPosition', studioPhotoPosition);
        setIsPhotoStudioOpen(false);
        setHasChanges(true);
    };

    const removePhoto = async () => {
        const photoUrl = cv?.personal_info?.photo;
        if (photoUrl?.includes('r2.dev')) {
            try {
                await fetch('/api/upload/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: photoUrl }),
                });
            } catch (e) { console.error(e); }
        }
        updatePersonalInfo('photo', null);
        setHasChanges(true);
    };

    // Photo Interaction Bridge
    const handlePhotoMouseDown = (e) => {
        if (!cv?.personal_info?.photo) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - studioPhotoPosition.x, y: e.clientY - studioPhotoPosition.y });
    };

    const handlePhotoMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setStudioPhotoPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }, [isDragging, dragStart]);

    const handlePhotoMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handlePhotoMouseMove);
            window.addEventListener('mouseup', handlePhotoMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handlePhotoMouseMove);
            window.removeEventListener('mouseup', handlePhotoMouseUp);
        };
    }, [isDragging, handlePhotoMouseMove, handlePhotoMouseUp]);

    const handlePhotoTouchStart = (e) => {
        if (!cv?.personal_info?.photo) return;
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - studioPhotoPosition.x, y: touch.clientY - studioPhotoPosition.y });
    };

    const handlePhotoTouchMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        setStudioPhotoPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }, [isDragging, dragStart]);

    const handlePhotoTouchEnd = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('touchmove', handlePhotoTouchMove, { passive: false });
            window.addEventListener('touchend', handlePhotoTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handlePhotoTouchMove);
            window.removeEventListener('touchend', handlePhotoTouchEnd);
        };
    }, [isDragging, handlePhotoTouchMove, handlePhotoTouchEnd]);

    /**
     * Export Pipeline - Optimized for OneKit 3.0 Rendering
     */
    const downloadAsPDF = async () => {
        if (!exportRef.current) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            await document.fonts.ready;
            const element = exportRef.current;
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(async (img) => {
                if (img.src && !img.src.startsWith('data:')) {
                    try {
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => { img.src = reader.result; resolve(); };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) { }
                }
            }));
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                scale: 2, useCORS: true, allowTaint: true,
                backgroundColor: '#ffffff', logging: false,
                width: 794, height: element.scrollHeight
            });
            const jsPDF = (await import('jspdf')).default;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210; const pdfHeight = 297;
            const canvasAspect = canvas.height / canvas.width;
            const imgWidth = pdfWidth; const imgHeight = pdfWidth * canvasAspect;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${cv.name || 'Personal_CV'}.pdf`);
        } catch (e) { console.error(e); }
        finally { setExporting(false); }
    };

    const downloadAsJPG = async () => {
        if (!exportRef.current) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            await document.fonts.ready;
            const element = exportRef.current;
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(async (img) => {
                if (img.src && !img.src.startsWith('data:')) {
                    try {
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => { img.src = reader.result; resolve(); };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) { }
                }
            }));
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `${cv.name || 'Personal_CV'}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (e) { console.error(e); }
        finally { setExporting(false); }
    };

    /**
     * AI Intelligence Matrix
     */
    const handleGenerateSummary = async () => {
        if (!cv?.personal_info?.jobTitle) return alert('Specify Job Title');
        setGeneratingSummary(true);
        try {
            const expText = (cv.experience || []).map(e => `${e.position} at ${e.company}`).join(', ');
            const res = await fetch('/api/ai/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: cv.personal_info.jobTitle, keywords: cv.skills?.map(s => s.name).join(', '), experience: expText })
            });
            const data = await res.json();
            if (data.summary) updateField('summary', data.summary);
        } catch (e) { } finally { setGeneratingSummary(false); }
    };

    const handleAIStylist = async () => {
        if (!cv?.personal_info?.jobTitle) return alert('Specify Job Title');
        setGeneratingStyle(true);
        try {
            const res = await fetch('/api/ai/recommend-style', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: cv.personal_info.jobTitle, availableTemplates: CV_TEMPLATES.map(t => ({ id: t.id, description: t.description })) })
            });
            const data = await res.json();
            if (data.templateId) {
                setCV(prev => ({ ...prev, template_id: data.templateId, custom_colors: { primary: data.primaryColor, accent: data.accentColor } }));
                setStyleRationale(data.rationale);
                setHasChanges(true);
            }
        } catch (e) { } finally { setGeneratingStyle(false); }
    };

    // Drag-Drop Surface Handlers
    const handleDragStart = (e, sectionId) => { setDraggedSection(sectionId); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e, sectionId) => {
        e.preventDefault();
        if (draggedSection === sectionId) return;
    };

    // Section drag-drop handlers
    const handleDrop = (e, targetSection) => {
        e.preventDefault();
        if (!draggedSection || draggedSection === targetSection) return;
        const newOrder = [...sectionOrder];
        const dragIndex = newOrder.indexOf(draggedSection);
        const dropIndex = newOrder.indexOf(targetSection);
        newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, draggedSection);
        setSectionOrder(newOrder);
        setCV(prev => ({ ...prev, section_order: newOrder }));
        setHasChanges(true);
        setDraggedSection(null);
    };

    const handleDragEnd = () => setDraggedSection(null);

    // CRUD Orchestrators
    const addExperience = () => { setCV(prev => ({ ...prev, experience: [...(prev.experience || []), { id: Date.now(), company: '', position: '', location: '', startDate: '', endDate: '', description: '' }] })); setHasChanges(true); };
    const updateExperience = (index, field, value) => { setCV(prev => { const exp = [...(prev.experience || [])]; exp[index] = { ...exp[index], [field]: value }; return { ...prev, experience: exp }; }); setHasChanges(true); };
    const removeExperience = (index) => { setCV(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) })); setHasChanges(true); };

    const addEducation = () => { setCV(prev => ({ ...prev, education: [...(prev.education || []), { id: Date.now(), institution: '', degree: '', field: '', endDate: '' }] })); setHasChanges(true); };
    const updateEducation = (index, field, value) => { setCV(prev => { const edu = [...(prev.education || [])]; edu[index] = { ...edu[index], [field]: value }; return { ...prev, education: edu }; }); setHasChanges(true); };
    const removeEducation = (index) => { setCV(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) })); setHasChanges(true); };

    const addSkill = () => { setCV(prev => ({ ...prev, skills: [...(prev.skills || []), { name: '', level: 'intermediate' }] })); setHasChanges(true); };
    const updateSkill = (index, field, value) => { setCV(prev => { const s = [...(prev.skills || [])]; s[index] = { ...s[index], [field]: value }; return { ...prev, skills: s }; }); setHasChanges(true); };
    const removeSkill = (index) => { setCV(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) })); setHasChanges(true); };

    const addLanguage = () => { setCV(prev => ({ ...prev, languages: [...(prev.languages || []), { name: '', level: 'intermediate' }] })); setHasChanges(true); };
    const updateLanguage = (index, field, value) => { setCV(prev => { const l = [...(prev.languages || [])]; l[index] = { ...l[index], [field]: value }; return { ...prev, languages: l }; }); setHasChanges(true); };
    const removeLanguage = (index) => { setCV(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) })); setHasChanges(true); };

    const addCertification = () => { setCV(prev => ({ ...prev, certifications: [...(prev.certifications || []), { id: Date.now(), name: '', issuer: '', date: '', credentialId: '' }] })); setHasChanges(true); };
    const updateCertification = (index, field, value) => { setCV(prev => { const c = [...(prev.certifications || [])]; c[index] = { ...c[index], [field]: value }; return { ...prev, certifications: c }; }); setHasChanges(true); };
    const removeCertification = (index) => { setCV(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) })); setHasChanges(true); };

    const addOrganization = () => { setCV(prev => ({ ...prev, organizations: [...(prev.organizations || []), { id: Date.now(), name: '', role: '', startDate: '', endDate: '' }] })); setHasChanges(true); };
    const updateOrganization = (index, field, value) => { setCV(prev => { const o = [...(prev.organizations || [])]; o[index] = { ...o[index], [field]: value }; return { ...prev, organizations: o }; }); setHasChanges(true); };
    const removeOrganization = (index) => { setCV(prev => ({ ...prev, organizations: prev.organizations.filter((_, i) => i !== index) })); setHasChanges(true); };

    const handleGenerateExperienceDescription = async (index) => {
        const exp = cv.experience?.[index];
        if (!exp?.position || !exp?.company) return alert('Enter position and company first');
        setCV(prev => { const e = [...prev.experience]; e[index] = { ...e[index], generating: true }; return { ...prev, experience: e }; });
        try {
            const res = await fetch('/api/ai/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: exp.position, keywords: `${exp.company}, ${exp.location || ''}`, experience: `${exp.position} at ${exp.company}`, type: 'experience_description' })
            });
            const data = await res.json();
            if (data.summary) updateExperience(index, 'description', data.summary);
        } catch (e) { } finally {
            setCV(prev => { const e = [...prev.experience]; e[index] = { ...e[index], generating: false }; return { ...prev, experience: e }; });
        }
    };

    if (loading || !cv) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icons.magic size={24} className="text-primary-600 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-neutral-900 mb-2">Syncing Your Career Blueprint</h2>
                <p className="text-neutral-500 font-medium">Preparing your OneKit 3.0 workspace...</p>
            </div>
        );
    }

    const currentTemplate = CV_TEMPLATES.find(t => t.id === cv.template_id) || CV_TEMPLATES[0];
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Icons.spinner className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!cv) return null;

    const photoStyle = cv.personal_info?.photo ? {
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
        transform: `translate(${cv.personal_info.photoPosition?.x || 0}px, ${cv.personal_info.photoPosition?.y || 0}px) scale(${cv.personal_info.photoZoom || 1}) rotate(${cv.personal_info.photoRotation || 0}deg)`
    } : {};

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Hidden Export Wrapper */}
            <div className="absolute -top-[9999px] -left-[9999px] w-0 h-0 overflow-hidden">
                <CVContent cv={cv} currentTemplate={currentTemplate} photoStyle={photoStyle} isExport={true} contentRef={exportRef} photoUploadPreview={photoUploadPreview} />
            </div>

            {/* OneKit 3.0: Absolute Workspace Header */}
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-neutral-200/50 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 lg:gap-6">
                    <button
                        onClick={() => router.push('/dashboard/cv-maker')}
                        className="group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 bg-white border border-neutral-200 rounded-2xl text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40 transition-all active:scale-95"
                    >
                        <Icons.back size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-8 w-px bg-neutral-200 hidden lg:block" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm lg:text-lg font-black text-neutral-900 truncate max-w-[120px] lg:max-w-[300px]">
                                {cv.name || 'Untitled Identity'}
                            </h1>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-500 ${saveStatus === 'saving' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                                saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    'bg-neutral-50 text-neutral-400 border-neutral-100 opacity-0 lg:opacity-100'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500' :
                                    saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-neutral-300'
                                    }`} />
                                <span>{saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Vaulted' : 'Synced'}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest hidden lg:block">Career Suite / Intellect Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <div className="flex lg:hidden bg-neutral-100 p-1 rounded-2xl border border-neutral-200/50">
                        <button onClick={() => setMobileView('edit')} className={`p-2 rounded-xl transition-all ${mobileView === 'edit' ? 'bg-white text-primary-600 shadow-md' : 'text-neutral-400'}`}><Icons.edit size={18} /></button>
                        <button onClick={() => setMobileView('preview')} className={`p-2 rounded-xl transition-all ${mobileView === 'preview' ? 'bg-white text-primary-600 shadow-md' : 'text-neutral-400'}`}><FileType size={18} /></button>
                    </div>
                    <div className="h-8 w-px bg-neutral-200 hidden lg:block" />
                    <div className="relative group/export">
                        <button
                            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs lg:text-sm shadow-xl shadow-neutral-900/10 active:scale-95 group"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            <Icons.download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                            <span className="hidden lg:inline">Dispatch Document</span>
                            <Icons.chevronDown size={14} className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-neutral-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                                <button onClick={downloadAsPDF} disabled={exporting} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 text-neutral-700 transition-colors text-left group/btn">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover/btn:scale-110 transition-transform"><Icons.pdf size={20} /></div>
                                    <div className="flex flex-col"><span className="text-sm font-bold">Export as PDF</span><span className="text-[10px] text-neutral-400 uppercase font-black">Institutional Standard</span></div>
                                    {exporting && <Icons.spinner size={16} className="ml-auto animate-spin text-primary-500" />}
                                </button>
                                <button onClick={downloadAsJPG} disabled={exporting} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 text-neutral-700 transition-colors text-left group/btn">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover/btn:scale-110 transition-transform"><Icons.jpg size={20} /></div>
                                    <div className="flex flex-col"><span className="text-sm font-bold">Export as Image</span><span className="text-[10px] text-neutral-400 uppercase font-black">Visual Portfolio</span></div>
                                    {exporting && <Icons.spinner size={16} className="ml-auto animate-spin text-primary-500" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden lg:h-[calc(100vh-80px)]">
                {/* OneKit 3.0: Section Navigation Sidebar */}
                <div className={`w-full lg:w-80 bg-white lg:border-r border-neutral-200/50 flex flex-col z-[40] transition-all duration-500 ${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
                        <div className="space-y-2">
                            {sectionOrder.map((sectionId) => {
                                const section = SECTIONS.find(s => s.id === sectionId) || SECTIONS[0];
                                return (
                                    <button
                                        key={sectionId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, sectionId)}
                                        onDragOver={(e) => handleDragOver(e, sectionId)}
                                        onDrop={(e) => handleDrop(e, sectionId)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setActiveSection(sectionId)}
                                        className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${activeSection === sectionId
                                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-xl shadow-neutral-900/10 active:scale-[0.98]'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent hover:border-neutral-100'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-all ${activeSection === sectionId ? 'bg-white/20' : 'bg-neutral-100 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                                            }`}>
                                            {section.icon}
                                        </div>
                                        <span className="flex-1 text-sm font-bold text-left">{section.label}</span>
                                        <div className={`opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 ${activeSection === sectionId ? 'text-white/40' : 'text-neutral-300'}`}>
                                            <Layout size={14} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-neutral-100 hidden lg:block">
                        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1">Career Intelligence</p>
                                <p className="text-[11px] text-primary-900/70 font-medium leading-relaxed">Drag sections to prioritize your professional narrative.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Perspective Container */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-neutral-50/50">
                    <div className="absolute inset-0 texture-noise opacity-[0.03] pointer-events-none" />
                    <div className={`flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-thin transition-all duration-500 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
                        <div className="max-w-3xl mx-auto space-y-8 pb-20">

                            {activeSection === 'personal' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-neutral-900 leading-tight">Identity Matrix</h2>
                                            <p className="text-sm text-neutral-400 font-medium">Define your professional core</p>
                                        </div>
                                    </div>

                                    <div className="mb-10 p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 overflow-hidden relative group/photo">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-6 ml-1">Profile Visual Identity</label>

                                        {photoUploadError && (
                                            <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3 animate-in zoom-in-95">
                                                <Icons.error size={16} />
                                                <span>{photoUploadError}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            {(cv.personal_info?.photo || photoUploadPreview) ? (
                                                <>
                                                    <div
                                                        onClick={() => !isUploadingPhoto && setIsPhotoStudioOpen(true)}
                                                        className="relative w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-premium-layered cursor-pointer group-hover/photo:scale-105 transition-transform duration-500"
                                                    >
                                                        <img
                                                            src={photoUploadPreview || cv.personal_info.photo}
                                                            alt="Identity"
                                                            style={photoStyle}
                                                            className="w-full h-full object-cover"
                                                            crossOrigin="anonymous"
                                                        />
                                                        {isUploadingPhoto ? (
                                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2 backdrop-blur-sm">
                                                                <Icons.spinner size={20} className="animate-spin" />
                                                                <span className="text-[9px] font-black tracking-tighter">UPLOADING</span>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                                                <Icons.edit size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                                        <button
                                                            onClick={() => setIsPhotoStudioOpen(true)}
                                                            className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm"
                                                        >
                                                            <Icons.edit size={16} />
                                                            <span>Calibrate Photo</span>
                                                        </button>
                                                        <button
                                                            onClick={removePhoto}
                                                            className="flex items-center justify-center gap-3 px-6 py-3 bg-red-50/50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <Icons.trash size={16} />
                                                            <span>Purge Image</span>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="relative w-full h-40 rounded-[32px] border-2 border-dashed border-neutral-200 bg-white hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center group/upload">
                                                    <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 group-hover/upload:bg-primary-100 group-hover/upload:text-primary-600 transition-all duration-500">
                                                        <Icons.upload size={24} />
                                                    </div>
                                                    <span className="mt-4 text-[10px] font-black tracking-widest text-neutral-400 group-hover/upload:text-primary-600 uppercase">Initialize Visual Identity</span>
                                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="e.g., Alexander Sterling"
                                                    value={cv.personal_info?.fullName || ''}
                                                    onChange={e => updatePersonalInfo('fullName', e.target.value)}
                                                />
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Professional Designation</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="e.g., Senior Systems Architect"
                                                    value={cv.personal_info?.jobTitle || ''}
                                                    onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
                                                />
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Dispatch Gateway (Email)</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="alexander@sterling.io"
                                                    value={cv.personal_info?.email || ''}
                                                    onChange={e => updatePersonalInfo('email', e.target.value)}
                                                />
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Voice Protocol (Phone)</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={cv.personal_info?.phone || ''}
                                                    onChange={e => updatePersonalInfo('phone', e.target.value)}
                                                />
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Physical Node (Location)</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="London, UK"
                                                    value={cv.personal_info?.location || ''}
                                                    onChange={e => updatePersonalInfo('location', e.target.value)}
                                                />
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Network Identity (LinkedIn)</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                    placeholder="linkedin.com/in/..."
                                                    value={cv.personal_info?.linkedin || ''}
                                                    onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                                                />
                                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Manifesto (Summary) */}
                            {activeSection === 'summary' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Career Manifesto</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your professional narrative summarized</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerateSummary}
                                            disabled={generatingSummary}
                                            className="group relative flex items-center gap-3 px-6 py-3 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-neutral-900/10 active:scale-95 disabled:opacity-50"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative flex items-center gap-3">
                                                {generatingSummary ? <Icons.spinner size={18} className="animate-spin" /> : <Icons.magic size={18} />}
                                                <span>{generatingSummary ? 'Synthesizing...' : 'AI Fabricate'}</span>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 ml-1">Narrative Content</label>
                                        <textarea
                                            className="w-full px-6 py-6 bg-neutral-50 border border-neutral-200 rounded-[28px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all min-h-[250px] leading-relaxed resize-none scrollbar-thin"
                                            placeholder="Write a high-impact summary of your professional journey..."
                                            value={cv.summary || ''}
                                            onChange={e => updateField('summary', e.target.value)}
                                        />
                                        <div className="absolute bottom-6 right-8 text-[10px] font-black text-neutral-300 tracking-widest uppercase">
                                            {cv.summary?.length || 0} Nodes
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-start gap-4 p-5 bg-primary-50/50 rounded-2xl border border-primary-100">
                                        <Info size={18} className="text-primary-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-primary-900/60 font-medium leading-relaxed">
                                            Focus on results-driven language. Mention specific technologies and high-impact projects to capture ATS and recruiter attention immediately.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Experience Timeline */}
                            {activeSection === 'experience' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Experience History</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your professional trajectory</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addExperience}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-600/20 active:scale-95 group"
                                        >
                                            <Icons.plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Milestone</span>
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {(cv.experience || []).map((e, idx) => (
                                            <div
                                                key={e.id}
                                                className="relative group/exp animate-in zoom-in-98 duration-500"
                                            >
                                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-neutral-100 rounded-full group-hover/exp:bg-primary-200 transition-colors" />

                                                <div className="bg-neutral-50/50 rounded-[32px] p-8 border border-neutral-100 group-hover/exp:bg-white group-hover/exp:shadow-xl group-hover/exp:border-primary-100 transition-all duration-500 relative">
                                                    <button
                                                        onClick={() => removeExperience(idx)}
                                                        className="absolute top-6 right-6 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/exp:opacity-100"
                                                    >
                                                        <Icons.trash size={18} />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Entity / Organization</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="e.g., Google Alpha"
                                                                value={e.company}
                                                                onChange={v => updateExperience(idx, 'company', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Operational Role</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="e.g., Senior Lead Engineer"
                                                                value={e.position}
                                                                onChange={v => updateExperience(idx, 'position', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Activation Date</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="Month Year"
                                                                value={e.startDate}
                                                                onChange={v => updateExperience(idx, 'startDate', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Departure Date</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="Present or Month Year"
                                                                value={e.endDate}
                                                                onChange={v => updateExperience(idx, 'endDate', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2 space-y-2 relative">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Impact Description</label>
                                                            <textarea
                                                                className="w-full px-6 py-6 bg-white border border-neutral-200 rounded-[24px] text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all min-h-[160px] resize-none leading-relaxed scrollbar-thin"
                                                                placeholder="Detail your responsibilities and core achievements..."
                                                                value={e.description}
                                                                onChange={v => updateExperience(idx, 'description', v.target.value)}
                                                            />
                                                            <button
                                                                onClick={() => handleGenerateExperienceDescription(idx)}
                                                                disabled={generatingExpDesc === idx}
                                                                className="absolute top-10 right-4 flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl transition-all font-bold text-[10px] shadow-lg disabled:opacity-50"
                                                            >
                                                                {generatingExpDesc === idx ? <Icons.spinner size={14} className="animate-spin" /> : <Icons.magic size={14} />}
                                                                <span>AI AUGMENT</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!cv.experience || cv.experience.length === 0) && (
                                            <div className="py-20 flex flex-col items-center justify-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-neutral-200 shadow-sm mb-6">
                                                    <Briefcase size={40} />
                                                </div>
                                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">No Milestones Recorded</h3>
                                                <p className="text-xs text-neutral-400 mt-2 font-medium">Add your first professional milestone to begin.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* Education Matrix */}
                            {activeSection === 'education' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Education Matrix</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your academic foundations</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addEducation}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-600/20 active:scale-95 group"
                                        >
                                            <Icons.add size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Foundation</span>
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {(cv.education || []).map((edu, idx) => (
                                            <div
                                                key={edu.id}
                                                className="relative group/edu animate-in zoom-in-98 duration-500"
                                            >
                                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-neutral-100 rounded-full group-hover/edu:bg-primary-200 transition-colors" />

                                                <div className="bg-neutral-50/50 rounded-[24px] p-6 border border-neutral-100 group-hover/edu:bg-white group-hover/edu:shadow-xl group-hover/edu:border-primary-100 transition-all duration-500 relative">
                                                    <button
                                                        onClick={() => removeEducation(idx)}
                                                        className="absolute top-6 right-6 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/edu:opacity-100"
                                                    >
                                                        <Icons.trash size={18} />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Academic Institution</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="Stanford University"
                                                                value={edu.institution}
                                                                onChange={v => updateEducation(idx, 'institution', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Degree / Certification</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="e.g., M.Sc in Artificial Intelligence"
                                                                value={edu.degree}
                                                                onChange={v => updateEducation(idx, 'degree', v.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Graduation Date</label>
                                                            <input
                                                                className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="e.g. 2023"
                                                                value={edu.endDate}
                                                                onChange={v => updateEducation(idx, 'endDate', v.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!cv.education || cv.education.length === 0) && (
                                            <div className="py-20 flex flex-col items-center justify-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-neutral-200 shadow-sm mb-6">
                                                    <GraduationCap size={40} />
                                                </div>
                                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">No Foundations Added</h3>
                                                <p className="text-xs text-neutral-400 mt-2 font-medium">Record your academic foundations to begin.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills Matrix */}
                            {activeSection === 'skills' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Capabilities</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your professional toolkit</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addSkill}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-600/20 active:scale-95 group"
                                        >
                                            <Icons.add size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Capability</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(cv.skills || []).map((skill, idx) => (
                                            <div
                                                key={idx}
                                                className="group/skill flex items-center gap-4 bg-neutral-50/50 hover:bg-white border border-neutral-100 hover:border-primary-100 hover:shadow-xl p-4 rounded-2xl transition-all duration-300"
                                            >
                                                <div className="flex-1">
                                                    <input
                                                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-neutral-900 placeholder:text-neutral-300"
                                                        value={skill.name}
                                                        onChange={v => updateSkill(idx, 'name', v.target.value)}
                                                        placeholder="Skill (e.g., React.js)"
                                                    />
                                                </div>
                                                <select
                                                    className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer"
                                                    value={skill.level}
                                                    onChange={v => updateSkill(idx, 'level', v.target.value)}
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                    <option value="Expert">Expert</option>
                                                </select>
                                                <button
                                                    onClick={() => removeSkill(idx)}
                                                    className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/skill:opacity-100"
                                                >
                                                    <Icons.close size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {(cv.skills || []).length === 0 && (
                                            <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">No Capabilities Listed</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Linguistic Frameworks */}
                            {activeSection === 'languages' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Languages size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Linguistic Frameworks</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your communication protocols</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addLanguage}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-500/20 active:scale-95 group"
                                        >
                                            <Icons.add size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Protocol</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(cv.languages || []).map((lang, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-neutral-50/50 p-5 rounded-[20px] border border-neutral-100 transition-all hover:bg-white hover:shadow-xl hover:border-primary-100 group/lang"
                                            >
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 mb-2 block">Language</label>
                                                    <input
                                                        className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                        placeholder="e.g., English, Kurdish, Arabic"
                                                        value={lang.name}
                                                        onChange={v => updateLanguage(idx, 'name', v.target.value)}
                                                    />
                                                </div>
                                                <div className="w-full md:w-64">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 mb-2 block">Proficiency Level</label>
                                                    <select
                                                        className="w-full px-5 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all cursor-pointer appearance-none"
                                                        value={lang.level}
                                                        onChange={v => updateLanguage(idx, 'level', v.target.value)}
                                                    >
                                                        <option value="Native">Native Speaker</option>
                                                        <option value="Fluent">Full Professional Fluency</option>
                                                        <option value="Advanced">Advanced Proficiency</option>
                                                        <option value="Intermediate">Intermediate Proficiency</option>
                                                        <option value="Basic">Basics / Foundations</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => removeLanguage(idx)}
                                                    className="p-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-end md:self-auto mt-6 md:mt-0 opacity-0 group-hover/lang:opacity-100"
                                                >
                                                    <Icons.trash size={18} />
                                                </button>
                                            </div>
                                        ))}

                                        {(cv.languages || []).length === 0 && (
                                            <div className="py-20 flex flex-col items-center justify-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200 text-center">
                                                <p className="text-sm font-black text-neutral-900 uppercase tracking-widest">No Linguistic Protocols Defined</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Credentials & Certifications */}
                            {activeSection === 'certifications' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Credentials</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Verify your expertise</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addCertification}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-500/20 active:scale-95 group"
                                        >
                                            <Icons.add size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Credential</span>
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {(cv.certifications || []).map((cert, idx) => (
                                            <div
                                                key={idx}
                                                className="relative p-6 rounded-[24px] border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all duration-500 group/cert animate-in zoom-in-98 duration-500"
                                            >
                                                <button
                                                    onClick={() => removeCertification(idx)}
                                                    className="absolute top-6 right-6 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/cert:opacity-100"
                                                >
                                                    <Icons.trash size={18} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="md:col-span-2 space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Certification Name</label>
                                                        <input
                                                            className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                            placeholder="e.g. AWS Certified Solutions Architect"
                                                            value={cert.name}
                                                            onChange={v => updateCertification(idx, 'name', v.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Issuing Organization</label>
                                                        <input
                                                            className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                            placeholder="e.g. Amazon Web Services"
                                                            value={cert.issuer}
                                                            onChange={v => updateCertification(idx, 'issuer', v.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Issue Date</label>
                                                        <input
                                                            className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                            placeholder="Month Year"
                                                            value={cert.date}
                                                            onChange={v => updateCertification(idx, 'date', v.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(!cv.certifications || cv.certifications.length === 0) && (
                                        <div className="py-20 flex flex-col items-center justify-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200 text-center">
                                            <p className="text-sm font-black text-neutral-900 uppercase tracking-widest">No Credentials Recorded</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Professional Guilds & Organizations */}
                            {activeSection === 'organizations' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Professional Guilds</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Your industry affiliations</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={addOrganization}
                                            className="flex items-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all font-bold text-xs shadow-xl shadow-primary-500/20 active:scale-95 group"
                                        >
                                            <Icons.add size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                            <span>Add Guild</span>
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {(cv.organizations || []).map((org, idx) => (
                                            <div
                                                key={idx}
                                                className="relative p-6 rounded-[24px] border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all duration-500 group/org animate-in zoom-in-98 duration-500"
                                            >
                                                <button
                                                    onClick={() => removeOrganization(idx)}
                                                    className="absolute top-6 right-6 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/org:opacity-100"
                                                >
                                                    <Icons.trash size={18} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Organization Name</label>
                                                        <input
                                                            className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                            placeholder="e.g. IEEE, Toastmasters"
                                                            value={org.name}
                                                            onChange={v => updateOrganization(idx, 'name', v.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Your Role</label>
                                                        <input
                                                            className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                            placeholder="e.g. Member, Lead Architect"
                                                            value={org.role}
                                                            onChange={v => updateOrganization(idx, 'role', v.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Participation Period</label>
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                className="flex-1 px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="Start"
                                                                value={org.startDate}
                                                                onChange={v => updateOrganization(idx, 'startDate', v.target.value)}
                                                            />
                                                            <span className="text-neutral-300 font-bold">—</span>
                                                            <input
                                                                className="flex-1 px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-50 transition-all"
                                                                placeholder="Present or End"
                                                                value={org.endDate}
                                                                onChange={v => updateOrganization(idx, 'endDate', v.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {(!cv.organizations || cv.organizations.length === 0) && (
                                        <div className="py-20 flex flex-col items-center justify-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200 text-center">
                                            <p className="text-sm font-black text-neutral-900 uppercase tracking-widest">No Guild Affiliations Record</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Visuals & Identity Systems */}
                            {activeSection === 'design' && (
                                <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-premium-layered border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                                <Palette size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-neutral-900 leading-tight">Visuals & Branding</h2>
                                                <p className="text-xs text-neutral-400 font-medium">Calibrate your document's aesthetic</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAIStylist}
                                            disabled={generatingStyle}
                                            className="flex items-center gap-3 px-6 py-3 bg-white border border-neutral-200 hover:border-primary-200 hover:bg-primary-50 text-neutral-700 hover:text-primary-600 rounded-2xl transition-all font-bold text-xs shadow-xl shadow-neutral-200/40 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generatingStyle ? <Icons.spinner size={18} className="animate-spin text-primary-500" /> : <Icons.magic size={18} className="group-hover:rotate-12 transition-transform text-primary-500" />}
                                            <span>AI STYLIST</span>
                                        </button>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Blueprint Architecture</label>
                                            <button
                                                onClick={() => setShowTemplates(true)}
                                                className="w-full flex items-center justify-between p-6 rounded-[24px] border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-16 h-20 bg-white rounded-xl shadow-premium-layered border border-neutral-100 overflow-hidden flex flex-col p-1.5 gap-1">
                                                            <div className="h-2 w-full rounded-sm" style={{ background: currentTemplate.colors.primary }} />
                                                            <div className="h-1 w-1/2 bg-neutral-100 rounded-px" />
                                                            <div className="space-y-0.5">
                                                                <div className="h-0.5 w-full bg-neutral-50" />
                                                                <div className="h-0.5 w-full bg-neutral-50" />
                                                                <div className="h-0.5 w-3/4 bg-neutral-50" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                                                            <Icons.success size={10} />
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block text-lg font-black text-neutral-900 leading-tight mb-1">{currentTemplate.name}</span>
                                                        <span className="block text-xs text-neutral-400 font-medium">Architecture optimized for visibility</span>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all">Change Template</div>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 rounded-[24px] border border-neutral-100 bg-neutral-50/50 space-y-4">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Primary Color Palette</label>
                                                <div className="flex items-center gap-6">
                                                    <div className="relative group/picker cursor-pointer w-16 h-16">
                                                        <input
                                                            type="color"
                                                            value={cv.custom_colors?.primary || '#2563eb'}
                                                            onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, primary: e.target.value } })}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div
                                                            className="absolute inset-0 rounded-2xl shadow-xl border-4 border-white group-hover/picker:scale-110 group-hover/picker:rotate-3 transition-all duration-300"
                                                            style={{ background: cv.custom_colors?.primary || '#2563eb' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="block font-mono text-lg font-black text-neutral-900 uppercase tracking-tighter">{cv.custom_colors?.primary || '#2563eb'}</span>
                                                        <span className="block text-xs text-neutral-400 font-medium">Core brand highlight</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-[24px] border border-neutral-100 bg-neutral-50/50 space-y-4">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Accent Highlight</label>
                                                <div className="flex items-center gap-6">
                                                    <div className="relative group/picker cursor-pointer w-16 h-16">
                                                        <input
                                                            type="color"
                                                            value={cv.custom_colors?.accent || '#eff6ff'}
                                                            onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, accent: e.target.value } })}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div
                                                            className="absolute inset-0 rounded-2xl shadow-xl border-4 border-white group-hover/picker:scale-110 group-hover/picker:rotate-3 transition-all duration-300"
                                                            style={{ background: cv.custom_colors?.accent || '#eff6ff' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="block font-mono text-lg font-black text-neutral-900 uppercase tracking-tighter">{cv.custom_colors?.accent || '#eff6ff'}</span>
                                                        <span className="block text-xs text-neutral-400 font-medium">Subtle depth support</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-6 rounded-[24px] bg-primary-50/50 border border-primary-100/50 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 shrink-0">
                                            <Icons.magic size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-primary-900 uppercase tracking-widest mb-1">AI Architect Logic</p>
                                            <p className="text-xs text-primary-700/80 leading-relaxed font-medium">
                                                Use the AI Stylist to automatically picks colors and templates that match your industry and personal branding.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Side */}
                        <div
                            className={`bg-slate-100/50 backdrop-blur-sm rounded-3xl p-4 lg:p-10 overflow-auto relative min-h-[calc(100vh-160px)] flex justify-center items-start transition-all duration-500 border border-neutral-100 ${mobileView === 'edit' ? 'hidden lg:flex' : 'flex'}`}
                            ref={containerRef}
                        >
                            <div
                                className="bg-white shadow-2xl origin-top transition-transform duration-300 ease-out hover:shadow-primary-500/10"
                                style={{
                                    transform: `scale(${previewScale})`,
                                    width: '794px', // A4 aspect ratio base width
                                }}
                            >
                                <CVContent
                                    cv={cv}
                                    currentTemplate={currentTemplate}
                                    photoStyle={photoStyle}
                                    contentRef={previewRef}
                                    photoUploadPreview={photoUploadPreview}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Template Selection Overlay */}
                    {showTemplates && (
                        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-2xl flex items-center justify-center z-[1000] p-4 lg:p-8 animate-in fade-in duration-500">
                            <div
                                className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500 border border-white/20"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="px-12 py-10 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 group-hover:rotate-6 transition-all duration-500">
                                            <img src="/onekit-logo.png" alt="OneKit" className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-black text-neutral-900 tracking-tighter italic">Career Studio</h2>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-neutral-900/20">
                                            <Palette size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">Blueprint Selection</h3>
                                            <p className="text-sm text-neutral-400 mt-2 font-medium">Select a high-fidelity architecture for your career narrative</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowTemplates(false)}
                                        className="w-14 h-14 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 rounded-full transition-all flex items-center justify-center group"
                                    >
                                        <Icons.close size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/* Modal Content - Grid of Premium Blueprints */}
                                <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide bg-neutral-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {CV_TEMPLATES.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => changeTemplate(t.id)}
                                                className={`group cursor-pointer rounded-[32px] border-2 transition-all duration-500 overflow-hidden relative flex flex-col ${cv.template_id === t.id
                                                    ? 'border-primary-500 bg-white shadow-2xl scale-[1.02] z-10'
                                                    : 'border-transparent bg-white/50 hover:bg-white hover:border-neutral-200 hover:shadow-xl hover:-translate-y-2'
                                                    }`}
                                            >
                                                {/* Blueprint Card Visual */}
                                                <div className="aspect-[3/4.2] p-6 relative overflow-hidden bg-neutral-50 group-hover:bg-neutral-100/50 transition-colors">
                                                    <div className="absolute inset-0 bg-texture-noise opacity-[0.03] pointer-events-none" />

                                                    {/* Miniature Architecture Preview */}
                                                    <div className="w-full h-full bg-white rounded-xl shadow-premium-layered border border-neutral-200/50 overflow-hidden flex flex-col animate-pulse-subtle">
                                                        <div className="h-4 w-full" style={{ background: t.colors.primary }} />
                                                        <div className="p-4 space-y-3">
                                                            <div className="h-3 w-2/3 bg-neutral-100 rounded-full" />
                                                            <div className="space-y-1.5 pt-2">
                                                                <div className="h-1.5 w-full bg-neutral-50 rounded-full" />
                                                                <div className="h-1.5 w-full bg-neutral-50 rounded-full" />
                                                                <div className="h-1.5 w-5/6 bg-neutral-50 rounded-full" />
                                                            </div>
                                                            <div className="pt-4 grid grid-cols-3 gap-2">
                                                                <div className="h-10 bg-neutral-50 rounded-lg" />
                                                                <div className="h-10 bg-neutral-50 rounded-lg" />
                                                                <div className="h-10 bg-neutral-50 rounded-lg" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Selection Glow */}
                                                    {cv.template_id === t.id && (
                                                        <div className="absolute inset-0 bg-primary-500/5 border-4 border-primary-500/50 rounded-inherit" />
                                                    )}
                                                </div>

                                                {/* Blueprint Labeling */}
                                                <div className="p-6 flex justify-between items-center bg-white border-t border-neutral-100">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-black text-neutral-900 leading-none mb-1">{t.name}</h4>
                                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t.description}</p>
                                                    </div>
                                                    {cv.template_id === t.id && (
                                                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                                                            <Icons.success size={18} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* RTL Framework Indicator */}
                                                {t.rtl && (
                                                    <div className="absolute top-4 right-4 bg-neutral-900 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-2xl uppercase tracking-widest z-20">RTL SUPPORT</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Modal Action Tray */}
                                <div className="px-12 py-8 border-t border-neutral-100 bg-white flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
                                        <Icons.magic size={16} />
                                        <span>All templates automatically adopt your custom identity matrix.</span>
                                    </div>
                                    <button
                                        onClick={() => setShowTemplates(false)}
                                        className="px-12 py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-black text-sm shadow-2xl hover:shadow-neutral-900/30 active:scale-95"
                                    >
                                        APPLY ARCHITECTURE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <Dialog open={isPhotoStudioOpen} onOpenChange={setIsPhotoStudioOpen}>
                        <DialogContent className="max-w-xl rounded-[40px] p-0 overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <DialogHeader className="px-10 pt-10 pb-6 text-center">
                                <DialogTitle className="text-xl font-black text-neutral-900 leading-tight">Photo Studio</DialogTitle>
                                <DialogDescription className="text-xs text-neutral-500 mt-2 font-medium">Perfect your profile picture for a professional look</DialogDescription>
                            </DialogHeader>

                            {/* Studio Content */}
                            <div className="px-10 pb-10 flex flex-col gap-8 items-center">
                                {/* Preview Circle */}
                                <div className="relative group">
                                    <div
                                        className={`w-64 h-64 rounded-full overflow-hidden border-8 border-neutral-50 shadow-2xl relative transition-all duration-300 ${isDragging ? 'cursor-grabbing scale-[1.02] shadow-primary-500/20' : 'cursor-grab hover:scale-[1.01]'}`}
                                        onMouseDown={handlePhotoMouseDown}
                                        onTouchStart={handlePhotoTouchStart}
                                    >
                                        <img
                                            src={photoUploadPreview || cv.personal_info.photo}
                                            alt="Profile"
                                            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                                            style={{
                                                transform: `translate(${studioPhotoPosition.x}px, ${studioPhotoPosition.y}px) scale(${photoZoom}) rotate(${photoRotation}deg)`,
                                            }}
                                            crossOrigin="anonymous"
                                        />
                                        {/* Overlay Grid/Guide */}
                                        <div className="absolute inset-0 border border-white/20 rounded-full pointer-events-none" />
                                    </div>

                                    {/* Reposition Tip */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border border-neutral-100 flex items-center gap-2 animate-bounce">
                                        <Icons.magic size={12} className="text-primary-500" />
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Drag to Reposition</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="w-full space-y-10 mt-4">
                                    {/* Zoom Control */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <Maximize2 size={16} className="text-neutral-400" />
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Architectural Scale</label>
                                            </div>
                                            <span className="text-sm font-black text-primary-600 bg-primary-50 px-4 py-1.5 rounded-xl border border-primary-100/50">{Math.round(photoZoom * 100)}%</span>
                                        </div>
                                        <div className="relative flex items-center h-10 px-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="3"
                                                step="0.01"
                                                value={photoZoom}
                                                onChange={e => setPhotoZoom(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Rotation Control */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <RotateCw size={16} className="text-neutral-400" />
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Angular Alignment</label>
                                            </div>
                                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100/50">{photoRotation}°</span>
                                        </div>
                                        <div className="relative flex items-center h-10 px-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                step="1"
                                                value={photoRotation}
                                                onChange={e => setPhotoRotation(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Tray */}
                                <div className="w-full flex gap-4 mt-10">
                                    <DialogClose asChild>
                                        <button
                                            onClick={() => setPhotoUploadPreview(null)}
                                            className="flex-1 px-8 py-5 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-[24px] transition-all font-black text-xs uppercase tracking-widest border border-neutral-200/50"
                                        >
                                            Abort
                                        </button>
                                    </DialogClose>
                                    <button
                                        onClick={applyPhotoEdits}
                                        className="flex-[2] px-8 py-5 bg-neutral-900 hover:bg-black text-white rounded-[24px] transition-all font-black text-xs uppercase tracking-widest shadow-2xl shadow-neutral-900/20 active:scale-95"
                                    >
                                        COMMIT TO IDENTITY
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </div>
    );
}


