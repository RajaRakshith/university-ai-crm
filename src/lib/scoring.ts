import { TopicWeight, StudentVector, EventVector, MatchScore } from './types';

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
 */
export function cosineSimilarity(vec1: TopicWeight[], vec2: TopicWeight[]): number {
  // Create maps for quick lookup
  const vec1Map = new Map(vec1.map(t => [t.topic, t.weight]));
  const vec2Map = new Map(vec2.map(t => [t.topic, t.weight]));
  
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
  
  // Find which topics matched (both have non-zero weight)
  const studentTopics = new Set(student.topics.map(t => t.topic));
  const eventTopics = new Set(event.topics.map(t => t.topic));
  const matchedTopics = [...studentTopics].filter(t => eventTopics.has(t));
  
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
