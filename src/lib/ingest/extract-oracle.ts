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

Analyze the following student profile/resume text and extract ALL their interests, skills, academic areas, industries, and career aspirations.

Extract ANY relevant topic you find - don't limit yourself to a predefined list. Be comprehensive and specific.

For each topic, assign a relevance score from 0.0 to 1.0 where:
- 1.0 = Primary focus/expertise (mentioned multiple times, clear expertise, major/degree)
- 0.7-0.9 = Strong interest or significant experience
- 0.4-0.6 = Moderate interest or some experience
- 0.0-0.3 = Minor interest or tangential mention

Examples of topics to extract:
- Academic majors (e.g., "Pre-Med", "Computer Science", "Business")
- Technical skills (e.g., "Python", "React", "Data Analysis")
- Industries (e.g., "Healthcare", "Finance", "Climate Tech")
- Career interests (e.g., "Product Management", "Research", "Entrepreneurship")
- Soft skills (e.g., "Leadership", "Communication", "Design")
- Specific domains (e.g., "Machine Learning", "Blockchain", "Biotech")

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "topics": [
    {"topic": "Pre-Med", "weight": 1.0},
    {"topic": "Neuroscience", "weight": 0.85},
    {"topic": "Research", "weight": 0.90}
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

    // Set endpoint
    client.endpoint = config.endpoint;

    console.log('[Oracle GenAI] Client created, sending request...');

    // Determine model type from model ID
    const isGemini = config.modelId.toLowerCase().includes('gemini') || config.modelId.toLowerCase().includes('google');
    const isCohere = config.modelId.toLowerCase().includes('cohere');
    const isMeta = config.modelId.toLowerCase().includes('meta') || config.modelId.toLowerCase().includes('llama');

    let generatedText = '';

    if (isGemini) {
      // Google Gemini models use Chat API
      console.log('[Oracle GenAI] Using Gemini Chat API');
      const chatDetails: genai.requests.ChatRequest = {
        chatDetails: {
          compartmentId: config.compartmentOcid,
          servingMode: {
            servingType: 'ON_DEMAND',
            modelId: config.modelId,
          } as genai.models.OnDemandServingMode,
          chatRequest: {
            apiFormat: 'GENERIC',
            messages: [
              {
                role: 'USER',
                content: [
                  {
                    type: 'TEXT',
                    text: prompt,
                  } as genai.models.TextContent,
                ],
              } as genai.models.UserMessage,
            ],
            maxTokens: 8000,
            temperature: 0.3,
            topP: 0.9,
          } as genai.models.GenericChatRequest,
        },
      };

      const response = await client.chat(chatDetails);
      console.log('[Oracle GenAI] Response received');
      console.log('  - Status:', response._httpResponse?.status);

      const chatResponse = response.chatResult.chatResponse as genai.models.GenericChatResponse;
      generatedText = chatResponse.choices?.[0]?.message?.content?.[0]?.text || '';
    } else {
      // Cohere and Llama use Text Generation API
      let generateTextDetails: genai.requests.GenerateTextRequest;

      if (isCohere) {
        console.log('[Oracle GenAI] Using Cohere runtime');
        generateTextDetails = {
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
      } else {
        // Meta Llama or default
        console.log('[Oracle GenAI] Using Llama runtime');
        generateTextDetails = {
          generateTextDetails: {
            compartmentId: config.compartmentOcid,
            servingMode: {
              servingType: 'ON_DEMAND',
              modelId: config.modelId,
            } as genai.models.OnDemandServingMode,
            inferenceRequest: {
              runtimeType: 'LLAMA',
              prompt: prompt,
              maxTokens: 500,
              temperature: 0.3,
              topP: 0.9,
              isStream: false,
            } as genai.models.LlamaLlmInferenceRequest,
          },
        };
      }

      const response = await client.generateText(generateTextDetails);
      console.log('[Oracle GenAI] Response received');
      console.log('  - Status:', response._httpResponse?.status);

      if (isCohere) {
        const inferenceResponse = response.generateTextResult.inferenceResponse as genai.models.CohereLlmInferenceResponse;
        generatedText = inferenceResponse.generatedTexts?.[0]?.text || '';
      } else {
        const inferenceResponse = response.generateTextResult.inferenceResponse as genai.models.LlamaLlmInferenceResponse;
        generatedText = inferenceResponse.generatedTexts?.[0]?.text || '';
      }
    }

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
    
    // Accept any topics the AI returns - no restrictions!
    const topics: TopicWeight[] = [];
    for (const item of parsed.topics || []) {
      if (item.topic && typeof item.topic === 'string' && item.topic.trim()) {
        // Try to normalize to canonical topic, but if not found, use as-is
        const canonical = normalizeTopicName(item.topic);
        const topicName = canonical || item.topic.trim();
        
        topics.push({
          topic: topicName,
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
 * Fallback keyword-based extraction with smart topic detection
 */
function extractInterestsFallback(text: string): ExtractedInterests {
  const topics: TopicWeight[] = [];
  const keywordScores: Record<string, number> = {};

  // First, try to extract from canonical topics
  for (const topic of CANONICAL_TOPICS) {
    const topicLower = topic.toLowerCase();
    const regex = new RegExp(`\\b${topicLower}\\b`, 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      const weight = Math.min(1.0, 0.5 + (count * 0.2));
      keywordScores[topic] = weight;
    }
  }

  // Enhanced extraction: Look for important capitalized phrases and domain terms
  // Common patterns for skills, fields, and expertise
  const importantPatterns = [
    // Medical/Healthcare
    /\b(Cancer Research|Oncology|Immunotherapy|Clinical Trial|Biostatistics|Medicine|Medical|Healthcare|Patient Care|Surgery|Pharmacology|Pathology|Neuroscience|Cardiology|Radiology|Pediatrics|Psychiatry)\b/gi,
    // Academic majors
    /\b(Pre-Med|Pre-Medical|Computer Science|Data Science|Molecular Biology|Bioengineering|Mechanical Engineering|Electrical Engineering|Chemical Engineering|Business Administration|Economics|Psychology|Sociology)\b/gi,
    // Technical skills
    /\b(Machine Learning|Artificial Intelligence|Deep Learning|Natural Language Processing|Computer Vision|Data Analysis|Web Development|Mobile Development|Cloud Computing|DevOps|Blockchain|Cybersecurity)\b/gi,
    // Programming/Tools
    /\b(Python|JavaScript|TypeScript|React|Node\.js|TensorFlow|PyTorch|Docker|Kubernetes|AWS|Azure|GCP)\b/gi,
    // Business/Career
    /\b(Product Management|Project Management|Business Development|Marketing|Sales|Consulting|Investment Banking|Venture Capital|Entrepreneurship|Strategy)\b/gi,
    // Research areas
    /\b(Research|Laboratory|Clinical|Experimental|Computational|Theoretical|Applied|Quantitative|Qualitative)\b/gi,
    // Soft skills
    /\b(Leadership|Communication|Teamwork|Problem Solving|Critical Thinking|Public Speaking|Design|UX|UI)\b/gi,
  ];

  for (const pattern of importantPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const normalized = match.trim();
        if (normalized.length > 2) {
          // Try to normalize to canonical topic first
          const canonical = normalizeTopicName(normalized);
          const topicName = canonical || normalized;
          
          // Increase count for this topic
          keywordScores[topicName] = (keywordScores[topicName] || 0) + 0.3;
        }
      }
    }
  }

  // Look for capitalized multi-word terms (likely important topics)
  // e.g., "Dana-Farber Cancer Institute" -> extract "Cancer"
  const capitalizedPhrases = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g);
  if (capitalizedPhrases) {
    for (const phrase of capitalizedPhrases) {
      // Extract meaningful words from the phrase
      const words = phrase.split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        if (!['Institute', 'University', 'College', 'School', 'Center', 'Department'].includes(word)) {
          const canonical = normalizeTopicName(word);
          if (canonical) {
            keywordScores[canonical] = (keywordScores[canonical] || 0) + 0.15;
          }
        }
      }
    }
  }

  // Convert to array and normalize weights
  for (const [topic, rawWeight] of Object.entries(keywordScores)) {
    const weight = Math.min(1.0, Math.max(0.3, rawWeight));
    topics.push({ topic, weight });
  }

  // Sort by weight
  topics.sort((a, b) => b.weight - a.weight);

  console.log('[Fallback Extraction] Extracted topics:', topics.map(t => `${t.topic} (${Math.round(t.weight * 100)}%)`).join(', '));

  return {
    topics,
    rawText: text,
  };
}
