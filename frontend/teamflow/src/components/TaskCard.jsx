import React from 'react';
import Avatar from './Avatar';
import { User, MessageSquare } from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';

const TaskCard = ({ task }) => {
  const { setSelectedTaskId } = useProjectContext();

  const isDone = task.status === 'DONE';
  const commentCount = task.comments?.length || 0;

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className="group bg-[#111e19] hover:bg-[#152620] border border-[#1b2f28] hover:border-[#254036] rounded-xl p-4 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-3"
    >
      {/* Title */}
      <h4 className="text-sm font-medium text-[#f1f5f9] group-hover:text-white leading-relaxed">
        {task.title}
      </h4>

      {/* Footer Info: Assignee & Due Date / Comments */}
      <div className="flex items-center justify-between text-xs text-[#8ca398] pt-1">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          {task.membername ? (
            <div className="flex items-center gap-1.5">
              <Avatar name={task.membername} size="sm" showTooltip />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-[#2f4940] flex items-center justify-center text-[#556d64]">
              <User className="w-3 h-3" />
            </div>
          )}

          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-[#718a7f]">
              <MessageSquare className="w-3 h-3" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {/* Due Date or Completed Status */}
        <span className={`text-xs font-medium ${isDone ? 'text-[#34d399]' : 'text-[#8ca398]'}`}>
          {isDone ? `Done ${task.duedate || ''}` : `Due ${task.duedate || 'Soon'}`}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;