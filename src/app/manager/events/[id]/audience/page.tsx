'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThresholdSlider } from '@/components/ThresholdSlider';

export default function AudiencePage({ params }: { params: { id: string } }) {
  const [threshold, setThreshold] = useState(0.6);
  const [audienceData, setAudienceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudience();
  }, [threshold]);

  const fetchAudience = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/events/${params.id}/score?threshold=${threshold}`
      );
      const data = await response.json();
      setAudienceData(data);
    } catch (error) {
      console.error('Error fetching audience:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async () => {
    if (!confirm(`Send to ${audienceData?.totalMatched} students?`)) return;

    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: params.id,
          threshold,
          targetedCount: audienceData?.totalMatched || 0,
        }),
      });

      alert('Campaign sent successfully!');
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/manager" className="text-2xl font-bold text-primary-600">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Target Audience
          </h1>
          {audienceData && (
            <p className="text-gray-600">{audienceData.event.title}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <ThresholdSlider
            value={threshold}
            onChange={setThreshold}
            showPreview
            matchedCount={audienceData?.totalMatched}
          />

          <div className="mt-6">
            <button
              onClick={sendCampaign}
              disabled={!audienceData || audienceData.totalMatched === 0}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Campaign to {audienceData?.totalMatched || 0} Students
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : audienceData && audienceData.audience.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matched Topics
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {audienceData.audience.map((student: any) => (
                  <tr key={student.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.major || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {Math.round(student.score * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.matchedTopics.map((topic: string) => (
                          <span
                            key={topic}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">
              No students match at this threshold. Try lowering the threshold.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
