import { readFileSync } from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import definitions from "../../tools/definitions.json";
import { getOrderStatus } from "../../tools/get-order-status";
import { getProductDetails } from "../../tools/get-product-details";
import { listProducts } from "../../tools/list-products";
import { logToolCall } from "../../tools/logger";
import { placeOrder } from "../../tools/place-order";
import type { ToolResult } from "../../tools/types";
import { ConfirmationStore } from "./confirmation";

const MODEL = "gpt-audio-1.5";
const MAX_TOOL_ROUNDS = 8;
const MAX_COMPLETION_TOKENS = 2048;
const systemPrompt = readFileSync(
  path.join(process.cwd(), "prompts", "system_prompt.md"),
  "utf8",
);
const tools = definitions as ChatCompletionTool[];
const conversations = new Map<string, ChatCompletionMessageParam[]>();
const confirmations = new ConfirmationStore();

export type AudioInput = {
  data: string;
  format: "mp3" | "wav";
};

export type AgentResult = {
  response: string;
  sessionId: string;
};

export async function runVoiceAgent(
  sessionId: string,
  audio: AudioInput,
): Promise<AgentResult> {
  const storedMessages = conversations.get(sessionId);
  const messages: ChatCompletionMessageParam[] = storedMessages
    ? sanitizeConversation(storedMessages)
    : [
        { role: "system", content: systemPrompt },
      ];
  messages.push({
    role: "user",
    content: [
      {
        type: "input_audio",
        input_audio: { data: audio.data, format: audio.format },
      },
    ],
  });

  const client = new OpenAI();
  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      modalities: ["text"],
      max_tokens: MAX_COMPLETION_TOKENS,
      messages,
      tools,
      tool_choice: "auto",
      store: false,
    });
    const message = completion.choices[0]?.message;
    if (!message) {
      throw new Error("OpenAI returned no assistant message.");
    }

    messages.push({
      role: "assistant",
      content: message.tool_calls?.length
        ? message.content
        : message.content,
      ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
    });
    if (!message.tool_calls?.length) {
      const response = formatCustomerResponse(message.content);
      if (!response) {
        throw new Error("OpenAI returned no text response.");
      }
      conversations.set(sessionId, sanitizeConversation(messages));
      return { response, sessionId };
    }

    for (const toolCall of message.tool_calls) {
      if (!("function" in toolCall)) {
        throw new Error("OpenAI returned an unsupported custom tool call.");
      }
      const result = executeTool(
        sessionId,
        toolCall.function.name,
        toolCall.function.arguments,
      );
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error("OpenAI tool loop exceeded the maximum number of rounds.");
}

export function executeTool(
  sessionId: string,
  name: string,
  rawArguments: string,
): ToolResult {
  const args = parseArguments(rawArguments);
  let result: ToolResult;

  try {
    switch (name) {
      case "list_products":
        result = listProducts(isRecord(args) ? args : {});
        break;
      case "get_product_details":
        result = getProductDetails({
          productId: requireString(args, "productId"),
        });
        break;
      case "get_order_status":
        result = getOrderStatus({
          orderNumber: requireString(args, "orderNumber"),
        });
        break;
      case "request_order_confirmation":
        result = confirmations.request(
          sessionId,
          requireString(args, "productId"),
          requireInteger(args, "quantity"),
        );
        break;
      case "confirm_order":
        result = confirmations.confirm(
          sessionId,
          requireString(args, "productId"),
          requireInteger(args, "quantity"),
          requireNumber(args, "totalPrice"),
        );
        break;
      case "place_order": {
        const placeOrderArgs = {
          productId: requireString(args, "productId"),
          quantity: requireInteger(args, "quantity"),
        };
        result = confirmations.canPlace(sessionId, placeOrderArgs)
          ? placeOrder(placeOrderArgs, sessionId)
          : {
              ok: false,
              error:
                "Order placement requires explicit confirmation of the exact product, quantity, and total price.",
            };
        if (result.ok) confirmations.clear(sessionId);
        break;
      }
      default:
        result = { ok: false, error: `Unknown tool '${name}'.` };
    }
  } catch (error) {
    result = {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid tool arguments.",
    };
  }

  logToolCall(name, args, result);
  return result;
}

export function resetAgentSession(sessionId: string): void {
  conversations.delete(sessionId);
  confirmations.clear(sessionId);
}

function parseArguments(rawArguments: string): unknown {
  try {
    return JSON.parse(rawArguments);
  } catch {
    return {};
  }
}

function sanitizeConversation(
  messages: ChatCompletionMessageParam[],
): ChatCompletionMessageParam[] {
  return messages.map((message) =>
    message.role === "user"
      ? { role: "user", content: "[Previous customer audio]" }
      : message,
  );
}

export function formatCustomerResponse(content: string | null): string {
  const trimmed = content?.trim();
  if (!trimmed) return "I’m sorry, I couldn’t generate a clear response. Please try again.";

  const withoutControlTokens = removeModelControlTokens(trimmed);
  const plainText = unwrapStructuredResponse(withoutControlTokens);
  const cleanedText = removeToolArgumentLines(
    removeLeadingStructuredObjects(plainText),
  );
  if (!cleanedText) {
    return "I’m sorry, I couldn’t generate a clear response. Please try again.";
  }
  if (cleanedText !== trimmed) return cleanedText;

  const productDetails = parseProductDetails(cleanedText);
  if (!productDetails) return cleanedText;

  const stockMessage =
    productDetails.stockStatus === "in_stock"
      ? "It is currently in stock."
      : "It is currently out of stock.";
  return `${productDetails.name} is a ${productDetails.category} product priced at $${productDetails.price.toFixed(2)}. ${productDetails.description} ${stockMessage} The estimated delivery time is ${productDetails.deliveryEstimate}.`;
}

function removeModelControlTokens(content: string): string {
  return content
    .replace(/<\|[\s\S]*?\|>/g, "")
    .replace(/<\/?(?:s|bos|eos)>/gi, "")
    .replace(/<<\/?SYS>>/gi, "")
    .replace(/\[\/?(?:INST|SYSTEM|ASSISTANT|USER)\]/gi, "")
    .replace(/^\s*###\s*(?:assistant|system|user)\s*:?\s*/gim, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function removeLeadingStructuredObjects(content: string): string {
  let remaining = content.trim();

  while (remaining.startsWith("{")) {
    const end = findJsonObjectEnd(remaining);
    if (end === -1) break;

    try {
      JSON.parse(remaining.slice(0, end + 1));
    } catch {
      break;
    }

    remaining = remaining.slice(end + 1).replace(/^\s*,?\s*/, "");
  }

  return remaining.trim();
}

function findJsonObjectEnd(content: string): number {
  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        quoted = false;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function removeToolArgumentLines(content: string): string {
  const remainingLines = content
    .split(/\r?\n/)
    .filter((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith("{") || !trimmedLine.endsWith("}")) {
        return true;
      }
      try {
        const parsed: unknown = JSON.parse(trimmedLine);
        return !(
          isRecord(parsed) &&
          (typeof parsed.productId === "string" ||
            typeof parsed.orderNumber === "string") &&
          (typeof parsed.quantity === "number" ||
            typeof parsed.productId === "string")
        );
      } catch {
        return true;
      }
    })
    .map((line) => line.trim())
    .filter(Boolean);

  const result = remainingLines.join(" ").trim();
  return /^northstar(?: goods)?$/i.test(result) ? "" : result;
}

function unwrapStructuredResponse(content: string): string {
  const withoutCodeFence = content
    .replace(/^```(?:json|text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed: unknown = JSON.parse(withoutCodeFence);
    if (typeof parsed === "string") return parsed.trim();
    if (isRecord(parsed)) {
      for (const key of ["response", "message", "text", "answer"]) {
        if (typeof parsed[key] === "string") return parsed[key].trim();
      }
    }
  } catch {
    const quotedObject = withoutCodeFence.match(/^\{\s*"([\s\S]*)"\s*\}$/);
    if (quotedObject) {
      try {
        return JSON.parse(`"${quotedObject[1]}"`).trim();
      } catch {
        return quotedObject[1].trim();
      }
    }
  }

  return withoutCodeFence;
}

function parseProductDetails(content: string): {
  name: string;
  description: string;
  price: number;
  stockStatus: string;
  deliveryEstimate: string;
  category: string;
} | null {
  try {
    const parsed: unknown = JSON.parse(content);
    if (!isRecord(parsed)) return null;
    const fields = {
      name: parsed.productName,
      description: parsed.productDescription,
      price: parsed.productPrice,
      stockStatus: parsed.productStockStatus,
      deliveryEstimate: parsed.productDeliveryEstimate,
      category: parsed.productCategory,
    };
    if (
      typeof fields.name !== "string" ||
      typeof fields.description !== "string" ||
      typeof fields.price !== "number" ||
      typeof fields.stockStatus !== "string" ||
      typeof fields.deliveryEstimate !== "string" ||
      typeof fields.category !== "string"
    ) {
      return null;
    }
    return {
      name: fields.name,
      description: fields.description,
      price: fields.price,
      stockStatus: fields.stockStatus,
      deliveryEstimate: fields.deliveryEstimate,
      category: fields.category,
    };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, key: string): string {
  if (!isRecord(value) || typeof value[key] !== "string") {
    throw new Error(`Tool argument '${key}' must be a string.`);
  }
  return value[key];
}

function requireInteger(value: unknown, key: string): number {
  const candidate = isRecord(value) ? value[key] : undefined;
  if (typeof candidate !== "number" || !Number.isInteger(candidate)) {
    throw new Error(`Tool argument '${key}' must be an integer.`);
  }
  return candidate;
}

function requireNumber(value: unknown, key: string): number {
  const candidate = isRecord(value) ? value[key] : undefined;
  if (typeof candidate !== "number") {
    throw new Error(`Tool argument '${key}' must be a number.`);
  }
  return candidate;
}
