import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all campaigns
export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        event: {
          include: {
            center: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST create campaign (send targeted event to matched students)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, threshold, targetedCount } = body;

    if (!eventId || threshold === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign record
    const campaign = await prisma.campaign.create({
      data: {
        eventId,
        threshold,
        targetedCount: targetedCount || 0,
      },
    });

    // In a real implementation, this would trigger the digest generation
    // For now, we just record the campaign

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
