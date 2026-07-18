import React from 'react';
import Header from '../Header';
import SelectorList from '../SelectorList';
import BackButton from '../BackButton';
import BreadcrumbNav from '../BreadcrumbNav';
import { getBreadcrumbSteps, getBackUrl } from '../../lib/navigation';

export default function SemesterSelector({ university, uniRecord, collegeRecord, courseRecord, semesters }) {
  const steps = getBreadcrumbSteps({ university, uniRecord, collegeRecord, courseRecord });
  const backUrl = getBackUrl({ university, collegeRecord, courseRecord });

  return (
    <main className="container animate-fade-in">
      <Header isLanding={false} />
      <BreadcrumbNav steps={steps} />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {collegeRecord ? collegeRecord.name : uniRecord.name}
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontWeight: 700 }}>
              {courseRecord.name}
            </h2>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {semesters.length > 0 ? (
            semesters.map((sem, idx) => {
              const semSlug = encodeURIComponent(sem.replace(/\s+/g, '-'));
              const href = collegeRecord
                ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}/${semSlug}`
                : `/institutes/${university}/u/${courseRecord.code}/${semSlug}`;
              const stepNum = (idx + 1).toString().padStart(2, '0');
              return (
                <SelectorList
                  key={sem}
                  stepNumber={stepNum}
                  title={sem}
                  subtitle="Previous Year Question Papers"
                  levelText="Active Archive"
                  href={href}
                />
              );
            })
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', padding: '1.5rem 0' }}>
              No semesters or question papers uploaded yet. Check back soon!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
