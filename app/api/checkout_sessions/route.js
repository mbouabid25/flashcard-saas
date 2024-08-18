import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe client with the secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function POST(req) {
  try {
    const { priceId, planType } = await req.json(); // Get the priceId or planType from the request body
    const referer = req.headers.get('Referer') || '';

    let params;

    if (planType === 'free') {
      // Handle the free plan separately, possibly by setting a success message
      return NextResponse.json({ success: true, message: 'Free plan activated' }, { status: 200 });
    } else if (planType === 'paid') {
      // Ensure that the priceId corresponds to a recurring price in Stripe
      params = {
        mode: 'subscription', // Use subscription mode for paid plans
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId, // Use the priceId passed from the client
            quantity: 1,
          },
        ],
        success_url: `${referer}success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${referer}error?session_id={CHECKOUT_SESSION_ID}`,
      };
    }

    // Create the checkout session for the paid plan
    if (params) {
      const checkoutSession = await stripe.checkout.sessions.create(params);
      return NextResponse.json(checkoutSession, { status: 200 });
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}