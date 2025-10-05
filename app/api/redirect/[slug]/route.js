import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import dbConnect from '../../../../lib/dbConnect';
import Link from '../../../../models/Link';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = params;
    const link = await Link.findOne({ shortCode: slug });
    
    if (!link) {
      return NextResponse.redirect(new URL('/?error=not-found', request.url));
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.redirect(new URL('/?error=expired', request.url));
    }

    // Increment click count
    await Link.findByIdAndUpdate(link._id, { $inc: { clicks: 1 } });

    return NextResponse.redirect(link.originalUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/?error=server-error', request.url));
  }
}