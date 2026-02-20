import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">
        UniConnect
      </h1>
      <p className="max-w-lg text-slate-600">
        Connect your experience with research and opportunities. Upload your resume and transcript to get a profile, or create a posting to find matched students.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/student/upload"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Upload my resume & transcript
        </Link>
        <Link
          href="/poster/new"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Create a posting / find students
        </Link>
      </div>
    </div>
  );
}
