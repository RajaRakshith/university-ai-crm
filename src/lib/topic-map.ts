/**
 * Canonical topic taxonomy for the CRM system
 * Maps various synonyms to standardized topic names
 */

export const CANONICAL_TOPICS = [
  // Technology
  'AI',
  'Machine Learning',
  'Data Science',
  'Web3',
  'Blockchain',
  'Cybersecurity',
  'Software Engineering',
  'Cloud Computing',
  
  // Industries
  'Healthcare',
  'Climate',
  'Energy',
  'Supply Chain',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'Education',
  'Real Estate',
  
  // Career Paths
  'Entrepreneurship',
  'Startups',
  'VC',
  'Product Management',
  'Consulting',
  'Finance',
  'Investment Banking',
  'Marketing',
  'Sales',
  
  // Skills
  'Networking',
  'Leadership',
  'Public Speaking',
  'Research',
  'Design',
  'UX',
  
  // Academic
  'MBA',
  'Engineering',
  'Computer Science',
  'Business',
  'Policy',
] as const;

export type CanonicalTopic = typeof CANONICAL_TOPICS[number];

/**
 * Map of synonyms to canonical topics
 */
export const TOPIC_SYNONYMS: Record<string, CanonicalTopic> = {
  // AI variations
  'artificial intelligence': 'AI',
  'ai': 'AI',
  'deep learning': 'Machine Learning',
  'neural networks': 'Machine Learning',
  'ml': 'Machine Learning',
  'nlp': 'AI',
  'computer vision': 'AI',
  
  // Climate variations
  'sustainability': 'Climate',
  'climate tech': 'Climate',
  'clean tech': 'Climate',
  'renewable energy': 'Energy',
  'cleantech': 'Climate',
  
  // Startup variations
  'startup': 'Startups',
  'venture capital': 'VC',
  'investing': 'VC',
  'entrepreneurial': 'Entrepreneurship',
  'founder': 'Startups',
  
  // Healthcare variations
  'health': 'Healthcare',
  'medical': 'Healthcare',
  'biotech': 'Healthcare',
  'pharma': 'Healthcare',
  'health tech': 'Healthcare',
  
  // Tech variations
  'data analysis': 'Data Science',
  'analytics': 'Data Science',
  'crypto': 'Web3',
  'web 3': 'Web3',
  'software development': 'Software Engineering',
  'programming': 'Software Engineering',
  'coding': 'Software Engineering',
  
  // Career variations
  'product manager': 'Product Management',
  'pm': 'Product Management',
  'strategy': 'Consulting',
  'management consulting': 'Consulting',
  'banking': 'Investment Banking',
  'ib': 'Investment Banking',
  
  // Skill variations
  'network': 'Networking',
  'public talk': 'Public Speaking',
  'speaking': 'Public Speaking',
  'user experience': 'UX',
  'ui/ux': 'UX',
  'design thinking': 'Design',
};

/**
 * Normalize a topic string to its canonical form
 */
export function normalizeTopicName(input: string): CanonicalTopic | null {
  const normalized = input.toLowerCase().trim();
  
  // Check if it's already canonical
  const canonical = CANONICAL_TOPICS.find(
    t => t.toLowerCase() === normalized
  );
  if (canonical) return canonical;
  
  // Check synonyms
  if (normalized in TOPIC_SYNONYMS) {
    return TOPIC_SYNONYMS[normalized];
  }
  
  return null;
}

/**
 * Extract and normalize topics from a list of strings
 */
export function extractCanonicalTopics(rawTopics: string[]): CanonicalTopic[] {
  const unique = new Set<CanonicalTopic>();
  
  for (const raw of rawTopics) {
    const canonical = normalizeTopicName(raw);
    if (canonical) {
      unique.add(canonical);
    }
  }
  
  return Array.from(unique);
}
