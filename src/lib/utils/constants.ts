// @ts-nocheck
// Services configuration
export const SERVICES = [
    {
        id: 'cv-maker',
        name: 'CV Maker',
        slug: 'cv-maker',
        category: 'Resumes',
        description: 'Create professional resumes and CVs with modern templates',
        image: '/images/previews/cv-maker.png',
        icon: 'document',
        color: 'primary',
        isFree: true,
        dashboardPath: '/dashboard/cv-maker',
        features: [
            'Multiple professional templates',
            'Export to PDF',
            'Custom sections',
            'Real-time preview',
            'ATS-friendly formats',
        ],
    },
    {
        id: 'menu-maker',
        name: 'Menu Maker',
        slug: 'menu-maker',
        category: 'Restaurants',
        description: 'Design beautiful restaurant and cafe menus',
        image: '/images/previews/menu-maker.png',
        icon: 'menu',
        color: 'accent',
        isFree: false,
        price_yearly: 25000,
        priceLabel: '25,000 IQD / Year',
        dashboardPath: '/dashboard/menu-maker',
        features: [
            'Restaurant menu templates',
            'Category organization',
            'Price formatting',
            'QR code export',
            'Multi-language support',
        ],
    },
    {
        id: 'qr-generator',
        name: 'QR Generator',
        slug: 'qr-generator',
        category: 'Technology',
        description: 'Generate dynamic QR codes for any purpose',
        image: '/images/previews/qr-generator.png',
        icon: 'qr',
        color: 'success',
        isFree: false,
        price_yearly: 10000,
        priceLabel: '10,000 IQD / Year',
        dashboardPath: '/dashboard/qr-generator',
        features: [
            'URL QR codes',
            'vCard contacts',
            'WiFi access',
            'Custom styling',
            'Analytics tracking',
        ],
    },

    {
        id: 'invoice-maker',
        name: 'Invoice Maker',
        slug: 'invoice-maker',
        category: 'Business',
        description: 'Create and manage professional invoices',
        image: '/images/previews/invoice-maker.png',
        icon: 'invoice',
        color: 'info',
        isFree: true,
        dashboardPath: '/dashboard/invoice-maker',
        features: [
            'Professional templates',
            'Client management',
            'Tax calculations',
            'PDF export',
            'Payment tracking',
        ],
    },
    {
        id: 'card-maker',
        name: 'Business Card Maker',
        slug: 'card-maker',
        category: 'Networking',
        description: 'Design professional business cards ready for print',
        image: '/images/previews/card-maker.png',
        icon: 'card',
        color: 'primary',
        isFree: true,
        dashboardPath: '/dashboard/card-maker',
        features: [
            'Double-sided designs',
            'QR code integration',
            'Print-ready export',
            'Modern templates',
            'Custom sizing',
        ],
    },
];

// App configuration
export const APP_CONFIG = {
    name: 'OneKit',
    tagline: 'All Your Professional Tools in One Place',
    description: 'Create CVs, menus, QR codes, and more with our easy-to-use professional tools.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // WhatsApp configuration for payments
    whatsapp: {
        number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+9647701493503',
        defaultMessage: 'Hello,\nHow can I pay for this service ?\n\nBest Regards',
    },

    // Trial configuration
    trial: {
        days: 2, // 2-day trial for all paid services
    },

    // Pricing (in IQD) - Yearly only
    pricing: {
        currency: 'IQD',
        qr_yearly: 10000,
        menu_yearly: 25000,
        // CV Maker, Invoice Maker, Business Card Maker are FREE
    },

    // Social links
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
    },
};

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
    PENDING: 'pending',
};

// Payment statuses
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

// User roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
};

// Navigation items
export const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/#services' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Contact', href: '/#contact' },
];

export const DASHBOARD_NAV = [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'My Services', href: '/dashboard/services', icon: 'services' },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: 'subscription' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
];

export const ADMIN_NAV = [
    { label: 'Overview', href: '/admin', icon: 'dashboard' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    { label: 'Users', href: '/admin/users', icon: 'users' },
    { label: 'Services', href: '/admin/services', icon: 'services' },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'subscription' },
    { label: 'Payments', href: '/admin/payments', icon: 'payment' },
    { label: 'Roles & Permissions', href: '/admin/roles', icon: 'roles' },
    { label: 'Audit Logs', href: '/admin/logs', icon: 'logs' },
    { label: 'Settings', href: '/admin/settings', icon: 'settings' },
];

