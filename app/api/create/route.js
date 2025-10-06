import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Link from '../../../models/Link';
import Plan from '../../../models/Plan';
import { nanoid } from 'nanoid';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    const { originalUrl, customAlias } = await request.json();

    // Validate URL
    if (!originalUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    let shortCode;

    if (customAlias) {
      // Only allow custom aliases for authenticated users
      if (!session?.user?.id) {
        return NextResponse.json({ 
          error: 'Custom aliases are only available for logged-in users' 
        }, { status: 401 });
      }

      // Validate custom alias
      if (!/^[a-zA-Z0-9-_]+$/.test(customAlias)) {
        return NextResponse.json({ 
          error: 'Custom alias can only contain letters, numbers, hyphens, and underscores' 
        }, { status: 400 });
      }

      // Check if custom alias already exists
      const existingLink = await Link.findOne({ shortCode: customAlias });
      if (existingLink) {
        return NextResponse.json({ error: 'Alias already taken' }, { status: 409 });
      }

      shortCode = customAlias;
    } else {
      // Generate random short code
      do {
        shortCode = nanoid(8);
      } while (await Link.findOne({ shortCode }));
    }

    // Get user plan and plan configuration from database
    let userPlanName = 'free';
    let planConfig = null;
    
    if (session?.user?.id) {
      const client = await clientPromise;
      const db = client.db();
      const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
      userPlanName = user?.plan || 'free';
    }
    
    // Get plan configuration from database
    planConfig = await Plan.findOne({ name: userPlanName, isActive: true });
    if (!planConfig) {
      // Fallback to free plan if plan not found
      planConfig = await Plan.findOne({ name: 'free', isActive: true });
    }

    // Check if custom alias is allowed for this plan
    if (customAlias && !planConfig.customAliasAllowed) {
      return NextResponse.json({ 
        error: 'Custom aliases not available in your current plan' 
      }, { status: 403 });
    }

    // Create the link with expiry based on plan configuration
    const linkData = {
      userId: session?.user?.id || null,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      userPlan: userPlanName,
    };

    // Set expiry based on plan configuration
    if (!session?.user?.id) {
      // Anonymous users: 1 day (hardcoded for security)
      linkData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      linkData.fingerprint = request.headers.get('x-forwarded-for') || request.headers.get('user-agent') || 'anonymous';
    } else if (planConfig.linkExpiryDays) {
      // Set expiry based on plan configuration
      linkData.expiresAt = new Date(Date.now() + planConfig.linkExpiryDays * 24 * 60 * 60 * 1000);
    }
    // If linkExpiryDays is null, no expiry (expiresAt remains undefined)

    const link = new Link(linkData);

    await link.save();

    return NextResponse.json({
      _id: link._id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      customAlias: link.customAlias,
      clicks: link.clicks,
      createdAt: link.createdAt,
    });

  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}