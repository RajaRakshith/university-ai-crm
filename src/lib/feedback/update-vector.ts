import { TopicWeight } from '../types';
import { applyFeedback } from './normalize';

/**
 * Update student interest weights based on interaction feedback
 */
export async function updateStudentVector(
  currentInterests: TopicWeight[],
  eventTopics: string[],
  interactionType: 'interested' | 'not_relevant' | 'strong_interest'
): Promise<TopicWeight[]> {
  const feedbackTypeMap = {
    strong_interest: 'strong_positive' as const,
    interested: 'positive' as const,
    not_relevant: 'negative' as const,
  };

  const feedbackType = feedbackTypeMap[interactionType];
  
  return applyFeedback(currentInterests, eventTopics, feedbackType);
}
