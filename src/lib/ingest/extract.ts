import Anthropic from '@anthropic-ai/sdk';
import { TopicWeight, ExtractedInterests } from '../types';
import { CANONICAL_TOPICS, normalizeTopicName } from '../topic-map';
import { extractInterestsWithOracle } from './extract-oracle';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Extract interests from text using AI (Oracle GenAI or Claude)
 */
export async function extractInterestsFromText(
  text: string
): Promise<ExtractedInterests> {
  // Prefer Oracle Generative AI if configured (for hackathon)
  if (process.env.OCI_GENERATIVE_AI_ENABLED === 'true') {
    console.log('Using Oracle Generative AI for extraction');
    return extractInterestsWithOracle(text);
  }

  // Fallback to Claude if configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('No AI service configured, using keyword extraction');
    return extractInterestsFallback(text);
  }

  try {
    const prompt = `Analyze the following student profile/resume text and extract their interests and skills.

Available topics to choose from:
${CANONICAL_TOPICS.join(', ')}

For each relevant topic, assign a relevance score from 0.0 to 1.0 where:
- 1.0 = Primary focus/expertise
- 0.7-0.9 = Strong interest or significant experience
- 0.4-0.6 = Moderate interest or some experience
- 0.0-0.3 = Minor interest or tangential mention

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "topics": [
    {"topic": "AI", "weight": 0.95},
    {"topic": "Healthcare", "weight": 0.80}
  ]
}

Student text:
${text}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse the JSON response
    const parsed = JSON.parse(responseText);
    
    // Validate and normalize topics
    const topics: TopicWeight[] = [];
    for (const item of parsed.topics || []) {
      const canonical = normalizeTopicName(item.topic);
      if (canonical) {
        topics.push({
          topic: canonical,
          weight: Math.min(1.0, Math.max(0.0, item.weight)),
        });
      }
    }

    return {
      topics,
      rawText: text,
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return extractInterestsFallback(text);
  }
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
