import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { currentUser } = useProjectContext();

  const isOwner = project.owner_email && currentUser?.email && (project.owner_email.toLowerCase() === currentUser.email.toLowerCase());
  const role = isOwner ? 'owner' : 'member';

  const openTasks = project.open_tasks_count !== undefined ? project.open_tasks_count : 0;
  const totalMembers = project.total_members_count !== undefined ? project.total_members_count : (project.members_emails?.length || 1);
  const isDone = project.status === 'DONE';

  const handleCardClick = () => {
    navigate(`/project/${project.code}`);
  };

  const membersList = project.members_emails || [project.owner_email || 'Owner'];

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

        <div className="flex items-center gap-1.5 shrink-0">
          {isDone && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#34d399] bg-[#10b981]/15 border border-[#10b981]/30 px-2 py-0.5 rounded text-center">
              done
            </span>
          )}
          <span className="text-[11px] font-mono lowercase tracking-wider text-[#8da69b] bg-[#172722] border border-[#233c33] px-2 py-0.5 rounded text-center">
            {role}
          </span>
        </div>
      </div>

      {/* Bottom row: Members stack and Task stats */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#162721]">
        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {membersList.slice(0, 4).map((memberEmail, index) => (
            <Avatar
              key={index}
              name={memberEmail.split('@')[0]}
              size="sm"
              showTooltip
              className="ring-2 ring-[#111e19] group-hover:ring-[#152520]"
            />
          ))}
          {membersList.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-[#1b2e28] text-[10px] font-medium text-[#94a89f] ring-2 ring-[#111e19] flex items-center justify-center">
              +{membersList.length - 4}
            </div>
          )}
        </div>

        {/* Task Metrics */}
        <div className="text-xs text-[#8ca398] font-medium flex items-center gap-1.5">
          {openTasks > 0 ? (
            <>
              <span className="text-white font-semibold">{openTasks}</span> open ·{' '}
              <span>{totalMembers}</span> {totalMembers === 1 ? 'member' : 'members'}
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