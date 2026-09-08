import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Lightbulb, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationsPage = () => {
  const [data, setData] = useState({ hasRecommendations: false, message: '', recommendations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await API.get('/recommendations');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching recommendations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <LoadingSpinner text="Generating learning recommendations..." />;

  const recommendations = data.recommendations || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Learning Recommendation Engine</h1>
          <p className="page-subtitle">Priority-sorted skills to acquire or improve next, calculated based on career gaps, market demand, and test performance.</p>
        </div>
      </div>

      {!data.hasRecommendations || recommendations.length === 0 ? (
        <EmptyState
          title="No Recommendations Available"
          message={data.message || 'Complete more assessments and add job requirements to receive personalized recommendations.'}
          actionLabel="Add Skills"
          onAction={() => window.location.href = '/student/skills'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map((rec, idx) => (
            <div
              key={rec.skill._id}
              className="card"
              style={{ borderLeft: `4px solid ${idx === 0 ? 'var(--primary-color)' : 'var(--border-color)'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{rec.skill.name}</h2>
                    <span className="user-badge" style={{ backgroundColor: '#1e3a8a', color: '#60a5fa' }}>
                      {rec.skill.category}
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>Reason for recommendation:</strong>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                    {rec.reason}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    className="user-badge"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      backgroundColor:
                        rec.priorityLevel === 'High Priority'
                          ? '#831843'
                          : rec.priorityLevel === 'Medium Priority'
                          ? '#7c2d12'
                          : '#1e3a8a',
                      color:
                        rec.priorityLevel === 'High Priority'
                          ? '#f472b6'
                          : rec.priorityLevel === 'Medium Priority'
                          ? '#fdba74'
                          : '#60a5fa',
                    }}
                  >
                    {rec.priorityLevel} (Score: {rec.priorityScore})
                  </span>

                  <div style={{ marginTop: '12px' }}>
                    <Link to="/student/skills" className="btn btn-primary btn-sm">
                      Improve Skill <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
