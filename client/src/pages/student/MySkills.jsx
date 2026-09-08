import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const MySkills = () => {
  const [studentSkills, setStudentSkills] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    skillId: '',
    currentLevel: 'Beginner',
    targetLevel: 'Advanced',
    progress: 25,
  });

  const levelProgressMap = {
    Beginner: 25,
    Intermediate: 50,
    Advanced: 75,
    Expert: 100,
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userSkillsRes, masterSkillsRes] = await Promise.all([
        API.get('/student-skills'),
        API.get('/skills'),
      ]);
      setStudentSkills(userSkillsRes.data);
      setMasterSkills(masterSkillsRes.data);
    } catch (error) {
      console.error('Error loading skills', error);
      setAlert({ type: 'danger', message: 'Unable to load skills.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      skillId: masterSkills.length > 0 ? masterSkills[0]._id : '',
      currentLevel: 'Beginner',
      targetLevel: 'Advanced',
      progress: 25,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      skillId: item.skillId?._id || '',
      currentLevel: item.currentLevel,
      targetLevel: item.targetLevel,
      progress: item.progress,
    });
    setIsModalOpen(true);
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setFormData((prev) => ({
      ...prev,
      currentLevel: level,
      progress: levelProgressMap[level] || prev.progress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    const prog = Number(formData.progress);
    if (isNaN(prog) || prog < 0 || prog > 100) {
      return setAlert({ type: 'danger', message: 'Progress percentage must be between 0 and 100' });
    }

    try {
      if (editItem) {
        await API.put(`/student-skills/${editItem._id}`, {
          currentLevel: formData.currentLevel,
          targetLevel: formData.targetLevel,
          progress: prog,
        });
        setAlert({ type: 'success', message: 'Skill progress updated successfully!' });
      } else {
        if (!formData.skillId) {
          return setAlert({ type: 'danger', message: 'Please select a skill' });
        }
        await API.post('/student-skills', {
          skillId: formData.skillId,
          currentLevel: formData.currentLevel,
          targetLevel: formData.targetLevel,
          progress: prog,
        });
        setAlert({ type: 'success', message: 'Skill added to your profile!' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving skill.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await API.delete(`/student-skills/${id}`);
      setAlert({ type: 'success', message: 'Skill removed successfully.' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting skill.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading your skills..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Technical Skills</h1>
          <p className="page-subtitle">Track current proficiency, set targets, and measure progress.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add Skill
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {studentSkills.length === 0 ? (
        <EmptyState
          title="No skills added yet"
          message="Select from available technical skills to begin tracking your placement readiness."
          actionLabel="+ Add Your First Skill"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid-2">
          {studentSkills.map((item) => (
            <div key={item._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{item.skillId?.name || 'Skill'}</h3>
                  <span className="user-badge" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                    {item.skillId?.category || 'General'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>Current: <strong>{item.currentLevel}</strong></span>
                  <span>Target: <strong>{item.targetLevel}</strong></span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{item.progress}%</span>
                </div>
                <ProgressBar progress={item.progress} />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated: {new Date(item.lastUpdated || item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Skill */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Update Skill Progress' : 'Add New Skill'}
      >
        <form onSubmit={handleSubmit}>
          {!editItem ? (
            <div className="form-group">
              <label className="form-label">Select Skill</label>
              {masterSkills.length === 0 ? (
                <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                  No master skills defined in system yet. Admin must add skills first.
                </div>
              ) : (
                <select
                  className="form-select"
                  value={formData.skillId}
                  onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Skill --</option>
                  {masterSkills.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input className="form-input" value={editItem.skillId?.name || ''} disabled />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Current Level</label>
              <select
                className="form-select"
                value={formData.currentLevel}
                onChange={handleLevelChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Level</label>
              <select
                className="form-select"
                value={formData.targetLevel}
                onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Progress Percentage (0 - 100%)</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={masterSkills.length === 0 && !editItem}>
              {editItem ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MySkills;
