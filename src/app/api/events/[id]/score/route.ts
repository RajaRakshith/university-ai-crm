import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { StudentVector, EventVector } from '@/lib/types';
import { scoreStudentsForEvent } from '@/lib/scoring';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseFloat(searchParams.get('threshold') || '0.5');

    const eventId = params.id;

    // Get event with topics
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

    // Build event vector
    const eventVector: EventVector = {
      eventId: event.id,
      topics: event.topics.map(et => ({
        topic: et.topic.name,
        weight: et.weight,
      })),
    };

    // Get all students with interests
    const students = await prisma.student.findMany({
      include: {
        interests: {
          include: {
            topic: true,
          },
        },
      },
    });

    // Build student vectors
    const studentVectors: StudentVector[] = students.map(s => ({
      studentId: s.id,
      topics: s.interests.map(si => ({
        topic: si.topic.name,
        weight: si.weight,
      })),
    }));

    // Calculate scores
    const scores = scoreStudentsForEvent(studentVectors, eventVector, threshold);

    // Enrich with student data
    const audience = scores.map(score => {
      const student = students.find(s => s.id === score.studentId)!;
      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        major: student.major,
        score: score.score,
        matchedTopics: score.matchedTopics,
      };
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
      },
      threshold,
      totalMatched: audience.length,
      audience,
    });
  } catch (error) {
    console.error('Error scoring event audience:', error);
    return NextResponse.json(
      { error: 'Failed to score audience' },
      { status: 500 }
    );
  }
}
