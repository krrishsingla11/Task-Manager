import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: '',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      params.set('page', filters.page);
      params.set('limit', '9');
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags?.join(', ') || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      dueDate: form.dueDate || undefined,
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach((e) => { mapped[e.field] = e.message; });
        setFormErrors(mapped);
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => t._id === id ? { ...t, status } : t));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">
              Welcome back, <strong>{user?.name}</strong> — {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <button id="create-task-btn" className="btn btn-secondary" onClick={openCreateModal}>
            + New Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-pill stat-todo">
            <span>{statusCounts.todo}</span> To Do
          </div>
          <div className="stat-pill stat-inprogress">
            <span>{statusCounts['in-progress']}</span> In Progress
          </div>
          <div className="stat-pill stat-done">
            <span>{statusCounts.done}</span> Done
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            id="filter-priority"
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            id="clear-filters-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setFilters({ status: '', priority: '', page: 1 })}
          >
            Clear Filters
          </button>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="task-skeleton" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
            <button className="btn btn-secondary" onClick={openCreateModal}>+ New Task</button>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              id="prev-page-btn"
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={filters.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              id="next-page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Task Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">Title *</label>
            <input
              id="task-title"
              type="text"
              className={`form-input ${formErrors.title ? 'input-error' : ''}`}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {formErrors.title && <span className="form-error">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">Description</label>
            <textarea
              id="task-desc"
              className="form-input form-textarea"
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">Status</label>
              <select
                id="task-status"
                className="form-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">Priority</label>
              <select
                id="task-priority"
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-due" className="form-label">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-tags" className="form-label">Tags (comma separated)</label>
              <input
                id="task-tags"
                type="text"
                className="form-input"
                placeholder="backend, api, urgent"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              id="task-submit-btn"
              type="submit"
              className="btn btn-secondary"
              disabled={submitting}
            >
              {submitting ? <span className="btn-spinner" /> : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
