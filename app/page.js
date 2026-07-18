import React from 'react';
import Header from '../components/Header';
import SelectionCard from '../components/SelectionCard';
import { supabase } from '../lib/supabase';
import styles from '../styles/components/cards.module.css';

export const revalidate = 3600; // cache for 1 hour

export default async function HomePage() {
  // get universities that actually have published papers so we don't show empty links
  const { data: activePapers, error: papersError } = await supabase
    .from('papers')
    .select('university_id')
    .eq('is_published', true)
    .not('file_path', 'is', null);

  if (papersError) {
    console.error('Error fetching active papers for universities:', papersError);
  }

  const activeUniIds = Array.from(new Set(activePapers?.map((p) => p.university_id).filter(Boolean) || []));

  // get the actual university list
  let query = supabase.from('universities').select('id, name, logo_url, code, headquarters').order('name', { ascending: true });
  if (activeUniIds.length > 0) {
    query = query.in('id', activeUniIds);
  }

  const { data: universities, error } = await query;

  if (error) {
    console.error('Error fetching universities:', error);
  }

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
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '1rem',
            borderRadius: '12px',
            fontSize: '0.9rem'
          }}>
            Failed to load institutional registry. Please refresh the page or verify network connectivity.
          </div>
        )}

        <div className={styles.grid}>
          {universities?.map((uni) => (
            <SelectionCard
              key={uni.id}
              name={uni.name}
              logoUrl={uni.logo_url}
              href={`/institutes/${uni.code}`}
              metaText={uni.headquarters}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

