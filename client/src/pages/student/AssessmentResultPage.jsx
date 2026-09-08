import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';

const AssessmentResultPage = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const latestSubmitted = location.state?.latestResult;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await API.get('/assessment-results');
        setResults(res.data);
      } catch (error) {
        console.error('Error fetching assessment results', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching your assessment results..." />;

  const displayResults = results;
  const featured = latestSubmitted || (displayResults.length > 0 ? displayResults[0] : null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessment Results</h1>
          <p className="page-subtitle">Detailed topic performance breakdown generated from evaluated test submissions.</p>
        </div>
        <Link to="/student/assessments" className="btn btn-primary">
          Take Another Assessment
        </Link>
      </div>

      {!featured ? (
        <EmptyState
          title="No assessment results found"
          message="Take a skill assessment to view your calculated scores and topic breakdown."
          actionLabel="View Available Assessments"
          onAction={() => window.location.href = '/student/assessments'}
        />
      ) : (
        <div>
          {/* Latest / Featured Result Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-color)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="user-badge">{featured.assessmentId?.skillId?.name || 'Technical Assessment'}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>
                  {featured.assessmentId?.title || 'Assessment Result'}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Attempted on: {new Date(featured.attemptedAt || featured.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '16px 24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: featured.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                  {featured.score}%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {featured.correctAnswers} / {featured.totalQuestions} Correct
                </div>
              </div>
            </div>

            {/* Topic Wise Performance */}
            <div style={{ marginTop: '24px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Topic-Wise Performance Breakdown</h3>

              {featured.topicResults && featured.topicResults.length > 0 ? (
                <div className="grid-2">
                  {featured.topicResults.map((t, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600 }}>{t.topic}</span>
                        <span style={{ color: t.percentage >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                          {t.correct}/{t.total} ({t.percentage}%)
                        </span>
                      </div>
                      <ProgressBar progress={t.percentage} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No topic details available.</p>
              )}
            </div>
          </div>

          {/* Past Attempts Table */}
          {displayResults.length > 1 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>All Attempt History</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Skill</th>
                      <th>Score</th>
                      <th>Correct / Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayResults.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600 }}>{item.assessmentId?.title || 'Assessment'}</td>
                        <td>{item.assessmentId?.skillId?.name || 'N/A'}</td>
                        <td style={{ fontWeight: 700, color: item.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                          {item.score}%
                        </td>
                        <td>{item.correctAnswers} / {item.totalQuestions}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {new Date(item.attemptedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentResultPage;
