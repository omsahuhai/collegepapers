import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/backbutton.module.css';

export default function BackButton({ href, label = "Back" }) {
  return (
    <Link href={href} className={styles.backBtn}>
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
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </Link>
  );
}
