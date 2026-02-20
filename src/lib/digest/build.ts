import { prisma } from '../db';
import { StudentVector, EventVector } from '../types';
import { scoreEventsForStudent } from '../scoring';

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Build digest items for all students for the current week
 */
export async function buildWeeklyDigests(minScore: number = 0.5): Promise<number> {
  const weekOf = getWeekStart();

  // Get all students with their interests
  const students = await prisma.student.findMany({
    include: {
      interests: {
        include: {
          topic: true,
        },
      },
    },
  });

  // Get upcoming events (future events only)
  const upcomingEvents = await prisma.event.findMany({
    where: {
      eventDate: {
        gte: new Date(),
      },
    },
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
      center: true,
    },
  });

  // Convert to vectors
  const eventVectors: EventVector[] = upcomingEvents.map((event: any) => ({
    eventId: event.id,
    topics: event.topics.map((et: any) => ({
      topic: et.topic.name,
      weight: et.weight,
    })),
  }));

  let totalItemsCreated = 0;

  // For each student, score all events and create digest items
  for (const student of students) {
    const studentVector: StudentVector = {
      studentId: student.id,
      topics: student.interests.map((si: any) => ({
        topic: si.topic.name,
        weight: si.weight,
      })),
    };

    // Score all events for this student
    const scores = scoreEventsForStudent(studentVector, eventVectors, minScore);

    // Take top 10 events
    const topScores = scores.slice(0, 10);

    // Create digest items
    for (const score of topScores) {
      await prisma.digestItem.upsert({
        where: {
          studentId_eventId: {
            studentId: student.id,
            eventId: score.eventId,
          },
        },
        update: {
          score: score.score,
          weekOf,
        },
        create: {
          studentId: student.id,
          eventId: score.eventId,
          score: score.score,
          weekOf,
          sent: false,
        },
      });

      totalItemsCreated++;
    }
  }

  return totalItemsCreated;
}

/**
 * Get digest for a specific student
 */
export async function getStudentDigest(studentId: string, weekOf?: Date) {
  const week = weekOf || getWeekStart();

  const digestItems = await prisma.digestItem.findMany({
    where: {
      studentId,
      weekOf: week,
    },
    include: {
      event: {
        include: {
          center: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
    orderBy: {
      score: 'desc',
    },
  });

  return digestItems.map((item: any) => ({
    eventId: item.event.id,
    title: item.event.title,
    description: item.event.description,
    eventDate: item.event.eventDate,
    location: item.event.location,
    centerName: item.event.center.name,
    score: item.score,
    topics: item.event.topics.map((et: any) => et.topic.name),
  }));
}
