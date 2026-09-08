import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const ManageQuestions = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    topic: '',
    difficulty: 'Medium',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessRes, qRes] = await Promise.all([
        API.get(`/assessments/${assessmentId}`),
        API.get(`/questions/${assessmentId}`),
      ]);
      setAssessment(assessRes.data);
      setQuestions(qRes.data);
    } catch (error) {
      console.error('Error loading questions', error);
      setAlert({ type: 'danger', message: 'Unable to load assessment questions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '',
      topic: 'OOP',
      difficulty: 'Medium',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    const opts = item.options || [];
    setFormData({
      questionText: item.questionText,
      option1: opts[0] || '',
      option2: opts[1] || '',
      option3: opts[2] || '',
      option4: opts[3] || '',
      correctAnswer: item.correctAnswer,
      topic: item.topic || 'General',
      difficulty: item.difficulty || 'Medium',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    const { questionText, option1, option2, option3, option4, correctAnswer, topic, difficulty } = formData;

    if (!questionText.trim() || !option1.trim() || !option2.trim() || !correctAnswer.trim() || !topic.trim()) {
      return setAlert({ type: 'danger', message: 'Question, at least 2 options, topic, and correct answer are required' });
    }

    const optionsList = [option1.trim(), option2.trim(), option3.trim(), option4.trim()].filter(Boolean);

    if (!optionsList.includes(correctAnswer.trim())) {
      return setAlert({ type: 'danger', message: 'Correct answer must match one of the entered options exactly' });
    }

    const payload = {
      assessmentId,
      questionText: questionText.trim(),
      options: optionsList,
      correctAnswer: correctAnswer.trim(),
      topic: topic.trim(),
      difficulty,
    };

    try {
      if (editItem) {
        await API.put(`/questions/${editItem._id}`, payload);
        setAlert({ type: 'success', message: 'Question updated successfully!' });
      } else {
        await API.post('/questions', payload);
        setAlert({ type: 'success', message: 'Question added successfully!' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving question.',
      });
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await API.delete(`/questions/${qId}`);
      setAlert({ type: 'success', message: 'Question deleted.' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting question.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading questions..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/admin/assessments')} className="btn btn-secondary btn-sm" style={{ marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Assessments
          </button>
          <h1 className="page-title">Questions for: {assessment?.title}</h1>
          <p className="page-subtitle">Configure quiz questions, options, topic categorization, and correct answers.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add Question
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {questions.length === 0 ? (
        <EmptyState
          title="No questions added to this assessment yet"
          message="Add multiple-choice questions with topics and correct answers."
          actionLabel="+ Add First Question"
          onAction={openAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q, idx) => (
            <div key={q._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    Q{idx + 1}. {q.questionText}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className="user-badge">{q.topic}</span>
                    <span className="user-badge" style={{ backgroundColor: '#1e3a8a', color: '#60a5fa' }}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(q)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid-2" style={{ margin: '14px 0' }}>
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                        border: isCorrect ? '1px solid var(--success)' : '1px solid var(--border-color)',
                        color: isCorrect ? '#6ee7b7' : 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontWeight: isCorrect ? 600 : 400,
                      }}
                    >
                      {opt} {isCorrect && ' ✓ (Correct Answer)'}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Question */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Question' : 'Add Question'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Which concept allows a subclass to provide a specific implementation of a superclass method?"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Topic / Sub-domain</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. OOP, Collections, Exception Handling"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Option 1</label>
            <input
              type="text"
              className="form-input"
              value={formData.option1}
              onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Option 2</label>
            <input
              type="text"
              className="form-input"
              value={formData.option2}
              onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Option 3 (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.option3}
              onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Option 4 (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.option4}
              onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correct Answer (Must match one option exactly)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Copy & paste exact correct option string here"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editItem ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageQuestions;
