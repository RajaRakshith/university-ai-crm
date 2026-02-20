'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CANONICAL_TOPICS } from '@/lib/topic-map';
import { TopicPill } from '@/components/TopicPill';
import { ThresholdSlider } from '@/components/ThresholdSlider';

interface Center {
  id: string;
  name: string;
}

export default function NewEventPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [formData, setFormData] = useState({
    centerId: '',
    title: '',
    description: '',
    eventDate: '',
    location: '',
    requiredMajors: '',
    requiredYears: '',
  });
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [threshold, setThreshold] = useState(0.6);
  const [audiencePreview, setAudiencePreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch centers
    fetch('/api/centers')
      .then((res) => res.json())
      .catch(() => {
        // Mock data if API not ready
        setCenters([
          { id: '1', name: 'Entrepreneurship Center' },
          { id: '2', name: 'AI Research Lab' },
          { id: '3', name: 'Career Services' },
          { id: '4', name: 'Sustainability Institute' },
        ]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const topics = Array.from(selectedTopics).map((topic) => ({
        topic,
        weight: 1.0,
      }));

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topics,
        }),
      });

      const data = await response.json();
      setEventId(data.event.id);
      
      // Preview audience
      previewAudience(data.event.id);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const previewAudience = async (id: string) => {
    try {
      const response = await fetch(
        `/api/events/${id}/score?threshold=${threshold}`
      );
      const data = await response.json();
      setAudiencePreview(data);
    } catch (error) {
      console.error('Error previewing audience:', error);
    }
  };

  const toggleTopic = (topic: string) => {
    const newTopics = new Set(selectedTopics);
    if (newTopics.has(topic)) {
      newTopics.delete(topic);
    } else {
      newTopics.add(topic);
    }
    setSelectedTopics(newTopics);
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center
                </label>
                <select
                  value={formData.centerId}
                  onChange={(e) =>
                    setFormData({ ...formData, centerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a center</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="AI for Healthcare Pitch Night"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your event..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ross School of Business"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Student Requirements (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Filter students by specific criteria. Leave blank to target all students.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Majors (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredMajors}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredMajors: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Computer Science, Engineering, Business"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Students with any of these majors will be eligible
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Years (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredYears}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredYears: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Junior, Senior, Graduate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only students in these years will be eligible
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Topic Tags
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select topics that describe this event. This helps match the right
              students.
            </p>

            <div className="flex flex-wrap gap-2">
              {CANONICAL_TOPICS.map((topic) => (
                <TopicPill
                  key={topic}
                  topic={topic}
                  selected={selectedTopics.has(topic)}
                  onClick={() => toggleTopic(topic)}
                />
              ))}
            </div>

            {selectedTopics.size > 0 && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-900">
                  Selected: <strong>{selectedTopics.size}</strong> topics
                </p>
              </div>
            )}
          </div>

          {eventId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Target Audience
              </h2>

              <ThresholdSlider
                value={threshold}
                onChange={(val) => {
                  setThreshold(val);
                  previewAudience(eventId);
                }}
                showPreview
                matchedCount={audiencePreview?.totalMatched}
              />

              {audiencePreview && (
                <div className="mt-4">
                  <Link
                    href={`/manager/events/${eventId}/audience`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Full Audience List →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || selectedTopics.size === 0}
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : eventId ? 'Event Created ✓' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
