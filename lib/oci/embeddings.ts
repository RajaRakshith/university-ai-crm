import { GenerativeAiInferenceClient } from "oci-generativeaiinference";
import type { EmbedTextDetails } from "oci-generativeaiinference/lib/model";
import { getOciProvider, getOciGenAiRegion, getOciCompartmentId } from "./auth";

let client: GenerativeAiInferenceClient | null = null;

function getClient(): GenerativeAiInferenceClient {
  if (!client) {
    client = new GenerativeAiInferenceClient({
      authenticationDetailsProvider: getOciProvider(),
    });
    client.regionId = getOciGenAiRegion();
  }
  return client;
}

/**
 * Embed a single text using OCI Generative AI (on-demand Cohere Embed English 3).
 * Uses OCI_GENAI_REGION (e.g. us-chicago-1) so you can keep Object Storage/Document in Ashburn.
 */
export async function embedText(text: string): Promise<number[]> {
  const compartmentId = getOciCompartmentId();
  const truncated = text.slice(0, 2000); // simple truncation for embed limit

  const embedTextDetails: EmbedTextDetails = {
    compartmentId,
    inputs: [truncated],
    servingMode: {
      servingType: "ON_DEMAND",
      modelId: "cohere.embed-english-v3.0",
    },
  };

  const response = await getClient().embedText({
    embedTextDetails,
  });

  if (!response.embedTextResult?.embeddings?.length) {
    throw new Error("OCI embed_text returned no embeddings");
  }
  const embedding = response.embedTextResult.embeddings[0];
  if (!embedding) throw new Error("Empty embedding");
  return embedding;
}
