import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Code2,
  FileCheck,
  FolderGit2,
  Binary,
  Target,
  Briefcase,
  Lightbulb,
  Users,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/student/profile', label: 'Profile', icon: <User size={18} /> },
    { to: '/student/skills', label: 'My Skills', icon: <Code2 size={18} /> },
    { to: '/student/assessments', label: 'Assessments', icon: <FileCheck size={18} /> },
    { to: '/student/projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
    { to: '/student/dsa', label: 'DSA Tracker', icon: <Binary size={18} /> },
    { to: '/student/readiness', label: 'Placement Readiness', icon: <Target size={18} /> },
    { to: '/student/jobs', label: 'Job Matches', icon: <Briefcase size={18} /> },
    { to: '/student/recommendations', label: 'Recommendations', icon: <Lightbulb size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/students', label: 'Students', icon: <Users size={18} /> },
    { to: '/admin/skills', label: 'Master Skills', icon: <Code2 size={18} /> },
    { to: '/admin/assessments', label: 'Assessments', icon: <FileCheck size={18} /> },
    { to: '/admin/jobs', label: 'Job Postings', icon: <Briefcase size={18} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
        </span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
