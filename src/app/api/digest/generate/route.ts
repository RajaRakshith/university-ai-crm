import { NextResponse } from 'next/server';
import { buildWeeklyDigests } from '@/lib/digest/build';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { minScore } = body;

    const itemsCreated = await buildWeeklyDigests(minScore || 0.5);

    return NextResponse.json({
      success: true,
      itemsCreated,
      message: `Generated ${itemsCreated} digest items`,
    });
  } catch (error) {
    console.error('Error generating digests:', error);
    return NextResponse.json(
      { error: 'Failed to generate digests' },
      { status: 500 }
    );
  }
}
