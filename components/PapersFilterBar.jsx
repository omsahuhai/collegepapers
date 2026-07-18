'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from '../styles/components/filterbar.module.css';

export default function PapersFilterBar({ examTypes, years }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [isPending, startTransition] = useTransition();
  const clickedSeePapers = useRef(false);

  useEffect(() => {
    if (!isPending && clickedSeePapers.current) {
      clickedSeePapers.current = false;
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPending, searchParams]);

  const handleSeePapers = () => {
    if (!selectedType || !selectedYear) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('type', selectedType);
    params.set('year', selectedYear);
    
    clickedSeePapers.current = true;
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const isButtonDisabled = !selectedType || !selectedYear;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIcon}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <span className={styles.headerTitle}>
              Filter Question Papers
            </span>
            <span className={styles.headerSubtitle}>
              Select parameters to search active PYQ archives
            </span>
          </div>
        </div>
        <span className={styles.badge}>
          Search Filters
        </span>
      </div>

      <div className={styles.formControls}>
        <div className={styles.selectsGroup}>
          <div className={styles.selectWrapper}>
            <label className={styles.label}>
              Exam Type
            </label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.select}
            >
              <option value="" disabled>Select Exam Type</option>
              {examTypes.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label className={styles.label}>
              PYQ Year
            </label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className={styles.select}
            >
              <option value="" disabled>Select PYQ Year</option>
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.buttonWrapper}>
          <button
            onClick={handleSeePapers}
            disabled={isButtonDisabled || isPending}
            className={styles.submitBtn}
          >
            {isPending && (
              <div className={styles.spinnerContainer}>
                <div className={styles.tinyBtnSpinnerWhite}></div>
              </div>
            )}
            <span>See Papers</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
