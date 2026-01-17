'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import styles from './roles.module.css';

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

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Roles & Permissions</h1>
                    <p>Manage admin roles and their permissions</p>
                </div>
                <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Role
                </button>
            </div>

            <div className={styles.layout}>
                {/* Roles List */}
                <div className={styles.rolesPanel}>
                    <h2 className={styles.panelTitle}>Roles</h2>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                        </div>
                    ) : (
                        <div className={styles.rolesList}>
                            {/* Default Roles */}
                            <div
                                className={`${styles.roleItem} ${selectedRole === 'super_admin' ? styles.roleActive : ''}`}
                                onClick={() => setSelectedRole('super_admin')}
                            >
                                <div className={styles.roleIcon}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M12 15l-2 5 4-2 4 2-2-5" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className={styles.roleInfo}>
                                    <span className={styles.roleName}>Super Admin</span>
                                    <span className={styles.roleDesc}>Full access to everything</span>
                                </div>
                                <span className={styles.systemBadge}>System</span>
                            </div>

                            <div
                                className={`${styles.roleItem} ${selectedRole === 'admin' ? styles.roleActive : ''}`}
                                onClick={() => setSelectedRole('admin')}
                            >
                                <div className={styles.roleIcon}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 14v7M3 9v7l9 5 9-5V9" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className={styles.roleInfo}>
                                    <span className={styles.roleName}>Admin</span>
                                    <span className={styles.roleDesc}>Manage users and content</span>
                                </div>
                                <span className={styles.systemBadge}>System</span>
                            </div>

                            <div
                                className={`${styles.roleItem} ${selectedRole === 'user' ? styles.roleActive : ''}`}
                                onClick={() => setSelectedRole('user')}
                            >
                                <div className={styles.roleIcon}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className={styles.roleInfo}>
                                    <span className={styles.roleName}>User</span>
                                    <span className={styles.roleDesc}>Standard user access</span>
                                </div>
                                <span className={styles.systemBadge}>System</span>
                            </div>

                            {/* Custom Roles */}
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`${styles.roleItem} ${selectedRole === role.id ? styles.roleActive : ''}`}
                                    onClick={() => setSelectedRole(role.id)}
                                >
                                    <div className={styles.roleIcon}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div className={styles.roleInfo}>
                                        <span className={styles.roleName}>{role.name}</span>
                                        <span className={styles.roleDesc}>{role.description || 'Custom role'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Permissions Panel */}
                <div className={styles.permissionsPanel}>
                    <h2 className={styles.panelTitle}>
                        {selectedRole ? `Permissions for ${typeof selectedRole === 'string' ? selectedRole.replace('_', ' ') : roles.find(r => r.id === selectedRole)?.name}` : 'Select a Role'}
                    </h2>

                    {selectedRole ? (
                        <div className={styles.permissionsGrid}>
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className={styles.permissionGroup}>
                                    <h3 className={styles.categoryTitle}>{category}</h3>
                                    <div className={styles.permissionsList}>
                                        {perms.map((perm) => (
                                            <label key={perm.id} className={styles.permissionItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRole === 'super_admin' || (selectedRole === 'admin' && !perm.name.includes('delete'))}
                                                    disabled={selectedRole === 'super_admin' || selectedRole === 'admin' || selectedRole === 'user'}
                                                    readOnly
                                                />
                                                <div className={styles.permissionInfo}>
                                                    <span className={styles.permissionName}>{perm.name}</span>
                                                    <span className={styles.permissionDesc}>{perm.description}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noSelection}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 15l-2 5 4-2 4 2-2-5" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <p>Select a role to view its permissions</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Role Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Role</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Role Name</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g., Moderator"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={newRoleDesc}
                                    onChange={(e) => setNewRoleDesc(e.target.value)}
                                    placeholder="Brief description of this role..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.createBtn}>
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
