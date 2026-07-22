"use client";

import React, { useState, useEffect, useRef } from 'react';

// Fade-in single input step component
function StepInput({ question, value, onChange, onEnter, placeholder, exampleText }) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'fadeUp 0.3s ease-out' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>{question}</h3>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onEnter(); }}
        placeholder={placeholder}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '2px solid var(--border-crisp)',
          color: 'var(--text-primary)',
          fontSize: '1.5rem',
          textAlign: 'center',
          padding: '0.5rem',
          width: '80%',
          maxWidth: '400px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.target.style.borderBottom = '2px solid var(--accent-cyan)'}
        onBlur={(e) => e.target.style.borderBottom = '2px solid var(--border-crisp)'}
      />
      {exampleText && (
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          {exampleText}
        </p>
      )}
      <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: value.trim() ? 1 : 0, transition: 'opacity 0.2s' }}>
        Press Enter ↵
      </p>
    </div>
  );
}

export default function PassTomorrowModal({ paper, onClose }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState(null);
  const [loadingText, setLoadingText] = useState('');
  
  // User Inputs
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [completedSyllabus, setCompletedSyllabus] = useState('');
  const [goal, setGoal] = useState('');

  const nextStep = () => setStep(s => s + 1);

  useEffect(() => {
    if (loading) {
      const texts = [
        "Understanding your preparation...",
        "Reading previous papers...",
        "Finding the fastest path...",
        "Creating your strategy..."
      ];
      let i = 0;
      setLoadingText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const generateStrategy = async () => {
    setLoading(true);
    setStep(99); // Move past inputs
    try {
      const res = await fetch('/api/ai/pass-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: paper.id,
          exam: examDate,
          studyHours: parseFloat(studyHours),
          completed: parseFloat(completedSyllabus),
          goal: goal,
        })
      });
      if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.error || 'Failed to generate strategy');
      }
      const data = await res.json();
      setStrategy(data.strategy);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4) {
      generateStrategy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'var(--surface-backdrop)', backdropFilter: 'blur(8px)',
      zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) blur(4px); } to { opacity: 1; transform: translateY(0) blur(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(42, 161, 152, 0.4); } 70% { box-shadow: 0 0 20px 10px rgba(42, 161, 152, 0); } 100% { box-shadow: 0 0 0 0 rgba(42, 161, 152, 0); } }
      `}</style>
      
      <div style={{
        background: 'var(--surface-card)', borderRadius: '24px', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border-crisp)',
        overflow: 'hidden', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🚀 AI Pass Strategy
          </h3>
          <button onClick={onClose} style={{
            background: 'var(--surface-elevated)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px', padding: '5rem 2rem 2rem 2rem' }}>
          
          {step === 0 && (
            <>
              <h4 style={{ color: 'var(--text-secondary)', fontWeight: 400, marginBottom: '2rem', animation: 'fadeIn 0.5s', textAlign: 'center' }}>Let&apos;s make the most of the time you have.</h4>
              <StepInput question="When is your exam?" value={examDate} onChange={setExamDate} onEnter={nextStep}
                placeholder="e.g. tomorrow morning" exampleText="(tomorrow morning, afternoon, evening, in 2 days)" />
            </>
          )}
          {step === 1 && (
            <StepInput question="How many hours can you actually study?" value={studyHours} onChange={setStudyHours} onEnter={nextStep}
              placeholder="e.g. 6" exampleText="Enter a number of hours (2, 4, 8, 12)" />
          )}
          {step === 2 && (
            <StepInput question="How much syllabus have you completed?" value={completedSyllabus} onChange={setCompletedSyllabus} onEnter={nextStep}
              placeholder="e.g. 25" exampleText="Enter a percentage (0, 25, 50, 75)" />
          )}
          {step === 3 && (
            <StepInput question="What is your goal?" value={goal} onChange={setGoal} onEnter={nextStep}
              placeholder="e.g. Just pass" exampleText="(pass, 60%, 75%, highest possible)" />
          )}
          
          {loading && (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', animation: 'fadeIn 0.5s' }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%', background: 'var(--accent-cyan)',
                  animation: 'pulseGlow 2s infinite', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="36" height="36" fill="none" stroke="#fff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '1.4rem', textAlign: 'center' }}>
                  {loadingText}
                </h3>
             </div>
          )}

          {error && !loading && (
            <div style={{ color: 'var(--accent-orange)', textAlign: 'center', animation: 'fadeUp 0.3s' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: '1rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3>Error generating strategy</h3>
              <p>{error}</p>
              <button onClick={() => setStep(0)} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--surface-elevated)', border: '1px solid var(--border-crisp)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            </div>
          )}

          {strategy && !loading && (
            <div style={{ width: '100%', animation: 'fadeUp 0.5s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: 'var(--surface-elevated)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-crisp)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Pass Confidence</p>
                  <h2 style={{ margin: '0.5rem 0 0 0', color: 'var(--accent-cyan)', fontSize: '3rem', fontWeight: 800 }}>{strategy.confidence}%</h2>
                </div>
                <div style={{ flex: 1, background: 'var(--surface-elevated)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-crisp)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Expected Marks</p>
                  <h2 style={{ margin: '0.5rem 0 0 0', color: 'var(--text-primary)', fontSize: '3rem', fontWeight: 800 }}>{strategy.expectedMarks?.minimum}-{strategy.expectedMarks?.maximum}</h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--accent-cyan)', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.5rem', letterSpacing: '0.05em' }}>FOCUS FIRST</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {strategy.focusTopics?.map((topic, i) => (
                      <li key={i} style={{ background: 'var(--border-highlight)', color: 'var(--text-primary)', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.95rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                         <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '1.1rem' }}>{i+1}</span> {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ color: 'var(--accent-orange)', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.5rem', letterSpacing: '0.05em' }}>SKIP FOR NOW</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {strategy.skipTopics?.map((topic, i) => (
                      <li key={i} style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.95rem', textDecoration: 'line-through' }}>
                         {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ color: 'var(--accent-amber)', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.5rem', letterSpacing: '0.05em' }}>HIGH-YIELD MEMORIZATION</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {strategy.memorizeQuestions?.map((q, i) => (
                    <li key={i} style={{ background: 'var(--surface-elevated)', color: 'var(--text-primary)', padding: '1.25rem', borderRadius: '12px', fontSize: '0.95rem', borderLeft: '4px solid var(--accent-amber)', lineHeight: 1.5 }}>
                      ⭐ <span style={{ marginLeft: '0.5rem' }}>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{strategy.strategyTitle || 'REVISION TIMELINE'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {strategy.revisionTimeline?.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1rem', background: 'var(--surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-crisp)' }}>
                      <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, minWidth: '110px', fontSize: '0.95rem' }}>{t.time}</div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{t.task}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-crisp)', paddingBottom: '0.5rem', letterSpacing: '0.05em' }}>EXAM HALL STRATEGY</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {strategy.examHallStrategy?.map((tip, i) => (
                    <li key={i} style={{ marginBottom: '0.75rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ padding: '1.75rem', background: 'var(--border-highlight)', borderRadius: '16px', textAlign: 'center', marginTop: '3rem', border: '1px solid rgba(42, 161, 152, 0.3)' }}>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: 500, fontSize: '1.1rem' }}>&quot;{strategy.motivation}&quot;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
