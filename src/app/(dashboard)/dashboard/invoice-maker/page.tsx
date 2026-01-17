'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInvoice } from '@/lib/hooks/useInvoice';
import { formatDate } from '@/lib/utils/helpers';
import styles from './invoice-maker.module.css';

const INVOICE_TEMPLATES = [
    { id: 'classic', name: 'Classic Receipt', preview: '📄', description: 'Standard business' },
    { id: 'modern', name: 'Modern', preview: '✨', description: 'Clean & professional' },
    { id: 'minimal', name: 'Minimalist', preview: '⬜', description: 'Simple & direct' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Business oriented' },
    { id: 'luxury', name: 'Luxury', preview: '💎', description: 'Elegant & high-end' },
    { id: 'compact', name: 'Compact', preview: '📏', description: 'Efficient & small' }
];

export default function InvoiceMakerPage() {
    const { invoices, loading, createInvoice, deleteInvoice, saving } = useInvoice();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createInvoice(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/invoice-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteInvoice(deleteId);
        setDeleteId(null);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Invoice Maker</h1>
                    <p>Create and manage professional receipts and invoices</p>
                </div>
                <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Create New Invoice
                </button>
            </div>

            {/* Invoices Grid */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your invoices...</span>
                </div>
            ) : invoices.length > 0 ? (
                <div className={styles.invoicesGrid}>
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className={styles.invoiceCard}>
                            <div className={styles.invoicePreview}>
                                <div className={styles.invoicePlaceholder}>
                                    <span>{INVOICE_TEMPLATES.find(t => t.id === invoice.template_id)?.preview || '📄'}</span>
                                </div>
                            </div>
                            <div className={styles.invoiceInfo}>
                                <h3>{invoice.name}</h3>
                                <span className={styles.invoiceMeta}>
                                    {INVOICE_TEMPLATES.find(t => t.id === invoice.template_id)?.name || 'Classic'} •
                                    Updated {formatDate(invoice.updated_at)}
                                </span>
                            </div>
                            <div className={styles.invoiceActions}>
                                <Link href={`/dashboard/invoice-maker/${invoice.id}`} className={styles.editBtn}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Edit
                                </Link>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleteId(invoice.id)}
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
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3>No invoices yet</h3>
                    <p>Create your first professional invoice or receipt</p>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        Create Your First Invoice
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Invoice</h2>
                            <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Internal Name (e.g., Client Name or Month)</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Client Receipt August"
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Choose Template</label>
                                <div className={styles.templatesGrid}>
                                    {INVOICE_TEMPLATES.map((template) => (
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
                                disabled={saving || !newName.trim()}
                            >
                                {saving ? 'Creating...' : 'Create Invoice'}
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
                            <h2>Delete Invoice</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
                        </div>
                        <div className={styles.modalFooter} >
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
