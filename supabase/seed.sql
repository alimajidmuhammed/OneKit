-- ============================================
-- OneKit Seed Data
-- Initial services and admin permissions
-- ============================================

-- ============================================
-- Insert Default Services
-- ============================================
INSERT INTO public.services (name, slug, description, icon, price_monthly, price_yearly, features) VALUES
(
    'CV Maker',
    'cv-maker',
    'Create professional resumes and CVs with modern templates',
    'document',
    15000,
    150000,
    '["Multiple professional templates", "Export to PDF", "Custom sections", "Real-time preview", "ATS-friendly formats"]'::jsonb
),
(
    'Menu Maker',
    'menu-maker',
    'Design beautiful restaurant and cafe menus',
    'menu',
    15000,
    150000,
    '["Restaurant menu templates", "Category organization", "Price formatting", "QR code export", "Multi-language support"]'::jsonb
),
(
    'QR Generator',
    'qr-generator',
    'Generate dynamic QR codes for any purpose',
    'qr',
    15000,
    150000,
    '["URL QR codes", "vCard contacts", "WiFi access", "Custom styling", "Analytics tracking"]'::jsonb
),
(
    'Invoice Maker',
    'invoice-maker',
    'Create and manage professional invoices',
    'invoice',
    15000,
    150000,
    '["Professional templates", "Client management", "Tax calculations", "PDF export", "Payment tracking"]'::jsonb
),
(
    'Logo Maker',
    'logo-maker',
    'Design stunning logos for your brand',
    'logo',
    15000,
    150000,
    '["Icon library", "Font pairings", "Color palettes", "Multiple formats", "Brand kit export"]'::jsonb
),
(
    'Business Card Maker',
    'card-maker',
    'Design professional business cards',
    'card',
    15000,
    150000,
    '["Double-sided designs", "QR code integration", "Print-ready export", "Modern templates", "Custom sizing"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Insert Default Admin Permissions
-- ============================================
INSERT INTO public.admin_permissions (name, description) VALUES
('users.view', 'View all users'),
('users.edit', 'Edit user profiles'),
('users.delete', 'Delete users'),
('users.role', 'Change user roles'),
('services.view', 'View all services'),
('services.edit', 'Edit services'),
('services.create', 'Create new services'),
('services.delete', 'Delete services'),
('subscriptions.view', 'View all subscriptions'),
('subscriptions.edit', 'Edit subscriptions'),
('subscriptions.renew', 'Renew subscriptions'),
('subscriptions.pause', 'Pause subscriptions'),
('payments.view', 'View all payments'),
('payments.approve', 'Approve payments'),
('payments.reject', 'Reject payments'),
('roles.view', 'View roles and permissions'),
('roles.edit', 'Edit roles'),
('roles.assign', 'Assign roles to users'),
('settings.view', 'View settings'),
('settings.edit', 'Edit settings'),
('audit.view', 'View audit logs')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Insert Default Admin Roles
-- ============================================

-- Get permission IDs for each role
DO $$
DECLARE
    support_permissions UUID[];
    manager_permissions UUID[];
BEGIN
    -- Support role: view-only + approve payments
    SELECT ARRAY_AGG(id) INTO support_permissions
    FROM public.admin_permissions
    WHERE name IN (
        'users.view',
        'services.view',
        'subscriptions.view',
        'payments.view',
        'payments.approve',
        'payments.reject'
    );

    -- Manager role: most permissions except role management
    SELECT ARRAY_AGG(id) INTO manager_permissions
    FROM public.admin_permissions
    WHERE name NOT IN ('roles.edit', 'roles.assign', 'users.delete', 'services.delete');

    -- Insert roles
    INSERT INTO public.admin_roles (name, description, permissions) VALUES
    ('Support', 'Customer support with limited access', support_permissions),
    ('Manager', 'Manager with full access except role management', manager_permissions)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- ============================================
-- Note: First Admin User
-- ============================================
-- To make a user an admin, run:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
-- 
-- Or use Supabase Dashboard to edit the profiles table directly.
