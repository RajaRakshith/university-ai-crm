'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TopicPill } from '@/components/TopicPill';
import { CANONICAL_TOPICS } from '@/lib/topic-map';

export default function StudentPreferencesPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();
      setInterests(data.interests || []);
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWeight = (topic: string, weight: number) => {
    const existing = interests.find((i) => i.topic.name === topic);
    if (existing) {
      setInterests(
        interests.map((i) =>
          i.topic.name === topic ? { ...i, weight } : i
        )
      );
    } else {
      setInterests([
        ...interests,
        { topic: { name: topic }, weight },
      ]);
    }
  };

  const removeTopic = (topic: string) => {
    setInterests(interests.filter((i) => i.topic.name !== topic));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would call an update API
      alert('Preferences saved! Your digest will be updated.');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No student ID provided</p>
          <Link
            href="/student/onboard"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go to Onboarding →
          </Link>
        </div>
      </div>
    );
  }

  const interestMap = new Map(interests.map((i) => [i.topic.name, i.weight]));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              UniConnect CRM
            </Link>
            <Link
              href={`/student/digest?id=${studentId}`}
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              Back to Digest
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customize Your Preferences
          </h1>
          <p className="text-gray-600">
            Adjust your interests to get better recommendations
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Current Interests
              </h2>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <TopicPill
                      key={interest.topic.name}
                      topic={interest.topic.name}
                      weight={interest.weight}
                      onRemove={() => removeTopic(interest.topic.name)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No interests yet. Add some below!
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add More Interests
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Click on topics to add them to your profile
              </p>
              <div className="flex flex-wrap gap-2">
                {CANONICAL_TOPICS.filter(
                  (topic) => !interestMap.has(topic)
                ).map((topic) => (
                  <TopicPill
                    key={topic}
                    topic={topic}
                    onClick={() => updateWeight(topic, 0.7)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fine-Tune Interest Strength
              </h2>
              <div className="space-y-4">
                {interests.map((interest) => (
                  <div key={interest.topic.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        {interest.topic.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(interest.weight * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={interest.weight}
                      onChange={(e) =>
                        updateWeight(
                          interest.topic.name,
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
              <Link
                href={`/student/digest?id=${studentId}`}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
