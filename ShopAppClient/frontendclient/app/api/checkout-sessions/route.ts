import { CartItem } from '@/types/types';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use a recent, standard API version.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: Request) {
  const body = await request.json();
  const { cartItems, total, email } = body;

  // Input validation (highly recommended)
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json(
      { error: 'Cart items are required.' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map((item: CartItem) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product.productName || 'Sản phẩm' },
          unit_amount: Math.round(item.product.specialPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${
        new URL(request.url).origin
      }/site/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(request.url).origin}/cancel`,
      customer_email: email, // ✅ gửi email cho Stripe
    });

    // Trả về URL để client redirect
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json(
      // Cast error to ensure .message is available
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
