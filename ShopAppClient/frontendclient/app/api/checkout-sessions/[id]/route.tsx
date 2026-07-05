// app/api/checkout-session/[id]/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as string) || 'sk_test_dummy', {
  apiVersion: '2025-10-29.clover',
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log('🪪 Received params:', resolvedParams);
  const { id } = resolvedParams;

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['line_items'],
    });
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
