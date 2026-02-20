interface TopicPillProps {
  topic: string;
  weight?: number;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TopicPill({
  topic,
  weight,
  selected,
  onClick,
  onRemove,
}: TopicPillProps) {
  const getWeightColor = (w?: number) => {
    if (!w) return 'bg-gray-200 text-gray-700';
    if (w >= 0.8) return 'bg-primary-600 text-white';
    if (w >= 0.6) return 'bg-primary-500 text-white';
    if (w >= 0.4) return 'bg-primary-300 text-primary-900';
    return 'bg-primary-100 text-primary-700';
  };

  const colorClass = selected
    ? 'bg-primary-600 text-white'
    : weight !== undefined
    ? getWeightColor(weight)
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${colorClass} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {topic}
      {weight !== undefined && (
        <span className="ml-2 text-xs opacity-75">
          {Math.round(weight * 100)}%
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 hover:bg-white/20 rounded-full p-0.5"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
