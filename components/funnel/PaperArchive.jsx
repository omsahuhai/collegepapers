"use client";

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../Header';
import PaperRow from '../PaperRow';
import PapersFilterBar from '../PapersFilterBar';
import BackButton from '../BackButton';
import BreadcrumbNav from '../BreadcrumbNav';
import { getBreadcrumbSteps, getBackUrl } from '../../lib/navigation';

// filtering is client side so nextjs builds this statically without server side searchParams
export default function PaperArchive({ 
  university, 
  uniRecord, 
  collegeRecord, 
  courseRecord, 
  selectedSemester, 
  selectedSubject, 
  allPapers = [], 
  examTypes, 
  years
}) {
  const searchParams = useSearchParams();
  const filterType = searchParams?.get('type');
  const filterYear = searchParams?.get('year');
  const showPapers = filterType && filterYear;

  const filteredPapers = useMemo(() => {
    if (!showPapers) return [];
    
    let filtered = [...allPapers];
    const extractYear = (session) => session?.match(/\d{4}/)?.[0] || 'Unknown';

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(p => p.exam_type === filterType);
    }
    if (filterYear && filterYear !== 'all') {
      filtered = filtered.filter(p => extractYear(p.examination_session) === filterYear);
    }
    
    return filtered.sort((a, b) => {
      const yearA = extractYear(a.examination_session);
      const yearB = extractYear(b.examination_session);
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      if (a.exam_type !== b.exam_type) return (a.exam_type || '').localeCompare(b.exam_type || '');
      return 0;
    });
  }, [allPapers, filterType, filterYear, showPapers]);

  const steps = getBreadcrumbSteps({ university, uniRecord, collegeRecord, courseRecord, selectedSemester, selectedSubject });
  const backUrl = getBackUrl({ university, collegeRecord, courseRecord, selectedSemester, selectedSubject });

  return (
    <main className="container animate-fade-in">
      <Header isLanding={false} />
      <BreadcrumbNav steps={steps} />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {selectedSemester} &bull; {selectedSubject}
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontWeight: 700 }}>
              Question Papers
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          Please select both Exam Type and PYQ Year from the dropdowns below, then click &quot;See Papers&quot; to search and view the archives.
        </p>

        {allPapers && allPapers.length > 0 ? (
          <PapersFilterBar examTypes={examTypes} years={years} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#fefcf7', borderRadius: '16px', border: '1.5px dashed rgba(147, 161, 161, 0.45)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(7, 54, 66, 0.03)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
              No question papers uploaded for this subject yet.
            </p>
          </div>
        )}

        {showPapers ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredPapers && filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => (
                <PaperRow key={paper.id} paper={paper} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fefcf7', borderRadius: '16px', border: '1.5px dashed rgba(147, 161, 161, 0.45)', boxShadow: '0 2px 8px rgba(7, 54, 66, 0.03)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                  No question papers match the selected filters.
                </p>
              </div>
            )}
          </div>
        ) : allPapers && allPapers.length > 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3.5rem 1.5rem', 
            background: '#fefcf7', 
            borderRadius: '16px', 
            border: '1.5px dashed rgba(147, 161, 161, 0.45)',
            boxShadow: '0 2px 8px rgba(7, 54, 66, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(42, 161, 152, 0.12)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem'
            }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.96rem', fontWeight: 600 }}>
              Use the filters above to display question papers
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Select both Exam Type and PYQ Year, then click &quot;See Papers&quot;
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
