import Link from 'next/link';
import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: institutions, error } = await supabase
    .from('institutions')
    .select('id, code, name, short_name, institution_type, district, state')
    .eq('is_active', true)
    .order('name');

  return (
    <main className="container animate-fade-in">
      <header className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>CollegePapers · Academic archive</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '.5rem 0' }}>Find your question papers.</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 720 }}>Browse by institution, programme, semester and subject. Paper access is checked against the institution and student category you select.</p>
      </header>
      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Choose your institution</h2>
        {error ? <p role="alert">The academic directory is temporarily unavailable.</p> : null}
        {!error && (!institutions || institutions.length === 0) ? (
          <p>No verified institutions have been added to this development catalogue yet.</p>
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1rem' }}>
          {(institutions || []).map((institution) => (
            <Link key={institution.id} href={`/institutions/${institution.code}`} className="glass-panel" style={{ display: 'block', padding: '1.25rem', textDecoration: 'none' }}>
              <strong>{institution.name}</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '.4rem' }}>{institution.institution_type.replaceAll('_', ' ')}{institution.district ? ` · ${institution.district}` : ''}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
