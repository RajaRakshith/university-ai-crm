"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Posting = {
  id: string;
  posterName: string;
  posterEmail: string;
  title: string;
  description: string;
  whoTheyNeed: string;
  createdAt: string;
};

type Match = {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  score: number;
};

export default function PostingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [posting, setPosting] = useState<Posting | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/postings/${id}`).then((r) => r.json()),
      fetch(`/api/postings/${id}/match`).then((r) => r.json()),
    ])
      .then(([postData, matchData]) => {
        if (postData.error) throw new Error(postData.error);
        setPosting(postData);
        setMatches(matchData.matches ?? []);
      })
      .catch((e) => setError(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center text-slate-600">Loading…</div>;
  }
  if (error || !posting) {
    return (
      <div className="rounded bg-red-50 p-4 text-red-700">
        {error || "Posting not found."}
        <p className="mt-2">
          <Link href="/poster/new" className="underline">Create a posting</Link> or <Link href="/" className="underline">go home</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">{posting.title}</h1>
      <p className="mb-4 text-sm text-slate-600">
        by {posting.posterName} · {new Date(posting.createdAt).toLocaleDateString()}
      </p>
      {posting.description && (
        <section className="mb-6">
          <h2 className="mb-1 text-sm font-medium text-slate-700">Description</h2>
          <p className="whitespace-pre-wrap text-slate-700">{posting.description}</p>
        </section>
      )}
      {posting.whoTheyNeed && (
        <section className="mb-8">
          <h2 className="mb-1 text-sm font-medium text-slate-700">Who we&apos;re looking for</h2>
          <p className="whitespace-pre-wrap text-slate-700">{posting.whoTheyNeed}</p>
        </section>
      )}

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Matched students</h2>
      {matches.length === 0 ? (
        <p className="text-slate-500">No students with profiles yet. Ask students to upload their resume and transcript.</p>
      ) : (
        <ul className="space-y-3">
          {matches.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-800">{m.name || "Unnamed"}</p>
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {m.email}
                    </a>
                  )}
                </div>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                  {(m.score * 100).toFixed(0)}% match
                </span>
              </div>
              {m.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.topics.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/poster/new" className="underline hover:text-slate-700">Create another posting</Link>
        {" · "}
        <Link href="/" className="underline hover:text-slate-700">Home</Link>
      </p>
    </div>
  );
}
