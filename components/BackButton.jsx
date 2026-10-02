"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/backbutton.module.css';
import ThemeToggle from './ThemeToggle';
import { useBookmarks } from '../hooks/useBookmarks';

export default function BackButton({ href, label = "Back" }) {
  const { savedPapers } = useBookmarks();

  return (
    <div className={styles.backRow}>
      <Link href={href} className={styles.backBtn}>
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {label}
      </Link>

      <div className={styles.actions}>
        {savedPapers.length > 0 && (
          <button 
            className={styles.savedTrigger} 
            onClick={() => window.dispatchEvent(new CustomEvent('openSavedDrawer'))}
            aria-label={`Open Saved PYQs Vault (${savedPapers.length} saved)`}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Saved ({savedPapers.length})</span>
          </button>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
