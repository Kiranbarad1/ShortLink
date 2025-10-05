import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../pages/api/auth/[...nextauth]';
import dbConnect from '../../../../lib/dbConnect';
import Link from '../../../../models/Link';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find and delete the link, but only if it belongs to the user
    const deletedLink = await Link.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedLink) {
      return NextResponse.json({ error: 'Link not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Link deleted successfully' });

  } catch (error) {
    console.error('Delete link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}