"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/components/header.module.css';
import SavedPapersDrawer from './SavedPapersDrawer';
import { useBookmarks } from '../hooks/useBookmarks';
import ThemeToggle from './ThemeToggle';

export default function Header({ isLanding = false }) {
  const { savedPapers, removeBookmark, clearAll } = useBookmarks();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOpenDrawer = () => setIsDrawerOpen(true);
    window.addEventListener('openSavedDrawer', handleOpenDrawer);
    return () => {
      window.removeEventListener('openSavedDrawer', handleOpenDrawer);
    };
  }, []);

  return (
    <>
      {isLanding ? (
        <header className={styles.header}>
          <div className={styles.glow} />

          <div className={styles.topRow}>
            <Link href="/" className={styles.brandPill}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--accent-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              collegepapers
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                className={styles.savedTrigger} 
                onClick={() => setIsDrawerOpen(true)}
                aria-label={`Open Saved PYQs Vault (${savedPapers.length} saved)`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Saved PYQs</span>
                <span className={styles.savedBadge}>{savedPapers.length}</span>
              </button>
              <ThemeToggle />
            </div>
          </div>

          <h1 className={styles.title}>
            Academic Research & PYQ Study Vault
          </h1>

          <p className={styles.subtitle}>
            High-velocity digital repository for state & autonomous universities across Chhattisgarh. Find, preview, bookmark, and download Previous Year Question Papers instantly.
          </p>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Verified PYQs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0s</span>
              <span className={styles.statLabel}>Direct Downloads</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>Free</span>
              <span className={styles.statLabel}>Open Access</span>
            </div>
          </div>
        </header>
      ) : (
        <header className={styles.compactHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedPapers.length > 0 && (
              <button 
                className={styles.savedTrigger} 
                style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setIsDrawerOpen(true)}
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
        </header>
      )}

      <SavedPapersDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        items={savedPapers}
        onRemove={removeBookmark}
        onClear={clearAll}
      />
    </>
  );
}
