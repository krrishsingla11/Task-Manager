import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toast } from '../components/Toast';
import api from '../api/axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setUsers(usersRes.data.data.users);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDeactivate = async (userId, userName) => {
    if (!window.confirm(`Deactivate ${userName}?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/deactivate`);
      toast.success(`${userName} deactivated`);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, isActive: false } : u)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage users and view platform statistics</p>
          </div>
          <button id="refresh-admin-btn" className="btn btn-ghost" onClick={fetchData}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-value">{stats.totalUsers}</div>
              <div className="admin-stat-label">Total Users</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value">{stats.totalTasks}</div>
              <div className="admin-stat-label">Total Tasks</div>
            </div>
            <div className="admin-stat-card stat-todo">
              <div className="admin-stat-value">{stats.tasksByStatus.todo}</div>
              <div className="admin-stat-label">To Do</div>
            </div>
            <div className="admin-stat-card stat-inprogress">
              <div className="admin-stat-value">{stats.tasksByStatus['in-progress']}</div>
              <div className="admin-stat-label">In Progress</div>
            </div>
            <div className="admin-stat-card stat-done">
              <div className="admin-stat-value">{stats.tasksByStatus.done}</div>
              <div className="admin-stat-label">Completed</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            id="tab-users"
          >
            Users ({users.length})
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table" id="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'row-inactive' : ''}>
                    <td>
                      <div className="table-user">
                        <span className="table-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={`role-select role-${user.role}`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={!user.isActive}
                        id={`role-select-${user.id}`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-chip ${user.isActive ? 'chip-active' : 'chip-inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.isActive && (
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => handleDeactivate(user.id, user.name)}
                          id={`deactivate-${user.id}`}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
