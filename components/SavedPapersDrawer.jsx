"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuickPreviewModal from './QuickPreviewModal';
import styles from '../styles/components/drawer.module.css';

export default function SavedPapersDrawer({ isOpen, onClose, items = [], onRemove, onClear }) {
  const router = useRouter();
  const [previewPaper, setPreviewPaper] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getPaperPageUrl = (paper) => {
    if (!paper.file_path) return '#';
    const parts = paper.file_path.split('/');
    if (parts.length < 4) return '#';
    
    const uniCode = parts[0].toUpperCase();
    const isDirect = parts[1] === 'u';
    const courseCode = parts[2].toUpperCase();
    const semSlug = encodeURIComponent(paper.semester.replace(/\s+/g, '-'));
    const subSlug = encodeURIComponent(paper.subject_name.replace(/\s+/g, '-'));
    
    if (isDirect) {
      return `/institutes/${uniCode}/u/${courseCode}/${semSlug}/${subSlug}`;
    } else {
      const colCode = parts[1].toUpperCase();
      return `/institutes/${uniCode}/c/${colCode}/${courseCode}/${semSlug}/${subSlug}`;
    }
  };

  const getPaperShareUrl = (paper) => {
    const baseUrl = getPaperPageUrl(paper);
    if (baseUrl === '#') return '#';
    
    const extractYear = (session) => session?.match(/\d{4}/)?.[0] || '';
    const year = extractYear(paper.examination_session);
    const type = paper.exam_type || '';
    
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (year) query.set('year', year);
    
    const queryString = query.toString();
    const path = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const handleShare = async (e, paper) => {
    e.stopPropagation();
    const shareUrl = getPaperShareUrl(paper);
    
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

  const handleCardClick = (paper) => {
    const baseUrl = getPaperPageUrl(paper);
    if (baseUrl !== '#') {
      const extractYear = (session) => session?.match(/\d{4}/)?.[0] || '';
      const year = extractYear(paper.examination_session);
      const type = paper.exam_type || '';
      
      const query = new URLSearchParams();
      if (type) query.set('type', type);
      if (year) query.set('year', year);
      
      const queryString = query.toString();
      const pathWithQuery = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      onClose();
      router.push(pathWithQuery);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} animate-fade-in`} onClick={onClose}>
      <aside 
        className={styles.drawer} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Saved PYQs Study Vault"
      >
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-cyan)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className={styles.title}>Saved PYQs Vault</h3>
            <span className={styles.badge}>{items.length}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Your Study Vault is Empty</p>
              <p style={{ fontSize: '0.82rem' }}>
                Click the bookmark icon on any question paper across collegepapers.in to save it here for instant 1-click access and downloads.
              </p>
            </div>
          ) : (
            items.map((paper) => {
              if (!paper || !paper.id) return null;
              return (
                <div 
                  key={paper.id} 
                  className={styles.savedItem}
                  onClick={() => handleCardClick(paper)}
                >
                  <div className={styles.itemHeader}>
                    <h4 className={styles.subjectName}>{paper.subject_name}</h4>
                    <button 
                      className={styles.removeBtn} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(paper.id);
                      }}
                      title="Remove bookmark"
                      aria-label={`Remove ${paper.subject_name}`}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className={styles.actions}>
                    {/* Eye/Preview Button */}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPaper(paper);
                      }}
                      title="Quick Preview Examination Metadata"
                      aria-label="Quick preview paper metadata"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => handleShare(e, paper)}
                      title="Share Website Page Link"
                      aria-label="Share website page link"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>

                    {/* Download Button */}
                    <a 
                      href={`/api/download?id=${paper.id}`} 
                      className={styles.downloadBtn}
                      download
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.clearBtn} onClick={onClear}>
              Clear All Saved Papers
            </button>
          </div>
        )}
      </aside>

      {/* Quick Preview Modal Portal */}
      {previewPaper && (
        <QuickPreviewModal 
          paper={previewPaper} 
          isOpen={true} 
          onClose={() => setPreviewPaper(null)} 
        />
      )}

      {/* Share Toast Notification */}
      {showShareToast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: 'var(--accent-emerald)',
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
    </div>
  );
}
