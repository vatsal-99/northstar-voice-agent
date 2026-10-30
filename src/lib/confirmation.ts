import { findProduct } from "../../tools/catalog";
import type { PlaceOrderArgs, Product, ToolResult } from "../../tools/types";

export type PendingOrder = {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type SessionState = {
  pendingOrder?: PendingOrder;
  confirmedOrder?: PendingOrder;
};

export class ConfirmationStore {
  private readonly sessions = new Map<string, SessionState>();

  get(sessionId: string): SessionState {
    return this.sessions.get(sessionId) ?? {};
  }

  request(sessionId: string, productId: string, quantity: number): ToolResult {
    const product = findProduct(productId);
    let result: ToolResult;

    if (!product) {
      result = { ok: false, error: `Product '${productId}' was not found.` };
    } else if (!Number.isInteger(quantity) || quantity < 1) {
      result = { ok: false, error: "Quantity must be a positive whole number." };
    } else if (product.stockStatus !== "in_stock") {
      result = {
        ok: false,
        error: `${product.name} is currently out of stock.`,
      };
    } else {
      const pendingOrder = toPendingOrder(product, quantity);
      this.sessions.set(sessionId, { pendingOrder });
      result = {
        ok: true,
        data: {
          status: "awaiting_customer_confirmation",
          product: product.name,
          quantity,
          unitPrice: product.price,
          totalPrice: pendingOrder.totalPrice,
          currency: product.currency,
        },
      };
    }

    return result;
  }

  confirm(
    sessionId: string,
    productId: string,
    quantity: number,
    totalPrice: number,
  ): ToolResult {
    const pendingOrder = this.sessions.get(sessionId)?.pendingOrder;
    const matches =
      pendingOrder &&
      pendingOrder.productId === productId &&
      pendingOrder.quantity === quantity &&
      pendingOrder.totalPrice === totalPrice;

    if (!matches) {
      return {
        ok: false,
        error: "There is no matching pending order to confirm.",
      };
    }

    this.sessions.set(sessionId, { pendingOrder, confirmedOrder: pendingOrder });
    return { ok: true, data: { status: "confirmed" } };
  }

  canPlace(sessionId: string, args: PlaceOrderArgs): boolean {
    const confirmedOrder = this.sessions.get(sessionId)?.confirmedOrder;
    return Boolean(
      confirmedOrder &&
        confirmedOrder.productId === args.productId &&
        confirmedOrder.quantity === args.quantity,
    );
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

function toPendingOrder(product: Product, quantity: number): PendingOrder {
  return {
    productId: product.id,
    quantity,
    unitPrice: product.price,
    totalPrice: Number((product.price * quantity).toFixed(2)),
  };
}
