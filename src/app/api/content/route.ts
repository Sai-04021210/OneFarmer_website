import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { content } from '@/lib/content';

export async function GET() {
  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  const newContent = await req.json();
  Object.assign(content, newContent);

  return NextResponse.json({ success: true, content });
}
