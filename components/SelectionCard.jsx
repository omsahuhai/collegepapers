import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/cards.module.css';

export default function SelectionCard({ name, logoUrl, href, metaText }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 3) : '';

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.logoWrapper}>
        {logoUrl ? (
          <img src={logoUrl} alt={`${name} logo`} className={styles.logo} />
        ) : (
          <span className={styles.placeholderLogo}>{initials}</span>
        )}
      </div>
      <h3 className={styles.name}>{name}</h3>
      {metaText && (
        <div className={styles.meta}>
          <span className={styles.metaBadge}>{metaText}</span>
        </div>
      )}
    </Link>
  );
}
