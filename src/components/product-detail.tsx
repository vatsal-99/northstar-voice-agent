import Image from "next/image";
import Link from "next/link";
import type { Product } from "../../tools/types";
import styles from "./product-detail.module.css";

type ProductDetailProps = {
  product: Product;
};

function formatPrice(product: Product) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const isInStock = product.stockStatus === "in_stock";

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <Link className={styles.backLink} href="/#shop">← Back to collection</Link>
      </nav>

      <div className={styles.breadcrumbs}>
        <Link href="/">Home</Link><span>/</span><Link href="/#shop">Collection</Link><span>/</span><span>{product.name}</span>
      </div>

      <section className={styles.productLayout} aria-labelledby="product-title">
        <div className={styles.imageFrame}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 55vw"
          />
          <span className={styles.category}>{product.category}</span>
        </div>
        <div className={styles.productInfo}>
          <p className={styles.kicker}>Northstar Goods / {product.category}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.priceRow}>
            <strong>{formatPrice(product)}</strong>
            <span className={`${styles.stock} ${isInStock ? "" : styles.outOfStock}`}>
              <span aria-hidden="true" /> {isInStock ? "In stock" : "Currently unavailable"}
            </span>
          </div>
          <div className={styles.details}>
            <div><span>Delivery</span><strong>{product.deliveryEstimate}</strong></div>
            <div><span>Category</span><strong>{product.category}</strong></div>
          </div>
          <div className={styles.actions}>
            <Link className={styles.voiceButton} href="/voice">
              Ask our voice agent about this product <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.continueLink} href="/#shop">Continue browsing</Link>
          </div>
          <p className={styles.note}>
            We do not process payments online in this demo. Our voice agent can answer questions and help with order enquiries.
          </p>
        </div>
      </section>
    </main>
  );
}
