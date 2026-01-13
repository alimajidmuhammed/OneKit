// Format date to readable string
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };

    return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

// Format date with time
export function formatDateTime(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Format currency
export function formatCurrency(amount, currency = 'IQD') {
    if (currency === 'IQD') {
        return `${amount.toLocaleString()} IQD`;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

// Get initials from name
export function getInitials(name) {
    if (!name) return '?';

    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Truncate text
export function truncate(text, length = 100) {
    if (!text || text.length <= length) return text;
    return text.slice(0, length).trim() + '...';
}

// Generate WhatsApp link
export function getWhatsAppLink(number, message = '') {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

// Calculate days remaining
export function getDaysRemaining(expiryDate) {
    if (!expiryDate) return null;

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Check if subscription is expiring soon (within 7 days)
export function isExpiringSoon(expiryDate, days = 7) {
    const remaining = getDaysRemaining(expiryDate);
    return remaining !== null && remaining > 0 && remaining <= days;
}

// Check if subscription has expired
export function isExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

// Slugify text
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Class name utility (like clsx)
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Delay helper
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Validate email
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Format phone number
export function formatPhone(phone) {
    if (!phone) return '';
    // Format for Iraqi numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('964')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
}

// Generate random ID
export function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
