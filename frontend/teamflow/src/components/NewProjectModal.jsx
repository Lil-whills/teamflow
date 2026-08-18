import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { useProjectContext, generateProjectCode } from '../context/ProjectContext';

const NewProjectModal = ({ isOpen, onClose }) => {
  const { addProject, projects } = useProjectContext();
  const [title, setTitle] = useState('');
  const [emailsInput, setEmailsInput] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const previewCode = generateProjectCode(title, projects);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const memberEmails = emailsInput
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    addProject({
      title: title.trim(),
      code: previewCode,
      members: memberEmails,
      description: description.trim()
    });

    setTitle('');
    setEmailsInput('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#0e1915] border border-[#1b2f28] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FolderPlus className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-lg font-bold">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6e857c] hover:text-white hover:bg-[#162721] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Title with character limit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#8ca398]">
                Project Title *
              </label>
              <span className={`text-[11px] font-mono ${title.length >= 90 ? 'text-amber-400' : 'text-[#5d776d]'}`}>
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marketing Site Launch"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none transition-all"
            />
          </div>

          {/* Auto-generated Code Preview */}
          <div className="bg-[#0a1310] border border-[#172b24] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span className="text-xs text-[#8ca398]">Auto-generated Key:</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#34d399] bg-[#12221d] px-2.5 py-1 rounded-md border border-[#1e382f]">
              {previewCode}
            </span>
          </div>

          {/* Invite Members via Emails */}
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5">
              Invite Members via Email (comma-separated)
            </label>
            <input
              type="text"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="e.g. alice@teamflow.app, bob@teamflow.app"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none transition-all"
            />
            <p className="text-[11px] text-[#5d776d] mt-1">
              Invitees will automatically see this board upon sign-in.
            </p>
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
              placeholder="What is this project aiming to accomplish?"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none resize-none transition-all"
            />
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
              className="px-4 py-2.5 text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-black rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
