import { findProduct } from "./catalog";
import { logToolCall } from "./logger";
import { createOrder } from "./order-store";
import type { PlaceOrderArgs, ToolResult } from "./types";

export function placeOrder(
  args: PlaceOrderArgs,
  sessionId = "direct-tool",
): ToolResult {
  const product = findProduct(args.productId);
  let result: ToolResult;

  if (!product) {
    result = { ok: false, error: `Product '${args.productId}' was not found.` };
  } else if (!Number.isInteger(args.quantity) || args.quantity < 1) {
    result = { ok: false, error: "Quantity must be a positive whole number." };
  } else if (product.stockStatus !== "in_stock") {
    result = {
      ok: false,
      error: `${product.name} is currently out of stock.`,
    };
  } else {
    result = {
      ok: true,
      data: createOrder(product, args.quantity, sessionId),
    };
  }

  logToolCall("place_order", args, result);
  return result;
}
