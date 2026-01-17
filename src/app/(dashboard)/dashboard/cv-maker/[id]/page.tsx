// @ts-nocheck
'use client';

import { use, useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { CVPDF } from '@/components/pdf/CVPDF';
import { PDFDownloadButton } from '@/components/ui/PDFDownloadButton';
import { useRouter } from 'next/navigation';
import { useCV } from '@/lib/hooks/useCV';
import { useAuth } from '@/components/auth/AuthProvider';
import { useImageUpload } from '@/lib/hooks/useImageUpload';

import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Globe,
    FileText,
    Image as ImageIcon,
    Plus,
    X,
    Download,
    Wand2,
    Loader2,
    ArrowLeft,
    Upload,
    ChevronDown,
    User,
    CheckCircle,
    AlertCircle,
    RotateCcw,
    RotateCw
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import './cv-templates.css';



// Premium CV Templates - 20 Designs
const CV_TEMPLATES = [
    { id: 'professional', name: 'Professional', description: 'Clean & Modern', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#2563eb', accent: '#eff6ff' } },
    { id: 'milano', name: 'Milano', description: 'Modern Minimalist', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#0f172a', accent: '#f1f5f9' } },
    { id: 'sydney', name: 'Sydney', description: 'Creative Two-Column', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#6366f1', accent: '#4f46e5' } },
    { id: 'london', name: 'London', description: 'Executive Classic', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#1e3a5f', accent: '#f8fafc' } },
    { id: 'paris', name: 'Paris', description: 'Elegant Serif', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#be185d', accent: '#fdf2f8' } },
    { id: 'berlin', name: 'Berlin', description: 'Bold Industrial', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#dc2626', accent: '#fef2f2' } },
    { id: 'vienna', name: 'Vienna', description: 'Classic Formal', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#059669', accent: '#ecfdf5' } },
    { id: 'amsterdam', name: 'Amsterdam', description: 'Creative Orange', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#ea580c', accent: '#fff7ed' } },
    { id: 'stockholm', name: 'Stockholm', description: 'Scandinavian Clean', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#64748b', accent: '#f8fafc' } },
    { id: 'barcelona', name: 'Barcelona', description: 'Warm Creative', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#b91c1c', accent: '#fef2f2' } },
    { id: 'oslo', name: 'Oslo', description: 'Minimalist Blue', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#0369a1', accent: '#f0f9ff' } },
    { id: 'rome', name: 'Rome', description: 'Serif Classic', hasPhoto: true, baseTemplate: 'london', colors: { primary: '#7f1d1d', accent: '#fff7ed' } },
    { id: 'lisbon', name: 'Lisbon', description: 'Creative Teal', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#0f766e', accent: '#f0fdfa' } },
    { id: 'dublin', name: 'Dublin', description: 'Tech Green', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#15803d', accent: '#f0fdf4' } },
    { id: 'vancouver', name: 'Vancouver', description: 'Soft Academic', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#365314', accent: '#f7fee7' } },
    { id: 'shanghai', name: 'Shanghai', description: 'Modern Red', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#be123c', accent: '#fff1f2' } },
    { id: 'helsinki', name: 'Helsinki', description: 'Ice Blue', hasPhoto: true, baseTemplate: 'milano', colors: { primary: '#1d4ed8', accent: '#eff6ff' } },
    { id: 'tokyo', name: 'Tokyo', description: 'Tech Dark Mode', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#3b82f6', accent: '#0f172a' } },
    { id: 'dubai', name: 'Dubai', description: 'Premium Elegant', hasPhoto: true, baseTemplate: 'dubai', colors: { primary: '#d4af37', accent: '#1a1a2e' } },
    { id: 'newyork', name: 'New York', description: 'Bold Dark', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#f97316', accent: '#18181b' } },
    { id: 'singapore', name: 'Singapore', description: 'Modern Dark', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#22d3ee', accent: '#0c4a6e' } },
    { id: 'seoul', name: 'Seoul', description: 'K-Style Neon', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#ec4899', accent: '#1e1b4b' } },
    { id: 'toronto_dark', name: 'Toronto Dark', description: 'Deep Charcoal', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#06b6d4', accent: '#0f172a' } },
    { id: 'paris_dark', name: 'Paris Dark', description: 'Night Rose', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#fb7185', accent: '#190a19' } },
    { id: 'tokyo_neon', name: 'Tokyo Neon', description: 'Cyber Neon', hasPhoto: true, baseTemplate: 'tokyo', colors: { primary: '#00ffcc', accent: '#05051a' } },
    { id: 'zurich', name: 'Zurich', description: 'Swiss Design', hasPhoto: false, baseTemplate: 'milano', colors: { primary: '#000000', accent: '#ffffff' } },
    { id: 'moscow', name: 'Moscow', description: 'Bold Statement', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#7c3aed', accent: '#faf5ff' } },
    { id: 'toronto', name: 'Toronto', description: 'Fresh Modern', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#0891b2', accent: '#ecfeff' } },
    { id: 'sydney_dark', name: 'Sydney Dark', description: 'Creative Dark', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#a855f7', accent: '#1e1b4b' } },
    { id: 'miami', name: 'Miami', description: 'Vibrant Gradient', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#f472b6', accent: '#0ea5e9' } },
    { id: 'cairo', name: 'Cairo', description: 'Golden Sand', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#b45309', accent: '#fffbeb' } },
    { id: 'sanfrancisco', name: 'S.F. Startup', description: 'Startup Bold', hasPhoto: true, baseTemplate: 'professional', colors: { primary: '#4f46e5', accent: '#eef2ff' } },
    // Kurdish & Arabic RTL Templates
    { id: 'erbil', name: 'ھەولێر', description: 'Kurdish Orange', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#ea580c', accent: '#1a1a1a' }, rtl: true },
    { id: 'sulaymaniyah', name: 'سلێمانی', description: 'Kurdish Blue', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#1e3a8a', accent: '#facc15' }, rtl: true },
    { id: 'baghdad', name: 'بەغداد', description: 'Arabic Navy', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#0c4a6e', accent: '#f8fafc' }, rtl: true },
    { id: 'duhok', name: 'دهۆک', description: 'Kurdish Green', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#166534', accent: '#fbbf24' }, rtl: true },
    { id: 'riyadh', name: 'الرياض', description: 'Arabic Gold', hasPhoto: true, baseTemplate: 'sydney', colors: { primary: '#292524', accent: '#d4af37' }, rtl: true },
];

const SECTIONS = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
    { id: 'organizations', label: 'Organizations', icon: '🤝' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'design', label: 'Design', icon: '🎨' },
];

const Icons = {
    email: Mail,
    phone: Phone,
    location: MapPin,
    linkedin: Linkedin,
    website: Globe,
    pdf: FileText,
    jpg: ImageIcon,
    add: Plus,
    close: X,
    download: Download,
    magic: Wand2,
    spinner: Loader2,
    back: ArrowLeft,
    upload: Upload,
    chevronDown: ChevronDown,
    User: User,
    success: CheckCircle,
    error: AlertCircle,
    rotateCw: RotateCw,
};


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
                        <h3>{currentTemplate.baseTemplate === 'sydney' ? 'About Me' : 'Summary'}</h3>
                        <p>{cv.summary}</p>
                    </div>
                );
            case 'experience':
                return cv.experience?.length > 0 && (
                    <div className="cvSection" key="experience">
                        <h3>Experience</h3>
                        {cv.experience.map((exp, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{exp.position || 'Position'}</strong>
                                    <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                                </div>
                                <p className="company">{exp.company}</p>
                                {exp.description && <p>{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                );
            case 'education':
                return cv.education?.length > 0 && (
                    <div className="cvSection" key="education">
                        <h3>Education</h3>
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
                        <h3>Skills</h3>
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
                        <h3>Languages</h3>
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
                        <h3>Certifications</h3>
                        {cv.certifications.map((cert, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{cert.name}</strong>
                                    <span>{cert.date}</span>
                                </div>
                                <p>{cert.issuer}{cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'organizations':
                return cv.organizations?.length > 0 && (
                    <div className="cvSection" key="organizations">
                        <h3>Organizations</h3>
                        {cv.organizations.map((org, i) => (
                            <div key={i} className="cvItem">
                                <div className="cvItemHeader">
                                    <strong>{org.name}</strong>
                                    <span>{org.startDate} - {org.endDate || 'Present'}</span>
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
                ...(isExport ? { transform: 'none', width: '794px', height: 'auto', fontSize: '12px' } : {})
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
                        <div className="sidebarName">{cv.personal_info?.fullName || 'Your Name'}</div>
                        <div className="sidebarTitle">{cv.personal_info?.jobTitle || 'Job Title'}</div>

                        <div className="sidebarSection">
                            <h4>Contact</h4>
                            <div className="contactList">
                                {cv.personal_info?.email && <div className="contactItem"><span className="icon"><Icons.email /></span> {cv.personal_info.email}</div>}
                                {cv.personal_info?.phone && <div className="contactItem"><span className="icon"><Icons.phone /></span> {cv.personal_info.phone}</div>}
                                {cv.personal_info?.location && <div className="contactItem"><span className="icon"><Icons.location /></span> {cv.personal_info.location}</div>}
                                {cv.personal_info?.linkedin && <div className="contactItem"><span className="icon"><Icons.linkedin /></span> {cv.personal_info.linkedin}</div>}
                            </div>
                        </div>

                        {/* Order-aware Sidebar Sections (Skills/Languages usually sidebar in Sydney) */}
                        {order.map(id => (id === 'skills' || id === 'languages') && renderSection(id))}
                    </div>
                    <div className="cvMain">
                        {/* Order-aware Main Sections (Excluding personal, design, and sidebar items) */}
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
                            <h1>{cv.personal_info?.fullName || 'Your Name'}</h1>
                            <p className="jobTitle">{cv.personal_info?.jobTitle || 'Job Title'}</p>
                            <div className="contactInfo">
                                {cv.personal_info?.email && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.email /></span>
                                        <span>{cv.personal_info.email}</span>
                                    </div>
                                )}
                                {cv.personal_info?.phone && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.phone /></span>
                                        <span>{cv.personal_info.phone}</span>
                                    </div>
                                )}
                                {cv.personal_info?.location && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.location /></span>
                                        <span>{cv.personal_info.location}</span>
                                    </div>
                                )}
                                {cv.personal_info?.linkedin && (
                                    <div className="contactItem">
                                        <span className="icon"><Icons.linkedin /></span>
                                        <span>{cv.personal_info.linkedin}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order-aware Sections (All except personal and design) */}
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
    const containerRef = useRef(null);
    const previewRef = useRef(null);
    const exportRef = useRef(null);
    const photoRef = useRef(null);

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
    const isMounted = useRef(true);

    const updateScale = useCallback(() => {
        if (!containerRef.current || !previewRef.current) return;
        const container = containerRef.current;
        const preview = previewRef.current;

        const padding = 40;
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

    const [styleRationale, setStyleRationale] = useState('');
    const [refiningExperience, setRefiningExperience] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

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

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

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

                // Extract nested data if it exists (for database compatibility)
                if (data.personal_info?.nested_data) {
                    data.summary = data.personal_info.nested_data.summary || data.summary;
                    data.custom_colors = data.personal_info.nested_data.custom_colors || data.custom_colors;
                }

                setCV(data);
                // Set section order from database, or use default if not present
                if (data.section_order && Array.isArray(data.section_order) && data.section_order.length > 0) {
                    setSectionOrder(data.section_order);
                }
                // If no section_order in database, keep the default initial state

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

    const handleSave = useCallback(async () => {
        if (!cv || !isMounted.current) return;
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
        } catch (err) {
            console.error('Save Error:', err);
        }
    }, [cv, id, updateCV, sectionOrder]);

    useEffect(() => {
        // Block auto-save while uploading photo to prevent blob URL persistence
        if (!hasChanges || !cv || isUploadingPhoto) return;
        const timeoutId = setTimeout(() => handleSave(), 2500);
        return () => clearTimeout(timeoutId);
    }, [cv, hasChanges, handleSave, isUploadingPhoto]);

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
        console.log(`🔍 updateField called: ${field} =`, value);
        setCV(prev => {
            const updated = { ...prev, [field]: value };
            console.log('📝 Updated CV state:', updated);
            return updated;
        });
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

        // Reset any previous errors
        setPhotoUploadError(null);
        setIsUploadingPhoto(true);

        try {
            // Create blob URL for immediate preview (DO NOT save to cv state)
            const localPreview = URL.createObjectURL(file);
            setPhotoUploadPreview(localPreview);
            setIsPhotoStudioOpen(true);

            // Upload optimized image to R2
            const publicUrl = await uploadImage(file, { folder: 'cv-photos', type: 'photo' });

            if (publicUrl) {
                // Success: Update with permanent R2 URL
                updatePersonalInfo('photo', publicUrl);
                setPhotoUploadPreview(null); // Clear preview
                setHasChanges(true);

                // Clean up blob URL
                URL.revokeObjectURL(localPreview);
            } else {
                // Upload failed
                throw new Error('Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            setPhotoUploadError(error.message || 'Failed to upload photo');
            setPhotoUploadPreview(null);
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

        // Delete from R2 if it's an R2 URL
        if (photoUrl?.includes('r2.dev')) {
            try {
                await fetch('/api/upload/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: photoUrl }),
                });
            } catch (e) {
                console.error('Failed to delete photo from R2:', e);
            }
        }

        updatePersonalInfo('photo', null);
        setHasChanges(true);
    };


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

    // Touch event handlers for mobile
    const handlePhotoTouchStart = (e) => {
        if (!cv?.personal_info?.photo) return;
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - studioPhotoPosition.x, y: touch.clientY - studioPhotoPosition.y });
    };

    const handlePhotoTouchMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling
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

    // Prevent body scroll when photo studio is open
    useEffect(() => {
        if (isPhotoStudioOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isPhotoStudioOpen]);

    const downloadAsPDF = async () => {
        if (!exportRef.current) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            await document.fonts.ready;
            const element = exportRef.current;

            // Pre-load images to base64
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(async (img) => {
                if (img.src && !img.src.startsWith('data:')) {
                    try {
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => {
                                img.src = reader.result;
                                resolve();
                            };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) { console.log('Image fetch failed:', e); }
                }
            }));

            // Dynamic import for better performance
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                height: element.scrollHeight
            });

            const jsPDF = (await import('jspdf')).default;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;
            const canvasAspect = canvas.height / canvas.width;
            const a4Aspect = pdfHeight / pdfWidth;
            let imgWidth, imgHeight, offsetX, offsetY;
            if (canvasAspect <= a4Aspect) {
                imgWidth = pdfWidth; imgHeight = pdfWidth * canvasAspect;
                offsetX = 0; offsetY = (pdfHeight - imgHeight) / 2;
            } else {
                imgHeight = pdfHeight; imgWidth = pdfHeight / canvasAspect;
                offsetX = (pdfWidth - imgWidth) / 2; offsetY = 0;
            }
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, imgWidth, imgHeight);
            pdf.save(`${cv.name || 'CV'}.pdf`);
        } catch (e) { console.error('PDF Error:', e); }
        finally { setExporting(false); }
    };

    const downloadAsJPG = async () => {
        if (!exportRef.current) return;
        setExporting(true);
        setShowExportMenu(false);
        try {
            await document.fonts.ready;
            const element = exportRef.current;

            // Pre-load images to base64
            const images = element.querySelectorAll('img');
            await Promise.all(Array.from(images).map(async (img) => {
                if (img.src && !img.src.startsWith('data:')) {
                    try {
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => {
                                img.src = reader.result;
                                resolve();
                            };
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) { console.log('Image fetch failed:', e); }
                }
            }));

            // Dynamic import for better performance
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                height: element.scrollHeight
            });
            const link = document.createElement('a');
            link.download = `${cv.name || 'CV'}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (e) { console.error('JPG Error:', e); }
        finally { setExporting(false); }
    };

    const handleGenerateSummary = async () => {
        if (!cv?.personal_info?.jobTitle) return alert('Enter Job Title first');
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
        } catch (e) { console.error(e); }
        finally { setGeneratingSummary(false); }
    };

    const handleAIStylist = async () => {
        if (!cv?.personal_info?.jobTitle) return alert('Enter Job Title first');
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
        } catch (e) { console.error(e); }
        finally { setGeneratingStyle(false); }
    };

    // Section drag-drop handlers
    const handleDragStart = (e, sectionId) => {
        setDraggedSection(sectionId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, sectionId) => {
        e.preventDefault();
        if (draggedSection === sectionId) return;
    };

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

    const handleDragEnd = () => {
        setDraggedSection(null);
    };

    // Get ordered sections for rendering
    const orderedSections = sectionOrder.map(id => SECTIONS.find(s => s.id === id)).filter(Boolean);

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

    // Certifications CRUD
    const addCertification = () => { setCV(prev => ({ ...prev, certifications: [...(prev.certifications || []), { id: Date.now(), name: '', issuer: '', date: '', credentialId: '' }] })); setHasChanges(true); };
    const updateCertification = (index, field, value) => { setCV(prev => { const c = [...(prev.certifications || [])]; c[index] = { ...c[index], [field]: value }; return { ...prev, certifications: c }; }); setHasChanges(true); };
    const removeCertification = (index) => { setCV(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) })); setHasChanges(true); };

    // Organizations CRUD
    const addOrganization = () => { setCV(prev => ({ ...prev, organizations: [...(prev.organizations || []), { id: Date.now(), name: '', role: '', startDate: '', endDate: '' }] })); setHasChanges(true); };
    const updateOrganization = (index, field, value) => { setCV(prev => { const o = [...(prev.organizations || [])]; o[index] = { ...o[index], [field]: value }; return { ...prev, organizations: o }; }); setHasChanges(true); };
    const removeOrganization = (index) => { setCV(prev => ({ ...prev, organizations: prev.organizations.filter((_, i) => i !== index) })); setHasChanges(true); };

    // AI Experience Description Generator
    const [generatingExpDesc, setGeneratingExpDesc] = useState(null);
    const handleGenerateExperienceDescription = async (index) => {
        const exp = cv.experience?.[index];
        if (!exp?.position || !exp?.company) return alert('Enter position and company first');
        setGeneratingExpDesc(index);
        try {
            const res = await fetch('/api/ai/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: exp.position,
                    keywords: `${exp.company}, ${exp.location || ''}`,
                    experience: `${exp.position} at ${exp.company}`,
                    type: 'experience_description'
                })
            });
            const data = await res.json();
            if (data.summary) updateExperience(index, 'description', data.summary);
        } catch (e) { console.error(e); }
        finally { setGeneratingExpDesc(null); }
    };


    if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /><span className="text-neutral-500 font-medium">Loading CV...</span></div>;

    if (!cv) return null;

    const currentTemplate = CV_TEMPLATES.find(t => t.id === cv.template_id) || CV_TEMPLATES[0];
    const photoStyle = cv.personal_info?.photo ? {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top center',
        transform: `translate(${cv.personal_info.photoPosition?.x || 0}px, ${cv.personal_info.photoPosition?.y || 0}px) scale(${cv.personal_info.photoZoom || 1}) rotate(${cv.personal_info.photoRotation || 0}deg)`
    } : {};



    return (
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden w-full font-sans antialiased">
            {/* Hidden Export Wrapper */}
            <div className="absolute -top-[9999px] -left-[9999px] w-0 h-0 overflow-hidden">
                <CVContent
                    cv={cv}
                    currentTemplate={currentTemplate}
                    photoStyle={photoStyle}
                    isExport={true}
                    contentRef={exportRef}
                    photoUploadPreview={photoUploadPreview}
                />
            </div>

            {/* Header / Top Bar */}
            <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 bg-white border-b border-neutral-100 sticky top-0 z-[100] shadow-sm">
                <button
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors text-sm font-medium"
                    onClick={() => router.push('/dashboard/cv-maker')}
                >
                    <Icons.back size={18} />
                    <span className="hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {/* Template Switcher (Mobile & Desktop) */}
                    <button
                        className="flex items-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-900 border border-neutral-100 rounded-xl hover:bg-neutral-100 transition-colors text-xs md:text-sm font-bold shadow-sm"
                        onClick={() => setShowTemplates(true)}
                    >
                        <span className="text-lg md:text-xl">🎨</span>
                        <span className="hidden sm:inline">Templates</span>
                    </button>

                    {/* Mobile Toggle */}
                    <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-inner lg:hidden">
                        <button
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mobileView === 'edit' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            onClick={() => setMobileView('edit')}
                        >
                            Edit
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mobileView === 'preview' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            onClick={() => setMobileView('preview')}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-neutral-200 mx-1" />

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold text-xs md:text-sm shadow-md hover:shadow-lg disabled:opacity-50"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            {exporting ? <Icons.spinner size={18} className="animate-spin" /> : <Icons.download size={18} />}
                            <span className="hidden sm:inline">Download</span>
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-3 bg-white border border-neutral-100 rounded-2xl shadow-2xl z-50 min-width-[180px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={downloadAsPDF} className="flex items-center gap-3 w-full px-5 py-3 hover:bg-neutral-50 transition-colors text-left text-sm font-semibold text-neutral-700">
                                    <Icons.pdf size={18} className="text-red-500" />
                                    <span>Download PDF</span>
                                </button>
                                <button onClick={downloadAsJPG} className="flex items-center gap-3 w-full px-5 py-3 hover:bg-neutral-50 transition-colors text-left text-sm font-semibold text-neutral-700">
                                    <Icons.jpg size={18} className="text-blue-500" />
                                    <span>Download JPG</span>
                                </button>
                                <div className="h-px bg-neutral-100 mx-3 my-1" />
                                <PDFDownloadButton
                                    document={<CVPDF cv={cv} />}
                                    fileName={`cv-${cv.personalInfo?.fullName?.replace(/\s+/g, '-') || 'resume'}.pdf`}
                                    label="HQ Text-Searchable PDF"
                                    className="flex items-center gap-3 w-full px-5 py-3 hover:bg-neutral-50 transition-colors text-left text-sm font-semibold text-primary-600"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="px-6 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl transition-all font-bold text-xs md:text-sm shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                    >
                        {saving ? <Icons.spinner size={18} className="animate-spin" /> : 'Save'}
                    </button>
                </div>
            </header>

            {/* Main Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-0 lg:gap-8 p-4 lg:p-8 max-w-[1800px] mx-auto w-full flex-1">
                {/* Form Side */}
                <div className={`flex flex-col gap-6 lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin transition-all duration-300 ${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'}`}>

                    <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-neutral-100">
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                            {orderedSections.map(s => s && (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, s.id)}
                                    onDragOver={(e) => handleDragOver(e, s.id)}
                                    onDrop={(e) => handleDrop(e, s.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all font-semibold text-[10px] md:text-xs cursor-grab active:cursor-grabbing border ${activeSection === s.id
                                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-md transform scale-105 z-10'
                                        : draggedSection === s.id
                                            ? 'bg-primary-50 border-primary-200 border-dashed opacity-50'
                                            : 'bg-transparent border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                        }`}
                                >
                                    <span className={`text-lg md:text-xl transition-opacity ${activeSection === s.id ? 'opacity-100' : 'opacity-70'}`}>{s.icon}</span>
                                    <span className="truncate w-full text-center px-1">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Editors */}
                    {activeSection === 'personal' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                <Icons.User size={20} className="text-primary-600" />
                                Personal Information
                            </h2>

                            <div className="mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Profile Photo</label>

                                {photoUploadError && (
                                    <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2 animate-in zoom-in-95 duration-200">
                                        <Icons.AlertCircle size={14} />
                                        <span>{photoUploadError}</span>
                                        <button onClick={() => setPhotoUploadError(null)} className="ml-auto hover:text-red-800 transition-colors">
                                            <Icons.X size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    {(cv.personal_info?.photo || photoUploadPreview) ? (
                                        <>
                                            <div
                                                onClick={() => !isUploadingPhoto && setIsPhotoStudioOpen(true)}
                                                className={`group relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isUploadingPhoto ? 'opacity-50 grayscale' : ''}`}
                                            >
                                                <img
                                                    src={photoUploadPreview || cv.personal_info.photo}
                                                    alt="Profile"
                                                    style={photoStyle}
                                                    className="w-full h-full object-cover"
                                                    crossOrigin="anonymous"
                                                />
                                                {isUploadingPhoto ? (
                                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-1">
                                                        <Icons.spinner size={16} className="animate-spin" />
                                                        <span className="text-[8px] font-bold">UPLOADING</span>
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-bold">EDIT</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => setIsPhotoStudioOpen(true)}
                                                    disabled={isUploadingPhoto}
                                                    className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    ✏️ Edit Photo
                                                </button>
                                                <button
                                                    onClick={removePhoto}
                                                    disabled={isUploadingPhoto}
                                                    className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-100 transition-all flex items-center gap-2"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="relative w-20 h-20 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 group hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer overflow-hidden">
                                            <Icons.upload size={20} className="group-hover:text-primary-500 transition-colors" />
                                            <span className="text-[9px] font-bold mt-1 group-hover:text-primary-600">UPLOAD</span>
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="John Doe"
                                        value={cv.personal_info?.fullName || ''}
                                        onChange={e => updatePersonalInfo('fullName', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Job Title</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="Software Engineer"
                                        value={cv.personal_info?.jobTitle || ''}
                                        onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="john@example.com"
                                        value={cv.personal_info?.email || ''}
                                        onChange={e => updatePersonalInfo('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="+1 234..."
                                        value={cv.personal_info?.phone || ''}
                                        onChange={e => updatePersonalInfo('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Location</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="City, Country"
                                        value={cv.personal_info?.location || ''}
                                        onChange={e => updatePersonalInfo('location', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">LinkedIn</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                        placeholder="linkedin.com/in/..."
                                        value={cv.personal_info?.linkedin || ''}
                                        onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'summary' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Professional Summary
                                </h2>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={generatingSummary}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 group overflow-hidden relative"
                                >
                                    {generatingSummary ? (
                                        <>
                                            <Icons.spinner size={16} className="animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.magic size={16} className="group-hover:rotate-12 transition-transform" />
                                            <span>AI Write</span>
                                        </>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </button>
                            </div>

                            <div className="relative group">
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-1">Summary Content</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all min-h-[180px] leading-relaxed resize-none"
                                    placeholder="Briefly describe your professional background, key achievements, and what you bring to the table..."
                                    value={cv.summary || ''}
                                    onChange={e => updateField('summary', e.target.value)}
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] font-bold text-neutral-300 group-focus-within:text-primary-300 transition-colors">
                                    {cv.summary?.length || 0} characters
                                </div>
                            </div>

                            <p className="mt-4 text-[11px] text-neutral-400 italic flex items-start gap-2">
                                <span className="text-primary-500 font-bold text-lg leading-none">💡</span>
                                A strong summary is usually 3-5 sentences that highlight your most relevant skills and career goals.
                            </p>
                        </div>
                    )}

                    {activeSection === 'experience' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Work Experience
                                </h2>
                                <button
                                    onClick={addExperience}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Experience</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {(cv.experience || []).map((e, idx) => (
                                    <div
                                        key={e.id}
                                        className="relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group animate-in zoom-in-98 duration-300"
                                    >
                                        <button
                                            onClick={() => removeExperience(idx)}
                                            className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Icons.close size={16} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Company</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="Company Name"
                                                    value={e.company}
                                                    onChange={v => updateExperience(idx, 'company', v.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Position</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="Job Title"
                                                    value={e.position}
                                                    onChange={v => updateExperience(idx, 'position', v.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. June 2021"
                                                    value={e.startDate}
                                                    onChange={v => updateExperience(idx, 'startDate', v.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. Present"
                                                    value={e.endDate}
                                                    onChange={v => updateExperience(idx, 'endDate', v.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-2 relative">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all min-h-[120px] resize-none leading-relaxed"
                                                    placeholder="Your responsibilities and achievements..."
                                                    value={e.description}
                                                    onChange={v => updateExperience(idx, 'description', v.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleGenerateExperienceDescription(idx)}
                                                    disabled={generatingExpDesc === idx}
                                                    className="absolute top-8 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all font-bold text-[10px] border border-indigo-100 disabled:opacity-50"
                                                >
                                                    {generatingExpDesc === idx ? <Icons.spinner size={12} className="animate-spin" /> : <Icons.magic size={12} />}
                                                    <span>AI IMPROVE</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!cv.experience || cv.experience.length === 0) && (
                                <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Icons.pdf size={24} className="text-neutral-300" />
                                    </div>
                                    <h3 className="text-sm font-bold text-neutral-900">No experience added yet</h3>
                                    <p className="text-xs text-neutral-500 mt-1 max-w-[200px] mx-auto">Click "Add Experience" to start building your professional history.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'education' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Education
                                </h2>
                                <button
                                    onClick={addEducation}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Education</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {(cv.education || []).map((e, idx) => (
                                    <div
                                        key={e.id}
                                        className="relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group animate-in zoom-in-98 duration-300"
                                    >
                                        <button
                                            onClick={() => removeEducation(idx)}
                                            className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Icons.close size={16} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Institution</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="University or School Name"
                                                    value={e.institution}
                                                    onChange={v => updateEducation(idx, 'institution', v.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Degree / Field</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. Bachelor of Science"
                                                    value={e.degree}
                                                    onChange={v => updateEducation(idx, 'degree', v.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Graduation Year</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. 2023"
                                                    value={e.endDate}
                                                    onChange={v => updateEducation(idx, 'endDate', v.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!cv.education || cv.education.length === 0) && (
                                <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Icons.pdf size={24} className="text-neutral-300" />
                                    </div>
                                    <h3 className="text-sm font-bold text-neutral-900">No education added yet</h3>
                                    <p className="text-xs text-neutral-500 mt-1 max-w-[200px] mx-auto">Click "Add Education" to list your academic background.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'skills' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Skills
                                </h2>
                                <button
                                    onClick={addSkill}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Skill</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {(cv.skills || []).map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="group flex items-center gap-2 bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-primary-200 hover:shadow-md px-4 py-2 rounded-xl transition-all"
                                    >
                                        <input
                                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 w-24 md:w-auto"
                                            value={s.name}
                                            onChange={v => updateSkill(idx, 'name', v.target.value)}
                                            placeholder="Skill e.g. React"
                                        />
                                        <button
                                            onClick={() => removeSkill(idx)}
                                            className="text-neutral-300 hover:text-red-500 transition-colors p-0.5"
                                        >
                                            <Icons.close size={14} />
                                        </button>
                                    </div>
                                ))}

                                {(cv.skills || []).length === 0 && (
                                    <p className="text-sm text-neutral-400 italic">No skills added yet. Click "Add Skill" to start listing your talents.</p>
                                )}
                            </div>

                            <p className="mt-8 text-[11px] text-neutral-400 italic flex items-start gap-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <span className="text-primary-500 font-bold text-lg leading-none">💡</span>
                                List your top technical and soft skills. Group them logically if possible (e.g., Programming: Javascript, Python).
                            </p>
                        </div>
                    )}

                    {activeSection === 'languages' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Languages
                                </h2>
                                <button
                                    onClick={addLanguage}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Language</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(cv.languages || []).map((l, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 transition-all hover:bg-white hover:shadow-md group"
                                    >
                                        <div className="flex-1">
                                            <input
                                                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-bold"
                                                placeholder="Language (e.g. English)"
                                                value={l.name}
                                                onChange={v => updateLanguage(idx, 'name', v.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <select
                                                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all cursor-pointer appearance-none"
                                                value={l.level}
                                                onChange={v => updateLanguage(idx, 'level', v.target.value)}
                                            >
                                                <option value="Native">Native</option>
                                                <option value="Fluent">Fluent</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Basic">Basic</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => removeLanguage(idx)}
                                            className="p-2.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end md:self-auto"
                                        >
                                            <Icons.close size={18} />
                                        </button>
                                    </div>
                                ))}

                                {(cv.languages || []).length === 0 && (
                                    <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                        <p className="text-sm text-neutral-400">No languages listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'certifications' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Certifications
                                </h2>
                                <button
                                    onClick={addCertification}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Certification</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {(cv.certifications || []).map((c, idx) => (
                                    <div
                                        key={idx}
                                        className="relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group animate-in zoom-in-98 duration-300"
                                    >
                                        <button
                                            onClick={() => removeCertification(idx)}
                                            className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Icons.close size={16} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Certification Name</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. AWS Certified Solutions Architect"
                                                    value={c.name}
                                                    onChange={v => updateCertification(idx, 'name', v.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Issuing Organization</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. Amazon Web Services"
                                                    value={c.issuer}
                                                    onChange={v => updateCertification(idx, 'issuer', v.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                                                    <input
                                                        type="month"
                                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                        value={c.date}
                                                        onChange={v => updateCertification(idx, 'date', v.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Credential ID</label>
                                                    <input
                                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                        placeholder="Optional"
                                                        value={c.credentialId}
                                                        onChange={v => updateCertification(idx, 'credentialId', v.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!cv.certifications || cv.certifications.length === 0) && (
                                <div className="text-center py-12 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                    <p className="text-sm text-neutral-400">No certifications added yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'organizations' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Organizations
                                </h2>
                                <button
                                    onClick={addOrganization}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold text-xs shadow-md hover:shadow-lg group"
                                >
                                    <Icons.add size={16} className="group-hover:rotate-90 transition-transform" />
                                    <span>Add Organization</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {(cv.organizations || []).map((o, idx) => (
                                    <div
                                        key={idx}
                                        className="relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all group animate-in zoom-in-98 duration-300"
                                    >
                                        <button
                                            onClick={() => removeOrganization(idx)}
                                            className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Icons.close size={16} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Organization Name</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="Organization Name"
                                                    value={o.name}
                                                    onChange={v => updateOrganization(idx, 'name', v.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Your Role</label>
                                                <input
                                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                    placeholder="e.g. Member, Volunteer"
                                                    value={o.role}
                                                    onChange={v => updateOrganization(idx, 'role', v.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                                                    <input
                                                        type="month"
                                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                        value={o.startDate}
                                                        onChange={v => updateOrganization(idx, 'startDate', v.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
                                                    <input
                                                        type="month"
                                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all"
                                                        value={o.endDate}
                                                        onChange={v => updateOrganization(idx, 'endDate', v.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!cv.organizations || cv.organizations.length === 0) && (
                                <div className="text-center py-12 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                    <p className="text-sm text-neutral-400">No organizations added yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'design' && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <Icons.pdf size={20} className="text-primary-600" />
                                    Design & Templates
                                </h2>
                                <button
                                    onClick={handleAIStylist}
                                    disabled={generatingStyle}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:border-indigo-200 hover:bg-indigo-50 text-neutral-700 hover:text-indigo-600 rounded-xl transition-all font-bold text-xs shadow-sm group"
                                >
                                    {generatingStyle ? (
                                        <Icons.spinner size={16} className="animate-spin text-indigo-500" />
                                    ) : (
                                        <Icons.magic size={16} className="group-hover:rotate-12 transition-transform text-indigo-500" />
                                    )}
                                    <span>AI Stylist</span>
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-1">Current Template</label>
                                    <button
                                        onClick={() => setShowTemplates(true)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div
                                                    className="w-10 h-10 rounded-xl shadow-inner border border-white/20"
                                                    style={{ background: currentTemplate.colors.primary }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-neutral-50 shadow-sm flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-neutral-900 leading-tight">{currentTemplate.name}</span>
                                                <span className="block text-[10px] text-neutral-400 font-medium">Click to change template</span>
                                            </div>
                                        </div>
                                        <Icons.chevronDown size={20} className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 ml-1">Primary Color</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group/picker">
                                                <input
                                                    type="color"
                                                    value={cv.custom_colors?.primary || '#2563eb'}
                                                    onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, primary: e.target.value } })}
                                                    className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer relative z-10 opacity-0"
                                                />
                                                <div
                                                    className="absolute inset-0 w-12 h-12 rounded-xl shadow-md border border-white/50 group-hover/picker:scale-110 transition-transform"
                                                    style={{ background: cv.custom_colors?.primary || '#2563eb' }}
                                                />
                                            </div>
                                            <div>
                                                <span className="block font-mono text-sm font-bold text-neutral-700 uppercase">{cv.custom_colors?.primary || '#2563eb'}</span>
                                                <span className="block text-[10px] text-neutral-400 font-medium">Theme Base</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3 ml-1">Accent Color</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group/picker">
                                                <input
                                                    type="color"
                                                    value={cv.custom_colors?.accent || '#eff6ff'}
                                                    onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, accent: e.target.value } })}
                                                    className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer relative z-10 opacity-0"
                                                />
                                                <div
                                                    className="absolute inset-0 w-12 h-12 rounded-xl shadow-md border border-white/50 group-hover/picker:scale-110 transition-transform"
                                                    style={{ background: cv.custom_colors?.accent || '#eff6ff' }}
                                                />
                                            </div>
                                            <div>
                                                <span className="block font-mono text-sm font-bold text-neutral-700 uppercase">{cv.custom_colors?.accent || '#eff6ff'}</span>
                                                <span className="block text-[10px] text-neutral-400 font-medium">Highlight</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-primary-50 border border-primary-100/50 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Icons.magic size={14} className="text-primary-600" />
                                </div>
                                <p className="text-[11px] text-primary-900 leading-relaxed pt-0.5">
                                    <strong className="block font-bold mb-0.5">Pro Tip: AI Stylist</strong>
                                    Use the AI Stylist to automatically pick colors and templates that match your industry and personal branding.
                                </p>
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
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 lg:p-8 animate-in fade-in duration-300">
                    <div
                        className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900 leading-tight">Choose Your Template</h3>
                                <p className="text-sm text-neutral-500 mt-1 font-medium">Select a design that best represents your professional brand</p>
                            </div>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="p-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 rounded-full transition-all"
                            >
                                <Icons.close size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {CV_TEMPLATES.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => changeTemplate(t.id)}
                                        className={`group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden relative ${cv.template_id === t.id
                                            ? 'border-primary-500 bg-primary-50 shadow-lg scale-[1.02]'
                                            : 'border-neutral-100 bg-white hover:border-primary-200 hover:shadow-xl hover:translate-y-[-4px]'
                                            }`}
                                    >
                                        {/* Template Preview Illustration */}
                                        <div className="aspect-[3/4] p-4 bg-neutral-50 group-hover:bg-white transition-colors">
                                            <div className="w-full h-full bg-white rounded shadow-sm border border-neutral-100 overflow-hidden">
                                                <div className="h-2 w-full" style={{ background: t.colors.primary }} />
                                                <div className="p-3 space-y-2">
                                                    <div className="h-1.5 w-1/2 bg-neutral-100 rounded" />
                                                    <div className="space-y-1">
                                                        <div className="h-1 w-full bg-neutral-50 rounded" />
                                                        <div className="h-1 w-full bg-neutral-50 rounded" />
                                                        <div className="h-1 w-3/4 bg-neutral-50 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-4 flex justify-between items-center">
                                            <div>
                                                <h4 className="text-sm font-bold text-neutral-900">{t.name}</h4>
                                                <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{t.description}</p>
                                            </div>
                                            {cv.template_id === t.id && (
                                                <div className="bg-primary-500 text-white p-1 rounded-full">
                                                    <Icons.pdf size={14} />
                                                </div>
                                            )}
                                        </div>

                                        {/* RTL Badge */}
                                        {t.rtl && (
                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase">RTL</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="px-8 py-3 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-bold text-sm shadow-lg hover:shadow-neutral-900/20 active:scale-95"
                            >
                                Apply Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={isPhotoStudioOpen} onOpenChange={setIsPhotoStudioOpen}>
                <DialogContent className="max-w-xl rounded-[40px] p-0 overflow-hidden shadow-2xl">
                    {/* Modal Header */}
                    <DialogHeader className="px-10 pt-10 pb-6 text-center">
                        <DialogTitle className="text-3xl font-black text-neutral-900 leading-tight">Photo Studio</DialogTitle>
                        <DialogDescription className="text-sm text-neutral-500 mt-2 font-medium">Perfect your profile picture for a professional look</DialogDescription>
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
                        <div className="w-full space-y-8 mt-4">
                            {/* Zoom Control */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Zoom Level</label>
                                    <span className="text-sm font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">{Math.round(photoZoom * 100)}%</span>
                                </div>
                                <div className="relative flex items-center h-6">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.01"
                                        value={photoZoom}
                                        onChange={e => setPhotoZoom(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                </div>
                            </div>

                            {/* Rotation Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPhotoRotation(r => r - 90)}
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all font-bold text-sm group"
                                >
                                    <Icons.rotateCw size={18} className="rotate-180 group-hover:-rotate-90 transition-transform" />
                                    <span>Rotate Left</span>
                                </button>
                                <button
                                    onClick={() => setPhotoRotation(r => r + 90)}
                                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all font-bold text-sm group"
                                >
                                    <Icons.rotateCw size={18} className="group-hover:rotate-90 transition-transform" />
                                    <span>Rotate Right</span>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <DialogFooter className="w-full flex gap-4 pt-4 mt-4 border-t border-neutral-100">
                            <DialogClose asChild>
                                <button className="flex-1 py-4 px-6 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-2xl transition-all font-bold text-sm">
                                    Cancel
                                </button>
                            </DialogClose>
                            <button
                                onClick={applyPhotoEdits}
                                className="flex-1 py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all font-bold text-sm shadow-xl shadow-primary-600/20 active:scale-95"
                            >
                                Apply Changes
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
