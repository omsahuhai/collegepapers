import React from 'react';
import Header from '../components/Header';
import SelectionCard from '../components/SelectionCard';
import { supabase } from '../lib/supabase';

export const revalidate = 3600; // Revalidate cache every hour for high performance

export default async function HomePage() {
  // Query all active universities
  const { data: universities, error } = await supabase
    .from('universities')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching universities:', error);
  }

  return (
    <main className="container animate-fade-in">
      <Header />
      
      <div className="glass-panel">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700 }}>
          Select Your Institute / University
        </h2>
        
        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>
            Failed to load universities. Please try again later.
          </p>
        )}

        <div className="grid-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
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
        </div>
      </div>
    </main>
  );
}
