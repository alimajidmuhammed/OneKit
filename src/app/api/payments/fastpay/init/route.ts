import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFastPayQR } from '@/lib/utils/fastpay';

interface InitPaymentRequest {
    service_id: string;
    plan_type: 'monthly' | 'yearly';
}

interface ServiceRecord {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    price_yearly: number;
}

interface InitPaymentResponse {
    success?: boolean;
    orderId?: string;
    qrUrl?: string;
    qrText?: string;
    amount?: number;
    serviceName?: string;
    error?: string;
}

/**
 * POST /api/payments/fastpay/init
 * Initialize a FastPay payment and generate QR code
 */
export async function POST(req: NextRequest): Promise<NextResponse<InitPaymentResponse>> {
    try {
        const supabase = await createClient();

        // 1. Check Auth - Using getUser() instead of getSession() for security
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: InitPaymentRequest = await req.json();
        const { service_id, plan_type } = body;

        if (!service_id || !plan_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Get Service Price
        // Check if service_id is a UUID or a slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(service_id);

        let query = supabase.from('services').select('*');
        if (isUUID) {
            query = query.eq('id', service_id);
        } else {
            query = query.eq('slug', service_id);
        }

        const { data: svc, error: svcErr } = await query.single() as { data: ServiceRecord | null; error: unknown };

        if (svcErr || !svc) {
            console.error('Service lookup failed:', svcErr, service_id);
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Use the actual database UUID from here on
        const dbServiceId = svc.id;

        // Amount comes from the service's own price
        const amount = plan_type === 'yearly'
            ? svc.price_yearly
            : svc.price_monthly || svc.price_yearly;

        // 3. Find or Create Pending Subscription
        let { data: subscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('service_id', dbServiceId)
            .single();

        if (!subscription) {
            const { data: newSub, error: createSubErr } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    service_id: dbServiceId,
                    plan_type: plan_type,
                    status: 'pending',
                })
                .select()
                .single();

            if (createSubErr) throw createSubErr;
            subscription = newSub;
        }

        // 4. Create Pending Payment Record
        const { data: payment, error: payErr } = await supabase
            .from('payments')
            .insert({
                user_id: user.id,
                subscription_id: subscription.id,
                amount: amount,
                currency: 'IQD',
                payment_method: 'fastpay',
                status: 'pending',
                notes: `FastPay Automated Payment for ${svc.name} (${plan_type})`,
            })
            .select()
            .single();

        if (payErr) throw payErr;

        // 5. Generate FastPay QR
        // Use payment.id as the unique orderID for FastPay
        const qrResult = await generateFastPayQR(payment.id, amount);

        if (!qrResult.success) {
            // Update payment record with error
            await supabase.from('payments')
                .update({ notes: `FastPay QR Generation Failed: ${qrResult.error}` })
                .eq('id', payment.id);

            return NextResponse.json({ error: qrResult.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            orderId: payment.id,
            qrUrl: qrResult.data?.qrUrl,
            qrText: qrResult.data?.qrText,
            amount,
            serviceName: svc.name,
        });

    } catch (error) {
        console.error('FastPay Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
