import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, UserPlus, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import Avatar from '../components/Avatar';
import NewTaskModal from '../components/NewTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { useProjectContext } from '../context/ProjectContext';

const ProjectDetail = () => {
  const { id } = useParams(); // id can be project code (e.g. MSL-01) or numeric ID
  const {
    projects,
    currentProject,
    tasks,
    currentUser,
    fetchProjectDetails,
    completeProject,
    loading
  } = useProjectContext();

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionError, setCompletionError] = useState('');

  // 1. Fetch live project and tasks on mount or route change
  useEffect(() => {
    if (id) {
      fetchProjectDetails(id);
    }
  }, [id]);

  const project = currentProject || projects.find(p => p.code === id || String(p.id) === String(id)) || {
    code: id || 'PROJ',
    title: 'Loading Project...',
    owner_email: '',
    status: 'TODO',
    members_emails: []
  };

  const isOwner =
    project.owner_email &&
    currentUser?.email &&
    project.owner_email.toLowerCase() === currentUser.email.toLowerCase();

  const isCompleted = project.status === 'DONE';

  // 2. Filter tasks into 3 columns
  const todoTasks = tasks.filter(t => t.status?.toUpperCase() === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status?.toUpperCase() === 'DONE');

  const allTasksCompleted = tasks.length > 0 && doneTasks.length === tasks.length;

  const columns = [
    {
      id: 'TODO',
      label: 'TODO',
      dotColor: 'bg-slate-400',
      tasks: todoTasks,
      count: todoTasks.length
    },
    {
      id: 'IN_PROGRESS',
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

  const membersList = project.members_emails || (project.owner_email ? [project.owner_email] : []);

  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      setCompletionError('');
      await completeProject(project.code);
    } catch (err) {
      setCompletionError(err.response?.data?.status || 'Failed to complete project.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#6e857c] uppercase mb-1.5">
            <Link to="/projects" className="hover:text-white transition-colors">
              PROJECTS
            </Link>
            <span>/</span>
            <span className="text-[#34d399] font-semibold">{project.code}</span>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#34d399] text-[10px] font-mono border border-[#10b981]/30">
                COMPLETED
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {project.title}
          </h1>

          {/* Member Avatars and names */}
          <div className="flex items-center gap-2.5 sm:gap-3 mt-2">
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {membersList.map((m, idx) => (
                <Avatar
                  key={idx}
                  name={m.split('@')[0]}
                  size="sm"
                  showTooltip
                  className="ring-2 ring-[#0c1512]"
                />
              ))}
            </div>
            <span className="text-xs text-[#8ca398] font-medium truncate max-w-[200px] sm:max-w-none">
              {membersList.length} {membersList.length === 1 ? 'member' : 'members'} ·{' '}
              <span className="text-[#34d399]">{project.owner_email ? `${project.owner_email.split('@')[0]} (Owner)` : ''}</span>
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons (Owner only) */}
        {isOwner && (
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#13231d] hover:bg-[#1a3128] border border-[#1f3b30] hover:border-[#10b981]/40 text-[#c8ded4] hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#10b981]" />
              <span>Invite</span>
            </button>

            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add task</span>
            </button>
          </div>
        )}
      </div>

      {/* Completion Error Alert */}
      {completionError && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
          {completionError}
        </div>
      )}

      {/* Dynamic Project Completion Banner (When all tasks are DONE) */}
      {allTasksCompleted && !isCompleted && (
        <div className="bg-[#122720] border border-[#1b4334] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                All subtasks completed!
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <p className="text-xs text-[#8ca398] mt-0.5">
                {isOwner
                  ? 'All tasks are marked DONE. You can conduct a final review and mark the project as completed.'
                  : 'All tasks are done! Awaiting final review from project owner.'}
              </p>
            </div>
          </div>

          {/* Mark Project Complete Action (Only visible to Owner) */}
          {isOwner && (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-black text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{completing ? 'Completing...' : 'Mark project complete'}</span>
            </button>
          )}
        </div>
      )}

      {/* Kanban Board Columns (3 Columns: TODO, IN PROGRESS, DONE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
        {columns.map(col => (
          <div
            key={col.id}
            className="bg-[#0e1814] border border-[#172922] rounded-2xl p-4 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#172922]">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {col.label}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#13241e] text-[11px] font-mono font-semibold text-[#8ca398] border border-[#1b332b]">
                {col.count}
              </span>
            </div>

            {/* Tasks Container */}
            <div className="space-y-3 flex-1">
              {col.tasks.map(task => (
                <TaskCard key={task.code || task.id} task={task} projectCode={project.code} />
              ))}

              {col.tasks.length === 0 && (
                <div className="h-32 border border-dashed border-[#182c24] rounded-xl flex items-center justify-center text-xs text-[#526a60] font-mono">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        projectCode={project.code}
      />

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        projectCode={project.code}
      />
    </div>
  );
};

export default ProjectDetail;