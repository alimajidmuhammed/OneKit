'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCV } from '@/lib/hooks/useCV';
import { formatDate } from '@/lib/utils/helpers';
import styles from './cv-maker.module.css';

const CV_TEMPLATES = [
    // Professional
    { id: 'professional', name: 'Professional', preview: '📄', description: 'Clean and modern' },
    { id: 'executive', name: 'Executive', preview: '💼', description: 'For senior positions' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Business formal style' },
    // Creative
    { id: 'creative', name: 'Creative', preview: '🎨', description: 'Stand out from the crowd' },
    { id: 'designer', name: 'Designer', preview: '🖌️', description: 'Visual & artistic' },
    { id: 'portfolio', name: 'Portfolio', preview: '📷', description: 'Showcase your work' },
    // Minimal
    { id: 'minimal', name: 'Minimal', preview: '✨', description: 'Simple and elegant' },
    { id: 'clean', name: 'Clean', preview: '🤍', description: 'Whitespace focused' },
    { id: 'simple', name: 'Simple', preview: '📑', description: 'No frills, just facts' },
    // Tech
    { id: 'tech', name: 'Tech', preview: '💻', description: 'Perfect for developers' },
    { id: 'data', name: 'Data Science', preview: '📊', description: 'Analytics focused' },
    { id: 'engineering', name: 'Engineering', preview: '⚙️', description: 'Technical roles' },
    // Academic & Other
    { id: 'academic', name: 'Academic', preview: '🎓', description: 'For researchers & educators' },
    { id: 'medical', name: 'Medical', preview: '🏥', description: 'Healthcare professionals' },
    { id: 'modern', name: 'Modern', preview: '🚀', description: 'Contemporary design' },
];

export default function CVMakerPage() {
    const { cvs, loading, createCV, deleteCV, saving } = useCV();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCVName, setNewCVName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('professional');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newCVName.trim()) return;
        const { data, error } = await createCV(newCVName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewCVName('');
            setSelectedTemplate('professional');
            // Redirect to editor
            window.location.href = `/dashboard/cv-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteCV(deleteId);
        setDeleteId(null);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>CV Maker</h1>
                    <p>Create professional resumes for free</p>
                </div>
                <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Create New CV
                </button>
            </div>

            {/* Free Badge */}
            <div className={styles.freeBanner}>
                <div className={styles.freeIcon}>🎉</div>
                <div>
                    <strong>Free Forever!</strong>
                    <p>CV Maker is completely free. Create unlimited professional resumes.</p>
                </div>
            </div>

            {/* CVs Grid */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your CVs...</span>
                </div>
            ) : cvs.length > 0 ? (
                <div className={styles.cvsGrid}>
                    {cvs.map((cv) => (
                        <div key={cv.id} className={styles.cvCard}>
                            <div className={styles.cvPreview}>
                                <div className={styles.previewContent}>
                                    <span className={styles.templateIcon}>
                                        {CV_TEMPLATES.find(t => t.id === cv.template_id)?.preview || '📄'}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.cvInfo}>
                                <h3>{cv.name}</h3>
                                <span className={styles.cvMeta}>
                                    {CV_TEMPLATES.find(t => t.id === cv.template_id)?.name || 'Professional'} •
                                    Updated {formatDate(cv.updated_at)}
                                </span>
                            </div>
                            <div className={styles.cvActions}>
                                <Link href={`/dashboard/cv-maker/${cv.id}`} className={styles.editBtn}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Edit
                                </Link>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleteId(cv.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3>No CVs yet</h3>
                    <p>Create your first professional CV in minutes</p>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        Create Your First CV
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New CV</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>CV Name</label>
                                <input
                                    type="text"
                                    value={newCVName}
                                    onChange={(e) => setNewCVName(e.target.value)}
                                    placeholder="e.g., Software Developer CV"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Choose Template</label>
                                <div className={styles.templatesGrid}>
                                    {CV_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.templateSelected : ''}`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <span className={styles.templatePreview}>{template.preview}</span>
                                            <span className={styles.templateName}>{template.name}</span>
                                            <span className={styles.templateDesc}>{template.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleCreate}
                                disabled={saving || !newCVName.trim()}
                            >
                                {saving ? 'Creating...' : 'Create CV'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Delete CV</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this CV? This action cannot be undone.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button className={styles.dangerBtn} onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
