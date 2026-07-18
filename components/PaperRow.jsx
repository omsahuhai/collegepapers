"use client";

import React, { useState } from 'react';
import styles from '../styles/components/paper.module.css';
import { useBookmarks } from '../hooks/useBookmarks';

export default function PaperRow({ paper }) {
  const { isSaved, toggleSave } = useBookmarks();
  const [showShareToast, setShowShareToast] = useState(false);

  const downloadUrl = `/api/download?id=${paper.id}`;
  const saved = isSaved(paper.id);

  const handleToggleSave = () => {
    toggleSave(paper);
  };

  const handleQuickShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${paper.subject_name} (${paper.subject_code || 'PYQ'}) - CollegePapers`,
          text: `Check out and download ${paper.subject_name} (${paper.examination_session || 'PYQ'}) question papers on CollegePapers.in`,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className={styles.paperRow}>
        <div className={styles.details}>
          <h4 className={styles.subjectName}>{paper.subject_name}</h4>
          <div className={styles.metaContainer}>
            {paper.subject_code && <span className={styles.codeBadge}>{paper.subject_code}</span>}
            {paper.examination_session && <span className={styles.metaTag}>{paper.examination_session}</span>}
            {paper.exam_type && <span className={styles.metaTag}>{paper.exam_type}</span>}
            {paper.curriculum_scheme && <span className={styles.metaTag}>{paper.curriculum_scheme}</span>}
            {paper.file_size_bytes > 0 && (
              <span className={styles.metaTag}>{formatBytes(paper.file_size_bytes)}</span>
            )}
          </div>
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={`${styles.iconBtn} ${saved ? styles.savedBtnActive : ''}`}
            onClick={handleToggleSave}
            title={saved ? 'Remove from Saved PYQs' : 'Save PYQ to Study Vault'}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark paper'}
          >
            <svg width="18" height="18" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleQuickShare}
            title="Share Website Page Link"
            aria-label="Share website page link"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <a href={downloadUrl} className={styles.downloadButton} download>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>

      {showShareToast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: '#10b981',
          color: '#ffffff',
          padding: '0.65rem 1.25rem',
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
          zIndex: 100000,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          Website page link copied to clipboard!
        </div>
      )}
    </>
  );
}
