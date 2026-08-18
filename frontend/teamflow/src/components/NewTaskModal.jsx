import React, { useState } from 'react';
import { X, PlusCircle, Calendar, UserCheck } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';

const NewTaskModal = ({ isOpen, onClose, projectId }) => {
  const { addTask, projects, currentUser } = useProjectContext();
  const [title, setTitle] = useState('');
  const [membername, setMembername] = useState('');
  const [duedate, setDuedate] = useState('');

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === projectId);
  const availableMembers = currentProject?.members || [currentUser.name];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      projectId,
      title: title.trim(),
      membername: membername || availableMembers[0] || currentUser.name,
      duedate: duedate || '2026-08-30'
      // status is automatically TODO by contract
    });

    setTitle('');
    setMembername('');
    setDuedate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#0e1915] border border-[#1b2f28] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <PlusCircle className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-lg font-bold">Add New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6e857c] hover:text-white hover:bg-[#162721] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title with 150 char limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#8ca398]">
                Task Title *
              </label>
              <span className={`text-[11px] font-mono ${title.length >= 130 ? 'text-amber-400' : 'text-[#5d776d]'}`}>
                {title.length}/150
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix mobile navigation header overflow"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none transition-all"
            />
          </div>

          {/* Assignee Dropdown (Strictly project members) */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Assign To Project Member
            </label>
            <select
              value={membername}
              onChange={(e) => setMembername(e.target.value)}
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none cursor-pointer"
            >
              <option value="">Select Assignee</option>
              {availableMembers.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date: Native Calendar Picker */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Due Date (Calendar)
            </label>
            <input
              type="date"
              value={duedate}
              onChange={(e) => setDuedate(e.target.value)}
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          {/* Initial Status indicator (locked to TODO) */}
          <div className="flex items-center justify-between p-3 bg-[#0a1310] border border-[#162721] rounded-xl text-xs text-[#7e998e]">
            <span>Initial Column:</span>
            <span className="font-mono font-bold text-slate-300 bg-[#162822] px-2 py-0.5 rounded border border-slate-600">
              TODO
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8ca398] hover:text-white rounded-lg hover:bg-[#162721] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-black rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
