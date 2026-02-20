"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [profile, setProfile] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    topics: string[];
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Missing student ID.");
      setLoading(false);
      return;
    }
    fetch(`/api/students/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProfile({
          ...data,
          topics: Array.isArray(data.topics) ? data.topics : [],
        });
      })
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-slate-600">Loading your profile…</div>
    );
  }
  if (error || !profile) {
    return (
      <div className="rounded bg-red-50 p-4 text-red-700">
        {error || "Profile not found."}
        <p className="mt-2">
          <Link href="/student/upload" className="underline">Upload again</Link> or <Link href="/" className="underline">go home</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Your profile</h1>
      <p className="mb-6 text-slate-600">
        Based on your resume and transcript, here are the topics you&apos;re strong in. You&apos;ll be matched to postings that need these skills.
      </p>
      {profile.name && (
        <p className="mb-1 font-medium text-slate-800">{profile.name}</p>
      )}
      {profile.email && (
        <p className="mb-4 text-sm text-slate-600">{profile.email}</p>
      )}
      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-700">Topics you&apos;re strong in</h2>
        <ul className="flex flex-wrap gap-2">
          {profile.topics.length > 0 ? (
            profile.topics.map((t) => (
              <li
                key={t}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
              >
                {t}
              </li>
            ))
          ) : (
            <li className="text-slate-500">No topics inferred yet.</li>
          )}
        </ul>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        <Link href="/" className="underline hover:text-slate-700">Back to home</Link>
      </p>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-600">Loading…</div>}>
      <StudentProfileContent />
    </Suspense>
  );
}
