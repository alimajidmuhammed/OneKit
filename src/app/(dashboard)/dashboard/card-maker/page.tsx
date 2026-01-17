'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBusinessCard } from '@/lib/hooks/useBusinessCard';
import { formatDate } from '@/lib/utils/helpers';
import styles from './card-maker.module.css';

const CARD_TEMPLATES = [
    { id: 'modern', name: 'Modern', preview: '📇', description: 'Clean and professional' },
    { id: 'minimal', name: 'Minimal', preview: '✨', description: 'Simple & Elegant' },
    { id: 'creative', name: 'Creative', preview: '🎨', description: 'Bold & Artistic' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Formal business style' },
];

export default function BusinessCardDashboard() {
    const { cards, loading, createCard, deleteCard, saving } = useBusinessCard();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createCard(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/card-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteCard(deleteId);
        setDeleteId(null);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Business Card Maker</h1>
                    <p>Design professional networking cards for free</p>
                </div>
                <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Create New Card
                </button>
            </div>

            <div className={styles.freeBanner}>
                <div className={styles.freeIcon}>✨</div>
                <div>
                    <strong>Now Free Forever!</strong>
                    <p>Business Card Maker is now a free service. Design and export unlimited cards.</p>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading your designs...</span>
                </div>
            ) : cards.length > 0 ? (
                <div className={styles.grid}>
                    {cards.map((card) => (
                        <div key={card.id} className={styles.card}>
                            <div className={styles.preview}>
                                <div className={styles.templateIcon}>
                                    {CARD_TEMPLATES.find(t => t.id === card.template_id)?.preview || '📇'}
                                </div>
                            </div>
                            <div className={styles.info}>
                                <h3>{card.name}</h3>
                                <span>Updated {formatDate(card.updated_at)}</span>
                            </div>
                            <div className={styles.actions}>
                                <Link href={`/dashboard/card-maker/${card.id}`} className={styles.editBtn}>
                                    Edit
                                </Link>
                                <button className={styles.deleteBtn} onClick={() => setDeleteId(card.id)}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📇</div>
                    <h3>No designs yet</h3>
                    <p>Create your first high-end business card today</p>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        Get Started
                    </button>
                </div>
            )}

            {showCreateModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>New Business Card</h2>
                        <input
                            type="text"
                            placeholder="Card Name (e.g. My Personal Card)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <div className={styles.templatePicker}>
                            {CARD_TEMPLATES.map(t => (
                                <div
                                    key={t.id}
                                    className={`${styles.tCard} ${selectedTemplate === t.id ? styles.tActive : ''}`}
                                    onClick={() => setSelectedTemplate(t.id)}
                                >
                                    <span>{t.preview}</span>
                                    <p>{t.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button onClick={handleCreate} disabled={saving || !newName.trim()}>
                                {saving ? 'Creating...' : 'Create design'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Delete Card?</h2>
                        <p>This will permanently remove your design.</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className={styles.dangerBtn} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
