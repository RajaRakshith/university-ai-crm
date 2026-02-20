import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadObject, uniqueObjectName } from "@/lib/oci/object-storage";
import { extractTextFromDocument } from "@/lib/oci/document";
import { embedText } from "@/lib/oci/embeddings";
import { inferTopicsFromText } from "@/lib/parse/profile";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const posterName = (formData.get("posterName") as string) || "Unknown";
    const posterEmail = (formData.get("posterEmail") as string) || "";
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const whoTheyNeed = (formData.get("whoTheyNeed") as string) || "";
    const pdf = formData.get("pdf") as File | null;

    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    let combinedText = [title, description, whoTheyNeed].filter(Boolean).join("\n");

    let optionalPdfObjectUrl: string | null = null;
    if (pdf && pdf.size > 0) {
      if (pdf.size > MAX_PDF_SIZE) {
        return NextResponse.json({ error: "PDF too large (max 10 MB)." }, { status: 400 });
      }
      const buf = Buffer.from(await pdf.arrayBuffer());
      const result = await uploadObject(
        uniqueObjectName("postings/", pdf.name || "posting.pdf"),
        buf,
        pdf.type || "application/pdf"
      );
      optionalPdfObjectUrl = result.key;
      const pdfText = await extractTextFromDocument(buf);
      combinedText += "\n\n" + pdfText;
    }

    const topics = inferTopicsFromText(combinedText);
    let embedding: number[] | null = null;
    try {
      embedding = await embedText(combinedText);
    } catch (embedErr) {
      console.warn("Embedding skipped (e.g. 401 in us-chicago-1); matching will use topics only:", embedErr);
    }

    const posting = await prisma.posting.create({
      data: {
        posterName,
        posterEmail,
        title,
        description,
        whoTheyNeed,
        optionalPdfObjectUrl,
        topics,
        embedding: embedding ?? undefined,
      },
    });

    return NextResponse.json({ id: posting.id, posting });
  } catch (err) {
    console.error("Posting create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create posting." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const postings = await prisma.posting.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, posterName: true, createdAt: true },
  });
  return NextResponse.json(postings);
}
