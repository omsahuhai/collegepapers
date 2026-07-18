import React from 'react';
import Header from '../Header';
import SelectionCard from '../SelectionCard';
import BackButton from '../BackButton';
import BreadcrumbNav from '../BreadcrumbNav';
import { getBreadcrumbSteps, getBackUrl } from '../../lib/navigation';

export default function CollegeSelector({ university, uniRecord, colleges }) {
  const steps = getBreadcrumbSteps({ university, uniRecord });
  const backUrl = getBackUrl({ university });

  return (
    <main className="container animate-fade-in">
      <Header isLanding={false} />
      <BreadcrumbNav steps={steps} />
      <BackButton href={backUrl} />

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {uniRecord.headquarters || 'Affiliated Colleges'}
            </span>
            <h2 style={{ fontSize: '1.45rem', marginTop: '0.2rem', fontWeight: 700 }}>
              {uniRecord.name}
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
          Select your college or department to browse available degree programs and question paper archives.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.35rem' }}>
          {colleges.map((college) => (
            <SelectionCard
              key={college.id}
              name={college.name}
              logoUrl={null}
              href={`/institutes/${university}/c/${college.code}`}
              metaText={college.district}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
