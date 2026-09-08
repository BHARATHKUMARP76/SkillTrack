import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, GitBranch, ExternalLink } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    status: 'In Progress',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
      setAlert({ type: 'danger', message: 'Unable to load projects.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      name: '',
      description: '',
      technologies: '',
      githubUrl: '',
      status: 'In Progress',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies || '',
      githubUrl: item.githubUrl || '',
      status: item.status || 'In Progress',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.name.trim()) {
      return setAlert({ type: 'danger', message: 'Project name is required' });
    }

    if (formData.githubUrl && formData.githubUrl.trim() !== '') {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+.*$/;
      if (!githubRegex.test(formData.githubUrl.trim())) {
        return setAlert({ type: 'danger', message: 'Please enter a valid GitHub repository URL' });
      }
    }

    try {
      if (editItem) {
        await API.put(`/projects/${editItem._id}`, formData);
        setAlert({ type: 'success', message: 'Project updated successfully!' });
      } else {
        await API.post('/projects', formData);
        setAlert({ type: 'success', message: 'Project created successfully!' });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving project.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      setAlert({ type: 'success', message: 'Project deleted successfully.' });
      fetchProjects();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting project.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Tracker</h1>
          <p className="page-subtitle">Document your real-world software applications and portfolio work.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add Project
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects added yet"
          message="Showcase your full-stack, frontend, or backend projects to boost your placement readiness score."
          actionLabel="+ Add Your First Project"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid-2">
          {projects.map((p) => (
            <div key={p._id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{p.name}</h3>
                  <span
                    className="user-badge"
                    style={{
                      marginTop: '4px',
                      backgroundColor:
                        p.status === 'Completed'
                          ? '#064e3b'
                          : p.status === 'In Progress'
                          ? '#1e3a8a'
                          : '#451a03',
                      color:
                        p.status === 'Completed'
                          ? '#34d399'
                          : p.status === 'In Progress'
                          ? '#60a5fa'
                          : '#fbbf24',
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {p.description || 'No description provided.'}
              </p>

              {p.technologies && p.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {p.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--primary-color)',
                    fontWeight: 600,
                  }}
                >
                  <GitBranch size={16} /> Repository URL <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Project Details' : 'Add New Project'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SkillTrack Placement Platform"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Brief description of application architecture and core features..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="React, Node.js, Express, MongoDB"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">GitHub Repository URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username/repository"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editItem ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
