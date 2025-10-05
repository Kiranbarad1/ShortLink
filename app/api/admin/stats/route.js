import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../lib/dbConnect';
import Link from '../../../../models/Link';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const client = await clientPromise;
    const db = client.db();

    // Get all stats
    const totalUsers = await db.collection('users').countDocuments();
    const premiumUsers = await db.collection('users').countDocuments({ plan: { $in: ['premium', 'premium_plus'] } });
    const totalLinks = await Link.countDocuments();
    const totalClicks = await Link.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]);
    const anonymousLinks = await Link.countDocuments({ userId: null });
    const userLinks = await Link.countDocuments({ userId: { $ne: null } });
    const anonymousUsers = await Link.distinct('fingerprint', { userId: null }).then(arr => arr.length);

    // Recent users
    const recentUsers = await db.collection('users').find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .project({ name: 1, email: 1, plan: 1, createdAt: 1 })
      .toArray();

    // Top links
    const topLinks = await Link.find({})
      .sort({ clicks: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      anonymousUsers,
      totalLinks,
      totalClicks: totalClicks[0]?.total || 0,
      anonymousLinks,
      userLinks,
      recentUsers,
      topLinks
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}