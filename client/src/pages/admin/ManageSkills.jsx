import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const categories = [
  'Programming',
  'Database',
  'Frontend',
  'Backend',
  'DevOps',
  'Computer Science',
  'Tools',
  'Other',
];

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming',
    description: '',
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await API.get('/skills');
      setSkills(res.data);
    } catch (error) {
      console.error('Error fetching master skills', error);
      setAlert({ type: 'danger', message: 'Unable to load skills.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      name: '',
      category: 'Programming',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.name.trim()) {
      return setAlert({ type: 'danger', message: 'Skill name is required' });
    }

    try {
      if (editItem) {
        await API.put(`/skills/${editItem._id}`, formData);
        setAlert({ type: 'success', message: 'Skill updated successfully!' });
      } else {
        await API.post('/skills', formData);
        setAlert({ type: 'success', message: 'Master skill created successfully!' });
      }
      setIsModalOpen(false);
      fetchSkills();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving skill.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this master skill?')) return;
    try {
      await API.delete(`/skills/${id}`);
      setAlert({ type: 'success', message: 'Master skill deleted.' });
      fetchSkills();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting skill.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading master skills..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Skills Management</h1>
          <p className="page-subtitle">Add and configure master technical skills available for students.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Create Skill
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {skills.length === 0 ? (
        <EmptyState
          title="No skills added yet"
          message="Create technical skills (e.g. Java, Python, SQL, React) for student tracking and job requirements."
          actionLabel="+ Create First Master Skill"
          onAction={openAddModal}
        />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <span className="user-badge">{s.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 8px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Master Skill */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Master Skill' : 'Create Master Skill'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Skill Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Java, Spring Boot, React.js"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Brief description of technical domain..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editItem ? 'Save Changes' : 'Create Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSkills;
