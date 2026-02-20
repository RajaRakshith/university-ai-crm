import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadObject, uniqueObjectName } from "@/lib/oci/object-storage";
import { extractTextFromDocument } from "@/lib/oci/document";
import { embedText } from "@/lib/oci/embeddings";
import { inferTopicsFromResumeAndTranscriptWithGemini } from "@/lib/parse/profile";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  console.log("[API students/upload] POST received.");
  try {
    const formData = await request.formData();
    const resume = formData.get("resume") as File | null;
    const transcript = formData.get("transcript") as File | null;
    const name = (formData.get("name") as string) || null;
    const email = (formData.get("email") as string) || null;

    console.log("[API students/upload] Form data:", {
      hasResume: !!resume,
      resumeSize: resume?.size ?? 0,
      resumeName: (resume as File)?.name,
      hasTranscript: !!transcript,
      transcriptSize: transcript?.size ?? 0,
      transcriptName: (transcript as File)?.name,
      name: name ?? "(empty)",
      email: email ?? "(empty)",
    });

    if (!resume && !transcript) {
      console.warn("[API students/upload] Rejecting: no resume or transcript.");
      return NextResponse.json(
        { error: "At least one of resume or transcript is required." },
        { status: 400 }
      );
    }

    let resumeUrl: string | null = null;
    let transcriptUrl: string | null = null;
    let rawResumeText = "";
    let rawTranscriptText = "";

    if (resume && resume.size > 0) {
      console.log("[API students/upload] Processing resume:", resume.name, resume.size, "bytes");
      if (resume.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Resume file too large (max 10 MB)." }, { status: 400 });
      }
      const buf = Buffer.from(await resume.arrayBuffer());
      const result = await uploadObject(
        uniqueObjectName("resumes/", resume.name || "resume.pdf"),
        buf,
        resume.type || "application/pdf"
      );
      resumeUrl = result.key;
      console.log("[API students/upload] Resume uploaded to OCI:", result.key);
      rawResumeText = await extractTextFromDocument(buf);
      console.log("[API students/upload] Resume text extracted, length:", rawResumeText.length);
    }

    if (transcript && transcript.size > 0) {
      console.log("[API students/upload] Processing transcript:", transcript.name, transcript.size, "bytes");
      if (transcript.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Transcript file too large (max 10 MB)." }, { status: 400 });
      }
      const buf = Buffer.from(await transcript.arrayBuffer());
      const result = await uploadObject(
        uniqueObjectName("transcripts/", transcript.name || "transcript.pdf"),
        buf,
        transcript.type || "application/pdf"
      );
      transcriptUrl = result.key;
      console.log("[API students/upload] Transcript uploaded to OCI:", result.key);
      rawTranscriptText = await extractTextFromDocument(buf);
      console.log("[API students/upload] Transcript text extracted, length:", rawTranscriptText.length);
    }

    console.log("[API students/upload] Calling Gemini for topics…");
    const topics = await inferTopicsFromResumeAndTranscriptWithGemini(rawResumeText, rawTranscriptText);
    console.log("[API students/upload] Topics inferred:", topics.length, topics);
    const profileText = [rawResumeText.slice(0, 1500), rawTranscriptText.slice(0, 1500), topics.join(", ")].join(" ");
    let embedding: number[] | null = null;
    try {
      embedding = await embedText(profileText);
    } catch (embedErr) {
      console.warn("Embedding skipped (e.g. 401 in us-chicago-1); student will match by topics only:", embedErr);
    }

    console.log("[API students/upload] Saving student to DB…");
    const student = await prisma.student.create({
      data: {
        name,
        email,
        resumeObjectUrl: resumeUrl,
        transcriptObjectUrl: transcriptUrl,
        rawResumeText: rawResumeText || null,
        rawTranscriptText: rawTranscriptText || null,
        topics,
        embedding: embedding ?? undefined,
      },
    });
    console.log("[API students/upload] Success, student id:", student.id);

    return NextResponse.json({ id: student.id, student });
  } catch (err) {
    console.error("Student upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
