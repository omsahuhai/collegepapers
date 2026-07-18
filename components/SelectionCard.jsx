"use client";

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/components/cards.module.css';

export default function SelectionCard({ name, logoUrl, href, metaText }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 3) : '';

  return (
    <Link href={href} onClick={handleClick} className={styles.card} style={{ position: 'relative' }}>
      {isPending && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
          <div className="tiny-btn-spinner"></div>
        </div>
      )}
      <div className={styles.logoWrapper}>
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logoUrl} alt={`${name} logo`} className={styles.logo} loading="lazy" />
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
      <style jsx>{`
        .tiny-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(147, 161, 161, 0.3);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Link>
  );
}
