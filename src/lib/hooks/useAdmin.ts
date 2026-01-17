// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useAdmin() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAdmin, isSuperAdmin } = useAuth();
    const supabase = getSupabaseClient();

    // Check if current user has a specific permission
    const hasPermission = (permissionName) => {
        // Super admin has all permissions
        if (isSuperAdmin) return true;

        // TODO: Implement permission checking from admin_role_assignments
        return isAdmin;
    };

    // Fetch all users (admin only)
    const fetchUsers = async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        }
    };

    // Fetch all roles
    const fetchRoles = async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('admin_roles')
                .select('*')
                .order('name');

            if (error) throw error;
            setRoles(data || []);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError(err.message);
        }
    };

    // Fetch all permissions
    const fetchPermissions = async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('admin_permissions')
                .select('*')
                .order('name');

            if (error) throw error;
            setPermissions(data || []);
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err.message);
        }
    };

    // Fetch all subscriptions (for admin management)
    const fetchAllSubscriptions = async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
          *,
          user:profiles!user_id(*),
          service:services(*)
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Subscriptions fetch issue (check RLS policies):', error.message || error);
                return;
            }
            setSubscriptions(data || []);
        } catch (err) {
            // Silently handle - likely RLS policy issue
            console.warn('Subscriptions access denied - ensure admin role is set correctly');
        }
    };

    // Fetch pending payments
    const fetchPendingPayments = async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          user:profiles(*),
          subscription:subscriptions(*, service:services(*))
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Payments fetch issue (check RLS policies):', error.message || error);
                return;
            }
            setPayments(data || []);
        } catch (err) {
            // Silently handle - likely RLS policy issue
            console.warn('Payments access denied - ensure admin role is set correctly');
        }
    };

    // Update user profile (admin action)
    const updateUser = async (userId, updates) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            // Log the action
            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'update_user',
                table_name: 'profiles',
                record_id: userId,
                new_data: updates,
            });

            await fetchUsers();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    };

    // Approve or reject payment
    const processPayment = async (paymentId, status, notes = '') => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { data: payment, error: fetchError } = await supabase
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .single();

            if (fetchError) throw fetchError;

            // Update payment status
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    status,
                    processed_by: user.id,
                    processed_at: new Date().toISOString(),
                    notes,
                })
                .eq('id', paymentId);

            if (updateError) throw updateError;

            // If approved, activate the subscription
            if (status === 'approved' && payment.subscription_id) {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1); // Add 1 month

                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        starts_at: new Date().toISOString(),
                        expires_at: expiryDate.toISOString(),
                        renewed_by: user.id,
                        renewed_at: new Date().toISOString(),
                    })
                    .eq('id', payment.subscription_id);
            }

            // Log the action
            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: `payment_${status}`,
                table_name: 'payments',
                record_id: paymentId,
                new_data: { status, notes },
            });

            await fetchPendingPayments();
            await fetchAllSubscriptions();

            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Renew subscription manually (admin action)
    const renewSubscription = async (subscriptionId, durationMonths = 1) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { data: sub, error: fetchError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('id', subscriptionId)
                .single();

            if (fetchError) throw fetchError;

            const now = new Date();
            const currentExpiry = sub.expires_at ? new Date(sub.expires_at) : now;
            const startFrom = currentExpiry > now ? currentExpiry : now;
            const newExpiry = new Date(startFrom);
            newExpiry.setMonth(newExpiry.getMonth() + durationMonths);

            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    starts_at: sub.starts_at || now.toISOString(),
                    expires_at: newExpiry.toISOString(),
                    renewed_by: user.id,
                    renewed_at: now.toISOString(),
                })
                .eq('id', subscriptionId);

            if (updateError) throw updateError;

            // Log the action
            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'renew_subscription',
                table_name: 'subscriptions',
                record_id: subscriptionId,
                new_data: { duration_months: durationMonths },
            });

            await fetchAllSubscriptions();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Pause subscription (admin action)
    const pauseSubscription = async (subscriptionId) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: 'inactive' })
                .eq('id', subscriptionId);

            if (error) throw error;

            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'pause_subscription',
                table_name: 'subscriptions',
                record_id: subscriptionId,
            });

            await fetchAllSubscriptions();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Update subscription dates (admin action)
    const updateSubscriptionDates = async (subscriptionId, updates) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const updateData = {};
            if (updates.starts_at) updateData.starts_at = updates.starts_at;
            if (updates.expires_at) updateData.expires_at = updates.expires_at;
            if (updates.status) updateData.status = updates.status;
            if (updates.plan_type) updateData.plan_type = updates.plan_type;
            if (updates.service_id) updateData.service_id = updates.service_id;

            const { error } = await supabase
                .from('subscriptions')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', subscriptionId);

            if (error) throw error;

            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'update_subscription_dates',
                table_name: 'subscriptions',
                record_id: subscriptionId,
                new_data: updates,
            });

            await fetchAllSubscriptions();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Create subscription for user (admin action)
    const createSubscription = async (subscriptionData) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: subscriptionData.user_id,
                    service_id: subscriptionData.service_id,
                    plan_type: subscriptionData.plan_type || 'monthly',
                    status: subscriptionData.status || 'active',
                    starts_at: subscriptionData.starts_at || new Date().toISOString(),
                    expires_at: subscriptionData.expires_at,
                })
                .select()
                .single();

            if (error) throw error;

            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'create_subscription',
                table_name: 'subscriptions',
                record_id: data.id,
                new_data: subscriptionData,
            });

            await fetchAllSubscriptions();
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    };

    // Cancel/End subscription (admin action)
    const cancelSubscription = async (subscriptionId) => {
        if (!isAdmin) return { error: 'Unauthorized' };

        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'expired',
                    expires_at: new Date().toISOString(),
                })
                .eq('id', subscriptionId);

            if (error) throw error;

            await supabase.from('audit_log').insert({
                user_id: user.id,
                action: 'cancel_subscription',
                table_name: 'subscriptions',
                record_id: subscriptionId,
            });

            await fetchAllSubscriptions();
            return { error: null };
        } catch (err) {
            return { error: err.message };
        }
    };

    // Load all admin data
    const loadAdminData = async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        await Promise.all([
            fetchUsers(),
            fetchRoles(),
            fetchPermissions(),
            fetchAllSubscriptions(),
            fetchPendingPayments(),
        ]);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) {
            loadAdminData();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    return {
        users,
        roles,
        permissions,
        subscriptions,
        payments,
        services: [],
        loading,
        error,
        hasPermission,
        updateUser,
        processPayment,
        renewSubscription,
        pauseSubscription,
        updateSubscriptionDates,
        createSubscription,
        cancelSubscription,
        refetch: loadAdminData,
        fetchUsers,
        fetchRoles,
        fetchPermissions,
        fetchAllSubscriptions,
        fetchPendingPayments,
        // Service management functions
        fetchServices: async () => {
            if (!isAdmin) return [];
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('name');
                if (error) throw error;
                return data || [];
            } catch (err) {
                console.warn('Error fetching services:', err.message || err);
                return [];
            }
        },
        createService: async (serviceData) => {
            if (!isAdmin) return { error: 'Unauthorized' };
            try {
                const { data, error } = await supabase
                    .from('services')
                    .insert(serviceData)
                    .select()
                    .single();
                if (error) throw error;
                return { data, error: null };
            } catch (err) {
                console.error('Error creating service:', err);
                return { data: null, error: err.message };
            }
        },
        updateService: async (serviceId, updates) => {
            if (!isAdmin) return { error: 'Unauthorized' };
            try {
                const { data, error } = await supabase
                    .from('services')
                    .update(updates)
                    .eq('id', serviceId)
                    .select()
                    .single();
                if (error) throw error;
                return { data, error: null };
            } catch (err) {
                console.error('Error updating service:', err);
                return { data: null, error: err.message };
            }
        },
        deleteService: async (serviceId) => {
            if (!isAdmin) return { error: 'Unauthorized' };
            try {
                // Check if service has active subscriptions
                const { data: subs, error: subError } = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('service_id', serviceId)
                    .limit(1);

                if (subs && subs.length > 0) {
                    return { error: 'Cannot delete service with active subscriptions. Deactivate it instead.' };
                }

                const { error } = await supabase
                    .from('services')
                    .delete()
                    .eq('id', serviceId);

                if (error) throw error;

                // Log the action
                await supabase.from('audit_log').insert({
                    user_id: user.id,
                    action: 'delete_service',
                    table_name: 'services',
                    record_id: serviceId,
                });

                return { error: null };
            } catch (err) {
                console.error('Error deleting service:', err);
                return { error: err.message };
            }
        },
        updateUserRole: async (userId, newRole) => {
            return updateUser(userId, { role: newRole });
        },
        toggleUserStatus: async (userId, isActive) => {
            return updateUser(userId, { is_active: isActive });
        },
        approvePayment: async (paymentId) => {
            return processPayment(paymentId, 'approved');
        },
        rejectPayment: async (paymentId, notes = '') => {
            return processPayment(paymentId, 'rejected', notes);
        },
    };
}

export default useAdmin;
