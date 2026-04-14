import { useState } from 'react';

const PRIORITY_COLORS = { low: 'green', medium: 'yellow', high: 'red' };
const STATUS_ICONS = { todo: '○', 'in-progress': '◑', done: '●' };

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    await onDelete(task._id);
    setDeleting(false);
  };

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'done' ? 'task-done' : ''}`}>
      <div className="task-header">
        <span className={`status-badge status-${task.status}`}>
          {STATUS_ICONS[task.status]} {task.status}
        </span>
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="task-meta">
        {task.owner?.name && (
          <span className="task-owner">👤 {task.owner.name}</span>
        )}
        {dueDateStr && (
          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? '⚠️' : '📅'} {dueDateStr}
          </span>
        )}
      </div>

      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          id={`status-${task._id}`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(task)}
          id={`edit-task-${task._id}`}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={handleDelete}
          disabled={deleting}
          id={`delete-task-${task._id}`}
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
