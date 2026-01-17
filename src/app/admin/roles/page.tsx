// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { Plus, Shield, Crown, User, Clock, X, Loader2 } from 'lucide-react';

export default function RolesPage() {
    const { roles, permissions, loading, fetchRoles, fetchPermissions } = useAdmin();
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const category = perm.name.split('.')[0];
        if (!acc[category]) acc[category] = [];
        acc[category].push(perm);
        return acc;
    }, {});

    const defaultRoles = [
        { id: 'super_admin', name: 'Super Admin', desc: 'Full access to everything', icon: Crown, badge: 'System' },
        { id: 'admin', name: 'Admin', desc: 'Manage users and content', icon: Shield, badge: 'System' },
        { id: 'user', name: 'User', desc: 'Standard user access', icon: User, badge: 'System' },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Roles & Permissions</h1>
                    <p className="text-neutral-400">Manage admin roles and their permissions</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Add Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Roles</h2>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Default Roles */}
                            {defaultRoles.map((role) => {
                                const IconComponent = role.icon;
                                return (
                                    <div
                                        key={role.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedRole === role.id
                                                ? 'bg-primary-600'
                                                : 'hover:bg-neutral-800'
                                            }`}
                                        onClick={() => setSelectedRole(role.id)}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role.id ? 'bg-primary-700' : 'bg-neutral-800'
                                            }`}>
                                            <IconComponent size={20} className="text-primary-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-medium text-white">{role.name}</span>
                                            <span className="block text-xs text-neutral-400">{role.desc}</span>
                                        </div>
                                        <span className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded text-xs">{role.badge}</span>
                                    </div>
                                );
                            })}

                            {/* Custom Roles */}
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedRole === role.id
                                            ? 'bg-primary-600'
                                            : 'hover:bg-neutral-800'
                                        }`}
                                    onClick={() => setSelectedRole(role.id)}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role.id ? 'bg-primary-700' : 'bg-neutral-800'
                                        }`}>
                                        <Clock size={20} className="text-primary-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block font-medium text-white">{role.name}</span>
                                        <span className="block text-xs text-neutral-400">{role.description || 'Custom role'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Permissions Panel */}
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        {selectedRole ? `Permissions for ${typeof selectedRole === 'string' ? selectedRole.replace('_', ' ') : roles.find(r => r.id === selectedRole)?.name}` : 'Select a Role'}
                    </h2>

                    {selectedRole ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="p-4 bg-neutral-800/50 rounded-lg">
                                    <h3 className="font-medium text-white mb-3 capitalize">{category}</h3>
                                    <div className="space-y-2">
                                        {perms.map((perm) => (
                                            <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRole === 'super_admin' || (selectedRole === 'admin' && !perm.name.includes('delete'))}
                                                    disabled={selectedRole === 'super_admin' || selectedRole === 'admin' || selectedRole === 'user'}
                                                    readOnly
                                                    className="mt-1 w-4 h-4 accent-primary-500"
                                                />
                                                <div>
                                                    <span className="block text-sm text-white">{perm.name}</span>
                                                    <span className="block text-xs text-neutral-500">{perm.description}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
                            <Shield size={48} className="mb-4 opacity-50" />
                            <p>Select a role to view its permissions</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Role Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Create New Role</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Role Name</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g., Moderator"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Description</label>
                                <textarea
                                    value={newRoleDesc}
                                    onChange={(e) => setNewRoleDesc(e.target.value)}
                                    placeholder="Brief description of this role..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
