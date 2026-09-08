import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, HelpCircle, UserCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const ManageAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const navigate = useNavigate();

  const [assessmentFormData, setAssessmentFormData] = useState({
    skillId: '',
    title: '',
    description: '',
    duration: 30,
  });

  const [assignFormData, setAssignFormData] = useState({
    studentId: '',
    testId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessRes, skillsRes, studentsRes, assignRes] = await Promise.all([
        API.get('/assessments'),
        API.get('/skills'),
        API.get('/auth/students'),
        API.get('/assessments/assignments'),
      ]);
      setAssessments(assessRes.data);
      setMasterSkills(skillsRes.data);
      setStudents(studentsRes.data);
      setAssignments(assignRes.data);
    } catch (error) {
      console.error('Error loading assessments data', error);
      setAlert({ type: 'danger', message: 'Unable to load assessments data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setAssessmentFormData({
      skillId: masterSkills.length > 0 ? masterSkills[0]._id : '',
      title: '',
      description: '',
      duration: 30,
    });
    setIsAssessmentModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setAssessmentFormData({
      skillId: item.skillId?._id || '',
      title: item.title,
      description: item.description || '',
      duration: item.duration || 30,
    });
    setIsAssessmentModalOpen(true);
  };

  const openAssignModal = () => {
    setAssignFormData({
      studentId: students.length > 0 ? students[0]._id : '',
      testId: assessments.length > 0 ? assessments[0]._id : '',
    });
    setIsAssignModalOpen(true);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!assessmentFormData.skillId || !assessmentFormData.title.trim() || !assessmentFormData.duration) {
      return setAlert({ type: 'danger', message: 'Skill, title, and duration are required' });
    }

    try {
      if (editItem) {
        await API.put(`/assessments/${editItem._id}`, assessmentFormData);
        setAlert({ type: 'success', message: 'Assessment updated successfully!' });
      } else {
        await API.post('/assessments', assessmentFormData);
        setAlert({ type: 'success', message: 'Assessment created successfully!' });
      }
      setIsAssessmentModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving assessment.',
      });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!assignFormData.studentId || !assignFormData.testId) {
      return setAlert({ type: 'danger', message: 'Please select both a student and a test.' });
    }

    try {
      await API.post('/assessments/assign', assignFormData);
      setAlert({ type: 'success', message: 'Test assigned to student successfully!' });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'This test is already assigned to this student.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment and all its questions and student assignments?')) return;
    try {
      await API.delete(`/assessments/${id}`);
      setAlert({ type: 'success', message: 'Assessment removed successfully.' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting assessment.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff' }}><CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Completed</span>;
      case 'in-progress':
        return <span className="user-badge" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> In Progress</span>;
      case 'assigned':
      default:
        return <span className="user-badge" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}><UserCheck size={12} style={{ display: 'inline', marginRight: '4px' }} /> Assigned</span>;
    }
  };

  if (loading) return <LoadingSpinner text="Loading assessments and student assignments..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Assessments & Assignments</h1>
          <p className="page-subtitle">Configure technical skill assessments and assign tests to students.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={openAssignModal} className="btn btn-secondary" disabled={assessments.length === 0 || students.length === 0}>
            <UserCheck size={16} /> Assign Test
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} /> Create Assessment
          </button>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {/* Assessments Section */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Created Assessments</h2>
      {assessments.length === 0 ? (
        <EmptyState
          title="No assessments created yet"
          message="Create assessments for master skills so students can evaluate their domain expertise."
          actionLabel="+ Create First Assessment"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid-2" style={{ marginBottom: '32px' }}>
          {assessments.map((a) => (
            <div key={a._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{a.title}</h3>
                  <span className="user-badge" style={{ marginTop: '4px' }}>
                    {a.skillId?.name || 'General'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(a)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {a.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Duration: {a.duration} mins • Questions: {a.questionCount || 0}
                </span>

                <button
                  onClick={() => navigate(`/admin/assessments/${a._id}`)}
                  className="btn btn-secondary btn-sm"
                >
                  <HelpCircle size={14} /> Manage Questions ({a.questionCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Test Assignments Tracker Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Student Test Assignments & Attempts</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Track one-time student attempt progress and scores for assigned tests.
            </p>
          </div>
          <button onClick={openAssignModal} className="btn btn-primary btn-sm" disabled={assessments.length === 0 || students.length === 0}>
            + Assign Test
          </button>
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tests have been assigned to students yet. Use the "Assign Test" button above to assign an assessment.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test Title</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Assigned On</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.studentId?.name || 'Unknown Student'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.studentId?.email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.testId?.title || 'Unknown Test'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ fontWeight: 700 }}>
                      {item.status === 'completed' ? (
                        <span style={{ color: item.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                          {item.score}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Assessment */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        title={editItem ? 'Edit Assessment' : 'Create Assessment'}
      >
        <form onSubmit={handleAssessmentSubmit}>
          <div className="form-group">
            <label className="form-label">Master Skill</label>
            {masterSkills.length === 0 ? (
              <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                Please create at least one Master Skill first.
              </div>
            ) : (
              <select
                className="form-select"
                value={assessmentFormData.skillId}
                onChange={(e) => setAssessmentFormData({ ...assessmentFormData, skillId: e.target.value })}
                required
              >
                <option value="">-- Select Skill --</option>
                {masterSkills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Assessment Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Java Fundamentals & OOP Assessment"
              value={assessmentFormData.title}
              onChange={(e) => setAssessmentFormData({ ...assessmentFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Brief overview of topics covered in assessment..."
              value={assessmentFormData.description}
              onChange={(e) => setAssessmentFormData({ ...assessmentFormData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Minutes)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={assessmentFormData.duration}
              onChange={(e) => setAssessmentFormData({ ...assessmentFormData, duration: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsAssessmentModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={masterSkills.length === 0}>
              {editItem ? 'Save Changes' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Assigning Test to Student */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Test to Student"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            {students.length === 0 ? (
              <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                No registered students found.
              </div>
            ) : (
              <select
                className="form-select"
                value={assignFormData.studentId}
                onChange={(e) => setAssignFormData({ ...assignFormData, studentId: e.target.value })}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Select Assessment / Test</label>
            {assessments.length === 0 ? (
              <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                No assessments available. Please create an assessment first.
              </div>
            ) : (
              <select
                className="form-select"
                value={assignFormData.testId}
                onChange={(e) => setAssignFormData({ ...assignFormData, testId: e.target.value })}
                required
              >
                <option value="">-- Select Assessment --</option>
                {assessments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title} ({a.skillId?.name || 'General'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={students.length === 0 || assessments.length === 0}>
              Assign Test
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAssessments;
