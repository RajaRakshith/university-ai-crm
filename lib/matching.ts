/**
 * Cosine similarity between two vectors; used to rank students for a posting.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface StudentWithScore {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  score: number;
}

/**
 * Rank students by cosine similarity to the posting embedding (requires OCI GenAI in a supported region).
 */
export function rankStudentsBySimilarity(
  postingEmbedding: number[],
  students: Array<{
    id: string;
    name: string | null;
    email: string | null;
    topics: unknown;
    embedding: unknown;
  }>
): StudentWithScore[] {
  const withScores: StudentWithScore[] = [];
  for (const s of students) {
    const emb = Array.isArray(s.embedding) ? (s.embedding as number[]) : null;
    if (!emb || emb.length === 0) continue;
    const score = cosineSimilarity(postingEmbedding, emb);
    const topics = Array.isArray(s.topics) ? (s.topics as string[]) : [];
    withScores.push({
      id: s.id,
      name: s.name,
      email: s.email,
      topics,
      score,
    });
  }
  withScores.sort((a, b) => b.score - a.score);
  return withScores;
}

/**
 * True if student topic matches at least one posting topic (exact or substring match).
 * Free-form topics work better with fuzzy match: "mechanical" matches "mechanical engineering".
 */
function topicMatchesPosting(studentTopic: string, postingTopicsLower: string[]): boolean {
  const s = studentTopic.toLowerCase();
  if (postingTopicsLower.some((p) => p === s)) return true;
  if (postingTopicsLower.some((p) => s.includes(p) || p.includes(s))) return true;
  return false;
}

/**
 * Rank students by topic overlap with the posting (no OCI GenAI needed).
 * Uses free-form topics; match is exact or substring (e.g. "mechanical" matches "mechanical engineering").
 * Score = fraction of posting topics that have at least one matching student topic, 0–1.
 */
export function rankStudentsByTopicOverlap(
  postingTopics: string[],
  students: Array<{
    id: string;
    name: string | null;
    email: string | null;
    topics: unknown;
  }>
): StudentWithScore[] {
  const postingLower = postingTopics.map((t) => t.toLowerCase()).filter(Boolean);
  if (postingLower.length === 0) return [];

  const withScores: StudentWithScore[] = [];
  for (const s of students) {
    const studentTopics = Array.isArray(s.topics) ? (s.topics as string[]) : [];
    const matchedPostingTopics = new Set<string>();
    for (const st of studentTopics) {
      for (const p of postingLower) {
        if (topicMatchesPosting(st, [p])) matchedPostingTopics.add(p);
      }
    }
    const score = matchedPostingTopics.size / postingLower.length;
    withScores.push({
      id: s.id,
      name: s.name,
      email: s.email,
      topics: studentTopics,
      score,
    });
  }
  withScores.sort((a, b) => b.score - a.score);
  return withScores;
}
