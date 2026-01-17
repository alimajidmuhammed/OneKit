// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/utils/helpers';
import { Plus, Edit3, Trash2, X, Monitor, AlertTriangle, Loader2 } from 'lucide-react';

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
                const { error } = await updateService(selectedService.id, formData);
                if (error) {
                    alert('Error updating service: ' + error);
                    return;
                }
            } else {
                const { error } = await createService(formData);
                if (error) {
                    alert('Error creating service: ' + error);
                    return;
                }
            }

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

            const data = await fetchServices();
            setServices(data || []);
            setShowDeleteModal(false);
            setServiceToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Services Management</h1>
                    <p className="text-neutral-400">Manage your platform services</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={handleCreate}
                >
                    <Plus size={18} /> Add Service
                </button>
            </div>

            {/* Services Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Service</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Slug</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Monthly</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Yearly</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                                                    <Monitor size={20} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-white">{service.name}</span>
                                                    <span className="text-xs text-neutral-500 truncate max-w-[200px]">{service.description?.slice(0, 50)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-sm">{service.slug}</code>
                                        </td>
                                        <td className="px-6 py-4 text-white">{formatCurrency(service.price_monthly)}</td>
                                        <td className="px-6 py-4 text-white">{formatCurrency(service.price_yearly)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${service.is_active
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                                                    onClick={() => handleEdit(service)}
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                    onClick={() => handleDeleteClick(service)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">{selectedService ? 'Edit Service' : 'Create Service'}</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Service Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        name: e.target.value,
                                        slug: selectedService ? formData.slug : generateSlug(e.target.value)
                                    })}
                                    placeholder="e.g., CV Maker"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g., cv-maker"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the service..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Monthly Price (IQD)</label>
                                    <input
                                        type="number"
                                        value={formData.price_monthly}
                                        onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Yearly Price (IQD)</label>
                                    <input
                                        type="number"
                                        value={formData.price_yearly}
                                        onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-primary-500"
                                />
                                <span className="text-white">Service is active</span>
                            </label>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : (selectedService ? 'Save Changes' : 'Create Service')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && serviceToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Delete Service</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowDeleteModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-2">Are you sure you want to delete this service?</h3>
                                    <p className="text-neutral-400 text-sm mb-2">
                                        You are about to delete <strong className="text-white">{serviceToDelete.name}</strong>. This action cannot be undone.
                                    </p>
                                    <p className="text-amber-400 text-xs">Note: Services with active subscriptions cannot be deleted.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
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
