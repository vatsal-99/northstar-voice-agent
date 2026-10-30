import { findProduct } from "./catalog";
import { logToolCall } from "./logger";
import type { PlaceOrderArgs, ToolResult } from "./types";

let nextOrderNumber = 10482;

export function placeOrder(args: PlaceOrderArgs): ToolResult {
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
    const orderNumber = String(nextOrderNumber++);
    result = {
      ok: true,
      data: {
        orderNumber,
        product: product.name,
        quantity: args.quantity,
        unitPrice: product.price,
        totalPrice: Number((product.price * args.quantity).toFixed(2)),
        currency: product.currency,
        status: "processing",
        estimatedDelivery: product.deliveryEstimate,
      },
    };
  }

  logToolCall("place_order", args, result);
  return result;
}
