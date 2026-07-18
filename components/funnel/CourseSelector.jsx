import React from 'react';
import Header from '../Header';
import SelectorList from '../SelectorList';
import BackButton from '../BackButton';
import BreadcrumbNav from '../BreadcrumbNav';
import { getBreadcrumbSteps, getBackUrl } from '../../lib/navigation';

export default function CourseSelector({ university, uniRecord, collegeRecord, courses }) {
  const steps = getBreadcrumbSteps({ university, uniRecord, collegeRecord });
  const backUrl = getBackUrl({ university, collegeRecord });

  return (
    <main className="container animate-fade-in">
      <Header isLanding={false} />
      <BreadcrumbNav steps={steps} />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Course & Program Selection
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontWeight: 700 }}>
              {collegeRecord ? collegeRecord.name : uniRecord.name}
            </h2>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {courses && courses.length > 0 ? (
            courses.map((course, idx) => {
              const href = collegeRecord
                ? `/institutes/${university}/c/${collegeRecord.code}/${course.code}`
                : `/institutes/${university}/u/${course.code}`;
              const stepNum = (idx + 1).toString().padStart(2, '0');
              return (
                <SelectorList
                  key={course.id}
                  stepNumber={stepNum}
                  title={course.name}
                  subtitle={course.degree_level || 'Degree Program'}
                  levelText={course.code.toUpperCase()}
                  href={href}
                />
              );
            })
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', padding: '1.5rem 0' }}>
              No active courses with question papers available at this moment.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
