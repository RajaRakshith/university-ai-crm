interface EventCardProps {
  title: string;
  description: string;
  eventDate: Date;
  location?: string;
  centerName: string;
  score?: number;
  topics?: string[];
  onInteraction?: (type: 'interested' | 'not_relevant' | 'strong_interest') => void;
}

export function EventCard({
  title,
  description,
  eventDate,
  location,
  centerName,
  score,
  topics,
  onInteraction,
}: EventCardProps) {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{centerName}</p>
        </div>
        {score !== undefined && (
          <div className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {Math.round(score * 100)}% match
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>
        {location && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </div>
        )}
      </div>

      {topics && topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {onInteraction && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onInteraction('not_relevant')}
            className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Not for me
          </button>
          <button
            onClick={() => onInteraction('interested')}
            className="flex-1 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            Interested
          </button>
          <button
            onClick={() => onInteraction('strong_interest')}
            className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded transition-colors"
          >
            Very Interested
          </button>
        </div>
      )}
    </div>
  );
}
