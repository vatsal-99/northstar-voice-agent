"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { findProduct } from "../../tools/catalog";
import type { StoredOrder } from "../../tools/types";
import styles from "../app/orders/orders.module.css";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export default function OrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const productId = useSearchParams().get("productId");
  const selectedProduct = productId ? findProduct(productId) : undefined;
  const isCheckout = pathname === "/orders/new" && Boolean(selectedProduct);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("northstar-session-id") ?? "guest";
    void fetch(`/api/orders?sessionId=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((result: { orders?: StoredOrder[] }) => setOrders(result.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  async function placeManualOrder() {
    if (!selectedProduct) return;
    setPlacing(true);
    setStatus(null);
    const sessionId = sessionStorage.getItem("northstar-session-id") ?? crypto.randomUUID();
    sessionStorage.setItem("northstar-session-id", sessionId);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, quantity, sessionId }),
      });
      const result = (await response.json()) as { error?: string; orderNumber?: string };
      if (response.ok && result.orderNumber) {
        router.push(`/orders/success?orderNumber=${encodeURIComponent(result.orderNumber)}`);
        return;
      }
      setStatus(result.error ?? "Order could not be placed.");
      if (response.ok) {
        const refreshed = await fetch(`/api/orders?sessionId=${encodeURIComponent(sessionId)}`);
        const orderList = (await refreshed.json()) as { orders?: StoredOrder[] };
        setOrders(orderList.orders ?? []);
      }
    } catch {
      setStatus("Order could not be placed. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/products">Products</Link>
          <Link className={styles.activeLink} href="/orders">Orders</Link>
        </div>
      </nav>

      <section className={styles.content} aria-labelledby="orders-title">
        <p className={styles.kicker}>Northstar Goods / Orders</p>
        <h1 id="orders-title">{isCheckout ? "Ready when you are." : "Your orders."}</h1>
        {isCheckout && selectedProduct ? (
          <>
            <p className={styles.intro}>Review your selected product before starting the secure order flow.</p>
            <article className={styles.orderCard}>
              <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} width={220} height={220} />
              <div>
                <p className={styles.category}>{selectedProduct.category}</p>
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <strong>{formatPrice(selectedProduct.price, selectedProduct.currency)}</strong>
                <label className={styles.quantityLabel} htmlFor="quantity">Quantity</label>
                <input
                  className={styles.quantityInput}
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                />
              </div>
            </article>
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={placeManualOrder} disabled={placing || selectedProduct.stockStatus !== "in_stock"}>
                {placing ? "Placing order..." : "Place order"} <span aria-hidden="true">→</span>
              </button>
              <Link className={styles.secondaryButton} href="/products">Back to products</Link>
            </div>
            {status && <p className={styles.status} role="status">{status}</p>}
            <p className={styles.note}>No payment is collected. This demo validates stock, confirms the exact quantity and total, then stores the order in memory.</p>
          </>
        ) : null}
      </section>
      <section className={styles.history} aria-labelledby="history-title">
        <h2 className={styles.srOnly} id="history-title">All orders</h2>
        <div className={styles.historyList}>
          {orders.map((order) => (
            <article className={styles.historyCard} key={order.orderNumber}>
              <div>
                <span className={styles.orderNumber}>Order #{order.orderNumber}</span>
                <h3>{order.product}</h3>
                <p>Quantity {order.quantity} · {formatPrice(order.totalPrice, order.currency)}</p>
              </div>
              <div className={styles.historyMeta}>
                <strong>{order.status}</strong>
                <span>Delivery: {order.estimatedDelivery}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
