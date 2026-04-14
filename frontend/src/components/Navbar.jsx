import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-text">Primetrade</span>
        <span className="brand-sub">TaskManager</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        {isAdmin() && (
          <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
        )}
        <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" className="nav-link">
          API Docs
        </a>
      </div>

      <div className="navbar-user">
        <div className="user-badge">
          <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        <button id="logout-btn" className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
