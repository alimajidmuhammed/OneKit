// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import { Search, Edit3, XCircle, CheckCircle2, Users, X, Loader2 } from 'lucide-react';

export default function UsersPage() {
    const { users, loading, fetchUsers, updateUserRole, toggleUserStatus } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (userId, newRole) => {
        await updateUserRole(userId, newRole);
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        await toggleUserStatus(userId, !currentStatus);
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-500/10 text-purple-400';
            case 'admin': return 'bg-blue-500/10 text-blue-400';
            default: return 'bg-neutral-700 text-neutral-400';
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-neutral-400">Manage all registered users and their roles</p>
                </div>
                <div className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium">
                    <span className="font-bold">{users.length}</span> Total Users
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Joined</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{getInitials(user.full_name || user.email)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-medium text-white truncate">{user.full_name || 'No name'}</span>
                                                    <span className="text-sm text-neutral-500 truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadgeClass(user.role)}`}>
                                                {user.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.is_active
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowModal(true);
                                                    }}
                                                    title="Edit Role"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${user.is_active
                                                            ? 'text-neutral-400 hover:bg-red-500/10 hover:text-red-400'
                                                            : 'text-neutral-400 hover:bg-green-500/10 hover:text-green-400'
                                                        }`}
                                                    onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.is_active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Users className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                        <p className="text-neutral-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Edit Role Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Edit User Role</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-xl mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                                    {getInitials(selectedUser.full_name || selectedUser.email)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">{selectedUser.full_name || 'No name'}</span>
                                    <span className="text-sm text-neutral-500">{selectedUser.email}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {['user', 'admin', 'super_admin'].map((role) => (
                                    <label key={role} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedUser.role === role
                                            ? 'border-primary-500 bg-primary-500/5'
                                            : 'border-neutral-800 hover:border-neutral-700'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={selectedUser.role === role}
                                            onChange={() => setSelectedUser({ ...selectedUser, role })}
                                            className="mt-1 accent-primary-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white capitalize">{role.replace('_', ' ')}</span>
                                            <span className="text-sm text-neutral-500">
                                                {role === 'user' && 'Standard user with access to subscribed services'}
                                                {role === 'admin' && 'Can manage users, subscriptions, and payments'}
                                                {role === 'super_admin' && 'Full access to all features and settings'}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button
                                className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                onClick={() => handleRoleChange(selectedUser.id, selectedUser.role)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
