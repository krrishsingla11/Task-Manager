import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Password must contain a number';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.data.token, res.data.data.user);
      toast.success('Welcome to Primetrade, ' + res.data.data.user.name + '!');
      navigate('/dashboard');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach((e) => { mapped[e.field] = e.message; });
        setErrors(mapped);
      } else {
        const msg = err.response?.data?.message || 'Registration failed';
        toast.error(msg);
        setErrors({ server: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (p.length >= 10) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

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

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join and start managing tasks</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="form-label">Password</label>
            <input
              id="reg-password"
              type="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Min 6 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-segment"
                      style={{ background: i <= strength ? strengthColors[strength] : '#1e293b' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {errors.server && (
            <div className="alert alert-error">{errors.server}</div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-secondary btn-full"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" id="go-to-login">Sign In →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
