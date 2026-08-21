import React, { useState } from 'react';
import { X, Send, Clock, UserCheck, Calendar, Trash2, Edit3, Check, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const TaskDetailDrawer = ({ taskId, onClose }) => {
  const {
    tasks,
    projects,
    currentProject,
    currentUser,
    updateTaskStatus,
    addComment,
    editTask,
    deleteTask
  } = useProjectContext();

  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [permissionWarning, setPermissionWarning] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Find task by code or ID
  const task = tasks.find(t => t.code === taskId || String(t.id) === String(taskId));
  if (!task) return null;

  const project =
    currentProject ||
    projects.find(p => p.code === task.project_code || p.id === task.project) || {
      title: 'Project',
      code: 'PROJ',
      owner_email: ''
    };

  const isOwner =
    project.owner_email &&
    currentUser?.email &&
    project.owner_email.toLowerCase() === currentUser.email.toLowerCase();

  const isAssignee =
    (task.assignee_email &&
      currentUser?.email &&
      task.assignee_email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (task.assignee_name &&
      currentUser?.username &&
      task.assignee_name.toLowerCase() === currentUser.username.toLowerCase());

  // STRICT DOMAIN RULE: ONLY the assigned member can update task status
  const canModifyStatus = isAssignee;

  const handleStatusChange = async (newStatus) => {
    if (!canModifyStatus) {
      const assigneeLabel = task.assignee_name || task.assignee_email || 'the assigned member';
      setPermissionWarning(
        `Permission denied: Only ${assigneeLabel} has permission to update this task's status.`
      );
      setTimeout(() => setPermissionWarning(''), 3500);
      return;
    }

    try {
      setActionLoading(true);
      await updateTaskStatus(project.code, task.code, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      setIsSubmittingComment(true);
      await addComment(project.code, task.code, commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDueDate(task.due_date || '');
    setIsEditing(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      setActionLoading(true);
      await editTask(project.code, task.code, {
        title: editTitle.trim(),
        due_date: editDueDate || null
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to edit task:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      try {
        setActionLoading(true);
        await deleteTask(project.code, task.code);
        onClose();
      } catch (err) {
        console.error('Failed to delete task:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const statuses = [
    { id: 'TODO', label: 'TODO' },
    { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { id: 'DONE', label: 'DONE' }
  ];

  const assigneeDisplayName =
    task.assignee_name || (task.assignee_email ? task.assignee_email.split('@')[0] : 'Unassigned');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-w-full sm:max-w-lg bg-[#0e1915] sm:border-l border-[#192d26] h-full flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="text-xs font-mono tracking-wider text-[#6f887f] uppercase">
                {project.code} / {task.code}
              </span>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    maxLength={150}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#13241e] border border-[#203c31] rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#10b981] outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="bg-[#13241e] border border-[#203c31] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-[#10b981] text-black text-xs font-semibold rounded-lg hover:bg-[#059669]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-xs text-[#8ca398] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white tracking-tight mt-1 leading-snug">
                  {task.title}
                </h2>
              )}

              {task.description && (
                <p className="text-xs text-[#8da59a] mt-2 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Owner actions: Edit and Delete */}
              {isOwner && !isEditing && (
                <>
                  <button
                    onClick={startEdit}
                    title="Edit task"
                    className="p-1.5 rounded-lg text-[#6e857c] hover:text-white hover:bg-[#162721] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    title="Delete task"
                    className="p-1.5 rounded-lg text-[#6e857c] hover:text-red-400 hover:bg-[#201515] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#6e857c] hover:text-white hover:bg-[#162721] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Selector Section */}
          <div>
            <label className="text-xs font-medium text-[#7d968b] block mb-2">
              Status Progression
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#0a1410] border border-[#162721] p-1.5 rounded-xl">
              {statuses.map(s => {
                const isActive = task.status === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    disabled={actionLoading}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? s.id === 'DONE'
                          ? 'bg-[#10b981] text-black shadow-md'
                          : s.id === 'IN_PROGRESS'
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-slate-200 text-black shadow-md'
                        : 'text-[#6e857c] hover:text-white hover:bg-[#13241e]'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Permission feedback warning banner */}
            {permissionWarning && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-200 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{permissionWarning}</span>
              </div>
            )}
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[#0a1310] border border-[#152721] rounded-2xl p-4">
            {/* Assignee */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#6e857c] uppercase flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Assignee
              </span>
              <div className="flex items-center gap-2 pt-1">
                <Avatar name={assigneeDisplayName} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-white truncate">
                    {assigneeDisplayName}
                  </span>
                  {task.assignee_email && (
                    <span className="text-[10px] text-[#6e857c] truncate">
                      {task.assignee_email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#6e857c] uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </span>
              <div className="pt-1">
                <span className="text-xs font-medium text-[#cbe0d6]">
                  {task.due_date || 'No due date set'}
                </span>
              </div>
            </div>
          </div>

          {/* Discussion & Activity Thread */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8ca398]">
              Discussion ({task.comments?.length || 0})
            </h4>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-xs text-[#587369] italic py-2">
                  No discussion comments yet. Start the conversation below.
                </p>
              )}

              {task.comments?.map((comment, idx) => {
                const authorDisplay =
                  comment.author_name ||
                  (comment.author_details ? comment.author_details.username : 'Member');
                const timeDisplay = comment.created_at
                  ? new Date(comment.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '';

                return (
                  <div
                    key={comment.id || idx}
                    className="bg-[#0b1612] border border-[#162721] rounded-xl p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={authorDisplay} size="xs" />
                        <span className="text-xs font-semibold text-white">
                          {authorDisplay}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5e776d] font-mono">
                        {timeDisplay}
                      </span>
                    </div>
                    <p className="text-xs text-[#b8cfc5] pl-6 leading-relaxed">
                      {comment.comment || comment.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Comment Input */}
        <div className="p-4 border-t border-[#172b24] bg-[#09110e]">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#12211c] border border-[#1e382f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#587369] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentInput.trim()}
              className="p-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-black rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
