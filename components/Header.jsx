import React from 'react';
import styles from '../styles/components/header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.glow} />
      <div className={styles.logoContainer}>
        <h1 className={styles.title}>collegepapers.in</h1>
      </div>
      <div className={styles.badge}>
        <span className={styles.pulseDot} />
        Chhattisgarh Academic Portal
      </div>
      <p className={styles.subtitle}>
        Find and download Previous Year Question Papers (PYQs) for state and autonomous universities instantly.
      </p>
    </header>
  );
}
