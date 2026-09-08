import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auth/students');
        setStudents(res.data);
      } catch (error) {
        console.error('Error fetching student list', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching registered students..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Students</h1>
          <p className="page-subtitle">View all registered student accounts in SkillTrack platform.</p>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="No students registered yet"
          message="Registered student accounts will automatically populate in this table."
        />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="user-badge">{student.role}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
