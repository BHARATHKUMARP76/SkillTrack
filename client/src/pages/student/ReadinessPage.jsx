import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';

const ReadinessPage = () => {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        setLoading(true);
        const res = await API.get('/readiness');
        setReadiness(res.data);
      } catch (error) {
        console.error('Error fetching placement readiness', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReadiness();
  }, []);

  if (loading) return <LoadingSpinner text="Calculating placement readiness..." />;

  const statusRanges = [
    { label: 'Beginner', range: '0 – 39%' },
    { label: 'Developing', range: '40 – 59%' },
    { label: 'Almost Ready', range: '60 – 74%' },
    { label: 'Placement Ready', range: '75 – 89%' },
    { label: 'Highly Ready', range: '90 – 100%' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Readiness Engine</h1>
          <p className="page-subtitle">Deterministic formula calculation based on technical skills, assessments, projects, and DSA.</p>
        </div>
      </div>

      {!readiness || !readiness.hasData ? (
        <EmptyState
          title="Placement Readiness Not Available Yet"
          message="Complete your skills, assessments, projects, and DSA tracking to calculate your placement readiness score."
          actionLabel="Add Skills Now"
          onAction={() => window.location.href = '/student/skills'}
        />
      ) : (
        <div>
          {/* Main Score Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', textAlign: 'center', padding: '36px 20px' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Calculated Placement Readiness Score
            </h3>

            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary-color)', margin: '12px 0 4px 0' }}>
              {readiness.readinessScore}%
            </div>

            <div style={{ margin: '8px 0' }}>
              <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.9rem', padding: '6px 14px' }}>
                Status: {readiness.status}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '16px auto 0 auto' }}>
              Formula: (Technical Skills × 40%) + (Assessment Score × 30%) + (Project Score × 20%) + (DSA Score × 10%)
            </p>
          </div>

          {/* Component Breakdowns */}
          <h3 className="page-title" style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Evaluation Component Breakdown</h3>
          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="card">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Technical Skills (40% Weight)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{readiness.breakdown.technicalSkills}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{readiness.counts.totalSkills} skills tracked</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Assessments (30% Weight)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{readiness.breakdown.assessments}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{readiness.counts.totalAssessments} completed</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Projects (20% Weight)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{readiness.breakdown.projects}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{readiness.counts.completedProjects} completed project(s)</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DSA Score (10% Weight)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{readiness.breakdown.dsa}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{readiness.counts.dsaTopics} DSA topics tracked</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Status Scale */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Readiness Level Classifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {statusRanges.map((st, idx) => {
                  const isActive = st.label === readiness.status;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : '#0f172a',
                        border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                        fontWeight: isActive ? 700 : 400,
                      }}
                    >
                      <span>{st.label}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{st.range}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Gap Priority List */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Priority Skill Gap List</h3>

              {readiness.skillGaps.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {readiness.skillGaps.map((sk, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0f172a', padding: '12px 14px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600 }}>{idx + 1}. {sk.skillName}</span>
                        <span style={{ fontWeight: 700, color: sk.gapPercentage > 30 ? 'var(--warning)' : 'var(--success)' }}>
                          {sk.gapPercentage}% gap
                        </span>
                      </div>
                      <ProgressBar progress={sk.currentProgress} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Current: {sk.currentProgress}%</span>
                        <span>Target: {sk.targetLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessPage;
