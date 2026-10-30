import { logToolCall } from "./logger";
import { getOrder } from "./order-store";
import type { OrderStatusArgs, ToolResult } from "./types";

export function getOrderStatus(args: OrderStatusArgs): ToolResult {
  const orderNumber = args.orderNumber.trim();
  const order = getOrder(orderNumber);
  const result: ToolResult = order
    ? { ok: true, data: order }
    : { ok: false, error: `Order '${orderNumber}' was not found.` };

  logToolCall("get_order_status", args, result);
  return result;
}
