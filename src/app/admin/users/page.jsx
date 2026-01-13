'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, getInitials } from '@/lib/utils/helpers';
import styles from './users.module.css';

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

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>User Management</h1>
                    <p>Manage all registered users and their roles</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statBadge}>
                        <span>{users.length}</span> Total Users
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} />
                                                ) : (
                                                    <span>{getInitials(user.full_name || user.email)}</span>
                                                )}
                                            </div>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{user.full_name || 'No name'}</span>
                                                <span className={styles.userEmail}>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${styles[`role_${user.role}`]}`}>
                                            {user.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${user.is_active ? styles.statusActive : styles.statusInactive}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowModal(true);
                                                }}
                                                title="Edit Role"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${user.is_active ? styles.actionBtnDanger : styles.actionBtnSuccess}`}
                                                onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                title={user.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.is_active ? (
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <h3>No users found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Edit Role Modal */}
            {showModal && selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Edit User Role</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.userPreview}>
                                <div className={styles.avatar}>
                                    <span>{getInitials(selectedUser.full_name || selectedUser.email)}</span>
                                </div>
                                <div>
                                    <span className={styles.userName}>{selectedUser.full_name || 'No name'}</span>
                                    <span className={styles.userEmail}>{selectedUser.email}</span>
                                </div>
                            </div>

                            <div className={styles.roleOptions}>
                                <label className={styles.roleOption}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={selectedUser.role === 'user'}
                                        onChange={() => setSelectedUser({ ...selectedUser, role: 'user' })}
                                    />
                                    <div className={styles.roleOptionContent}>
                                        <span className={styles.roleOptionTitle}>User</span>
                                        <span className={styles.roleOptionDesc}>Standard user with access to subscribed services</span>
                                    </div>
                                </label>

                                <label className={styles.roleOption}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={selectedUser.role === 'admin'}
                                        onChange={() => setSelectedUser({ ...selectedUser, role: 'admin' })}
                                    />
                                    <div className={styles.roleOptionContent}>
                                        <span className={styles.roleOptionTitle}>Admin</span>
                                        <span className={styles.roleOptionDesc}>Can manage users, subscriptions, and payments</span>
                                    </div>
                                </label>

                                <label className={styles.roleOption}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="super_admin"
                                        checked={selectedUser.role === 'super_admin'}
                                        onChange={() => setSelectedUser({ ...selectedUser, role: 'super_admin' })}
                                    />
                                    <div className={styles.roleOptionContent}>
                                        <span className={styles.roleOptionTitle}>Super Admin</span>
                                        <span className={styles.roleOptionDesc}>Full access to all features and settings</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={styles.saveBtn}
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
