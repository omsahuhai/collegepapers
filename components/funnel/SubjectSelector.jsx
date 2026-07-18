import React from 'react';
import Header from '../Header';
import SelectorList from '../SelectorList';
import BackButton from '../BackButton';
import BreadcrumbNav from '../BreadcrumbNav';
import { getBreadcrumbSteps, getBackUrl } from '../../lib/navigation';

export default function SubjectSelector({ university, uniRecord, collegeRecord, courseRecord, selectedSemester, subjects }) {
  const steps = getBreadcrumbSteps({ university, uniRecord, collegeRecord, courseRecord, selectedSemester });
  const backUrl = getBackUrl({ university, collegeRecord, courseRecord, selectedSemester });
  const semSlug = encodeURIComponent(selectedSemester.replace(/\s+/g, '-'));

  return (
    <main className="container animate-fade-in">
      <Header isLanding={false} />
      <BreadcrumbNav steps={steps} />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {courseRecord.name} &bull; {selectedSemester}
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontWeight: 700 }}>
              Select Subject
            </h2>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {subjects.length > 0 ? (
            subjects.map((sub, idx) => {
              const subSlug = encodeURIComponent(sub.replace(/\s+/g, '-'));
              const href = collegeRecord
                ? `/institutes/${university}/c/${collegeRecord.code}/${courseRecord.code}/${semSlug}/${subSlug}`
                : `/institutes/${university}/u/${courseRecord.code}/${semSlug}/${subSlug}`;
              const stepNum = (idx + 1).toString().padStart(2, '0');
              return (
                <SelectorList
                  key={sub}
                  stepNumber={stepNum}
                  title={sub}
                  subtitle="Subject Archives"
                  levelText="View Papers"
                  href={href}
                />
              );
            })
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', padding: '1.5rem 0' }}>
              No subjects found for this semester.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
