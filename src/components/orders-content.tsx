"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findProduct } from "../../tools/catalog";
import styles from "../app/orders/orders.module.css";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export default function OrdersContent() {
  const productId = useSearchParams().get("productId");
  const selectedProduct = productId ? findProduct(productId) : undefined;

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/#shop">Products</Link>
          <Link className={styles.activeLink} href="/orders">Orders</Link>
          <Link href="/voice">Voice help</Link>
        </div>
      </nav>

      <section className={styles.content} aria-labelledby="orders-title">
        <p className={styles.kicker}>Northstar Goods / Orders</p>
        <h1 id="orders-title">{selectedProduct ? "Ready when you are." : "Your orders."}</h1>
        {selectedProduct ? (
          <>
            <p className={styles.intro}>Review your selected product before continuing with this demo order request.</p>
            <article className={styles.orderCard}>
              <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} width={220} height={220} />
              <div>
                <p className={styles.category}>{selectedProduct.category}</p>
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <strong>{formatPrice(selectedProduct.price, selectedProduct.currency)}</strong>
              </div>
            </article>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href="/voice">Continue with order assistance <span aria-hidden="true">→</span></Link>
              <Link className={styles.secondaryButton} href="/#shop">Back to products</Link>
            </div>
            <p className={styles.note}>No payment is collected. The voice agent handles the assessment order-confirmation flow before an order can be placed.</p>
          </>
        ) : (
          <>
            <p className={styles.intro}>Select a product to begin an order request. This demo does not process payments or create live orders.</p>
            <div className={styles.emptyState}>
              <span aria-hidden="true">✦</span>
              <h2>No order selected</h2>
              <Link className={styles.primaryButton} href="/#shop">Browse products <span aria-hidden="true">→</span></Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
