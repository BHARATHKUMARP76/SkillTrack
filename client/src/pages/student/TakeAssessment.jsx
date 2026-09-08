import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initAssessment = async () => {
      try {
        setLoading(true);
        setError('');
        // First start/verify test assignment status
        await API.post(`/assessments/${id}/start`);

        // Fetch assessment questions
        const res = await API.get(`/assessments/${id}`);
        setAssessment(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Error starting quiz', err);
        setError(err.response?.data?.message || 'Unable to load assessment questions.');
      } finally {
        setLoading(false);
      }
    };

    initAssessment();
  }, [id]);

  const handleOptionSelect = (questionId, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit your assessment?')) return;
    try {
      setSubmitting(true);
      setError('');
      const res = await API.post(`/assessments/${id}/submit`, {
        answers: userAnswers,
      });
      // Redirect to results history page
      navigate('/student/results', { state: { latestResult: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assessment.');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing test interface..." />;

  if (error || !assessment || questions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '40px auto' }}>
        <Alert type="danger" message={error || 'No questions found for this assessment.'} />
        <button onClick={() => navigate('/student/assessments')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Assessments
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedAnswer = userAnswers[currentQ._id];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Assessment Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{assessment.title}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {questions.length} • Topic: {currentQ.topic}
            </span>
          </div>
          <span className="user-badge" style={{ backgroundColor: '#1e3a8a', color: '#60a5fa' }}>
            {currentQ.difficulty}
          </span>
        </div>
      </div>

      <Alert type="danger" message={error} />

      {/* Question Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '20px', lineHeight: 1.5 }}>
          {currentIndex + 1}. {currentQ.questionText}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            return (
              <div
                key={idx}
                onClick={() => handleOptionSelect(currentQ._id, opt)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius)',
                  border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '6px solid var(--primary-color)' : '2px solid var(--text-muted)',
                    backgroundColor: '#0f172a',
                  }}
                ></div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="btn btn-secondary"
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="btn btn-primary"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--success)' }}
              disabled={submitting}
            >
              {submitting ? 'Evaluating Answers...' : 'Submit Assessment'} <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
