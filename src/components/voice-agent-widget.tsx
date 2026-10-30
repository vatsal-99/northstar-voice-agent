"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import VoiceAgent from "./voice-agent";
import styles from "./voice-agent-widget.module.css";

export default function VoiceAgentWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(pathname === "/");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className={`${styles.launcher} ${isOpen ? styles.launcherOpen : ""}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="voice-agent-popup"
      >
        <span className={styles.launcherIcon} aria-hidden="true">{isOpen ? "×" : ")))"}</span>
        <span>{isOpen ? "Close" : "Talk to us"}</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <section
            id="voice-agent-popup"
            className={styles.popup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.avatarPanel}>
              <Image
                className={styles.avatarBackground}
                src="/avatars/woman.png"
                alt=""
                fill
                sizes="300px"
                priority
              />
              <div className={styles.avatarOverlay} aria-hidden="true" />
              <div className={styles.brandLockup}>
                <span className={styles.brandMark}>N</span>
                <strong>Northstar <em>Goods</em><small>Your everyday essentials</small></strong>
              </div>
              <div className={styles.profileDetails}>
                <strong>Olivia</strong>
                <span>AI Customer Care Assistant</span>
                <span className={styles.onlineStatus}><i /> Online</span>
                <p className={styles.avatarQuote}>“I’m here to help you with products, orders, and delivery.”</p>
              </div>
              <div className={styles.avatarActions}>
                <span><b>♧</b><strong>Discover products</strong><small>Find the perfect item</small></span>
                <span><b>□</b><strong>Place an order</strong><small>I&apos;ll guide you through it</small></span>
                <span><b>▱</b><strong>Track your order</strong><small>Get the latest status</small></span>
              </div>
            </div>
            <div className={styles.chatPanel}>
              <div className={styles.popupHeader}>
                <div className={styles.agentIdentity}>
                  <div className={styles.miniAvatar}>
                    <Image src="/avatars/woman.png" alt="" fill sizes="42px" />
                    <i aria-label="Online" />
                  </div>
                  <div>
                    <h2 id="voice-popup-title">Olivia</h2>
                    <p>Northstar Goods · AI Assistant</p>
                  </div>
                </div>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close voice agent"
                >
                  ×
                </button>
              </div>
              <VoiceAgent compact />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
