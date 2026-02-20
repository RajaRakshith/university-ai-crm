// Core types for the application

export interface TopicWeight {
  topic: string;
  weight: number;
}

export interface StudentVector {
  studentId: string;
  topics: TopicWeight[];
}

export interface EventVector {
  eventId: string;
  topics: TopicWeight[];
}

export interface MatchScore {
  studentId: string;
  eventId: string;
  score: number;
  matchedTopics: string[];
}

export interface ExtractedInterests {
  topics: TopicWeight[];
  rawText?: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  major?: string;
  year?: string;
  interests: TopicWeight[];
}

export interface EventWithScore {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location?: string;
  centerName: string;
  score: number;
  matchedTopics: string[];
}

export interface DigestWeek {
  weekOf: Date;
  events: EventWithScore[];
}
