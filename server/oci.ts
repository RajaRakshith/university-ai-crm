/**
 * OCI integration for OpportUNI (per Backend API Reference).
 * - Object Storage: store resume/transcript PDFs
 * - Document Understanding: extract text from PDFs (us-ashburn-1)
 * - Gemini 2.5 Flash: infer free-form topics (us-ashburn-1)
 * - GenAI Embed: embeddings (us-chicago-1; skipped on 401)
 */

import * as common from "oci-common";
import * as os from "oci-objectstorage";
import * as genai from "oci-generativeaiinference";
import { readFileSync } from "fs";
import { resolve } from "path";

const OCI_REGION = process.env.OCI_REGION || "us-ashburn-1";
const OCI_GENAI_REGION = process.env.OCI_GENAI_REGION || "us-chicago-1";
const OCI_COMPARTMENT_OCID = process.env.OCI_COMPARTMENT_OCID;
const OCI_OBJECTSTORAGE_NAMESPACE = process.env.OCI_OBJECTSTORAGE_NAMESPACE;
const OCI_OBJECTSTORAGE_BUCKET = process.env.OCI_OBJECTSTORAGE_BUCKET;
const OCI_PRIVATE_KEY_PATH = process.env.OCI_PRIVATE_KEY_PATH;
const OCI_USER_OCID = process.env.OCI_USER_OCID;
const OCI_FINGERPRINT = process.env.OCI_FINGERPRINT;
const OCI_TENANCY_OCID = process.env.OCI_TENANCY_OCID;

const GEMINI_MODEL_ID = "google.gemini-2.5-flash";
const EMBED_MODEL_ID = "cohere.embed-english-v3.0";

function isOciConfigured(): boolean {
  return !!(
    OCI_COMPARTMENT_OCID &&
    OCI_OBJECTSTORAGE_NAMESPACE &&
    OCI_OBJECTSTORAGE_BUCKET &&
    (OCI_PRIVATE_KEY_PATH || process.env.OCI_CONFIG_PATH)
  );
}

function getProvider(): common.AuthenticationDetailsProvider | null {
  if (!OCI_COMPARTMENT_OCID) return null;
  try {
    if (OCI_PRIVATE_KEY_PATH && OCI_USER_OCID && OCI_FINGERPRINT && OCI_TENANCY_OCID) {
      const keyPath = resolve(process.cwd(), OCI_PRIVATE_KEY_PATH.replace(/^~/, process.env.HOME || ""));
      const privateKey = readFileSync(keyPath, "utf-8");
      return new common.SimpleAuthenticationDetailsProvider(
        OCI_TENANCY_OCID,
        OCI_USER_OCID,
        OCI_COMPARTMENT_OCID,
        OCI_FINGERPRINT,
        privateKey,
        undefined
      );
    }
    if (process.env.OCI_CONFIG_PATH && process.env.OCI_PROFILE) {
      return new common.ConfigFileAuthenticationDetailsProvider(
        process.env.OCI_CONFIG_PATH,
        process.env.OCI_PROFILE
      );
    }
  } catch {
    // ignore
  }
  return null;
}

let cachedProvider: common.AuthenticationDetailsProvider | null = undefined as any;

function provider(): common.AuthenticationDetailsProvider | null {
  if (cachedProvider === undefined) cachedProvider = getProvider();
  return cachedProvider;
}

/** Upload a buffer to OCI Object Storage; returns the object key (e.g. "resumes/file.pdf"). */
export async function uploadToObjectStorage(objectKey: string, buffer: Buffer, contentType = "application/pdf"): Promise<string> {
  const prov = provider();
  if (!prov || !OCI_OBJECTSTORAGE_NAMESPACE || !OCI_OBJECTSTORAGE_BUCKET) {
    throw new Error("OCI Object Storage not configured");
  }
  const client = new os.ObjectStorageClient({ authenticationDetailsProvider: prov });
  client.regionId = OCI_REGION;
  await client.putObject({
    namespaceName: OCI_OBJECTSTORAGE_NAMESPACE,
    bucketName: OCI_OBJECTSTORAGE_BUCKET,
    objectName: objectKey,
    putObjectBody: buffer,
    contentLength: buffer.length,
    contentType,
  });
  return objectKey;
}

/**
 * Extract text from a PDF using OCI Document Understanding (document in Object Storage).
 * Caller must upload the file first and pass the object key.
 * Returns extracted text or empty string on failure (caller uses pdf-parse fallback).
 */
export async function extractTextFromDocumentByKey(objectKey: string): Promise<string> {
  const prov = provider();
  if (!prov || !OCI_OBJECTSTORAGE_NAMESPACE || !OCI_OBJECTSTORAGE_BUCKET || !OCI_COMPARTMENT_OCID) {
    return "";
  }
  try {
    const endpoint = `https://document.aiservice.${OCI_REGION}.oci.oraclecloud.com`;
    const path = "/20221109/actions/analyzeDocument";
    const body = JSON.stringify({
      compartmentId: OCI_COMPARTMENT_OCID,
      document: {
        source: "OBJECT_STORAGE",
        namespaceName: OCI_OBJECTSTORAGE_NAMESPACE,
        bucketName: OCI_OBJECTSTORAGE_BUCKET,
        objectName: objectKey,
      },
      features: [{ featureType: "TEXT_DETECTION" }],
    });
    const headers = new Headers({ "Content-Type": "application/json" });
    const req: common.HttpRequest = {
      method: "POST",
      uri: endpoint + path,
      headers,
      body,
    };
    const signer = new common.DefaultRequestSigner(prov);
    const client = new common.FetchHttpClient(signer);
    const response = await client.send(req, false, "AIServiceDocument", "AnalyzeDocument", undefined, endpoint + path);
    if (!response.ok) return "";
    const result = (await response.json()) as any;
    const pages = result?.pages || [];
    const words: string[] = [];
    for (const p of pages) {
      for (const w of p.words || []) {
        if (w.text) words.push(w.text);
      }
    }
    return words.join(" ").trim();
  } catch {
    return "";
  }
}

/**
 * Infer unique, specific skills and interests from resume/transcript text using Gemini 2.5 Flash (us-ashburn-1).
 * Returns array of unique topic strings, or empty on failure (caller should use pattern fallback).
 */
export async function inferTopicsWithGemini(combinedText: string): Promise<string[]> {
  const prov = provider();
  if (!prov || !OCI_COMPARTMENT_OCID || !combinedText.trim()) return [];

  const text = combinedText.slice(0, 28000);
  const client = new genai.GenerativeAiInferenceClient({ authenticationDetailsProvider: prov });
  client.regionId = OCI_REGION;

  try {
    const prompt = `You are an expert at analyzing resumes and transcripts to identify unique, specific skills, expertise areas, and interests that distinguish this person.

CRITICAL RULES:
1. Extract ONLY unique, specific traits that are actually mentioned in the text
2. Do NOT use generic programming language names (like "Python", "SQL", "R", "Java", "JavaScript") unless they are mentioned WITH specific context (e.g., "Python for data analysis", "SQL database optimization", "R statistical modeling")
3. Do NOT use generic categories or predefined lists
4. Focus on what makes THIS person unique

Extract:
- Specific technical skills WITH context (e.g., "TensorFlow deep learning", "React Native mobile apps", "PostgreSQL database design", NOT just "Python" or "SQL")
- Specific research areas or projects (e.g., "computational biology", "renewable energy systems", NOT just "research")
- Specific domains of expertise (e.g., "quantitative finance", "user experience design", NOT just "finance" or "design")
- Unique combinations or specializations (e.g., "AI for healthcare", "sustainable materials engineering")
- Specific methodologies, frameworks, or tools WITH their application context
- Any distinctive interests, experiences, or achievements that stand out

AVOID generic terms like:
- Single programming language names without context ("Python", "SQL", "R", "Java")
- Generic categories ("software engineering", "data science", "research")
- Common skills that appear in most resumes

From the following resume and transcript text, extract a JSON array of 15-25 unique, specific topic strings. Each topic should be:
- Specific and concrete (not vague or generic)
- Actually present in the text with context
- Distinctive to this person's profile
- Include context for technical skills (e.g., "Python for machine learning" not just "Python")

Output ONLY a valid JSON array of strings, no other text. Example format: ["TensorFlow deep learning", "computational biology research", "quantitative trading strategies", "user research methodologies", "PostgreSQL database optimization"]

Text:
${text}`;

    const response = await client.chat({
      chatDetails: {
        compartmentId: OCI_COMPARTMENT_OCID,
        servingMode: {
          servingType: "ON_DEMAND",
          modelId: GEMINI_MODEL_ID,
        },
        chatRequest: {
          apiFormat: "GENERIC",
          messages: [
            {
              role: "USER",
              content: [
                { type: "TEXT", text: prompt } as genai.models.TextContent,
              ],
            },
          ],
        },
      },
    });

    const chatResult = (response as genai.responses.ChatResponse)?.chatResult;
    const chatResponse = chatResult?.chatResponse as { choices?: Array<{ message?: { content?: Array<{ text?: string }> | string } }> } | undefined;
    const choices = chatResponse?.choices;
    const msg = choices?.[0]?.message;
    const content = msg?.content;
    const textPart = Array.isArray(content) ? content.find((c: unknown) => c && typeof c === "object" && "text" in c) : content;
    const raw = (typeof textPart === "string" ? textPart : (textPart && typeof textPart === "object" && "text" in textPart ? (textPart as { text?: string }).text : (typeof content === "string" ? content : ""))) ?? "";
    if (!raw) {
      console.warn("[OCI] Gemini returned empty response for topic extraction");
      return [];
    }

    // Clean and parse JSON response
    let jsonStr = raw.trim();
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    // Extract JSON array
    jsonStr = jsonStr.replace(/^[^[]*\[/, "[").replace(/\][^]]*$/, "]");
    
    try {
      const parsed = JSON.parse(jsonStr) as string[];
      if (Array.isArray(parsed)) {
        // Filter and deduplicate topics
        const unique = Array.from(new Set(
          parsed
            .filter((s) => typeof s === "string" && s.trim().length > 0)
            .map((s) => s.trim())
        ));
        console.log(`[OCI] Gemini extracted ${unique.length} unique topics`);
        return unique.slice(0, 25);
      }
    } catch (parseError) {
      console.error("[OCI] Failed to parse Gemini response as JSON:", parseError);
      console.error("[OCI] Raw response:", raw.substring(0, 500));
    }
    
    return [];
  } catch (err: any) {
    console.error("[OCI] Gemini topic extraction failed:", err.message || err);
    return [];
  }
}

/**
 * Create embedding for text using OCI GenAI (us-chicago-1). Returns null on 401 or any failure.
 */
export async function createEmbedding(text: string): Promise<number[] | null> {
  const prov = provider();
  if (!prov || !OCI_COMPARTMENT_OCID || !text.trim()) return null;

  const client = new genai.GenerativeAiInferenceClient({ authenticationDetailsProvider: prov });
  client.regionId = OCI_GENAI_REGION;

  try {
    const input = text.slice(0, 8000);
    const response = await client.embedText({
      embedTextDetails: {
        compartmentId: OCI_COMPARTMENT_OCID,
        inputs: [input],
        servingMode: {
          servingType: "ON_DEMAND",
          modelId: EMBED_MODEL_ID,
        } as genai.models.OnDemandServingMode,
      },
    });
    const embeddings = response?.embedTextResult?.embeddings;
    if (Array.isArray(embeddings) && embeddings[0]?.length) return embeddings[0];
    return null;
  } catch (err: any) {
    if (err?.statusCode === 401) return null;
    return null;
  }
}

export { isOciConfigured };
