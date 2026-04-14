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

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  // ✅ FIXED: correct API docs base URL
  const API_DOCS_URL =
    import.meta.env.VITE_API_URL.replace('/api/v1', '') + '/api-docs';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-text">Primetrade</span>
        <span className="brand-sub">TaskManager</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>
          Dashboard
        </Link>

        {isAdmin() && (
          <Link to="/admin" className={isActive('/admin')}>
            Admin Panel
          </Link>
        )}

        {/* ✅ FIXED LINK */}
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          API Docs
        </a>
      </div>

      <div className="navbar-user">
        <div className="user-badge">
          <span className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role role-${user?.role}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          id="logout-btn"
          className="btn btn-ghost"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
