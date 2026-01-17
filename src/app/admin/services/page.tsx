'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';
import styles from './services.module.css';

export default function AdminServicesPage() {
    const { loading, fetchServices, createService, updateService, deleteService } = useAdmin();
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price_monthly: 15000,
        price_yearly: 150000,
        is_active: true,
    });

    useEffect(() => {
        const loadServices = async () => {
            const data = await fetchServices();
            setServices(data || []);
        };
        loadServices();
    }, []);

    const handleSave = async () => {
        if (!formData.name || !formData.slug) return;

        setSaving(true);
        try {
            if (selectedService) {
                // Update existing service
                const { error } = await updateService(selectedService.id, formData);
                if (error) {
                    alert('Error updating service: ' + error);
                    return;
                }
            } else {
                // Create new service
                const { error } = await createService(formData);
                if (error) {
                    alert('Error creating service: ' + error);
                    return;
                }
            }

            // Refresh services list
            const data = await fetchServices();
            setServices(data || []);
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            slug: service.slug,
            description: service.description || '',
            price_monthly: service.price_monthly,
            price_yearly: service.price_yearly,
            is_active: service.is_active,
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedService(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            price_monthly: 15000,
            price_yearly: 150000,
            is_active: true,
        });
        setShowModal(true);
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return;

        setDeleting(true);
        try {
            const { error } = await deleteService(serviceToDelete.id);
            if (error) {
                alert('Error deleting service: ' + error);
                return;
            }

            // Refresh services list
            const data = await fetchServices();
            setServices(data || []);
            setShowDeleteModal(false);
            setServiceToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Services Management</h1>
                    <p>Manage your platform services</p>
                </div>
                <button className={styles.addBtn} onClick={handleCreate}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Service
                </button>
            </div>

            {/* Services Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Slug</th>
                                <th>Monthly Price</th>
                                <th>Yearly Price</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td>
                                        <div className={styles.serviceCell}>
                                            <div className={styles.serviceIcon}>
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                                                    <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                                                    <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                                                    <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className={styles.serviceName}>{service.name}</span>
                                                <span className={styles.serviceDesc}>{service.description?.slice(0, 50)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code className={styles.slugCode}>{service.slug}</code>
                                    </td>
                                    <td>{formatCurrency(service.price_monthly)}</td>
                                    <td>{formatCurrency(service.price_yearly)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${service.is_active ? styles.statusActive : styles.statusInactive}`}>
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>{formatDate(service.created_at)}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleEdit(service)}
                                                title="Edit"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDeleteClick(service)}
                                                title="Delete"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedService ? 'Edit Service' : 'Create Service'}</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Service Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        slug: selectedService ? formData.slug : generateSlug(e.target.value)
                                    })}
                                    placeholder="e.g., CV Maker"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g., cv-maker"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the service..."
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Monthly Price (IQD)</label>
                                    <input
                                        type="number"
                                        value={formData.price_monthly}
                                        onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Yearly Price (IQD)</label>
                                    <input
                                        type="number"
                                        value={formData.price_yearly}
                                        onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>Service is active</span>
                                </label>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (selectedService ? 'Save Changes' : 'Create Service')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && serviceToDelete && (
                <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div className={`${styles.modal} ${styles.deleteModal}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Delete Service</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDeleteModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.deleteWarning}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div>
                                    <h3>Are you sure you want to delete this service?</h3>
                                    <p>
                                        You are about to delete <strong>{serviceToDelete.name}</strong>.
                                        This action cannot be undone.
                                    </p>
                                    <p className={styles.warningNote}>
                                        Note: Services with active subscriptions cannot be deleted.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.deleteConfirmBtn}
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
