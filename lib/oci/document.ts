import { AIServiceDocumentClient } from "oci-aidocument";
import type {
  AnalyzeDocumentDetails,
  InlineDocumentDetails,
  DocumentTextExtractionFeature,
} from "oci-aidocument/lib/model";
import { getOciProvider, getOciRegion, getOciCompartmentId } from "./auth";

let client: AIServiceDocumentClient | null = null;

function getClient(): AIServiceDocumentClient {
  if (!client) {
    client = new AIServiceDocumentClient({
      authenticationDetailsProvider: getOciProvider(),
    });
    client.regionId = getOciRegion();
  }
  return client;
}

/**
 * Extract text from a PDF/document buffer using OCI Document Understanding.
 * Returns concatenated text from all lines in all pages.
 */
export async function extractTextFromDocument(buffer: Buffer): Promise<string> {
  const compartmentId = getOciCompartmentId();
  const base64Data = buffer.toString("base64");

  const document: InlineDocumentDetails = {
    source: "INLINE",
    data: base64Data,
  };

  const textFeature: DocumentTextExtractionFeature = {
    featureType: "TEXT_EXTRACTION",
  };

  const details: AnalyzeDocumentDetails = {
    document,
    features: [textFeature],
    compartmentId,
  };

  const response = await getClient().analyzeDocument({
    analyzeDocumentDetails: details,
  });

  const result = response.analyzeDocumentResult;
  if (!result?.pages?.length) {
    return "";
  }

  const lines: string[] = [];
  for (const page of result.pages) {
    if (page.lines) {
      for (const line of page.lines) {
        if (line.text?.trim()) lines.push(line.text.trim());
      }
    }
  }
  return lines.join("\n");
}
