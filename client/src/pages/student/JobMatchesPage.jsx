import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { Check, X, TrendingUp, Building, MapPin, Briefcase, BookOpen, AlertCircle } from 'lucide-react';

const JobMatchesPage = () => {
  const [jobMatches, setJobMatches] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [matchesRes, skillsRes] = await Promise.all([
          API.get('/jobs/matches'),
          API.get('/student-skills'),
        ]);

        setJobMatches(matchesRes.data || []);
        setStudentSkills(skillsRes.data || []);
      } catch (err) {
        console.error('Error fetching job matches', err);
        setError(err.response?.data?.message || 'Unable to load job opportunities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Analyzing placement job matches..." />;

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Job Skill Matching</h1>
            <p className="page-subtitle">Compare your current skills against company requirements.</p>
          </div>
        </div>
        <Alert type="danger" message={error} />
      </div>
    );
  }

  // Check if student has 0 skills added
  if (studentSkills.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Job Skill Matching</h1>
            <p className="page-subtitle">Compare your current skills against company requirements.</p>
          </div>
        </div>

        <EmptyState
          title="Complete your skill profile to see personalized job matches"
          message="You haven't added any technical skills to your profile yet. Add your skills to calculate job match scores."
          actionLabel="+ Add Technical Skills"
          onAction={() => (window.location.href = '/student/skills')}
        />
      </div>
    );
  }

  // Check if 0 active jobs exist in MongoDB
  if (jobMatches.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Job Skill Matching</h1>
            <p className="page-subtitle">Compare your current skills against company requirements.</p>
          </div>
        </div>

        <EmptyState
          title="No job opportunities available yet."
          message="System administrator has not posted any active placement opportunities yet."
        />
      </div>
    );
  }

  // Check if highest match is low (<40%)
  const maxMatch = Math.max(...jobMatches.map((m) => m.matchPercentage || 0));
  const hasLowMatchesOnly = maxMatch < 40;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Job Skill Matching</h1>
          <p className="page-subtitle">Compare your current skills against company requirements.</p>
        </div>
        <Link to="/student/skills" className="btn btn-secondary">
          Manage My Skills
        </Link>
      </div>

      {hasLowMatchesOnly && (
        <Alert
          type="warning"
          message="No strong matches found yet. Add more technical skills or improve your proficiency to increase match scores."
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {jobMatches.map((m) => {
          const hasRequirements = m.hasSkillRequirements !== false;
          const matchGrade = m.matchGrade || 'Low Match';

          let gradeColor = 'var(--danger)';
          if (m.matchPercentage >= 80) gradeColor = 'var(--success)';
          else if (m.matchPercentage >= 60) gradeColor = '#3b82f6';
          else if (m.matchPercentage >= 40) gradeColor = 'var(--warning)';

          return (
            <div key={m.job._id} className="card">
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m.job.title}</h2>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={14} /> {m.job.company}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {m.job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Briefcase size={14} /> {m.job.employmentType}
                    </span>
                  </div>
                </div>

                {/* Score & Grade Display */}
                <div
                  style={{
                    textAlign: 'right',
                    backgroundColor: '#0f172a',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    minWidth: '160px',
                  }}
                >
                  {hasRequirements ? (
                    <>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: gradeColor }}>
                        {m.matchPercentage}% Match
                      </div>
                      <div style={{ fontSize: '0.78rem', color: gradeColor, fontWeight: 600, marginTop: '2px' }}>
                        {matchGrade}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '6px 0' }}>
                      Skill requirements not specified.
                    </div>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {m.job.description || 'No detailed description provided.'}
              </p>

              {/* 3 Skill Breakdown Categories */}
              {hasRequirements && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {/* 1. Matched Skills */}
                  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <Check size={16} /> Skills You Already Have ({m.matchedCount})
                    </h4>
                    {m.matchedSkills.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No required skills matched yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.matchedSkills.map((sk) => (
                          <div key={sk._id} style={{ fontSize: '0.82rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✓ <strong>{sk.name}</strong> ({sk.studentLevel})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Skills to Improve */}
                  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <TrendingUp size={16} /> Skills You Need to Improve ({m.toImproveCount || 0})
                    </h4>
                    {(!m.skillsToImprove || m.skillsToImprove.length === 0) ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No level gaps for matched skills.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.skillsToImprove.map((sk) => (
                          <div key={sk._id} style={{ fontSize: '0.82rem', color: '#fde047', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>• <strong>{sk.name}</strong> ({sk.gap})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Missing Skills */}
                  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <X size={16} /> Skills You Need to Learn ({m.missingCount})
                    </h4>
                    {m.missingSkills.length === 0 ? (
                      <div style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Great job! You have all required skills.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.missingSkills.map((sk) => (
                          <div key={sk._id} style={{ fontSize: '0.82rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✗ <strong>{sk.name}</strong> ({sk.requiredLevel})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Learning Path */}
              {m.recommendedLearning && m.recommendedLearning.length > 0 && (
                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} color="var(--primary-color)" /> Recommended Learning Path for {m.job.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {m.recommendedLearning.map((step, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobMatchesPage;
