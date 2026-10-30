import { NextResponse } from "next/server";
import { executeTool } from "@/lib/agent";
import { listOrdersForSession } from "../../../../tools/order-store";

type OrderRequest = {
  productId?: unknown;
  quantity?: unknown;
  sessionId?: unknown;
};

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId") ?? "";
  return NextResponse.json({ orders: listOrdersForSession(sessionId) });
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "A valid JSON body is required." }, { status: 400 });
  }

  if (
    typeof body.productId !== "string" ||
    typeof body.quantity !== "number" ||
    !Number.isInteger(body.quantity) ||
    body.quantity < 1 ||
    typeof body.sessionId !== "string" ||
    body.sessionId.trim() === ""
  ) {
    return NextResponse.json(
      { error: "Product, quantity, and session ID are required." },
      { status: 400 },
    );
  }

  const sessionId = body.sessionId;
  const quantity = body.quantity as number;
  const requested = executeTool(
    sessionId,
    "request_order_confirmation",
    JSON.stringify({ productId: body.productId, quantity }),
  );
  if (!requested.ok) return NextResponse.json({ error: requested.error }, { status: 400 });

  const confirmation = executeTool(
    sessionId,
    "confirm_order",
    JSON.stringify({
      productId: body.productId,
      quantity,
      totalPrice: (requested.data as { totalPrice: number }).totalPrice,
    }),
  );
  if (!confirmation.ok) return NextResponse.json({ error: confirmation.error }, { status: 400 });

  const placed = executeTool(
    sessionId,
    "place_order",
    JSON.stringify({ productId: body.productId, quantity }),
  );
  return placed.ok
    ? NextResponse.json(placed.data)
    : NextResponse.json({ error: placed.error }, { status: 400 });
}
