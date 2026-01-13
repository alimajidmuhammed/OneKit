-- ============================================
-- OneKit Row Level Security Policies
-- Supabase PostgreSQL
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function to check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Profiles Policies
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (public.is_admin());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Users cannot change their own role
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (public.is_admin());

-- Super admins can insert profiles (for manual user creation)
CREATE POLICY "Super admins can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- ============================================
-- Services Policies
-- ============================================

-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
    ON public.services
    FOR SELECT
    USING (is_active = true);

-- Admins can view all services
CREATE POLICY "Admins can view all services"
    ON public.services
    FOR SELECT
    USING (public.is_admin());

-- Admins can manage services
CREATE POLICY "Admins can insert services"
    ON public.services
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services"
    ON public.services
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Super admins can delete services"
    ON public.services
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================
-- Subscriptions Policies
-- ============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (public.is_admin());

-- Users can create their own subscriptions (pending status only)
CREATE POLICY "Users can create own subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        status = 'pending'
    );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can insert subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete subscriptions"
    ON public.subscriptions
    FOR DELETE
    USING (public.is_admin());

-- ============================================
-- Payments Policies
-- ============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON public.payments
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON public.payments
    FOR SELECT
    USING (public.is_admin());

-- Users can create their own payment records
CREATE POLICY "Users can create own payments"
    ON public.payments
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        status = 'pending'
    );

-- Admins can manage all payments
CREATE POLICY "Admins can update payments"
    ON public.payments
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete payments"
    ON public.payments
    FOR DELETE
    USING (public.is_admin());

-- ============================================
-- Admin Permissions Policies
-- ============================================

-- Only admins can view permissions
CREATE POLICY "Admins can view permissions"
    ON public.admin_permissions
    FOR SELECT
    USING (public.is_admin());

-- Only super admins can manage permissions
CREATE POLICY "Super admins can manage permissions"
    ON public.admin_permissions
    FOR ALL
    USING (public.is_super_admin());

-- ============================================
-- Admin Roles Policies
-- ============================================

-- Admins can view roles
CREATE POLICY "Admins can view roles"
    ON public.admin_roles
    FOR SELECT
    USING (public.is_admin());

-- Only super admins can manage roles
CREATE POLICY "Super admins can manage roles"
    ON public.admin_roles
    FOR ALL
    USING (public.is_super_admin());

-- ============================================
-- Admin Role Assignments Policies
-- ============================================

-- Admins can view role assignments
CREATE POLICY "Admins can view role assignments"
    ON public.admin_role_assignments
    FOR SELECT
    USING (public.is_admin());

-- Only super admins can manage role assignments
CREATE POLICY "Super admins can manage role assignments"
    ON public.admin_role_assignments
    FOR ALL
    USING (public.is_super_admin());

-- ============================================
-- Audit Log Policies
-- ============================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON public.audit_log
    FOR SELECT
    USING (public.is_admin());

-- System can insert audit logs (via functions)
CREATE POLICY "System can insert audit logs"
    ON public.audit_log
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- No one can update or delete audit logs
-- (No UPDATE or DELETE policies = denied by default)
