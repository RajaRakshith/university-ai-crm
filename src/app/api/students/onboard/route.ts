import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractInterestsFromText } from '@/lib/ingest/extract';
import { normalizeWeights } from '@/lib/ingest/normalize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, major, year, resumeText } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existing = await prisma.student.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 409 }
      );
    }

    // Extract interests from resume text if provided
    let interests: { topic: string; weight: number }[] = [];
    
    if (resumeText) {
      const extracted = await extractInterestsFromText(resumeText);
      interests = normalizeWeights(extracted.topics);
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        email,
        name,
        major,
        year,
        resumeText,
      },
    });

    // Save interests
    if (interests.length > 0) {
      for (const interest of interests) {
        // Find or create topic
        let topic = await prisma.interestTopic.findUnique({
          where: { name: interest.topic },
        });

        if (!topic) {
          topic = await prisma.interestTopic.create({
            data: { name: interest.topic },
          });
        }

        // Create student interest
        await prisma.studentInterest.create({
          data: {
            studentId: student.id,
            topicId: topic.id,
            weight: interest.weight,
            source: 'resume',
          },
        });
      }
    }

    // Fetch complete student with interests
    const completeStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        interests: {
          include: {
            topic: true,
          },
        },
      },
    });

    return NextResponse.json({
      student: completeStudent,
      extractedInterests: interests,
    });
  } catch (error) {
    console.error('Error onboarding student:', error);
    return NextResponse.json(
      { error: 'Failed to onboard student' },
      { status: 500 }
    );
  }
}
