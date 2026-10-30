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
        <div className={styles.navLinks}>
          <Link href="/#shop">Products</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/voice">Voice help</Link>
        </div>
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
            {isInStock ? (
              <Link className={styles.buyButton} href={`/orders?productId=${product.id}`}>
                Buy now <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span className={styles.unavailableButton}>Currently unavailable</span>
            )}
            <Link className={styles.continueLink} href="/#shop">Continue browsing</Link>
          </div>
          <p className={styles.note}>
            This assessment storefront does not process payments. Your order request will be reviewed before it is placed.
          </p>
        </div>
      </section>
    </main>
  );
}
