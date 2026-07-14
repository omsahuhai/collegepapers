import React from 'react';
import styles from '../styles/components/paper.module.css';

export default function PaperRow({ paper }) {
  // Direct API Route download link ensuring native download flow
  const downloadUrl = `/api/download?id=${paper.id}`;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.paperRow}>
      <div className={styles.details}>
        <h4 className={styles.subjectName}>{paper.subject_name}</h4>
        <div className={styles.metaContainer}>
          <span className={styles.codeBadge}>{paper.subject_code}</span>
          <span className={styles.metaTag}>{paper.examination_session}</span>
          <span className={styles.metaTag}>{paper.exam_type}</span>
          <span className={styles.metaTag}>{paper.curriculum_scheme}</span>
          {paper.file_size_bytes > 0 && (
            <span className={styles.metaTag}>{formatBytes(paper.file_size_bytes)}</span>
          )}
        </div>
      </div>
      
      <a 
        href={downloadUrl} 
        className={styles.downloadButton}
        download
      >
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download
      </a>
    </div>
  );
}
