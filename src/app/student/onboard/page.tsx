'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopicPill } from '@/components/TopicPill';

export default function StudentOnboardPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    major: '',
    year: '',
    resumeText: '',
    resumeUrl: '',
    transcriptText: '',
    transcriptUrl: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [extractedInterests, setExtractedInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');

      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        resumeText: data.text,
        resumeUrl: data.url,
      }));
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleTranscriptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscriptFile(file);
    setUploadingTranscript(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'transcript');

      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload transcript');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        transcriptText: data.text,
        transcriptUrl: data.url,
      }));
    } catch (error) {
      console.error('Error uploading transcript:', error);
      alert('Failed to upload transcript. Please try again.');
    } finally {
      setUploadingTranscript(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to onboard');
        return;
      }

      const data = await response.json();
      setExtractedInterests(data.extractedInterests || []);
      setStudentId(data.student.id);
    } catch (error) {
      console.error('Error onboarding:', error);
      alert('Failed to onboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToDigest = () => {
    if (studentId) {
      router.push(`/student/digest?id=${studentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            UniConnect CRM
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome! Let's Get You Started
          </h1>
          <p className="text-gray-600">
            Tell us about yourself and we'll personalize opportunities for you
          </p>
        </div>

        {!studentId ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@university.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jane Smith"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major / Program
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) =>
                      setFormData({ ...formData, major: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Computer Science & Business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                    <option value="MBA">MBA</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload your resume (PDF, DOCX, or TXT) or paste the text below
                </p>
                <div className="mb-3">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {uploadingResume && (
                    <p className="text-sm text-primary-600 mt-2">Uploading and extracting text...</p>
                  )}
                  {resumeFile && !uploadingResume && (
                    <p className="text-sm text-green-600 mt-2">✓ {resumeFile.name} uploaded</p>
                  )}
                </div>
                <textarea
                  value={formData.resumeText}
                  onChange={(e) =>
                    setFormData({ ...formData, resumeText: e.target.value })
                  }
                  rows={6}
                  placeholder="Or paste your resume text here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transcript (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload your transcript for better academic interest matching
                </p>
                <div className="mb-3">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleTranscriptFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {uploadingTranscript && (
                    <p className="text-sm text-primary-600 mt-2">Uploading and extracting text...</p>
                  )}
                  {transcriptFile && !uploadingTranscript && (
                    <p className="text-sm text-green-600 mt-2">✓ {transcriptFile.name} uploaded</p>
                  )}
                </div>
                <textarea
                  value={formData.transcriptText}
                  onChange={(e) =>
                    setFormData({ ...formData, transcriptText: e.target.value })
                  }
                  rows={4}
                  placeholder="Or paste your transcript/coursework here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Create Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Created!
              </h2>
              <p className="text-gray-600">
                We've analyzed your profile and identified your interests
              </p>
            </div>

            {extractedInterests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extractedInterests.map((interest) => (
                    <TopicPill
                      key={interest.topic}
                      topic={interest.topic}
                      weight={interest.weight}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={goToDigest}
                className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Your Personalized Digest →
              </button>
              <Link
                href={`/student/preferences?id=${studentId}`}
                className="block w-full px-6 py-3 text-center border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
              >
                Customize Preferences
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
