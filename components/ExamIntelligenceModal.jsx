"use client";

import React, { useState, useEffect } from 'react';
import PassTomorrowModal from './PassTomorrowModal';

export default function ExamIntelligenceModal({ paper, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showPassTomorrow, setShowPassTomorrow] = useState(false);

  useEffect(() => {
    async function fetchIntelligence() {
      try {
        const res = await fetch(`/api/ai/paper-analysis?paper_id=${paper.id}`);
        if (!res.ok) throw new Error('Failed to fetch AI analysis');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIntelligence();
  }, [paper.id]);

  if (!paper) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--surface-card)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-crisp)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-crisp)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-elevated)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" fill="none" stroke="var(--accent-cyan)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Exam Intelligence
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {paper.subject_name} • {paper.examination_session}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
              <div className="spinner" style={{
                width: '40px', height: '40px', border: '3px solid var(--border-highlight)',
                borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Analyzing paper structure and syllabus mapping...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ color: 'var(--accent-orange)', textAlign: 'center', padding: '2rem' }}>
              <p>Error: {error}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <button 
                onClick={() => setShowPassTomorrow(true)}
                style={{
                  width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-primary))',
                  color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold',
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(42, 161, 152, 0.4)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(42, 161, 152, 0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(42, 161, 152, 0.4)'; }}
              >
                🚀 Pass Tomorrow&apos;s Exam
              </button>

              {/* Intelligence Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{
                  padding: '1.25rem', background: 'var(--surface-elevated)', borderRadius: '12px',
                  border: '1px solid var(--border-highlight)'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Syllabus Weightage Heatmap</h4>
                  {Object.entries(data.intelligence?.syllabus_mapping || {}).map(([unit, weight]) => (
                    <div key={unit} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{unit}</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{weight}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-crisp)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${weight}%`, background: 'var(--accent-cyan)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '1.25rem', background: 'var(--surface-elevated)', borderRadius: '12px',
                  border: '1px solid var(--border-crisp)'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>High-Yield Key Topics</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(data.intelligence?.key_topics || []).map((topic, i) => (
                      <li key={i} style={{ 
                        fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'var(--surface-elevated)', padding: '0.5rem 0.75rem', borderRadius: '6px'
                      }}>
                        <span style={{ color: 'var(--accent-amber)' }}>★</span> {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-crisp)' }}>
                  Interactive Question Resolver
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(data.questions || []).map((q, idx) => {
                    const isExpanded = expandedQuestion === idx;
                    return (
                      <div key={idx} style={{ 
                        border: '1px solid var(--border-crisp)', 
                        borderRadius: '8px', 
                        overflow: 'hidden' 
                      }}>
                        <button 
                          onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '1rem',
                            background: isExpanded ? 'var(--surface-elevated)' : 'transparent',
                            border: 'none', cursor: 'pointer', display: 'flex',
                            flexDirection: 'column', gap: '0.5rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--border-crisp)', borderRadius: '4px' }}>Section {q.section}</span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--border-highlight)', color: 'var(--accent-cyan)', borderRadius: '4px' }}>{q.question_type}</span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--border-crisp)', borderRadius: '4px' }}>{q.marks} Marks</span>
                            </div>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {q.question_text}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-crisp)', background: 'var(--bg-obsidian)' }}>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                              TARGET UNIT: {q.syllabus_unit}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {q.question_type === 'MCQ' ? (
                                <>
                                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Answer: {q.model_answer.answer}</p>
                                  <p style={{ margin: 0 }}>{q.model_answer.explanation}</p>
                                </>
                              ) : (
                                <>
                                  {q.model_answer.points && q.model_answer.points.length > 0 && (
                                    <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.25rem' }}>
                                      {q.model_answer.points.map((pt, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{pt}</li>)}
                                    </ul>
                                  )}
                                  {q.model_answer.diagrams && q.model_answer.diagrams.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px dashed #555', borderRadius: '6px' }}>
                                      <strong>Suggested Diagram:</strong> {q.model_answer.diagrams.join(', ')}
                                    </div>
                                  )}
                                  {q.model_answer.conclusion && (
                                    <p style={{ margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>{q.model_answer.conclusion}</p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPassTomorrow && (
        <PassTomorrowModal paper={paper} onClose={() => setShowPassTomorrow(false)} />
      )}
    </div>
  );
}
