interface FeedbackButtonsProps {
  onFeedback: (type: 'interested' | 'not_relevant' | 'strong_interest') => void;
  loading?: boolean;
}

export function FeedbackButtons({ onFeedback, loading }: FeedbackButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFeedback('not_relevant')}
        disabled={loading}
        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        👎 Not for me
      </button>
      <button
        onClick={() => onFeedback('interested')}
        disabled={loading}
        className="flex-1 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-300 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        👍 Interested
      </button>
      <button
        onClick={() => onFeedback('strong_interest')}
        disabled={loading}
        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ⭐️ Very Interested
      </button>
    </div>
  );
}
