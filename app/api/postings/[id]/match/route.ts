import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rankStudentsBySimilarity, rankStudentsByTopicOverlap } from "@/lib/matching";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posting = await prisma.posting.findUnique({
    where: { id },
    select: { id: true, topics: true, embedding: true },
  });
  if (!posting) {
    return NextResponse.json({ error: "Posting not found." }, { status: 404 });
  }

  const students = await prisma.student.findMany({
    select: { id: true, name: true, email: true, topics: true, embedding: true },
  });

  // Prefer embedding-based matching when available (OCI GenAI in us-chicago-1)
  const embedding = posting.embedding as number[] | null;
  if (embedding && Array.isArray(embedding) && embedding.length > 0) {
    const withEmbedding = students.filter((s) => s.embedding != null);
    const matches = rankStudentsBySimilarity(embedding, withEmbedding);
    return NextResponse.json({ matches });
  }

  // Fallback: topic overlap when no embeddings
  const postingTopics = Array.isArray(posting.topics) ? (posting.topics as string[]) : [];
  if (postingTopics.length > 0) {
    const matches = rankStudentsByTopicOverlap(postingTopics, students);
    return NextResponse.json({ matches });
  }

  return NextResponse.json({ matches: [] });
}
