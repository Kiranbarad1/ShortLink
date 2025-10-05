import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../lib/dbConnect';
import Link from '../../../../models/Link';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const clientPromise = (await import('../../../../lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import('mongodb');
    
    const links = await Link.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Get user names for links with userId
    const userIds = links.filter(link => link.userId).map(link => link.userId);
    const users = await db.collection('users').find(
      { _id: { $in: userIds.map(id => new ObjectId(id)) } },
      { projection: { name: 1, email: 1 } }
    ).toArray();

    // Map user names to links
    const linksWithUsers = links.map(link => {
      if (link.userId) {
        const user = users.find(u => u._id.toString() === link.userId);
        return { ...link, userName: user?.name || user?.email || 'Unknown User' };
      }
      return { ...link, userName: null };
    });

    return NextResponse.json(linksWithUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, originalUrl, shortCode } = await request.json();
    
    await dbConnect();
    
    // Check if shortCode is being updated and if it already exists
    if (shortCode) {
      const existing = await Link.findOne({ shortCode, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: 'Short code already exists' }, { status: 400 });
      }
    }
    
    const updateData = { originalUrl };
    if (shortCode) updateData.shortCode = shortCode;
    
    await Link.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();
    
    await dbConnect();
    await Link.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}