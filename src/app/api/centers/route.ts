import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ centers });
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}
