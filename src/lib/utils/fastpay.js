/**
 * FastPay Payment Gateway Utility
 * Handles interactions with FastPay QR and Validation APIs
 */

const FASTPAY_CONFIG = {
    sandbox: {
        baseUrl: 'https://staging-qr.fast-pay.iq',
        storeId: process.env.FASTPAY_STORE_ID || '1000007066_485',
        storePassword: process.env.FASTPAY_STORE_PASSWORD || 'Password100@',
    },
    production: {
        baseUrl: 'https://qr.fast-pay.iq',
        storeId: process.env.FASTPAY_STORE_ID,
        storePassword: process.env.FASTPAY_STORE_PASSWORD,
    },
    isSandbox: process.env.NEXT_PUBLIC_FASTPAY_MODE === 'sandbox' || process.env.NODE_ENV !== 'production',
    currency: 'IQD',
};

const getEnvConfig = () => {
    return FASTPAY_CONFIG.isSandbox ? FASTPAY_CONFIG.sandbox : FASTPAY_CONFIG.production;
};

/**
 * Generate a QR code for payment
 * @param {string} orderId Unique merchant generated order ID
 * @param {number} amount Total payable (Min 1000)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function generateFastPayQR(orderId, amount) {
    const config = getEnvConfig();

    try {
        const payload = {
            storeId: config.storeId,
            storePassword: config.storePassword,
            orderId: orderId, // Fixed casing from orderID to orderId
            billAmount: Math.round(amount),
            currency: FASTPAY_CONFIG.currency, // Fixed: use FASTPAY_CONFIG.currency instead of config.currency
        };

        const response = await fetch(`${config.baseUrl}/api/v1/public/vending/qr`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        // Detailed logging for debugging
        console.log('FastPay QR Request:', { ...payload, storePassword: '***' });
        console.log('FastPay QR Response:', JSON.stringify(result, null, 2));

        if (result.code === 200) {
            return {
                success: true,
                data: result.data, // Contains qrUrl and qrText
            };
        } else {
            return {
                success: false,
                error: result.errors?.[0] || result.messages?.[0] || result.message || 'Failed to generate FastPay QR',
            };
        }
    } catch (error) {
        console.error('FastPay QR Generation Error:', error);
        return {
            success: false,
            error: error.message || 'Network error while connecting to FastPay',
        };
    }
}

/**
 * Validate a payment with FastPay
 * @param {string} orderId Merchant Generated Unique Order ID
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function validateFastPayPayment(orderId) {
    const config = getEnvConfig();

    try {
        const response = await fetch(`${config.baseUrl}/api/v1/public/vending/validate`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                storeId: config.storeId,
                storePassword: config.storePassword,
                orderId: orderId,
            }),
        });

        const result = await response.json();

        if (result.code === 200) {
            return {
                success: true,
                data: result.data, // Contains gw_transaction_id, received_amount, status, etc.
            };
        } else {
            return {
                success: false,
                error: result.messages || 'Payment validation failed',
            };
        }
    } catch (error) {
        console.error('FastPay Validation Error:', error);
        return {
            success: false,
            error: error.message || 'Network error while validating FastPay payment',
        };
    }
}
