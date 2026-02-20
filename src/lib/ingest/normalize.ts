import { TopicWeight } from '../types';

/**
 * Normalize topic weights to ensure they're valid and sum appropriately
 */
export function normalizeWeights(topics: TopicWeight[]): TopicWeight[] {
  if (topics.length === 0) return [];

  // Ensure all weights are between 0 and 1
  const clamped = topics.map(t => ({
    topic: t.topic,
    weight: Math.min(1.0, Math.max(0.0, t.weight)),
  }));

  // Filter out zero weights
  const filtered = clamped.filter(t => t.weight > 0);

  // Sort by weight descending
  filtered.sort((a, b) => b.weight - a.weight);

  return filtered;
}

/**
 * Merge topic weights from multiple sources
 * Later sources have higher priority (can override earlier ones)
 */
export function mergeTopicWeights(
  sources: { weights: TopicWeight[]; priority: number }[]
): TopicWeight[] {
  const topicMap = new Map<string, { weight: number; priority: number }>();

  for (const source of sources) {
    for (const topic of source.weights) {
      const existing = topicMap.get(topic.topic);
      
      if (!existing || source.priority >= existing.priority) {
        // Take the higher priority source, or average if same priority
        if (existing && source.priority === existing.priority) {
          topicMap.set(topic.topic, {
            weight: (existing.weight + topic.weight) / 2,
            priority: source.priority,
          });
        } else {
          topicMap.set(topic.topic, {
            weight: topic.weight,
            priority: source.priority,
          });
        }
      }
    }
  }

  const merged: TopicWeight[] = Array.from(topicMap.entries()).map(
    ([topic, data]) => ({
      topic,
      weight: data.weight,
    })
  );

  return normalizeWeights(merged);
}

/**
 * Apply feedback to update topic weights
 * Positive feedback increases weight, negative decreases
 */
export function applyFeedback(
  currentWeights: TopicWeight[],
  feedbackTopics: string[],
  feedbackType: 'positive' | 'negative' | 'strong_positive'
): TopicWeight[] {
  const weightMap = new Map(currentWeights.map(t => [t.topic, t.weight]));

  const adjustments = {
    strong_positive: 0.2,
    positive: 0.1,
    negative: -0.15,
  };

  const adjustment = adjustments[feedbackType];

  for (const topic of feedbackTopics) {
    const current = weightMap.get(topic) || 0.3; // Default for new topics
    const updated = Math.min(1.0, Math.max(0.0, current + adjustment));
    weightMap.set(topic, updated);
  }

  const updated: TopicWeight[] = Array.from(weightMap.entries()).map(
    ([topic, weight]) => ({ topic, weight })
  );

  return normalizeWeights(updated);
}
