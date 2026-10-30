"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "../../tools/types";
import styles from "./storefront.module.css";

type StorefrontProps = {
  products: Product[];
};

function formatPrice(product: Product) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export default function Storefront({ products }: StorefrontProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/products">Products</Link>
          <a href="/orders">Orders</a>
          <a className={styles.navAgentLink} href="/voice"><span aria-hidden="true">◉</span> Voice help</a>
        </div>
      </nav>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Thoughtful things, for every day</p>
          <h1 id="hero-title">Make space for the <span>good stuff.</span></h1>
          <p className={styles.heroDescription}>
            Well-made essentials for slow mornings, focused afternoons, and
            everywhere in between.
          </p>
          <a className={styles.primaryButton} href="#shop">
            Explore the collection <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className={styles.heroArt} aria-label="A curated selection of Northstar Goods products" role="img">
          <div className={`${styles.artOrb} ${styles.orbOne}`} />
          <div className={`${styles.artOrb} ${styles.orbTwo}`} />
          <div className={styles.artCard}>
            <span className={styles.artSpark}>✦</span>
            <span className={styles.artLabel}>NORTHSTAR<br /><strong>GOODS</strong></span>
            <span className={styles.artLine} />
            <span className={styles.artCaption}>EVERYDAY<br />OBJECTS</span>
          </div>
        </div>
      </section>

      <section className={styles.collection} id="shop" aria-labelledby="collection-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>The collection</p>
            <h2 id="collection-title">Small upgrades, <em>big difference.</em></h2>
          </div>
          <p className={styles.sectionNote}>Four featured essentials<br />from our full collection.</p>
        </div>
        <div className={styles.productGrid}>
          {products.slice(0, 4).map((product) => {
            return (
              <article className={styles.productCard} key={product.id}>
                <button
                  className={styles.productVisual}
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`View details for ${product.name}`}
                >
                  <Image src={product.imageUrl} alt="" fill sizes="(max-width: 430px) 100vw, (max-width: 760px) 50vw, 33vw" />
                  <span className={styles.visualCategory}>{product.category}</span>
                  <span className={styles.viewDetails}>View details <span aria-hidden="true">↗</span></span>
                </button>
                <div className={styles.productInfo}>
                  <div className={styles.productTitleRow}>
                    <h3>{product.name}</h3>
                    <span className={styles.price}>{formatPrice(product)}</span>
                  </div>
                  <p>{product.description}</p>
                  <span className={`${styles.stock} ${product.stockStatus === "out_of_stock" ? styles.outOfStock : ""}`}>
                    <span aria-hidden="true" /> {product.stockStatus === "in_stock" ? "In stock" : "Currently unavailable"}
                  </span>
                  <Link className={styles.productLink} href={`/products/${product.id}`}>See full details <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className={styles.collectionFooter}>
          <Link className={styles.primaryButton} href="/products">
            View all {products.length} products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={styles.voiceBanner} id="story" aria-labelledby="voice-title">
        <div className={styles.voiceIcon} aria-hidden="true">)))</div>
        <div className={styles.voiceCopy}>
          <p className={styles.kicker}>Need a little help?</p>
          <h2 id="voice-title">Ask a human.<br /><em>Or something close.</em></h2>
          <p>Our voice agent can answer product questions, check availability, and help with your order.</p>
        </div>
        <a className={styles.lightButton} href="/voice">
          Talk to our voice agent <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/" aria-label="Northstar Goods home">
          <span className={styles.brandMark}>N</span>
          <span>Northstar <em>Goods</em></span>
        </Link>
        <p>Made for the everyday.</p>
        <span>© Northstar Goods</span>
      </footer>

      {selectedProduct && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setSelectedProduct(null)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className={styles.closeButton} type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product details">×</button>
            <div className={styles.modalVisual}>
              <Image src={selectedProduct.imageUrl} alt="" fill sizes="(max-width: 600px) 100vw, 40vw" />
            </div>
            <div className={styles.modalContent}>
              <p className={styles.kicker}>{selectedProduct.category}</p>
              <h2 id="product-dialog-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <div className={styles.modalMeta}>
                <strong>{formatPrice(selectedProduct)}</strong>
                <span className={`${styles.stock} ${selectedProduct.stockStatus === "out_of_stock" ? styles.outOfStock : ""}`}>
                  <span aria-hidden="true" /> {selectedProduct.stockStatus === "in_stock" ? "In stock" : "Currently unavailable"}
                </span>
              </div>
              <p className={styles.delivery}>Estimated delivery: {selectedProduct.deliveryEstimate}</p>
              {selectedProduct.stockStatus === "in_stock" ? (
                <a className={styles.primaryButton} href={`/orders?productId=${selectedProduct.id}`}>
                  Buy now <span aria-hidden="true">→</span>
                </a>
              ) : (
                <span className={styles.primaryButton}>Currently unavailable</span>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
