import Image from "next/image";
import Link from "next/link";
import type { Product } from "../../tools/types";
import styles from "./storefront.module.css";

type ProductCatalogueProps = {
  products: Product[];
};

function formatPrice(product: Product) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export default function ProductCatalogue({ products }: ProductCatalogueProps) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <div className={styles.navLinks}>
          <Link className={styles.navAgentLink} href="/products">Products</Link>
          <Link href="/orders">Orders</Link>
          <Link className={styles.navAgentLink} href="/voice"><span aria-hidden="true">◉</span> Voice help</Link>
        </div>
      </nav>

      <section className={styles.catalogueHeader} aria-labelledby="catalogue-title">
        <p className={styles.kicker}>Northstar Goods / Collection</p>
        <h1 id="catalogue-title">The full collection.</h1>
        <p>Everyday objects chosen for useful beauty, dependable materials, and a little more ease.</p>
      </section>

      <section className={styles.catalogueGrid} aria-label="All products">
        {products.map((product) => (
          <article className={styles.productCard} key={product.id}>
            <Link className={styles.productVisual} href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
              <Image src={product.imageUrl} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              <span className={styles.visualCategory}>{product.category}</span>
              <span className={styles.viewDetails}>View product <span aria-hidden="true">↗</span></span>
            </Link>
            <div className={styles.productInfo}>
              <div className={styles.productTitleRow}>
                <h2>{product.name}</h2>
                <span className={styles.price}>{formatPrice(product)}</span>
              </div>
              <p>{product.description}</p>
              <span className={`${styles.stock} ${product.stockStatus === "out_of_stock" ? styles.outOfStock : ""}`}>
                <span aria-hidden="true" /> {product.stockStatus === "in_stock" ? "In stock" : "Currently unavailable"}
              </span>
              <Link className={styles.productLink} href={`/products/${product.id}`}>See full details <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
