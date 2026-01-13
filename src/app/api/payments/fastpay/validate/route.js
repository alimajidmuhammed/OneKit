import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { validateFastPayPayment } from '@/lib/utils/fastpay';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Database Status first
        const { data: payment, error: payErr } = await supabase
            .from('payments')
            .select('*, subscription:subscriptions(*)')
            .eq('id', orderId)
            .eq('user_id', session.user.id)
            .single();

        if (payErr || !payment) {
            return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
        }

        if (payment.status === 'approved') {
            return NextResponse.json({ success: true, status: 'approved' });
        }

        if (payment.status === 'rejected') {
            return NextResponse.json({ success: false, status: 'rejected' });
        }

        // 3. Proactively Validate with FastPay if still pending
        const validationResult = await validateFastPayPayment(orderId);

        if (validationResult.success && validationResult.data.status === 'success') {
            const fastPayData = validationResult.data;
            const now = new Date();

            // Calculate expiry based on plan_type
            const expiryDate = new Date();
            if (payment.subscription?.plan_type === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            } else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            }

            // 4. Atomic Update: Payment and Subscription
            // Update Payment
            const { error: updatePayErr } = await supabase
                .from('payments')
                .update({
                    status: 'approved',
                    processed_at: now.toISOString(),
                    notes: `Autoprocessed via FastPay. Trans ID: ${fastPayData.gw_transaction_id}`
                })
                .eq('id', orderId);

            if (updatePayErr) throw updatePayErr;

            // Update Subscription
            const { error: updateSubErr } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    starts_at: payment.subscription.starts_at || now.toISOString(),
                    expires_at: expiryDate.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq('id', payment.subscription_id);

            if (updateSubErr) throw updateSubErr;

            // Create Audit Log
            await supabase.from('audit_log').insert({
                user_id: session.user.id,
                action: 'payment_success_fastpay',
                table_name: 'payments',
                record_id: orderId,
                new_data: fastPayData,
            });

            return NextResponse.json({ success: true, status: 'approved' });
        }

        return NextResponse.json({ success: false, status: payment.status });

    } catch (error) {
        console.error('FastPay Validation API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
