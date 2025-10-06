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

      console.log('Webhook received:', { userId, plan, sessionId: session.id });

      // Update user plan in database
      const client = await clientPromise;
      const db = client.db();
      
      const userUpdate = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            plan: plan,
            planUpdatedAt: new Date(),
            stripeSessionId: session.id
          } 
        }
      );

      console.log('User update result:', userUpdate);

      // Extend existing user links based on new plan configuration
      const dbConnect = (await import('../../../../lib/dbConnect')).default;
      const Link = (await import('../../../../models/Link')).default;
      const Plan = (await import('../../../../models/Plan')).default;
      
      await dbConnect();
      
      // Get plan configuration from database
      const planConfig = await Plan.findOne({ name: plan, isActive: true });
      
      let newExpiry;
      if (planConfig && planConfig.linkExpiryDays) {
        // Set expiry based on plan configuration
        newExpiry = new Date(Date.now() + planConfig.linkExpiryDays * 24 * 60 * 60 * 1000);
      } else {
        // No expiry for lifetime plans
        newExpiry = null;
      }
      
      // Update all user's existing links
      const linkUpdate = await Link.updateMany(
        { userId: userId },
        { $set: { expiresAt: newExpiry, userPlan: plan } }
      );

      console.log('Links update result:', linkUpdate);
      console.log(`User ${userId} upgraded to ${plan} successfully`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}