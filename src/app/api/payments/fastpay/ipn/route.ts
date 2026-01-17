import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateFastPayPayment } from '@/lib/utils/fastpay';

interface IPNBody {
    merchant_order_id?: string;
    status?: string;
    [key: string]: unknown;
}

interface PaymentRecord {
    id: string;
    user_id: string;
    subscription_id: string;
    status: string;
    subscription?: {
        plan_type: string;
        starts_at: string | null;
    };
}

interface IPNResponse {
    success?: boolean;
    message?: string;
    error?: string;
}

// Helper to get admin client
const getSupabaseAdmin = (): SupabaseClient => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

/**
 * POST /api/payments/fastpay/ipn
 * Handle FastPay Instant Payment Notification (IPN) webhook
 */
export async function POST(req: NextRequest): Promise<NextResponse<IPNResponse>> {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        // IPN data usually comes as form data or JSON
        let body: IPNBody;
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            body = await req.json();
        } else {
            const formData = await req.formData();
            body = Object.fromEntries(formData) as IPNBody;
        }

        console.log('FastPay IPN Received:', body);

        const orderId = body.merchant_order_id;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing merchant_order_id' }, { status: 400 });
        }

        // 1. Check if already processed
        const { data: payment, error: fetchErr } = await supabaseAdmin
            .from('payments')
            .select('*, subscription:subscriptions(*)')
            .eq('id', orderId)
            .single() as { data: PaymentRecord | null; error: unknown };

        if (fetchErr || !payment) {
            console.error('IPN Error: Payment not found', orderId);
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.status === 'approved') {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // 2. Mandatory Validation via FastPay API
        const validationResult = await validateFastPayPayment(orderId);

        if (validationResult.success && validationResult.data?.status === 'success') {
            const fastPayData = validationResult.data;
            const now = new Date();

            // Calculate expiry
            const expiryDate = new Date();
            if (payment.subscription?.plan_type === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            } else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            }

            // 3. Update Database
            // Update Payment
            await supabaseAdmin
                .from('payments')
                .update({
                    status: 'approved',
                    processed_at: now.toISOString(),
                    notes: `Autoprocessed via FastPay IPN. Trans ID: ${fastPayData.gw_transaction_id}`
                })
                .eq('id', orderId);

            // Update Subscription
            await supabaseAdmin
                .from('subscriptions')
                .update({
                    status: 'active',
                    starts_at: payment.subscription?.starts_at || now.toISOString(),
                    expires_at: expiryDate.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq('id', payment.subscription_id);

            // Log the action
            await supabaseAdmin.from('audit_log').insert({
                user_id: payment.user_id,
                action: 'payment_success_fastpay_ipn',
                table_name: 'payments',
                record_id: orderId,
                new_data: fastPayData,
            });

            return NextResponse.json({ success: true });
        }

        // If validation failed or status not success
        console.warn('FastPay IPN Validation failed or non-success status:', validationResult);
        return NextResponse.json({ success: false, message: 'Validation failed' });

    } catch (error) {
        console.error('FastPay IPN Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
