import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Calendar, UserCheck } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';

const NewTaskModal = ({ isOpen, onClose, projectCode }) => {
  const { addTask, getAssignees } = useProjectContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneesList, setAssigneesList] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch eligible assignees whenever modal opens
  useEffect(() => {
    if (isOpen && projectCode) {
      setLoadingAssignees(true);
      getAssignees(projectCode)
        .then(data => {
          setAssigneesList(data || []);
          if (data && data.length > 0) {
            setAssigneeEmail(data[0].email);
          }
        })
        .finally(() => setLoadingAssignees(false));
    }
  }, [isOpen, projectCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await addTask(projectCode, {
        title: title.trim(),
        description: description.trim(),
        assignee_email: assigneeEmail || null,
        due_date: dueDate || null
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      onClose();
    } catch (err) {
      const serverErr = err.response?.data;
      const message =
        serverErr?.title?.[0] ||
        serverErr?.assignee_email?.[0] ||
        serverErr?.message ||
        'Failed to add task.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-[#0e1915] border border-[#1b2f28] rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

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
              placeholder="e.g. Design hero section wireframes"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context or instructions..."
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none resize-none transition-all"
            />
          </div>

          {/* Single Assignee Selection (Scoped strictly to this project's members) */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5">
              Assignee
            </label>
            <div className="relative">
              <select
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                disabled={loadingAssignees}
                className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
              >
                {loadingAssignees ? (
                  <option value="">Loading members...</option>
                ) : assigneesList.length === 0 ? (
                  <option value="">No members invited yet</option>
                ) : (
                  assigneesList.map((option, idx) => (
                    <option key={idx} value={option.email} className="bg-[#0e1915] text-white">
                      {option.name} ({option.email}) [{option.status}]
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6e857c]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-[#5d776d] mt-1">
              Strictly 1 assignee per task from this project's team.
            </p>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6e857c]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Initial Status Note */}
          <div className="text-[11px] font-mono text-[#6e857c] bg-[#0a1310] border border-[#162721] p-2.5 rounded-lg flex items-center justify-between">
            <span>INITIAL STATUS:</span>
            <span className="text-[#34d399] font-bold">TODO</span>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-black rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
