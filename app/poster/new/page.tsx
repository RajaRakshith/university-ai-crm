"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPostingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    try {
      const res = await fetch("/api/postings", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create posting.");
      router.push(`/poster/posting/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Create a posting</h1>
      <p className="mb-6 text-slate-600">
        Describe who you&apos;re looking for and what you&apos;re offering. We&apos;ll match students whose experience fits best.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Your name *</label>
          <input
            type="text"
            name="posterName"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="Dr. Jane Smith"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Your email *</label>
          <input
            type="email"
            name="posterEmail"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="jane@university.edu"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Posting title *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="Research assistant – ML for healthcare"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="What the role or project involves…"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Who you&apos;re looking for</label>
          <textarea
            name="whoTheyNeed"
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
            placeholder="Skills, background, or interests you need…"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Optional PDF (project brief, etc.)</label>
          <input
            type="file"
            name="pdf"
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
          {loading ? "Creating…" : "Create posting and see matches"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        <Link href="/" className="underline hover:text-slate-700">Back to home</Link>
      </p>
    </div>
  );
}
