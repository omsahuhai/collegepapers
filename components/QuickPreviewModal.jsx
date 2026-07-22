"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/components/modal.module.css';

export default function QuickPreviewModal({ paper, isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      handleClose();
    }
  };

  const handleShare = async () => {
    if (!paper) return;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${paper.subject_name} (${paper.subject_code || 'PYQ'}) - CollegePapers`,
          text: `Check out and download ${paper.subject_name} (${paper.examination_session || 'PYQ'}) question paper on CollegePapers`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to copy if share is cancelled/errors
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!paper) return null;

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleBox}>
            <span className={styles.subjectCode}>{paper.subject_code || 'PYQ DOCUMENT'}</span>
            <h3 id="modal-title" className={styles.subjectName}>{paper.subject_name}</h3>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close preview">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.gridSpecs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Examination Session</span>
            <span className={styles.specValue}>{paper.examination_session || 'N/A'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Exam Type</span>
            <span className={styles.specValue}>{paper.exam_type || 'Regular'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Curriculum Scheme</span>
            <span className={styles.specValue}>{paper.curriculum_scheme || 'CBCS / NEP'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Document Size</span>
            <span className={styles.specValue}>{formatBytes(paper.file_size_bytes)}</span>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button type="button" className={styles.shareButton} onClick={handleShare}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <a
            href={`/api/download?id=${paper.id}`}
            className={styles.downloadButton}
            download
            onClick={handleClose}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PYQ
          </a>
        </div>

        {showToast && (
          <div className={styles.toast}>
            Website page link copied to clipboard!
          </div>
        )}
      </div>
    </dialog>
  );
}
