import { findProduct } from "./catalog";
import { logToolCall } from "./logger";
import type { ProductDetailsArgs, ToolResult } from "./types";

export function getProductDetails(args: ProductDetailsArgs): ToolResult {
  const product = findProduct(args.productId);
  const result: ToolResult = product
    ? { ok: true, data: { product } }
    : { ok: false, error: `Product '${args.productId}' was not found.` };

  logToolCall("get_product_details", args, result);
  return result;
}
