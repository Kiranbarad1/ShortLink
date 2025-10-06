import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import Link from '../../../models/Link';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await Link.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(links);

  } catch (error) {
    console.error('Fetch links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}