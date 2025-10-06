import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Link from '../../../models/Link';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    
    const fingerprint = request.headers.get('x-forwarded-for') || request.headers.get('user-agent') || 'anonymous';
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const links = await Link.find({
      userId: null, // Anonymous links
      fingerprint: fingerprint, // Only this user's links
      createdAt: { $gte: oneDayAgo }, // Created within last 24 hours
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } } // Not expired
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    return NextResponse.json(links);

  } catch (error) {
    console.error('Fetch anonymous links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}