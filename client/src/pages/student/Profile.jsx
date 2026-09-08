import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { UserCheck, Edit3, ArrowRight } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isSetupMode = !user?.profileCompleted;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    department: '',
    graduationYear: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get('/profile');
        const data = res.data;
        setFormData({
          name: data.userId?.name || user?.name || '',
          email: data.userId?.email || user?.email || '',
          college: data.college || '',
          department: data.department || '',
          graduationYear: data.graduationYear || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
      } catch (error) {
        console.error('Error fetching student profile', error);
        setMessage({ type: 'danger', text: 'Unable to load profile information.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (isSetupMode) {
      if (
        !formData.name.trim() ||
        !formData.college.trim() ||
        !formData.department.trim() ||
        !formData.graduationYear.trim() ||
        !formData.phone.trim()
      ) {
        return setMessage({
          type: 'danger',
          text: 'Please fill in all required academic details to complete your profile setup.',
        });
      }
    }

    try {
      setSaving(true);
      const res = await API.put('/profile', formData);

      // Update global context with new profileCompleted status and updated name
      updateUser({
        name: formData.name,
        profileCompleted: true,
      });

      if (isSetupMode) {
        setMessage({ type: 'success', text: 'Profile saved successfully! Redirecting to Dashboard...' });
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1200);
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to save profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student profile..." />;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isSetupMode ? (
              <>
                <UserCheck size={28} color="var(--primary-color)" /> First-Time Profile Setup
              </>
            ) : (
              <>
                <Edit3 size={28} color="var(--primary-color)" /> Edit Student Profile
              </>
            )}
          </h1>
          <p className="page-subtitle">
            {isSetupMode
              ? 'Welcome to SkillTrack! Please complete your academic details below to activate your dashboard.'
              : 'Update your personal, academic, and contact information anytime.'}
          </p>
        </div>
        {!isSetupMode && (
          <button onClick={() => navigate('/student/dashboard')} className="btn btn-secondary">
            Go to Dashboard <ArrowRight size={16} />
          </button>
        )}
      </div>

      <Alert type={message.type} message={message.text} />

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                College / University <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="college"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                required={isSetupMode}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Department / Branch <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g. Computer Science Engineering"
                value={formData.department}
                onChange={handleChange}
                required={isSetupMode}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Graduation Year <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="graduationYear"
                className="form-input"
                placeholder="e.g. 2026"
                value={formData.graduationYear}
                onChange={handleChange}
                required={isSetupMode}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required={isSetupMode}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Career Objective</label>
            <textarea
              name="bio"
              className="form-textarea"
              rows={4}
              placeholder="Brief summary of your career objective and technical interests..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? isSetupMode
                  ? 'Saving Profile...'
                  : 'Updating Profile...'
                : isSetupMode
                ? 'Save Profile'
                : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
