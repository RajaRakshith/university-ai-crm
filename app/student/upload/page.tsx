"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const resume = (form.elements.namedItem("resume") as HTMLInputElement).files?.[0];
    const transcript = (form.elements.namedItem("transcript") as HTMLInputElement).files?.[0];

    console.log("[Student upload] Submit clicked.", {
      hasResume: !!resume,
      resumeName: resume?.name,
      resumeSize: resume?.size,
      hasTranscript: !!transcript,
      transcriptName: transcript?.name,
      transcriptSize: transcript?.size,
    });

    if (!resume && !transcript) {
      console.warn("[Student upload] No files selected.");
      setError("Please upload at least your resume or transcript (PDF).");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      if (name) fd.set("name", name);
      if (email) fd.set("email", email);
      if (resume) fd.set("resume", resume);
      if (transcript) fd.set("transcript", transcript);

      console.log("[Student upload] Sending POST /api/students/upload …");
      const res = await fetch("/api/students/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("[Student upload] Response:", res.status, res.ok ? { id: data.id } : { error: data.error });
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      router.push(`/student/profile?id=${data.id}`);
    } catch (err) {
      console.error("[Student upload] Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Student upload</h1>
      <p className="mb-6 text-slate-600">
        Upload your resume and transcript. We&apos;ll infer your strengths and use them to match you with opportunities.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Resume (PDF)</label>
          <input
            type="file"
            name="resume"
            accept=".pdf,application/pdf"
            className="w-full text-sm text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Transcript (PDF)</label>
          <input
            type="file"
            name="transcript"
            accept=".pdf,application/pdf"
            className="w-full text-sm text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
          />
        </div>
        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Processing…" : "Upload and create profile"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        <Link href="/" className="underline hover:text-slate-700">Back to home</Link>
      </p>
    </div>
  );
}
