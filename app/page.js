import React from 'react';
import Header from '../components/Header';
import SelectionCard from '../components/SelectionCard';
import { supabase } from '../lib/supabase';
import styles from '../styles/components/cards.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: institutions, error } = await supabase
    .from('institutions')
    .select('id, name, short_name, code, logo_url, district, state')
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (
    <main className="container animate-fade-in">
      <Header isLanding={true} />
      <section className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Institutional Directory
            </span>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.25rem', fontWeight: 700 }}>
              Select Your University / Institute
            </h2>
          </div>
        </div>
        {error && (
          <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-orange)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
            Failed to load institutional registry. Please refresh the page or verify network connectivity.
          </div>
        )}
        {!error && (!institutions || institutions.length === 0) && (
          <p>No verified institutions have been added to this development catalogue yet.</p>
        )}
        <div className={styles.grid}>
          {(institutions || []).map((institution) => (
            <SelectionCard
              key={institution.id}
              name={institution.name}
              logoUrl={institution.logo_url}
              href={`/institutions/${institution.code}`}
              metaText={[institution.district, institution.state].filter(Boolean).join(', ') || institution.short_name}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
