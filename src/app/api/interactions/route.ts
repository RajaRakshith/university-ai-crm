import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateStudentVector } from '@/lib/feedback/update-vector';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, eventId, type } = body;

    if (!studentId || !eventId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validTypes = ['interested', 'not_relevant', 'strong_interest', 'clicked', 'signed_up'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }

    // Record interaction
    const interaction = await prisma.interaction.create({
      data: {
        studentId,
        eventId,
        type,
      },
    });

    // Update student vector if it's a feedback type
    if (['interested', 'not_relevant', 'strong_interest'].includes(type)) {
      // Get current student interests
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          interests: {
            include: {
              topic: true,
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      // Get event topics
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const currentInterests = student.interests.map(si => ({
        topic: si.topic.name,
        weight: si.weight,
      }));

      const eventTopics = event.topics.map(et => et.topic.name);

      // Update vector
      const updatedInterests = await updateStudentVector(
        currentInterests,
        eventTopics,
        type as 'interested' | 'not_relevant' | 'strong_interest'
      );

      // Save updated interests
      for (const interest of updatedInterests) {
        const topic = await prisma.interestTopic.findUnique({
          where: { name: interest.topic },
        });

        if (topic) {
          await prisma.studentInterest.upsert({
            where: {
              studentId_topicId: {
                studentId,
                topicId: topic.id,
              },
            },
            update: {
              weight: interest.weight,
              source: 'feedback',
            },
            create: {
              studentId,
              topicId: topic.id,
              weight: interest.weight,
              source: 'feedback',
            },
          });
        }
      }
    }

    return NextResponse.json({ interaction, success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

// GET interactions for a student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const interactions = await prisma.interaction.findMany({
      where: { studentId },
      include: {
        event: {
          include: {
            center: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ interactions });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}
