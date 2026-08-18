import React, { useState } from 'react';
import { X, Send, Clock, UserCheck, Calendar, Trash2, Edit3, Check, AlertCircle } from 'lucide-react';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const TaskDetailDrawer = ({ taskId, onClose }) => {
  const { tasks, projects, currentUser, updateTaskStatus, addComment, editTask, deleteTask } = useProjectContext();
  const [commentInput, setCommentInput] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [permissionWarning, setPermissionWarning] = useState('');

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const project = projects.find(p => p.id === task.projectId) || {
    title: 'Project',
    code: 'PROJ',
    owner: 'Williams',
    members: [task.membername || currentUser.name]
  };

  const isOwner = project.owner?.toLowerCase() === currentUser.name?.toLowerCase() || project.role === 'owner';
  const isAssignee = task.membername?.toLowerCase() === currentUser.name?.toLowerCase();
  const canModifyStatus = isOwner || isAssignee;

  const handleStatusChange = (newStatus) => {
    if (!canModifyStatus) {
      setPermissionWarning(`Only ${task.membername || 'the assigned member'} or project owner can update this status.`);
      setTimeout(() => setPermissionWarning(''), 3000);
      return;
    }
    updateTaskStatus(task.id, newStatus);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput);
    setCommentInput('');
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditAssignee(task.membername || '');
    setEditDueDate(task.duedate || '');
    setIsEditing(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    editTask(task.id, {
      title: editTitle.trim(),
      membername: editAssignee || task.membername,
      duedate: editDueDate || task.duedate
      // Preserves current status!
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  const statuses = [
    { id: 'TODO', label: 'TODO' },
    { id: 'IN PROGRESS', label: 'IN PROGRESS' },
    { id: 'DONE', label: 'DONE' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-w-lg bg-[#0e1915] border-l border-[#192d26] h-full flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs font-mono tracking-wider text-[#6f887f] uppercase">
                {project.code || 'MSL-01'} / {task.code || 'TASK'}
              </span>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    maxLength={150}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#12211c] border border-[#10b981] rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="px-3 py-1 bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs rounded-md transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-xs text-[#8ca398] hover:text-white rounded-md hover:bg-[#162721]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-white mt-1 leading-snug">
                  {task.title}
                </h2>
              )}

              <p className="text-xs text-[#8ca398] mt-0.5">
                in <span className="text-white font-medium">{project.title}</span>
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {isOwner && !isEditing && (
                <>
                  <button
                    onClick={startEdit}
                    title="Edit task details"
                    className="p-1.5 rounded-lg text-[#748e84] hover:text-white hover:bg-[#162721] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    title="Delete task"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#748e84] hover:text-white hover:bg-[#162721] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Warning Banner */}
          {permissionWarning && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-xs text-amber-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{permissionWarning}</span>
            </div>
          )}

          <hr className="border-[#172b24]" />

          {/* Status Switcher Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#7d988e]">
                Status
              </label>
              {!canModifyStatus && (
                <span className="text-[11px] text-[#5e776e]">
                  (Assigned to {task.membername})
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map(s => {
                const isActive = task.status?.toUpperCase() === s.id;
                let activeClasses = 'bg-[#152721] text-[#93ab9f] border-[#223d33] hover:border-[#2f5346]';
                
                if (isActive) {
                  if (s.id === 'TODO') {
                    activeClasses = 'bg-[#1c2c26] text-white border-slate-400 font-semibold shadow-xs';
                  } else if (s.id === 'IN PROGRESS') {
                    activeClasses = 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b] font-semibold shadow-xs';
                  } else if (s.id === 'DONE') {
                    activeClasses = 'bg-[#10b981]/15 text-[#34d399] border-[#10b981] font-semibold shadow-xs';
                  }
                }

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStatusChange(s.id)}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all duration-150 flex items-center justify-center gap-1.5 ${activeClasses}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee Section */}
          <div>
            <label className="text-xs font-medium text-[#7d988e] block mb-2">
              Assignee
            </label>
            {isEditing ? (
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full bg-[#12211c] border border-[#10b981] rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                {project.members?.map((m, idx) => (
                  <option key={idx} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.membername ? (
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#14241e] border border-[#223d33] text-sm text-white font-medium shadow-xs">
                    <Avatar name={task.membername} size="sm" />
                    <span>{task.membername}</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#718c81] italic">No assignee assigned</div>
                )}
              </div>
            )}
          </div>

          {/* Metadata: Due date & Created by */}
          <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#172b24]">
            <div>
              <span className="text-xs text-[#7d988e] block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due
              </span>
              {isEditing ? (
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="bg-[#12211c] border border-[#10b981] rounded-lg px-2 py-1 text-xs text-white outline-none [color-scheme:dark]"
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {task.duedate || 'Not set'}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-[#7d988e] block mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Created by
              </span>
              <div className="flex items-center gap-1.5">
                <Avatar name={task.createdBy || currentUser.name} size="xs" />
                <span className="text-sm font-medium text-white">
                  {task.createdBy || currentUser.name}
                </span>
              </div>
            </div>
          </div>

          {/* Discussion Section */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Discussion · <span>{task.comments?.length || 0}</span>
              </h3>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map(c => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.author} size="xs" />
                      <span className="text-xs font-semibold text-white">{c.author}</span>
                      <span className="text-[11px] text-[#6e857c]">{c.time}</span>
                    </div>
                    <div className="ml-6 p-3 rounded-lg bg-[#12211b] border border-[#1b2f28] text-xs text-[#d1d5db] leading-relaxed">
                      {c.text}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6e857c] italic py-2">
                  No comments yet. Start the conversation below.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Composer */}
        <div className="p-4 border-t border-[#172b24] bg-[#0b1511]">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
            <Avatar name={currentUser.name} size="sm" />
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-lg px-3 py-2 text-xs text-white placeholder-[#587369] outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-2 rounded-lg bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:hover:bg-[#10b981] text-black font-semibold transition-all shadow-xs"
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
