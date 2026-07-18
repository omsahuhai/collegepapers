"use client";

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/components/list.module.css';

export default function SelectorList({ title, subtitle, href, stepNumber, levelText }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link href={href} onClick={handleClick} className={styles.item} style={{ position: 'relative' }}>
      {isPending && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
          <div className="tiny-btn-spinner"></div>
        </div>
      )}
      <div className={styles.leftContainer}>
        {stepNumber && <div className={styles.stepBadge}>{stepNumber}</div>}
        <div className={styles.content}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      </div>

      <div className={styles.rightContainer}>
        {levelText && <span className={styles.levelBadge}>{levelText}</span>}
        <svg
          className={styles.arrow}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
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
