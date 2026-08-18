import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { tasks } = useProjectContext();

  // Calculate project statistics
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const openTasksCount = projectTasks.filter(t => t.status !== 'DONE').length;
  const totalMembers = project.members?.length || 0;

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#111e19] hover:bg-[#152520] border border-[#1b2f28] hover:border-[#2a483e] rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between min-h-[140px]"
    >
      {/* Top row: Title and Role badge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#6e857c] uppercase tracking-wider mb-1 block">
            {project.code || 'PROJECT'}
          </span>
          <h3 className="text-base font-semibold text-white group-hover:text-[#34d399] transition-colors leading-snug">
            {project.title}
          </h3>
        </div>

        <span className="text-[11px] font-mono lowercase tracking-wider text-[#8da69b] bg-[#172722] border border-[#233c33] px-2 py-0.5 rounded text-center shrink-0">
          {project.role || 'member'}
        </span>
      </div>

      {/* Bottom row: Members stack and Task stats */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#162721]">
        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {project.members && project.members.slice(0, 4).map((memberName, index) => (
            <Avatar
              key={index}
              name={memberName}
              size="sm"
              showTooltip
              className="ring-2 ring-[#111e19] group-hover:ring-[#152520]"
            />
          ))}
          {project.members && project.members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-[#1b2e28] text-[10px] font-medium text-[#94a89f] ring-2 ring-[#111e19] flex items-center justify-center">
              +{project.members.length - 4}
            </div>
          )}
        </div>

        {/* Task Metrics */}
        <div className="text-xs text-[#8ca398] font-medium flex items-center gap-1.5">
          {openTasksCount > 0 ? (
            <>
              <span className="text-white font-semibold">{openTasksCount}</span> open ·{' '}
              <span>{totalMembers}</span> members
            </>
          ) : (
            <span className="text-[#34d399] font-medium">0 open · all tasks done</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;