import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractInterestsFromText } from '@/lib/ingest/extract';
import { extractInterestsFromTranscript, mergeInterests } from '@/lib/ingest/extract-transcript';
import { normalizeWeights } from '@/lib/ingest/normalize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      name, 
      major, 
      year, 
      resumeText,
      resumeUrl,
      transcriptText,
      transcriptUrl
    } = body;

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

    // Extract interests from resume and transcript
    let interests: { topic: string; weight: number }[] = [];
    
    if (resumeText || transcriptText) {
      let resumeInterests: any[] = [];
      let transcriptInterests: any[] = [];
      
      // Extract from resume
      if (resumeText) {
        const extracted = await extractInterestsFromText(resumeText);
        resumeInterests = extracted.topics;
      }
      
      // Extract from transcript
      if (transcriptText) {
        const extracted = await extractInterestsFromTranscript(transcriptText);
        transcriptInterests = extracted.topics;
      }
      
      // Merge interests if both are present
      if (resumeInterests.length > 0 && transcriptInterests.length > 0) {
        interests = mergeInterests(resumeInterests, transcriptInterests);
      } else if (resumeInterests.length > 0) {
        interests = resumeInterests;
      } else if (transcriptInterests.length > 0) {
        interests = transcriptInterests;
      }
      
      // Normalize weights
      interests = normalizeWeights(interests);
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        email,
        name,
        major,
        year,
        resumeText,
        resumeUrl,
        transcriptText,
        transcriptUrl,
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
            source: resumeText && transcriptText ? 'resume+transcript' : (resumeText ? 'resume' : 'transcript'),
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
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: `Failed to onboard student: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
