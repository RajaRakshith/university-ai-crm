/**
 * Extract interests from transcript text
 */

import { ExtractedInterests, TopicWeight } from '../types';
import { extractInterestsWithOracle } from './extract-oracle';
import { CANONICAL_TOPICS } from '../topic-map';

/**
 * Extract academic interests from transcript
 * Focuses on courses, majors, and academic achievements
 */
export async function extractInterestsFromTranscript(
  transcriptText: string
): Promise<ExtractedInterests> {
  // Use Oracle GenAI to extract interests
  return extractInterestsWithOracle(transcriptText);
}

/**
 * Merge interests from resume and transcript
 * Combines and normalizes weights
 */
export function mergeInterests(
  resumeInterests: TopicWeight[],
  transcriptInterests: TopicWeight[],
  resumeWeight: number = 0.6,  // Resume is slightly more important
  transcriptWeight: number = 0.4
): TopicWeight[] {
  const mergedMap = new Map<string, number>();
  
  // Add resume interests
  for (const item of resumeInterests) {
    mergedMap.set(item.topic, item.weight * resumeWeight);
  }
  
  // Add/merge transcript interests
  for (const item of transcriptInterests) {
    const existing = mergedMap.get(item.topic) || 0;
    mergedMap.set(item.topic, existing + (item.weight * transcriptWeight));
  }
  
  // Convert back to array and normalize
  const merged: TopicWeight[] = [];
  const maxWeight = Math.max(...Array.from(mergedMap.values()));
  
  for (const [topic, weight] of mergedMap.entries()) {
    merged.push({
      topic,
      weight: maxWeight > 0 ? weight / maxWeight : weight,
    });
  }
  
  // Sort by weight
  merged.sort((a, b) => b.weight - a.weight);
  
  return merged;
}
