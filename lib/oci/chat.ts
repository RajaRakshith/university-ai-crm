import { GenerativeAiInferenceClient } from "oci-generativeaiinference";
import type {
  ChatDetails,
  GenericChatRequest,
  OnDemandServingMode,
  Message,
  TextContent,
} from "oci-generativeaiinference/lib/model";
import { getOciProvider, getOciRegion, getOciCompartmentId } from "./auth";

const GEMINI_MODEL_ID = "google.gemini-2.5-flash";

let chatClient: GenerativeAiInferenceClient | null = null;

function getChatClient(): GenerativeAiInferenceClient {
  if (!chatClient) {
    chatClient = new GenerativeAiInferenceClient({
      authenticationDetailsProvider: getOciProvider(),
    });
    chatClient.regionId = getOciRegion();
  }
  return chatClient;
}

/**
 * Send a single user message to Gemini 2.5 Flash via OCI GenAI chat (us-ashburn-1).
 * Returns the assistant reply text.
 */
export async function chatWithGemini(userMessage: string, maxTokens = 500): Promise<string> {
  const compartmentId = getOciCompartmentId();

  const servingMode: OnDemandServingMode = {
    servingType: "ON_DEMAND",
    modelId: GEMINI_MODEL_ID,
  };

  const content: TextContent[] = [{ type: "TEXT", text: userMessage }];
  const messages: Message[] = [
    { role: "USER", content },
  ];

  const chatRequest: GenericChatRequest = {
    apiFormat: "GENERIC",
    messages,
    maxTokens,
  };

  const chatDetails: ChatDetails = {
    compartmentId,
    servingMode,
    chatRequest,
  };

  const response = await getChatClient().chat({
    chatDetails,
  });

  interface ChatResultShape {
    chatResult?: {
      chatResponse?: {
        choices?: Array<{ message?: { content?: Array<{ type?: string; text?: string }> } }>;
      };
    };
  }
  const res = response as ChatResultShape;
  if (res?.chatResult?.chatResponse?.choices == null) {
    throw new Error("OCI chat returned no result");
  }

  const choices = res.chatResult.chatResponse.choices;
  const first = choices?.[0];
  const msg = first?.message;
  const contents = msg && "content" in msg ? (msg as { content?: Array<{ type?: string; text?: string }> }).content : undefined;
  const textPart = contents?.find((c) => c.type === "TEXT");
  const text = textPart && "text" in textPart ? textPart.text : undefined;

  if (text == null) {
    throw new Error("OCI chat response had no text content");
  }
  return text;
}
