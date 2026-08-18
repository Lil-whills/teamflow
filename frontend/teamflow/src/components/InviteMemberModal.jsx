import React, { useState } from 'react';
import { X, UserPlus, Link2, Check, Copy } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';

const InviteMemberModal = ({ isOpen, onClose, projectId }) => {
  const { addMemberToProject, projects } = useProjectContext();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === projectId) || { code: 'PRJ' };
  const shareableLink = `${window.location.origin}/join/${currentProject.code?.toLowerCase() || 'invite'}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    addMemberToProject(projectId, email.trim());
    setEmail('');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#0e1915] border border-[#1b2f28] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-lg font-bold">Invite Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6e857c] hover:text-white hover:bg-[#162721] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8ca398] block mb-1.5">
              Member Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. crispen@teamflow.app"
              className="w-full bg-[#12211c] border border-[#1f372f] focus:border-[#10b981] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#587369] outline-none transition-all"
            />
            <p className="text-[11px] text-[#5d776d] mt-1">
              Invitees can be assigned to tasks before or after they sign up.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8ca398] hover:text-white rounded-lg hover:bg-[#162721] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-black rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Send Invite
            </button>
          </div>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#172b24]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-[#587369]">OR SHARE LINK</span>
          <div className="flex-grow border-t border-[#172b24]"></div>
        </div>

        {/* Copy Shareable Link */}
        <div className="flex items-center gap-2 p-2 bg-[#0a1310] border border-[#172b24] rounded-xl">
          <Link2 className="w-4 h-4 text-[#8ca398] shrink-0 ml-1" />
          <span className="text-xs text-[#8ca398] truncate flex-1 font-mono">
            {shareableLink}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-[#162822] hover:bg-[#1f382f] border border-[#223d33] text-xs font-medium text-white rounded-lg flex items-center gap-1 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#34d399]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
