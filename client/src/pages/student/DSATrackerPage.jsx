import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const defaultTopics = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack',
  'Queue',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Binary Search',
  'Recursion & Backtracking',
];

const DSATrackerPage = () => {
  const [dsaList, setDsaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    topic: 'Arrays',
    totalProblems: 50,
    solvedProblems: 0,
  });

  const fetchDsaData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dsa');
      setDsaList(res.data);
    } catch (error) {
      console.error('Error loading DSA progress', error);
      setAlert({ type: 'danger', message: 'Unable to load DSA tracker data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDsaData();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      topic: 'Arrays',
      totalProblems: 50,
      solvedProblems: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      topic: item.topic,
      totalProblems: item.totalProblems,
      solvedProblems: item.solvedProblems,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    const total = Number(formData.totalProblems);
    const solved = Number(formData.solvedProblems);

    if (isNaN(total) || isNaN(solved)) {
      return setAlert({ type: 'danger', message: 'Total and solved problems must be numbers' });
    }
    if (solved < 0) {
      return setAlert({ type: 'danger', message: 'Solved problems cannot be negative' });
    }
    if (total <= 0) {
      return setAlert({ type: 'danger', message: 'Total problems must be greater than 0' });
    }
    if (solved > total) {
      return setAlert({ type: 'danger', message: 'Solved problems cannot exceed total problems' });
    }

    try {
      if (editItem) {
        await API.put(`/dsa/${editItem._id}`, {
          totalProblems: total,
          solvedProblems: solved,
        });
        setAlert({ type: 'success', message: 'DSA topic progress updated!' });
      } else {
        await API.post('/dsa', {
          topic: formData.topic,
          totalProblems: total,
          solvedProblems: solved,
        });
        setAlert({ type: 'success', message: 'DSA topic added to tracking!' });
      }
      setIsModalOpen(false);
      fetchDsaData();
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Error updating DSA topic.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this DSA topic tracker?')) return;
    try {
      await API.delete(`/dsa/${id}`);
      setAlert({ type: 'success', message: 'DSA topic tracker removed.' });
      fetchDsaData();
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error deleting DSA topic.' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading DSA tracker..." />;

  // Calculate global DSA progress
  const globalTotal = dsaList.reduce((acc, curr) => acc + curr.totalProblems, 0);
  const globalSolved = dsaList.reduce((acc, curr) => acc + curr.solvedProblems, 0);
  const globalPercentage = globalTotal > 0 ? Math.round((globalSolved / globalTotal) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">DSA Practice Tracker</h1>
          <p className="page-subtitle">Track Data Structures & Algorithms problem-solving progress across core topics.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Track Topic
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {/* Global DSA Summary */}
      {dsaList.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 className="card-title">Overall DSA Completion</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {globalSolved} of {globalTotal} Problems Solved
              </span>
            </div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>
              {globalPercentage}%
            </span>
          </div>
          <ProgressBar progress={globalPercentage} />
        </div>
      )}

      {dsaList.length === 0 ? (
        <EmptyState
          title="No DSA progress recorded yet"
          message="Start tracking Arrays, Dynamic Programming, Trees, and Graphs problem solving to improve your readiness score."
          actionLabel="+ Track Your First Topic"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid-2">
          {dsaList.map((item) => {
            const topicPercentage = Math.round((item.solvedProblems / item.totalProblems) * 100);
            return (
              <div key={item._id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{item.topic}</h3>
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

                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Progress: <strong>{item.solvedProblems} / {item.totalProblems}</strong> Solved</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{topicPercentage}%</span>
                  </div>
                  <ProgressBar progress={topicPercentage} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit DSA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? `Update Progress for ${editItem.topic}` : 'Add DSA Topic'}
      >
        <form onSubmit={handleSubmit}>
          {!editItem ? (
            <div className="form-group">
              <label className="form-label">DSA Topic</label>
              <select
                className="form-select"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              >
                {defaultTopics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">DSA Topic</label>
              <input className="form-input" value={editItem.topic} disabled />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Problems Target</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={formData.totalProblems}
                onChange={(e) => setFormData({ ...formData, totalProblems: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Solved Problems</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.solvedProblems}
                onChange={(e) => setFormData({ ...formData, solvedProblems: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editItem ? 'Save Changes' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DSATrackerPage;
