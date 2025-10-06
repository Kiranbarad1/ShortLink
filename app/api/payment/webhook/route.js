import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, plan } = session.metadata;

      // Update user plan in database
      const client = await clientPromise;
      const db = client.db();

      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            plan: plan,
            planUpdatedAt: new Date(),
            stripeSessionId: session.id
          }
        }
      );

      // Extend existing user links based on new plan
      const dbConnect = (await import('../../../../lib/dbConnect')).default;
      const Link = (await import('../../../../models/Link')).default;

      await dbConnect();

      let newExpiry;
      if (plan === 'premium') {
        // Premium: 30 days from now
        newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (plan === 'premium_plus') {
        // Premium Plus: no expiry
        newExpiry = null;
      }

      // Update all user's existing links
      await Link.updateMany(
        { userId: userId },
        { $set: { expiresAt: newExpiry, userPlan: plan } }
      );

      console.log(`User ${userId} upgraded to ${plan}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}