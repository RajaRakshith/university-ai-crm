import { useState } from 'react';

interface ThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showPreview?: boolean;
  matchedCount?: number;
}

export function ThresholdSlider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  label = 'Match Threshold',
  showPreview = false,
  matchedCount,
}: ThresholdSliderProps) {
  const percentage = Math.round(value * 100);

  const getQualityLabel = (val: number) => {
    if (val >= 0.8) return { text: 'Very High Match', color: 'text-green-600' };
    if (val >= 0.6) return { text: 'High Match', color: 'text-blue-600' };
    if (val >= 0.4) return { text: 'Medium Match', color: 'text-yellow-600' };
    return { text: 'Low Match', color: 'text-gray-600' };
  };

  const quality = getQualityLabel(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${quality.color}`}>
            {quality.text}
          </span>
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>More Students</span>
        <span>Better Match</span>
      </div>

      {showPreview && matchedCount !== undefined && (
        <div className="mt-3 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-900">
            <span className="font-semibold">{matchedCount}</span> students match at{' '}
            {percentage}% threshold
          </p>
        </div>
      )}
    </div>
  );
}
