import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Plan from '../../../models/Plan';

export async function GET() {
  try {
    await dbConnect();
    
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 }).lean();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Initialize default plans (run once)
export async function POST() {
  try {
    await dbConnect();
    
    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      return NextResponse.json({ message: 'Plans already exist' });
    }

    const defaultPlans = [
      {
        name: 'free',
        displayName: 'Free',
        price: 0,
        linkExpiryDays: 7,
        customAliasAllowed: true,
        features: ['7-day link expiry', 'Custom aliases', 'Click tracking'],
      },
      {
        name: 'premium',
        displayName: 'Premium',
        price: 500, // $5.00
        linkExpiryDays: 30,
        customAliasAllowed: true,
        features: ['30-day link expiry', 'Custom aliases', 'Click tracking', 'Priority support'],
      },
      {
        name: 'premium_plus',
        displayName: 'Premium Plus',
        price: 1500, // $15.00
        linkExpiryDays: null, // No expiry
        customAliasAllowed: true,
        features: ['Lifetime links', 'Custom aliases', 'Click tracking', 'Priority support', 'Advanced analytics'],
      },
    ];

    await Plan.insertMany(defaultPlans);
    return NextResponse.json({ message: 'Default plans created' });
  } catch (error) {
    console.error('Plans creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}