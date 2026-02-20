'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EventCard } from '@/components/EventCard';

export default function StudentDigestPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchDigest();
    }
  }, [studentId]);

  const fetchDigest = async () => {
    try {
      const response = await fetch(`/api/digest/${studentId}`);
      const data = await response.json();
      setDigest(data);
    } catch (error) {
      console.error('Error fetching digest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (
    eventId: string,
    type: 'interested' | 'not_relevant' | 'strong_interest'
  ) => {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          eventId,
          type,
        }),
      });

      // Refresh digest to reflect updated preferences
      fetchDigest();
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const generateDigest = async () => {
    try {
      setLoading(true);
      await fetch('/api/digest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minScore: 0.5 }),
      });
      fetchDigest();
    } catch (error) {
      console.error('Error generating digest:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              UniConnect CRM
            </Link>
            <Link
              href={`/student/preferences?id=${studentId}`}
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              Customize Preferences
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            For You This Week
          </h1>
          <p className="text-gray-600">
            Personalized opportunities matched to your interests
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : digest && digest.events.length > 0 ? (
          <div className="space-y-6">
            {digest.events.map((event: any) => (
              <EventCard
                key={event.eventId}
                title={event.title}
                description={event.description}
                eventDate={new Date(event.eventDate)}
                location={event.location}
                centerName={event.centerName}
                score={event.score}
                topics={event.topics}
                onInteraction={(type) => handleInteraction(event.eventId, type)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-600 mb-6">
              There are no personalized events in your digest yet.
            </p>
            <button
              onClick={generateDigest}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Generate Digest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
