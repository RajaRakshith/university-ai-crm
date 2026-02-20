/**
 * Oracle Generative AI Service Integration
 * Uses OCI Generative AI with Cohere Command models
 */

import { TopicWeight, ExtractedInterests } from '../types';
import { CANONICAL_TOPICS, normalizeTopicName } from '../topic-map';
import * as fs from 'fs';

// OCI SDK - using full SDK for proper authentication
import * as common from 'oci-common';
import * as genai from 'oci-generativeaiinference';

interface OracleGenAIConfig {
  tenancyOcid: string;
  userOcid: string;
  fingerprint: string;
  privateKey: string;
  region: string;
  compartmentOcid: string;
  modelId: string;
  endpoint: string;
}

/**
 * Get Oracle Cloud configuration from environment
 */
function getOracleConfig(): OracleGenAIConfig | null {
  if (process.env.OCI_GENERATIVE_AI_ENABLED !== 'true') {
    console.log('[Oracle GenAI] Not enabled (OCI_GENERATIVE_AI_ENABLED != true)');
    return null;
  }

  // Read private key from file if path is provided
  let privateKey = process.env.OCI_PRIVATE_KEY || '';
  
  if (!privateKey && process.env.OCI_PRIVATE_KEY_PATH) {
    try {
      privateKey = fs.readFileSync(process.env.OCI_PRIVATE_KEY_PATH, 'utf8');
      console.log('[Oracle GenAI] Private key loaded from:', process.env.OCI_PRIVATE_KEY_PATH);
    } catch (error) {
      console.error('[Oracle GenAI] Failed to read private key file:', error);
      return null;
    }
  }

  if (!privateKey) {
    console.error('[Oracle GenAI] No private key found (need OCI_PRIVATE_KEY or OCI_PRIVATE_KEY_PATH)');
    return null;
  }

  const config = {
    tenancyOcid: process.env.OCI_TENANCY_OCID || '',
    userOcid: process.env.OCI_USER_OCID || '',
    fingerprint: process.env.OCI_FINGERPRINT || '',
    privateKey: privateKey,
    region: process.env.OCI_REGION || 'us-ashburn-1',
    compartmentOcid: process.env.OCI_COMPARTMENT_OCID || '',
    modelId: process.env.OCI_GENAI_MODEL || 'cohere.command-r-plus',
    endpoint: process.env.OCI_GENAI_ENDPOINT || 
      'https://inference.generativeai.us-ashburn-1.oci.oraclecloud.com',
  };

  console.log('[Oracle GenAI] Config loaded:');
  console.log('  - Region:', config.region);
  console.log('  - Model:', config.modelId);
  console.log('  - Endpoint:', config.endpoint);
  console.log('  - Compartment:', config.compartmentOcid.substring(0, 50) + '...');

  return config;
}

/**
 * Extract interests using Oracle Generative AI
 */
export async function extractInterestsWithOracle(
  text: string
): Promise<ExtractedInterests> {
  console.log('[Oracle GenAI] Starting extraction...');
  
  const config = getOracleConfig();

  if (!config || !config.tenancyOcid) {
    console.log('[Oracle GenAI] Not available, using fallback');
    return extractInterestsFallback(text);
  }

  try {
    const prompt = buildExtractionPrompt(text);

    console.log('[Oracle GenAI] Prompt created, calling API...');

    // Call Oracle Generative AI API
    const response = await callOracleGenAI(config, prompt);

    console.log('[Oracle GenAI] Response received, parsing...');

    // Parse response
    const interests = parseOracleResponse(response);

    console.log('[Oracle GenAI] Successfully extracted', interests.length, 'interests');

    return {
      topics: interests,
      rawText: text,
    };
  } catch (error: any) {
    console.error('[Oracle GenAI] Extraction failed:', error.message);
    console.log('[Oracle GenAI] Falling back to simple extraction');
    return extractInterestsFallback(text);
  }
}

/**
 * Build prompt for Oracle GenAI
 */
function buildExtractionPrompt(text: string): string {
  return `You are an expert at analyzing student profiles and extracting professional interests.

Analyze the following student profile/resume text and extract their interests and skills.

Available topics to choose from:
${CANONICAL_TOPICS.join(', ')}

For each relevant topic, assign a relevance score from 0.0 to 1.0 where:
- 1.0 = Primary focus/expertise (mentioned multiple times, clear expertise)
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

Student profile:
${text}

Response (JSON only):`;
}

/**
 * Call Oracle Generative AI API using OCI SDK
 */
async function callOracleGenAI(
  config: OracleGenAIConfig,
  prompt: string
): Promise<string> {
  console.log('[Oracle GenAI] Calling API...');
  console.log('  - Endpoint:', config.endpoint);
  console.log('  - Model:', config.modelId);
  
  try {
    // Create authentication provider
    const provider = new common.SimpleAuthenticationDetailsProvider(
      config.tenancyOcid,
      config.userOcid,
      config.fingerprint,
      config.privateKey,
      null, // passphrase (if key is encrypted)
      common.Region.fromRegionId(config.region)
    );

    console.log('[Oracle GenAI] Authentication provider created');

    // Create GenerativeAI client
    const client = new genai.GenerativeAiInferenceClient({
      authenticationDetailsProvider: provider,
    });

    // Set endpoint to Chicago region (where GenAI is available)
    client.endpoint = config.endpoint;

    console.log('[Oracle GenAI] Client created, sending request...');

    // Create request
    const generateTextDetails: genai.requests.GenerateTextRequest = {
      generateTextDetails: {
        compartmentId: config.compartmentOcid,
        servingMode: {
          servingType: 'ON_DEMAND',
          modelId: config.modelId,
        } as genai.models.OnDemandServingMode,
        inferenceRequest: {
          runtimeType: 'COHERE',
          prompt: prompt,
          maxTokens: 500,
          temperature: 0.3,
          topP: 0.9,
          isStream: false,
        } as genai.models.CohereLlmInferenceRequest,
      },
    };

    const response = await client.generateText(generateTextDetails);

    console.log('[Oracle GenAI] Response received');
    console.log('  - Status:', response._httpResponse?.status);

    // Extract generated text from response
    const inferenceResponse = response.generateTextResult.inferenceResponse as genai.models.CohereLlmInferenceResponse;
    const generatedText = inferenceResponse.generatedTexts?.[0]?.text || '';

    console.log('[Oracle GenAI] Generated text length:', generatedText.length);

    return generatedText;

  } catch (error: any) {
    console.error('[Oracle GenAI] API call failed:', {
      message: error.message,
      statusCode: error.statusCode,
      serviceName: error.serviceName,
      operationName: error.operationName,
      requestId: error['opc-request-id'],
    });

    if (error.statusCode === 401) {
      console.error('[Oracle GenAI] AUTHENTICATION ERROR:');
      console.error('  - Check fingerprint matches API key in OCI Console');
      console.error('  - Verify user OCID is correct');
      console.error('  - Ensure private key is not encrypted or provide passphrase');
    } else if (error.statusCode === 404) {
      console.error('[Oracle GenAI] SERVICE NOT FOUND:');
      console.error('  - Generative AI may not be enabled in your tenancy');
      console.error('  - Check if policy grants access to generative-ai-family');
      console.error('  - Verify model ID:', config.modelId);
    } else if (error.statusCode === 403) {
      console.error('[Oracle GenAI] AUTHORIZATION ERROR:');
      console.error('  - User lacks permission to use Generative AI');
      console.error('  - Required policy: allow any-user to use generative-ai-family in tenancy');
      console.error('  - Or: allow group <your-group> to use generative-ai-family in tenancy');
    }

    throw new Error(`Oracle GenAI API error: ${error.message || error.statusCode || 'Unknown error'}`);
  }
}

/**
 * Parse Oracle GenAI response into topics
 */
function parseOracleResponse(responseText: string): TopicWeight[] {
  try {
    // Clean up response (remove markdown if present)
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleanText);
    
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

    return topics;
  } catch (error) {
    console.error('Error parsing Oracle GenAI response:', error);
    return [];
  }
}

/**
 * Fallback keyword-based extraction
 */
function extractInterestsFallback(text: string): ExtractedInterests {
  const lowerText = text.toLowerCase();
  const topics: TopicWeight[] = [];

  const keywordScores: Record<string, number> = {};

  for (const topic of CANONICAL_TOPICS) {
    const topicLower = topic.toLowerCase();
    
    const regex = new RegExp(`\\b${topicLower}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      const weight = Math.min(1.0, 0.5 + (count * 0.2));
      keywordScores[topic] = weight;
    }
  }

  for (const [topic, weight] of Object.entries(keywordScores)) {
    topics.push({ topic, weight });
  }

  topics.sort((a, b) => b.weight - a.weight);

  return {
    topics,
    rawText: text,
  };
}
