import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Code2, FileCheck, Briefcase } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSkills: 0,
    totalAssessments: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auth/admin-stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error loading admin statistics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin analytics..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Real-time system overview and student placement management.</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Students</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{stats.totalStudents}</div>
            </div>
            <Users size={32} color="var(--primary-color)" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <Link to="/admin/students" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Students &rarr;</Link>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Master Skills</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{stats.totalSkills}</div>
            </div>
            <Code2 size={32} color="var(--success)" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <Link to="/admin/skills" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Skills &rarr;</Link>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Skill Assessments</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{stats.totalAssessments}</div>
            </div>
            <FileCheck size={32} color="var(--warning)" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <Link to="/admin/assessments" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Assessments &rarr;</Link>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Job Postings</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{stats.totalJobs}</div>
            </div>
            <Briefcase size={32} color="#a855f7" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <Link to="/admin/jobs" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Manage Jobs &rarr;</Link>
          </div>
        </div>
      </div>

      {stats.totalStudents === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
          <h3>No students registered yet.</h3>
          <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>Newly registered students will appear here automatically.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
