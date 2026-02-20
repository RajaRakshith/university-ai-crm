import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        center: true,
        topics: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST create new event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      centerId,
      title,
      description,
      eventDate,
      location,
      topics, // Array of { topic: string, weight: number }
    } = body;

    if (!centerId || !title || !description || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        centerId,
        title,
        description,
        eventDate: new Date(eventDate),
        location,
      },
    });

    // Add topics
    if (topics && Array.isArray(topics)) {
      for (const topicData of topics) {
        // Find or create topic
        let topic = await prisma.interestTopic.findUnique({
          where: { name: topicData.topic },
        });

        if (!topic) {
          topic = await prisma.interestTopic.create({
            data: { name: topicData.topic },
          });
        }

        // Create event topic
        await prisma.eventTopic.create({
          data: {
            eventId: event.id,
            topicId: topic.id,
            weight: topicData.weight || 1.0,
          },
        });
      }
    }

    // Fetch complete event
    const completeEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        center: true,
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });

    return NextResponse.json({ event: completeEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
