"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
            <div className={styles.popupHeader}>
              <div>
                <p className={styles.popupEyebrow}>Northstar Goods</p>
                <h2 id="voice-popup-title">Talk to our voice agent</h2>
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
          </section>
        </div>
      )}
    </>
  );
}
