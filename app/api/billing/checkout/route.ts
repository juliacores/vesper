import { NextRequest, NextResponse } from 'next/server';
import { createApiClient } from '@/lib/supabase/api';
import { getStripe, PRICE_ID_MONTHLY, PRICE_ID_YEARLY } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { supabase, token } = createApiClient(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = body?.plan === 'monthly' ? 'monthly' : 'yearly';
    const selectedPriceId = plan === 'monthly' ? PRICE_ID_MONTHLY : PRICE_ID_YEARLY;

    if (!selectedPriceId) {
      return NextResponse.json(
        { error: 'Billing is not configured yet.' },
        { status: 503 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: userData?.email || user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const origin = request.headers.get('origin') || request.nextUrl.origin;

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall?cancelled=true`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
