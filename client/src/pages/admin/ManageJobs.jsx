import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, Code2, X, Power } from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [masterSkills, setMasterSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Job Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: 'Remote',
    employmentType: 'Full-time',
    status: 'active',
  });

  // Assign Skill Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [activeJobForSkill, setActiveJobForSkill] = useState(null);
  const [skillFormData, setSkillFormData] = useState({
    skillId: '',
    requiredLevel: 'Intermediate',
    importance: 'High',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, skillsRes] = await Promise.all([API.get('/jobs'), API.get('/skills')]);
      setJobs(jobsRes.data);
      setMasterSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching jobs', error);
      setAlert({ type: 'danger', message: 'Unable to load jobs.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddJobModal = () => {
    setEditJob(null);
    setJobFormData({
      title: '',
      company: '',
      description: '',
      location: 'Remote',
      employmentType: 'Full-time',
      status: 'active',
    });
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job) => {
    setEditJob(job);
    setJobFormData({
      title: job.title,
      company: job.company,
      description: job.description || '',
      location: job.location || 'Remote',
      employmentType: job.employmentType || 'Full-time',
      status: job.status || 'active',
    });
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!jobFormData.title.trim() || !jobFormData.company.trim()) {
      return setAlert({ type: 'danger', message: 'Job title and company are required' });
    }

    try {
      if (editJob) {
        await API.put(`/jobs/${editJob._id}`, jobFormData);
        setAlert({ type: 'success', message: 'Job posting updated successfully!' });
      } else {
        await API.post('/jobs', jobFormData);
        setAlert({ type: 'success', message: 'Job posting created successfully!' });
      }
      setIsJobModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error saving job posting.',
      });
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'inactive' ? 'active' : 'inactive';
    try {
      await API.put(`/jobs/${job._id}`, { status: newStatus });
      setAlert({
        type: 'success',
        message: `Job status changed to ${newStatus.toUpperCase()}`,
      });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error toggling job status.' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting and its required skills?')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setAlert({ type: 'success', message: 'Job posting deleted.' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting job.' });
    }
  };

  // Skill Assignment Logic
  const openAssignSkillModal = (job) => {
    setActiveJobForSkill(job);
    setSkillFormData({
      skillId: masterSkills.length > 0 ? masterSkills[0]._id : '',
      requiredLevel: 'Intermediate',
      importance: 'High',
    });
    setIsSkillModalOpen(true);
  };

  const handleAssignSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillFormData.skillId) {
      return setAlert({ type: 'danger', message: 'Please select a skill' });
    }

    try {
      await API.post(`/jobs/${activeJobForSkill._id}/skills`, skillFormData);
      setAlert({ type: 'success', message: 'Required skill assigned to job!' });
      setIsSkillModalOpen(false);
      fetchData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error assigning skill to job.',
      });
    }
  };

  const handleRemoveJobSkill = async (jobId, skillId) => {
    try {
      await API.delete(`/jobs/${jobId}/skills/${skillId}`);
      setAlert({ type: 'success', message: 'Skill requirement removed from job.' });
      fetchData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error removing skill from job.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading job postings..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Job Opportunities</h1>
          <p className="page-subtitle">Create placement postings and assign required technical skills for matching algorithm.</p>
        </div>
        <button onClick={openAddJobModal} className="btn btn-primary">
          <Plus size={16} /> Create Job Posting
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {jobs.length === 0 ? (
        <EmptyState
          title="No job postings created yet"
          message="Post job opportunities and set skill criteria to enable student job matching."
          actionLabel="+ Create First Job Posting"
          onAction={openAddJobModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {jobs.map((j) => {
            const isActive = j.status !== 'inactive';
            return (
              <div key={j._id} className="card" style={{ borderLeft: isActive ? '4px solid var(--success)' : '4px solid var(--border-color)' }}>
                <div className="card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{j.title}</h2>
                      <span className="user-badge" style={{ backgroundColor: isActive ? '#10b981' : '#64748b', color: '#ffffff' }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {j.company} • {j.location} • {j.employmentType}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleStatus(j)}
                      className={`btn btn-sm ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      title={isActive ? 'Deactivate Job' : 'Activate Job'}
                    >
                      <Power size={14} style={{ marginRight: '4px' }} />
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openEditJobModal(j)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteJob(j._id)} className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  {j.description || 'No detailed description provided.'}
                </p>

                {/* Required Skills Section */}
                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Required Technical Skills ({j.requiredSkills?.length || 0})
                    </h4>
                    <button onClick={() => openAssignSkillModal(j)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      <Code2 size={12} /> Assign Required Skill
                    </button>
                  </div>

                  {(!j.requiredSkills || j.requiredSkills.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No required skills assigned yet. Click "Assign Required Skill" to add skill criteria.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {j.requiredSkills.map((rs) => (
                        <span
                          key={rs._id}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid var(--border-color)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span>
                            <strong>{rs.skillId?.name || 'Skill'}</strong> ({rs.requiredLevel} • {rs.importance})
                          </span>
                          <button
                            onClick={() => handleRemoveJobSkill(j._id, rs.skillId?._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Job */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editJob ? 'Edit Job Posting' : 'Create Job Posting'}
      >
        <form onSubmit={handleJobSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software Engineer Trainee"
              value={jobFormData.title}
              onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Google, Microsoft, Tech Corp"
              value={jobFormData.company}
              onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Remote, Bangalore, New York"
                value={jobFormData.location}
                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                className="form-select"
                value={jobFormData.employmentType}
                onChange={(e) => setJobFormData({ ...jobFormData, employmentType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={jobFormData.status}
              onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
            >
              <option value="active">Active (Visible to Students)</option>
              <option value="inactive">Inactive (Hidden from Students)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Job overview, responsibilities, and qualifications..."
              value={jobFormData.description}
              onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsJobModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editJob ? 'Save Changes' : 'Create Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Assigning Required Skill to Job */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        title={`Assign Required Skill to ${activeJobForSkill?.title}`}
      >
        <form onSubmit={handleAssignSkillSubmit}>
          <div className="form-group">
            <label className="form-label">Master Skill</label>
            {masterSkills.length === 0 ? (
              <div style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                No master skills available in system. Please create Master Skills first.
              </div>
            ) : (
              <select
                className="form-select"
                value={skillFormData.skillId}
                onChange={(e) => setSkillFormData({ ...skillFormData, skillId: e.target.value })}
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Required Level</label>
              <select
                className="form-select"
                value={skillFormData.requiredLevel}
                onChange={(e) => setSkillFormData({ ...skillFormData, requiredLevel: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Importance</label>
              <select
                className="form-select"
                value={skillFormData.importance}
                onChange={(e) => setSkillFormData({ ...skillFormData, importance: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsSkillModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={masterSkills.length === 0}>
              Assign Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageJobs;
