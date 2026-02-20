/**
 * Infer topics (expertise areas) from raw resume + transcript or other text.
 * Uses free-form extraction: no fixed topic list. Gemini returns open-ended phrases;
 * fallback uses pattern-based extraction from the document text.
 */

import { chatWithGemini } from "@/lib/oci/chat";

// Patterns that capture phrases from text (capture group 1 = topic phrase). No hardcoded output list.
const FREE_FORM_PATTERNS: RegExp[] = [
  /\b([a-z]+(?:\s+[a-z]+)?\s+engineering)\b/gi,
  /\b([a-z]+(?:\s+[a-z]+)?\s+science)\b/gi,
  /\b(machine learning|data science|deep learning|natural language processing|computer vision)\b/gi,
  /\b(Python|Java|JavaScript|MATLAB|R|C\+\+|SQL)\b/g,
  /\b(research|robotics|aerospace|physics|chemistry|biology|mathematics|statistics|economics)\b/gi,
  /\b(software development|web development|cloud|security|databases)\b/gi,
  /\b(healthcare|climate|sustainability|entrepreneurship|finance|public policy)\b/gi,
];

/**
 * Extract expertise phrases directly from text using patterns. Returns whatever phrases
 * appear in the document (e.g. "mechanical engineering", "fluid dynamics") — no fixed list.
 */
function extractFreeFormTopicsFromText(text: string): string[] {
  if (!text?.trim()) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const re of FREE_FORM_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const phrase = m[1].trim();
      const key = phrase.toLowerCase();
      if (phrase.length > 1 && phrase.length < 80 && !seen.has(key)) {
        seen.add(key);
        result.push(phrase);
      }
    }
  }
  return result;
}

/**
 * From raw resume and transcript text, return a list of expertise topics (free-form).
 * Uses pattern-based extraction only; no hardcoded list.
 */
export function inferTopicsFromResumeAndTranscript(
  rawResumeText: string,
  rawTranscriptText: string
): string[] {
  const combined = [rawResumeText, rawTranscriptText].filter(Boolean).join("\n");
  const topics = extractFreeFormTopicsFromText(combined);
  return topics.length > 0 ? topics : ["research"];
}

/**
 * Parse Gemini's free-form response: comma/semicolon/newline separated phrases. No allow-list.
 */
function parseFreeFormTopicsFromGeminiResponse(responseText: string): string[] {
  const parts = responseText
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 100);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(p);
    }
  }
  return result;
}

const MAX_RESUME_CHARS = 3200;
const MAX_TRANSCRIPT_CHARS = 3200;

/**
 * Infer topics from resume + transcript using Gemini. Free-form: model returns any
 * expertise areas it sees (no fixed list). Falls back to pattern-based extraction on error.
 */
export async function inferTopicsFromResumeAndTranscriptWithGemini(
  rawResumeText: string,
  rawTranscriptText: string
): Promise<string[]> {
  const resumePart = rawResumeText.trim().slice(0, MAX_RESUME_CHARS);
  const transcriptPart = rawTranscriptText.trim().slice(0, MAX_TRANSCRIPT_CHARS);
  const hasResume = resumePart.length > 0;
  const hasTranscript = transcriptPart.length > 0;
  if (!hasResume && !hasTranscript) return ["research"];

  const sections: string[] = [];
  if (hasResume) sections.push(`=== RESUME ===\n${resumePart}`);
  if (hasTranscript) sections.push(`=== ACADEMIC TRANSCRIPT (courses, grades) ===\n${transcriptPart}`);
  const body = sections.join("\n\n");

  const prompt = `You are analyzing a student's profile to identify their main expertise areas and skills. Use BOTH the resume and the academic transcript when provided. The transcript (courses, grades) is especially important.

Extract the person's expertise areas, academic focus, and relevant skills. Use clear, concise phrases that appear in or are directly implied by the documents (e.g. "mechanical engineering", "fluid dynamics", "CAD", "Python", "research", "thermodynamics"). Do NOT invent topics that are not supported by the text. Match the person's actual field and wording where possible.

Respond with ONLY a comma-separated list of these phrases. No other text.`;

  const fullPrompt = `${prompt}\n\n${body}`;

  try {
    const reply = await chatWithGemini(fullPrompt, 500);
    const topics = parseFreeFormTopicsFromGeminiResponse(reply);
    if (topics.length > 0) return topics;
    return inferTopicsFromResumeAndTranscript(rawResumeText, rawTranscriptText);
  } catch {
    return inferTopicsFromResumeAndTranscript(rawResumeText, rawTranscriptText);
  }
}

/**
 * Infer free-form topics from any text (e.g. posting description). Used for topic-based matching.
 * No hardcoded list — extracts phrases that appear in the text.
 */
export function inferTopicsFromText(text: string): string[] {
  const topics = extractFreeFormTopicsFromText(text);
  return topics.length > 0 ? topics : ["research"];
}
