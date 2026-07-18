"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/breadcrumb.module.css';

export default function BreadcrumbNav({ steps = [] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <nav className={styles.breadcrumbNav} aria-label="Hierarchical navigation">
      <div className={styles.item}>
        <Link href="/" className={styles.link} aria-label="Go to Home">
          <svg className={styles.homeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div>

      {steps
        .filter((step) => step.label && step.label.toLowerCase() !== 'home')
        .map((step, index, filteredSteps) => {
          const isLast = index === filteredSteps.length - 1;

        return (
          <React.Fragment key={index}>
            <span className={styles.separator} aria-hidden="true">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>

            <div className={styles.item}>
              {isLast || !step.href ? (
                <span className={styles.active} aria-current="page">
                  {step.label}
                </span>
              ) : (
                <Link href={step.href} className={styles.link}>
                  {step.label}
                </Link>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
