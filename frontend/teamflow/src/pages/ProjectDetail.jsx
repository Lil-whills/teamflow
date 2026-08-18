import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, UserPlus, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Avatar from '../components/Avatar';
import NewTaskModal from '../components/NewTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { useProjectContext } from '../context/ProjectContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { projects, tasks, currentUser, completeProject } = useProjectContext();
  
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const project = projects.find(p => p.id === id) || projects[0] || {
    id: 'unknown',
    code: 'PROJ',
    title: 'Project not found',
    role: 'owner',
    owner: 'Williams',
    isCompleted: false,
    members: ['Williams']
  };

  const isOwner = project.owner?.toLowerCase() === currentUser.name?.toLowerCase() || project.role === 'owner';

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const todoTasks = projectTasks.filter(t => t.status?.toUpperCase() === 'TODO');
  const inProgressTasks = projectTasks.filter(t => t.status?.toUpperCase() === 'IN PROGRESS');
  const doneTasks = projectTasks.filter(t => t.status?.toUpperCase() === 'DONE');

  const allTasksCompleted = projectTasks.length > 0 && doneTasks.length === projectTasks.length;

  const columns = [
    {
      id: 'TODO',
      label: 'TODO',
      dotColor: 'bg-slate-400',
      tasks: todoTasks,
      count: todoTasks.length
    },
    {
      id: 'IN PROGRESS',
      label: 'IN PROGRESS',
      dotColor: 'bg-amber-400',
      tasks: inProgressTasks,
      count: inProgressTasks.length
    },
    {
      id: 'DONE',
      label: 'DONE',
      dotColor: 'bg-emerald-400',
      tasks: doneTasks,
      count: doneTasks.length
    }
  ];

  const membersFormatted = project.members
    ? project.members
        .map(m => (m.toLowerCase() === project.owner?.toLowerCase() ? `${m} (owner)` : m))
        .join(', ')
    : '';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#6e857c] uppercase mb-1.5">
            <Link to="/projects" className="hover:text-white transition-colors">
              PROJECTS
            </Link>
            <span>/</span>
            <span className="text-[#34d399] font-semibold">{project.code}</span>
            {project.isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] text-[10px] font-mono border border-[#10b981]/30">
                COMPLETED
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {project.title}
          </h1>

          {/* Member Avatars and names */}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {project.members?.map((m, idx) => (
                <Avatar key={idx} name={m} size="sm" showTooltip className="ring-2 ring-[#0c1512]" />
              ))}
            </div>
            <span className="text-xs text-[#8ca398] font-medium">
              {membersFormatted}
            </span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-[#12221d] hover:bg-[#182c26] border border-[#223d33] hover:border-[#10b981]/50 text-white hover:text-[#34d399] px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-[#8ca398]" />
            <span>Invite member</span>
          </button>

          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* Completion Banner (When all tasks are DONE) */}
      {allTasksCompleted && !project.isCompleted && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#10b981]/15 via-[#065f46]/20 to-[#10b981]/15 border border-[#10b981]/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#34d399]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                All {projectTasks.length} tasks completed!
              </h4>
              <p className="text-xs text-[#9fd3c0]">
                All team members have marked their tasks as done. Ready for final owner review.
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => completeProject(project.id)}
              className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mark Project as Complete</span>
            </button>
          )}
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {columns.map(col => (
          <div
            key={col.id}
            className="flex flex-col bg-[#0b1612]/50 border border-[#172b24] rounded-2xl p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#172b24]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-mono font-bold tracking-wider text-[#d1d5db]">
                  {col.label}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#8ca398] bg-[#142620] px-2 py-0.5 rounded-full border border-[#1e382f]">
                {col.count}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {col.tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}

              {col.tasks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#526a61] border border-dashed border-[#182c25] rounded-xl">
                  No tasks in {col.label.toLowerCase()}
                </div>
              )}
            </div>

            {/* Add Task Button at bottom of TODO column */}
            {col.id === 'TODO' && (
              <button
                onClick={() => setIsNewTaskOpen(true)}
                className="mt-3 w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-[#7a958a] hover:text-white bg-[#101e19] hover:bg-[#152721] border border-[#1b2f28] hover:border-[#27443a] rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        projectId={project.id}
      />

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        projectId={project.id}
      />
    </div>
  );
};

export default ProjectDetail;