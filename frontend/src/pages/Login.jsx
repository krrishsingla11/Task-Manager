import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.data.token, res.data.data.user);
      toast.success('Welcome back, ' + res.data.data.user.name + '!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ server: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">⚡</span>
          <h1 className="auth-brand">Primetrade</h1>
          <p className="auth-brand-sub">Task Manager</p>
        </div>

        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Access your productivity dashboard</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {errors.server && (
            <div className="alert alert-error">{errors.server}</div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-secondary btn-full"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : 'Sign In →'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="go-to-register">Create one →</Link>
        </p>

        <div className="demo-creds">
          <p className="demo-label">🔑 Demo Credentials</p>
          <div className="demo-grid">
            <div>
              <span className="demo-role">Admin</span>
              <code>admin@primetrade.ai</code>
              <code>Admin1234</code>
            </div>
            <div>
              <span className="demo-role">User</span>
              <code>user@primetrade.ai</code>
              <code>User1234</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
