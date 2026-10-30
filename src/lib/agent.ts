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
  const messages = conversations.get(sessionId) ?? [
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
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
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
        : message.content ?? message.audio?.transcript ?? null,
      ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
    });
    if (!message.tool_calls?.length) {
      const response = (message.content ?? message.audio?.transcript)?.trim();
      if (!response) {
        throw new Error("OpenAI returned no text response.");
      }
      conversations.set(sessionId, messages);
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
