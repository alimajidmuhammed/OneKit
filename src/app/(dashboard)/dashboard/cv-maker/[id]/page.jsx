'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCV } from '@/lib/hooks/useCV';
import { useAuth } from '@/components/auth/AuthProvider';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './editor.module.css';


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
    email: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="M22 6l-10 7L2 6" />
        </svg>
    ),
    phone: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
    ),
    location: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    linkedin: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    website: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    ),
    pdf: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="12" y2="15"></line>
        </svg>
    ),
    jpg: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    ),
    add: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    ),
    close: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    download: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    ),
    magic: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path>
        </svg>
    ),
    spinner: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spin} style={{ width: '16px', height: '16px' }}>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
    ),
    back: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    ),
    upload: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    ),
    chevronDown: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    ),
};

const CVContent = ({ cv, currentTemplate, photoStyle, isExport = false, contentRef }) => {
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
                    <div className={styles.cvSection} key="summary">
                        <h3>{currentTemplate.baseTemplate === 'sydney' ? 'About Me' : 'Summary'}</h3>
                        <p>{cv.summary}</p>
                    </div>
                );
            case 'experience':
                return cv.experience?.length > 0 && (
                    <div className={styles.cvSection} key="experience">
                        <h3>Experience</h3>
                        {cv.experience.map((exp, i) => (
                            <div key={i} className={styles.cvItem}>
                                <div className={styles.cvItemHeader}>
                                    <strong>{exp.position || 'Position'}</strong>
                                    <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                                </div>
                                <p className={styles.company}>{exp.company}</p>
                                {exp.description && <p>{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                );
            case 'education':
                return cv.education?.length > 0 && (
                    <div className={styles.cvSection} key="education">
                        <h3>Education</h3>
                        {cv.education.map((edu, i) => (
                            <div key={i} className={styles.cvItem}>
                                <div className={styles.cvItemHeader}>
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
                    <div className={styles.cvSection} key="skills">
                        <h3>Skills</h3>
                        {currentTemplate.baseTemplate === 'sydney' ? (
                            <div className={styles.skillList}>
                                {cv.skills.map((skill, i) => (
                                    <div key={i} className={styles.skillItem}>
                                        <span className={styles.skillName}>{skill.name}</span>
                                        <div className={styles.skillBar}>
                                            <div className={styles.skillFill} style={{ width: `${getSkillLevel(skill.level)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.skillTags}>
                                {cv.skills.map((skill, i) => (
                                    <span key={i} className={styles.skillTag}>{skill.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'languages':
                return cv.languages?.length > 0 && (
                    <div className={styles.cvSection} key="languages">
                        <h3>Languages</h3>
                        {currentTemplate.baseTemplate === 'sydney' ? (
                            <div className={styles.skillList}>
                                {cv.languages.map((lang, i) => (
                                    <div key={i} className={styles.skillItem}>
                                        <span className={styles.skillName}>{lang.name}</span>
                                        <div className={styles.skillBar}>
                                            <div className={styles.skillFill} style={{ width: `${getSkillLevel(lang.level)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.skillTags}>
                                {cv.languages.map((lang, i) => (
                                    <span key={i} className={styles.skillTag}>{lang.name} ({lang.level})</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'certifications':
                return cv.certifications?.length > 0 && (
                    <div className={styles.cvSection} key="certifications">
                        <h3>Certifications</h3>
                        {cv.certifications.map((cert, i) => (
                            <div key={i} className={styles.cvItem}>
                                <div className={styles.cvItemHeader}>
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
                    <div className={styles.cvSection} key="organizations">
                        <h3>Organizations</h3>
                        {cv.organizations.map((org, i) => (
                            <div key={i} className={styles.cvItem}>
                                <div className={styles.cvItemHeader}>
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
            className={`${styles.cvPreview} ${styles[`template_${currentTemplate.baseTemplate || cv.template_id}`]} ${isExport ? styles.exportItem : ''}`}
            style={{
                '--template-primary': cv.custom_colors?.primary || currentTemplate.colors.primary,
                '--template-accent': cv.custom_colors?.accent || currentTemplate.colors.accent,
                ...(currentTemplate.rtl ? { direction: 'rtl', textAlign: 'right' } : {}),
                ...(isExport ? { transform: 'none', width: '794px', height: 'auto', fontSize: '12px' } : {})
            }}
        >
            {currentTemplate.baseTemplate === 'sydney' ? (
                <div className={styles.cvInner}>
                    <div className={styles.cvSidebar}>
                        {cv.personal_info?.photo && (
                            <div className={styles.cvPhoto}>
                                <img src={cv.personal_info.photo} alt="Profile" style={photoStyle} crossOrigin="anonymous" />
                            </div>
                        )}
                        <div className={styles.sidebarName}>{cv.personal_info?.fullName || 'Your Name'}</div>
                        <div className={styles.sidebarTitle}>{cv.personal_info?.jobTitle || 'Job Title'}</div>

                        <div className={styles.sidebarSection}>
                            <h4>Contact</h4>
                            <div className={styles.contactList}>
                                {cv.personal_info?.email && <div className={styles.contactItem}><span className={styles.icon}><Icons.email /></span> {cv.personal_info.email}</div>}
                                {cv.personal_info?.phone && <div className={styles.contactItem}><span className={styles.icon}><Icons.phone /></span> {cv.personal_info.phone}</div>}
                                {cv.personal_info?.location && <div className={styles.contactItem}><span className={styles.icon}><Icons.location /></span> {cv.personal_info.location}</div>}
                                {cv.personal_info?.linkedin && <div className={styles.contactItem}><span className={styles.icon}><Icons.linkedin /></span> {cv.personal_info.linkedin}</div>}
                            </div>
                        </div>

                        {/* Order-aware Sidebar Sections (Skills/Languages usually sidebar in Sydney) */}
                        {order.map(id => (id === 'skills' || id === 'languages') && renderSection(id))}
                    </div>
                    <div className={styles.cvMain}>
                        {/* Order-aware Main Sections (Excluding personal, design, and sidebar items) */}
                        {order.map(id => (id !== 'personal' && id !== 'design' && id !== 'skills' && id !== 'languages') && renderSection(id))}
                    </div>
                </div>
            ) : (
                <div className={styles.cvInner}>
                    <div className={styles.cvHeader}>
                        {cv.personal_info?.photo && (
                            <div className={styles.cvPhoto}>
                                <img src={cv.personal_info.photo} alt="Profile" style={photoStyle} crossOrigin="anonymous" />
                            </div>
                        )}
                        <div className={styles.cvHeaderText}>
                            <h1>{cv.personal_info?.fullName || 'Your Name'}</h1>
                            <p className={styles.jobTitle}>{cv.personal_info?.jobTitle || 'Job Title'}</p>
                            <div className={styles.contactInfo}>
                                {cv.personal_info?.email && (
                                    <div className={styles.contactItem}>
                                        <span className={styles.icon}><Icons.email /></span>
                                        <span>{cv.personal_info.email}</span>
                                    </div>
                                )}
                                {cv.personal_info?.phone && (
                                    <div className={styles.contactItem}>
                                        <span className={styles.icon}><Icons.phone /></span>
                                        <span>{cv.personal_info.phone}</span>
                                    </div>
                                )}
                                {cv.personal_info?.location && (
                                    <div className={styles.contactItem}>
                                        <span className={styles.icon}><Icons.location /></span>
                                        <span>{cv.personal_info.location}</span>
                                    </div>
                                )}
                                {cv.personal_info?.linkedin && (
                                    <div className={styles.contactItem}>
                                        <span className={styles.icon}><Icons.linkedin /></span>
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

export default function CVEditorPage({ params }) {
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
                if (data.section_order && Array.isArray(data.section_order)) {
                    setSectionOrder(data.section_order);
                }
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
        if (!hasChanges || !cv) return;
        const timeoutId = setTimeout(() => handleSave(), 2500);
        return () => clearTimeout(timeoutId);
    }, [cv, hasChanges, handleSave]);

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

        // Show immediate preview
        const localPreview = URL.createObjectURL(file);
        updatePersonalInfo('photo', localPreview);
        setIsPhotoStudioOpen(true);

        // Upload optimized image to R2
        const publicUrl = await uploadImage(file, { folder: 'cv-photos', type: 'photo' });
        if (publicUrl) {
            updatePersonalInfo('photo', publicUrl);
            setHasChanges(true);
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

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794,
                height: element.scrollHeight
            });
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


    if (loading) return <div className={styles.loading}><div className={styles.spinner} /><span>Loading CV...</span></div>;
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
        <div className={styles.editor}>
            {/* Hidden Export Wrapper */}
            <div className={styles.exportWrapper}>
                <CVContent
                    cv={cv}
                    currentTemplate={currentTemplate}
                    photoStyle={photoStyle}
                    isExport={true}
                    contentRef={exportRef}
                />
            </div>

            {/* Header / Top Bar */}
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/dashboard/cv-maker')}>
                    <Icons.back />
                    <span>Back</span>
                </button>

                <div className={styles.headerActions}>
                    {/* Template Switcher (Mobile & Desktop) */}
                    <button
                        className={styles.themeBtn}
                        onClick={() => setShowTemplates(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#f5f5f5',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            cursor: 'pointer'
                        }}
                    >
                        <span>🎨</span>
                    </button>

                    {/* Mobile Toggle */}
                    <div className={styles.mobileToggle}>
                        <button
                            className={`${styles.toggleBtn} ${mobileView === 'edit' ? styles.toggleActive : ''}`}
                            onClick={() => setMobileView('edit')}
                        >
                            Edit
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${mobileView === 'preview' ? styles.toggleActive : ''}`}
                            onClick={() => setMobileView('preview')}
                        >
                            Preview
                        </button>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: '#e2e8f0', margin: '0 8px' }} />

                    <div className={styles.exportDropdown} style={{ position: 'relative' }}>
                        <button className={styles.downloadBtn} onClick={() => setShowExportMenu(!showExportMenu)}>
                            {exporting ? <Icons.spinner /> : <Icons.download />}
                            <span>Download</span>
                        </button>

                        {showExportMenu && (
                            <div className={styles.exportMenu} style={{ position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '160px', marginTop: '8px' }}>
                                <button onClick={downloadAsPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>
                                    <Icons.pdf />
                                    <span>Download PDF</span>
                                </button>
                                <button onClick={downloadAsJPG} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>
                                    <Icons.jpg />
                                    <span>Download JPG</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.saveStatus} style={{ display: 'none' }}>
                        {saving ? 'Saving...' : hasChanges ? 'Unsaved' : 'Saved'}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        style={{
                            background: '#1a1a1a',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            opacity: (saving || !hasChanges) ? 0.5 : 1,
                            flexShrink: 0
                        }}
                    >
                        {saving ? '...' : 'Save'}
                    </button>
                </div>

            </header>

            {/* Main Workspace Grid */}
            <div className={styles.container}>
                {/* Form Side */}
                <div className={`${styles.formSide} ${mobileView === 'preview' ? styles.hideMobile : ''}`}>

                    {/* Navigation Tabs */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
                            gap: '8px'
                        }}>
                            {orderedSections.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, s.id)}
                                    onDragOver={(e) => handleDragOver(e, s.id)}
                                    onDrop={(e) => handleDrop(e, s.id)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '12px 8px',
                                        borderRadius: '12px',
                                        border: draggedSection === s.id ? '2px dashed #2563eb' : 'none',
                                        background: activeSection === s.id ? '#1a1a1a' : draggedSection === s.id ? '#eff6ff' : 'transparent',
                                        color: activeSection === s.id ? 'white' : '#6b7280',
                                        cursor: 'grab',
                                        transition: 'all 0.15s ease',
                                        fontWeight: '500',
                                        fontSize: '12px',
                                        opacity: draggedSection === s.id ? 0.5 : 1
                                    }}
                                >
                                    <span style={{ fontSize: '20px', opacity: activeSection === s.id ? 1 : 0.7 }}>{s.icon}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Editors */}
                    {activeSection === 'personal' && (
                        <div className={styles.formSection}>
                            <h2 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}>👤</span> Personal Information
                            </h2>
                            <div className={styles.photoUpload} style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Profile Photo</label>
                                <div className={styles.photoContainer} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {cv.personal_info?.photo ? (
                                        <>
                                            <div
                                                className={styles.photoPreview}
                                                onClick={() => setIsPhotoStudioOpen(true)}
                                                style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '3px solid white', boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)', position: 'relative' }}
                                            >
                                                <img src={cv.personal_info.photo} alt="Profile" style={photoStyle} crossOrigin="anonymous" />
                                                <div className={styles.photoEditOverlay} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                                    <span style={{ fontSize: '10px' }}>Edit</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <button
                                                    onClick={() => setIsPhotoStudioOpen(true)}
                                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={removePhoto}
                                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                                            <Icons.upload />
                                            <span style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Upload</span>
                                            <input type="file" onChange={handlePhotoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGrid} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</label>
                                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="John Doe" value={cv.personal_info?.fullName || ''} onChange={e => updatePersonalInfo('fullName', e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Job Title</label>
                                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Software Engineer" value={cv.personal_info?.jobTitle || ''} onChange={e => updatePersonalInfo('jobTitle', e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Location</label>
                                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="City, Country" value={cv.personal_info?.location || ''} onChange={e => updatePersonalInfo('location', e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email</label>
                                    <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="john@example.com" value={cv.personal_info?.email || ''} onChange={e => updatePersonalInfo('email', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Phone</label>
                                        <input style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} placeholder="+1 234..." value={cv.personal_info?.phone || ''} onChange={e => updatePersonalInfo('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>LinkedIn</label>
                                        <input style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} placeholder="linkedin..." value={cv.personal_info?.linkedin || ''} onChange={e => updatePersonalInfo('linkedin', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'summary' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Summary</h2>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={generatingSummary}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {generatingSummary ? <Icons.spinner /> : <Icons.magic />} AI Write
                                </button>
                            </div>
                            <textarea
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', lineHeight: '1.5', minHeight: '150px' }}
                                value={cv.summary || ''}
                                onChange={e => updateField('summary', e.target.value)}
                                placeholder="Describe your professional journey..."
                            />
                        </div>
                    )}

                    {activeSection === 'experience' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Experience</h2>
                                <button
                                    onClick={addExperience}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#2563eb', color: 'white', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    <Icons.add /> Add
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {(cv.experience || []).map((e, idx) => (
                                    <div key={e.id} className={styles.itemCard} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', background: '#f8fafc' }}>
                                        <button
                                            onClick={() => removeExperience(idx)}
                                            style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                        >
                                            <Icons.close />
                                        </button>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Company" value={e.company} onChange={v => updateExperience(idx, 'company', v.target.value)} />
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Position" value={e.position} onChange={v => updateExperience(idx, 'position', v.target.value)} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Jan 2020" value={e.startDate} onChange={v => updateExperience(idx, 'startDate', v.target.value)} />
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Present" value={e.endDate} onChange={v => updateExperience(idx, 'endDate', v.target.value)} />
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <textarea
                                                    style={{ width: '100%', padding: '8px', paddingRight: '90px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', minHeight: '80px' }}
                                                    placeholder="Key responsibilities and achievements..."
                                                    value={e.description}
                                                    onChange={v => updateExperience(idx, 'description', v.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleGenerateExperienceDescription(idx)}
                                                    disabled={generatingExpDesc === idx}
                                                    style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', fontSize: '11px', fontWeight: '600', cursor: 'pointer', color: '#6366f1' }}
                                                >
                                                    {generatingExpDesc === idx ? <Icons.spinner /> : <Icons.magic />}
                                                    AI
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'education' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Education</h2>
                                <button
                                    onClick={addEducation}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#2563eb', color: 'white', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    <Icons.add /> Add
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {(cv.education || []).map((e, idx) => (
                                    <div key={e.id} className={styles.itemCard} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', background: '#f8fafc' }}>
                                        <button
                                            onClick={() => removeEducation(idx)}
                                            style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                        >
                                            <Icons.close />
                                        </button>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Institution" value={e.institution} onChange={v => updateEducation(idx, 'institution', v.target.value)} />
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Degree / Field" value={e.degree} onChange={v => updateEducation(idx, 'degree', v.target.value)} />
                                                <input style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }} placeholder="Year" value={e.endDate} onChange={v => updateEducation(idx, 'endDate', v.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'skills' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Skills</h2>
                                <button onClick={addSkill} style={{ height: '32px', width: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {(cv.skills || []).map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                        <input
                                            style={{ border: 'none', background: 'transparent', width: 'auto', minWidth: '60px', flex: '1', fontSize: '13px', fontWeight: '700' }}
                                            value={s.name}
                                            onChange={v => updateSkill(idx, 'name', v.target.value)}
                                            placeholder="Skill..."
                                        />
                                        <button onClick={() => removeSkill(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'languages' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Languages</h2>
                                <button onClick={addLanguage} style={{ height: '32px', width: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(cv.languages || []).map((l, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <input
                                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                            placeholder="Language (e.g. English)"
                                            value={l.name}
                                            onChange={v => updateLanguage(idx, 'name', v.target.value)}
                                        />
                                        <select
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white' }}
                                            value={l.level}
                                            onChange={v => updateLanguage(idx, 'level', v.target.value)}
                                        >
                                            <option value="Native">Native</option>
                                            <option value="Fluent">Fluent</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Basic">Basic</option>
                                        </select>
                                        <button onClick={() => removeLanguage(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f43f5e' }}>
                                            <Icons.close />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'certifications' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Certifications</h2>
                                <button onClick={addCertification} style={{ height: '32px', width: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(cv.certifications || []).map((c, idx) => (
                                    <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <input
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                placeholder="Certification Name"
                                                value={c.name}
                                                onChange={v => updateCertification(idx, 'name', v.target.value)}
                                            />
                                            <input
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                placeholder="Issuing Organization"
                                                value={c.issuer}
                                                onChange={v => updateCertification(idx, 'issuer', v.target.value)}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="month"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                    value={c.date}
                                                    onChange={v => updateCertification(idx, 'date', v.target.value)}
                                                />
                                                <input
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                    placeholder="Credential ID (optional)"
                                                    value={c.credentialId}
                                                    onChange={v => updateCertification(idx, 'credentialId', v.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => removeCertification(idx)} style={{ marginTop: '12px', color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'organizations' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Organizations</h2>
                                <button onClick={addOrganization} style={{ height: '32px', width: '32px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(cv.organizations || []).map((o, idx) => (
                                    <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <input
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                placeholder="Organization Name"
                                                value={o.name}
                                                onChange={v => updateOrganization(idx, 'name', v.target.value)}
                                            />
                                            <input
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                placeholder="Your Role"
                                                value={o.role}
                                                onChange={v => updateOrganization(idx, 'role', v.target.value)}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="month"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                    placeholder="Start"
                                                    value={o.startDate}
                                                    onChange={v => updateOrganization(idx, 'startDate', v.target.value)}
                                                />
                                                <input
                                                    type="month"
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                                    placeholder="End"
                                                    value={o.endDate}
                                                    onChange={v => updateOrganization(idx, 'endDate', v.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => removeOrganization(idx)} style={{ marginTop: '12px', color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'design' && (
                        <div className={styles.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Design & Templates</h2>
                                <button
                                    onClick={handleAIStylist}
                                    disabled={generatingStyle}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {generatingStyle ? <Icons.spinner /> : <Icons.magic />} AI Stylist
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Current Template</label>
                                <button
                                    className={styles.themeSelectorBtn}
                                    onClick={() => setShowTemplates(true)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: currentTemplate.colors.primary }} />
                                        <span style={{ fontWeight: '600' }}>{currentTemplate.name}</span>
                                    </div>
                                    <Icons.chevronDown />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Primary Color</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="color" value={cv.custom_colors?.primary || '#2563eb'} onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, primary: e.target.value } })} style={{ width: '40px', height: '40px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{cv.custom_colors?.primary || '#2563eb'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Accent Color</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="color" value={cv.custom_colors?.accent || '#eff6ff'} onChange={e => setCV({ ...cv, custom_colors: { ...cv.custom_colors, accent: e.target.value } })} style={{ width: '40px', height: '40px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{cv.custom_colors?.accent || '#eff6ff'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Side */}
                <div
                    className={`${styles.previewSide} ${mobileView === 'edit' ? styles.hideMobile : ''}`}
                    ref={containerRef}
                >
                    <div
                        className={styles.previewContainer}
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <CVContent
                            cv={cv}
                            currentTemplate={currentTemplate}
                            photoStyle={photoStyle}
                            contentRef={previewRef}
                        />
                    </div>
                </div>
            </div>

            {/* Template Selection Overlay */}
            {showTemplates && (
                <div className={styles.modalOverlay} onClick={() => setShowTemplates(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className={styles.templateDropdown} onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Choose a Template</h3>
                            <button onClick={() => setShowTemplates(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <Icons.close />
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {CV_TEMPLATES.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => changeTemplate(t.id)}
                                    style={{
                                        cursor: 'pointer',
                                        borderRadius: '20px',
                                        border: cv.template_id === t.id ? '3px solid #2563eb' : '1px solid #e2e8f0',
                                        padding: '16px',
                                        background: cv.template_id === t.id ? '#eff6ff' : 'white',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: cv.template_id === t.id ? 'scale(1.02)' : 'none'
                                    }}
                                    onMouseEnter={e => !(cv.template_id === t.id) && (e.currentTarget.style.borderColor = '#2563eb')}
                                    onMouseLeave={e => !(cv.template_id === t.id) && (e.currentTarget.style.borderColor = '#e2e8f0')}
                                >
                                    <div style={{ height: '120px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                        <div style={{ height: '12px', background: t.colors.primary, marginBottom: '8px' }} />
                                        <div style={{ padding: '8px' }}>
                                            <div style={{ height: '6px', background: '#e2e8f0', width: '60%', marginBottom: '4px' }} />
                                            <div style={{ height: '4px', background: '#f1f5f9', width: '100%', marginBottom: '2px' }} />
                                            <div style={{ height: '4px', background: '#f1f5f9', width: '90%', marginBottom: '2px' }} />
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{t.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isPhotoStudioOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsPhotoStudioOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div className={styles.photoStudioModal} onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '800' }}>Photo Studio</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Adjust your profile photo for the perfect fit</p>
                        </div>

                        <div className={styles.studioContent} style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                            <div className={styles.studioPreviewSection}>
                                <div
                                    className={styles.studioPreviewCircle}
                                    style={{
                                        width: '240px',
                                        height: '240px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '8px solid #f1f5f9',
                                        boxShadow: 'inset 0 4px 6px 0 rgba(0,0,0,0.1)',
                                        position: 'relative',
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                    onMouseDown={handlePhotoMouseDown}
                                >
                                    <img
                                        src={cv.personal_info.photo}
                                        style={{
                                            position: 'absolute',
                                            transform: `translate(${studioPhotoPosition.x}px, ${studioPhotoPosition.y}px) scale(${photoZoom}) rotate(${photoRotation}deg)`,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        draggable={false}
                                        crossOrigin="anonymous"
                                    />
                                    <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                                    Tip: Drag photo to reposition
                                </div>
                            </div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                        Zoom <span>{Math.round(photoZoom * 100)}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.01"
                                        value={photoZoom}
                                        onChange={e => setPhotoZoom(parseFloat(e.target.value))}
                                        style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', appearance: 'none', cursor: 'pointer' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setPhotoRotation(r => r - 90)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        ↺ Rotate Left
                                    </button>
                                    <button
                                        onClick={() => setPhotoRotation(r => r + 90)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        ↻ Rotate Right
                                    </button>
                                </div>
                            </div>

                            <div style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    onClick={() => setIsPhotoStudioOpen(false)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyPhotoEdits}
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
