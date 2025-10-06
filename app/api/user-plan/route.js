import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { plan: 1, planUpdatedAt: 1 } }
    );

    return NextResponse.json({ 
      plan: user?.plan || 'free',
      planUpdatedAt: user?.planUpdatedAt 
    });
  } catch (error) {
    console.error('User plan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}