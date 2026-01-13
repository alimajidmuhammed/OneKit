/**
 * WhatsApp Integration Utilities
 * Helpers for WhatsApp Business API integration
 */

/**
 * Format phone number for WhatsApp
 * @param {string} phone - Phone number (e.g., "+964 770 123 4567")
 * @returns {string} - Formatted for WhatsApp (e.g., "964770123456")
 */
export const formatWhatsAppPhone = (phone) => {
    return phone.replace(/[^0-9]/g, '');
};

/**
 * Generate WhatsApp message URL
 * @param {string} phone - Recipient phone number
 * @param {string} message - Pre-filled message
 * @returns {string} - WhatsApp web URL
 */
export const getWhatsAppUrl = (phone, message) => {
    const formattedPhone = formatWhatsAppPhone(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Generate payment completion message for WhatsApp
 * @param {object} orderDetails - Order information
 * @returns {string} - Formatted message
 */
export const generatePaymentMessage = (orderDetails) => {
    const { serviceName, userName, userEmail, amount, currency = 'IQD' } = orderDetails;

    return `مرحباً، أرغب بإكمال الدفع لخدمة OneKit

Hello, I would like to complete payment for OneKit service

📦 Service: ${serviceName}
👤 Name: ${userName}
📧 Email: ${userEmail}
💰 Amount: ${amount.toLocaleString()} ${currency}

شكراً لكم / Thank you!`;
};

/**
 * Send payment request via WhatsApp
 * @param {object} orderDetails - Order information
 * @param {string} businessPhone - Business WhatsApp number
 */
export const sendPaymentRequest = (orderDetails, businessPhone = '+9647701234567') => {
    const message = generatePaymentMessage(orderDetails);
    const url = getWhatsAppUrl(businessPhone, message);
    window.open(url, '_blank');
};

/**
 * Generate subscription renewal reminder message
 * @param {object} subscriptionDetails - Subscription information
 * @returns {string} - Formatted message
 */
export const generateRenewalMessage = (subscriptionDetails) => {
    const { serviceName, expiryDate, userName } = subscriptionDetails;

    return `مرحباً ${userName}، اشتراكك في ${serviceName} سينتهي في ${expiryDate}

Hello ${userName}, your ${serviceName} subscription expires on ${expiryDate}

تجديد الاشتراك؟ / Renew subscription?

شكراً / Thank you!`;
};

/**
 * Placeholder for future WhatsApp Business API integration
 * TODO: Integrate with api.whatsapp.com when Business API is set up
 */
export const sendWhatsAppMessage = async (phone, message) => {
    // Future: Implement actual WhatsApp Business API call
    // For now, this is a placeholder that opens WhatsApp Web
    console.log('WhatsApp API not configured. Opening WhatsApp Web...');
    window.open(getWhatsAppUrl(phone, message), '_blank');
    return { success: true, method: 'web' };
};
