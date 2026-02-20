import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posting = await prisma.posting.findUnique({
    where: { id },
    select: {
      id: true,
      posterName: true,
      posterEmail: true,
      title: true,
      description: true,
      whoTheyNeed: true,
      createdAt: true,
    },
  });
  if (!posting) {
    return NextResponse.json({ error: "Posting not found." }, { status: 404 });
  }
  return NextResponse.json(posting);
}
