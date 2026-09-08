import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', display: 'flex' }}
        >
          <Menu size={18} />
        </button>
        <div className="navbar-brand">
          <span className="brand-icon">⚡</span> SkillTrack
        </div>
      </div>

      {user && (
        <div className="user-nav-info">
          <span className={`user-badge ${user.role === 'admin' ? 'admin-badge' : ''}`}>
            {user.role}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
