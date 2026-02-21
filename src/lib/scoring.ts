import { TopicWeight, StudentVector, EventVector, MatchScore } from './types';
import { normalizeTopicName } from './topic-map';

/**
 * Student with metadata for requirement filtering
 */
export interface StudentWithMetadata extends StudentVector {
  major?: string | null;
  year?: string | null;
}

/**
 * Event with requirements
 */
export interface EventWithRequirements extends EventVector {
  requiredMajors?: string | null;
  requiredYears?: string | null;
}

/**
 * Check if student meets event requirements
 */
export function meetsRequirements(
  student: StudentWithMetadata,
  event: EventWithRequirements
): boolean {
  // Check major requirement
  if (event.requiredMajors) {
    const requiredMajors = event.requiredMajors.split(',').map(m => m.trim().toLowerCase());
    const studentMajor = student.major?.toLowerCase().trim();
    
    if (studentMajor && !requiredMajors.some(rm => studentMajor.includes(rm) || rm.includes(studentMajor))) {
      return false;
    }
  }
  
  // Check year requirement
  if (event.requiredYears) {
    const requiredYears = event.requiredYears.split(',').map(y => y.trim().toLowerCase());
    const studentYear = student.year?.toLowerCase().trim();
    
    if (studentYear && !requiredYears.includes(studentYear)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate cosine similarity between two topic vectors
 * Topics are normalized to canonical forms before comparison
 */
export function cosineSimilarity(vec1: TopicWeight[], vec2: TopicWeight[]): number {
  console.log('\n🔍 COSINE SIMILARITY CALLED');
  console.log('Vec1 topics:', vec1.map(t => t.topic));
  console.log('Vec2 topics:', vec2.map(t => t.topic));
  
  // Normalize topics to canonical forms and aggregate weights
  const normalizeVector = (vec: TopicWeight[]) => {
    const normalized = new Map<string, number>();
    for (const { topic, weight } of vec) {
      const canonical = normalizeTopicName(topic) || topic;
      console.log(`  Normalizing "${topic}" → "${canonical}"`);
      normalized.set(canonical, (normalized.get(canonical) || 0) + weight);
    }
    return normalized;
  };
  
  const vec1Map = normalizeVector(vec1);
  const vec2Map = normalizeVector(vec2);
  
  console.log('Normalized vec1:', Array.from(vec1Map.entries()));
  console.log('Normalized vec2:', Array.from(vec2Map.entries()));
  
  // Get all unique topics
  const allTopics = new Set([...vec1Map.keys(), ...vec2Map.keys()]);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (const topic of allTopics) {
    const w1 = vec1Map.get(topic) || 0;
    const w2 = vec2Map.get(topic) || 0;
    
    dotProduct += w1 * w2;
    mag1 += w1 * w1;
    mag2 += w2 * w2;
  }
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Calculate match score between a student and an event
 */
export function calculateMatchScore(
  student: StudentVector,
  event: EventVector
): MatchScore {
  const score = cosineSimilarity(student.topics, event.topics);
  
  // Find which topics matched after normalization
  const studentNormalized = new Map<string, string>();
  student.topics.forEach(t => {
    const canonical = normalizeTopicName(t.topic) || t.topic;
    if (!studentNormalized.has(canonical)) {
      studentNormalized.set(canonical, t.topic);
    }
  });
  
  const eventNormalized = new Set<string>();
  event.topics.forEach(t => {
    const canonical = normalizeTopicName(t.topic) || t.topic;
    eventNormalized.add(canonical);
  });
  
  const matchedTopics: string[] = [];
  studentNormalized.forEach((originalTopic, canonical) => {
    if (eventNormalized.has(canonical)) {
      matchedTopics.push(originalTopic);
    }
  });
  
  return {
    studentId: student.studentId,
    eventId: event.eventId,
    score,
    matchedTopics,
  };
}

/**
 * Filter students by minimum threshold score
 */
export function filterByThreshold(
  scores: MatchScore[],
  threshold: number
): MatchScore[] {
  return scores
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate match scores for multiple students against one event
 */
export function scoreStudentsForEvent(
  students: StudentWithMetadata[],
  event: EventWithRequirements,
  threshold?: number
): MatchScore[] {
  // First filter by requirements
  const eligibleStudents = students.filter(student => meetsRequirements(student, event));
  
  // Then calculate scores
  const scores = eligibleStudents.map(student => calculateMatchScore(student, event));
  
  if (threshold !== undefined) {
    return filterByThreshold(scores, threshold);
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Calculate match scores for one student against multiple events
 */
export function scoreEventsForStudent(
  student: StudentWithMetadata,
  events: EventWithRequirements[],
  threshold?: number
): MatchScore[] {
  // Filter events where student meets requirements
  const eligibleEvents = events.filter(event => meetsRequirements(student, event));
  
  // Calculate scores
  const scores = eligibleEvents.map(event => calculateMatchScore(student, event));
  
  if (threshold !== undefined) {
    return filterByThreshold(scores, threshold);
  }
  
  return scores.sort((a, b) => b.score - a.score);
}
