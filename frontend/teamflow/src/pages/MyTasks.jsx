import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, CircleDashed, Clock, Check } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useProjectContext } from '../context/ProjectContext';

const MyTasks = () => {
  const {
    currentUser,
    myTasksList,
    projects,
    fetchMyTasks,
    updateTaskStatus,
    setSelectedTaskId
  } = useProjectContext();

  const [filter, setFilter] = useState('ALL'); // 'ALL', 'TODO', 'IN_PROGRESS', 'DONE'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMyTasks().finally(() => setLoading(false));
  }, []);

  const filteredTasks = myTasksList.filter(t => {
    if (filter === 'ALL') return true;
    return t.status?.toUpperCase() === filter;
  });

  const getProjectName = (task) => {
    const p = projects.find(proj => proj.id === task.project || proj.code === task.project_code);
    return p ? p.title : 'Project';
  };

  const getProjectCode = (task) => {
    const p = projects.find(proj => proj.id === task.project || proj.code === task.project_code);
    return p ? p.code : 'PROJ';
  };

  const userName = currentUser?.username || currentUser?.name || 'You';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#10b981]" />
            My Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba298] mt-1">
            Tasks assigned directly to <span className="text-white font-medium">{userName}</span>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0f1d18] border border-[#1a2e26] p-1 rounded-xl overflow-x-auto max-w-full">
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filter === f
                  ? 'bg-[#182c25] text-[#34d399] shadow-xs'
                  : 'text-[#7e998e] hover:text-white'
              }`}
            >
              {f === 'IN_PROGRESS' ? 'IN PROGRESS' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 pt-2">
        {filteredTasks.map(task => {
          const isDone = task.status === 'DONE';
          const isInProgress = task.status === 'IN_PROGRESS';
          const projCode = getProjectCode(task);

          return (
            <div
              key={task.code || task.id}
              className="bg-[#111e19] hover:bg-[#152520] border border-[#1b2f28] hover:border-[#264137] rounded-xl p-4 transition-all duration-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div
                onClick={() => setSelectedTaskId(task.code || task.id)}
                className="flex items-start gap-3.5 cursor-pointer flex-1"
              >
                <div className="pt-0.5">
                  <Avatar name={userName} size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-[#6e857c] uppercase">
                      {projCode} / {task.code}
                    </span>
                    <span className="text-[11px] text-[#557065]">·</span>
                    <span className="text-[11px] text-[#8ca398]">
                      {getProjectName(task)}
                    </span>
                  </div>
                  <h4
                    className={`text-sm font-semibold transition-all ${
                      isDone ? 'line-through text-[#6a8277]' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[#7e998e] mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due:{' '}
                      {task.due_date || 'Soon'}
                    </span>
                    {task.comments?.length > 0 && (
                      <span>· {task.comments.length} comments</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Status Switcher */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => updateTaskStatus(projCode, task.code, 'TODO')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    task.status === 'TODO'
                      ? 'bg-slate-700 text-white border-slate-400 font-semibold'
                      : 'bg-[#14241e] text-[#718b80] border-[#1e362d] hover:border-[#2f4f43]'
                  }`}
                >
                  TODO
                </button>

                <button
                  type="button"
                  onClick={() => updateTaskStatus(projCode, task.code, 'IN_PROGRESS')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    isInProgress
                      ? 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b] font-semibold'
                      : 'bg-[#14241e] text-[#718b80] border-[#1e362d] hover:border-[#2f4f43]'
                  }`}
                >
                  IN PROGRESS
                </button>

                <button
                  type="button"
                  onClick={() => updateTaskStatus(projCode, task.code, 'DONE')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    isDone
                      ? 'bg-[#10b981]/20 text-[#34d399] border-[#10b981] font-semibold'
                      : 'bg-[#14241e] text-[#718b80] border-[#1e362d] hover:border-[#2f4f43]'
                  }`}
                >
                  DONE
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-16 border border-dashed border-[#1a2f26] rounded-2xl bg-[#0e1915]/50">
            <CheckCircle2 className="w-10 h-10 text-[#50695f] mx-auto mb-2" />
            <p className="text-sm text-[#8ba298] font-medium">No tasks found matching this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
