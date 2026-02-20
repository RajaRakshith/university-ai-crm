import { TopicWeight, ExtractedInterests } from '../types';
import { CANONICAL_TOPICS, normalizeTopicName } from '../topic-map';
import { extractInterestsWithOracle } from './extract-oracle';

/**
 * Extract interests from text using AI (Oracle GenAI or fallback)
 */
export async function extractInterestsFromText(
  text: string
): Promise<ExtractedInterests> {
  // Use Oracle Generative AI if configured
  if (process.env.OCI_GENERATIVE_AI_ENABLED === 'true') {
    console.log('Using Oracle Generative AI for extraction');
    return extractInterestsWithOracle(text);
  }

  // Fallback to keyword extraction if no AI configured
  console.warn('No AI service configured, using keyword extraction');
  return extractInterestsFallback(text);
}

/**
 * Fallback keyword-based extraction if AI is unavailable
 */
function extractInterestsFallback(text: string): ExtractedInterests {
  const lowerText = text.toLowerCase();
  const topics: TopicWeight[] = [];

  // Simple keyword matching
  const keywordScores: Record<string, number> = {};

  for (const topic of CANONICAL_TOPICS) {
    const topicLower = topic.toLowerCase();
    
    // Count occurrences
    const regex = new RegExp(`\\b${topicLower}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      // Calculate weight based on frequency (capped at 1.0)
      const weight = Math.min(1.0, 0.5 + (count * 0.2));
      keywordScores[topic] = weight;
    }
  }

  // Convert to topics array
  for (const [topic, weight] of Object.entries(keywordScores)) {
    topics.push({ topic, weight });
  }

  // Sort by weight
  topics.sort((a, b) => b.weight - a.weight);

  return {
    topics,
    rawText: text,
  };
}

/**
 * Extract interests from structured profile data
 */
export function extractInterestsFromProfile(profile: {
  major?: string;
  skills?: string[];
  interests?: string[];
  experience?: string[];
}): TopicWeight[] {
  const topicCounts: Record<string, number> = {};

  // Process all fields
  const allText = [
    profile.major || '',
    ...(profile.skills || []),
    ...(profile.interests || []),
    ...(profile.experience || []),
  ].join(' ');

  // Use keyword matching
  const lowerText = allText.toLowerCase();

  for (const topic of CANONICAL_TOPICS) {
    const topicLower = topic.toLowerCase();
    const regex = new RegExp(`\\b${topicLower}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      topicCounts[topic] = count;
    }
  }

  // Convert to weighted topics
  const maxCount = Math.max(...Object.values(topicCounts), 1);
  const topics: TopicWeight[] = Object.entries(topicCounts).map(([topic, count]) => ({
    topic,
    weight: Math.min(1.0, 0.4 + (count / maxCount) * 0.6),
  }));

  return topics.sort((a, b) => b.weight - a.weight);
}
