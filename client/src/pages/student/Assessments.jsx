import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Clock, HelpCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

const Assessments = () => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedTests = async () => {
      try {
        setLoading(true);
        const res = await API.get('/assessments/my-assignments');
        setAssignedTests(res.data);
      } catch (error) {
        console.error('Error fetching assigned assessments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedTests();
  }, []);

  if (loading) return <LoadingSpinner text="Loading assigned assessments..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Technical Assessments</h1>
          <p className="page-subtitle">Attempt tests assigned by your Administrator. Each test can be attempted only once.</p>
        </div>
        <Link to="/student/results" className="btn btn-secondary">
          View Assessment History
        </Link>
      </div>

      {assignedTests.length === 0 ? (
        <EmptyState
          title="No tests assigned to you yet"
          message="When your Administrator assigns a technical skill assessment, it will appear here for you to attempt."
        />
      ) : (
        <div className="grid-2">
          {assignedTests.map((assignment) => {
            const test = assignment.testId || {};
            const isCompleted = assignment.status === 'completed';
            const isInProgress = assignment.status === 'in-progress';

            return (
              <div
                key={assignment._id}
                className="card"
                style={{
                  opacity: isCompleted ? 0.9 : 1,
                  borderLeft: isCompleted
                    ? '4px solid var(--success)'
                    : isInProgress
                    ? '4px solid var(--warning)'
                    : '4px solid var(--primary-color)',
                }}
              >
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{test.title || 'Assessment'}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <span className="user-badge">{test.skillId?.name || 'General Skill'}</span>
                      {isCompleted && (
                        <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="user-badge" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                          In Progress
                        </span>
                      )}
                      {assignment.status === 'assigned' && (
                        <span className="user-badge" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  {test.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--primary-color)" />
                    <span>{test.duration || 30} minutes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HelpCircle size={16} color="var(--primary-color)" />
                    <span>{test.questionCount || 0} Questions</span>
                  </div>
                </div>

                {isCompleted ? (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#0f172a',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score Achieved:</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                        {assignment.score}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Attempt Completed
                      {assignment.submittedAt && (
                        <div>{new Date(assignment.submittedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/student/assessments/${test._id}`)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={!test.questionCount || test.questionCount === 0}
                  >
                    {test.questionCount > 0 ? (
                      <>
                        {isInProgress ? 'Resume Assessment' : 'Start Assessment'} <ArrowRight size={16} />
                      </>
                    ) : (
                      'No Questions Added Yet'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assessments;
