import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/list.module.css';

export default function SelectorList({ title, subtitle, href }) {
  return (
    <Link href={href} className={styles.item}>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
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
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
