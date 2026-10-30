"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "../orders.module.css";

function SuccessContent() {
  const orderNumber = useSearchParams().get("orderNumber");

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

      <section className={styles.success} aria-labelledby="success-title">
        <div className={styles.successIcon} aria-hidden="true">✓</div>
        <p className={styles.kicker}>Northstar Goods / Order confirmed</p>
        <h1 id="success-title">Thanks for your order.</h1>
        <p>Your order has been placed and saved to the current session.</p>
        {orderNumber && <strong className={styles.successNumber}>Order #{orderNumber}</strong>}
        <Link className={styles.primaryButton} href="/orders">
          View order <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <SuccessContent />
    </Suspense>
  );
}
