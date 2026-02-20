import { NextResponse } from 'next/server';
import { getStudentDigest } from '@/lib/digest/build';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    const digest = await getStudentDigest(studentId);

    return NextResponse.json({
      studentId,
      events: digest,
      count: digest.length,
    });
  } catch (error) {
    console.error('Error fetching student digest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digest' },
      { status: 500 }
    );
  }
}
