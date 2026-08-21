import React, { useState } from 'react';
import { Plus, LayoutGrid, FolderPlus } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import NewProjectModal from '../components/NewProjectModal';
import { useProjectContext } from '../context/ProjectContext';

const Projects = () => {
  const { projects, loading } = useProjectContext();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Total open tasks calculated from backend summary metrics
  const totalOpenTasks = projects.reduce((acc, p) => acc + (p.open_tasks_count || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Your projects
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba298] mt-1">
            <span className="text-white font-medium">{projects.length}</span> {projects.length === 1 ? 'project' : 'projects'} ·{' '}
            <span className="text-white font-medium">{totalOpenTasks}</span> open tasks across your boards
          </p>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#12221d] hover:bg-[#182c26] border border-[#223d33] hover:border-[#10b981]/50 text-white hover:text-[#34d399] px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-[#10b981]" />
          <span>New project</span>
        </button>
      </div>

      {/* Projects List or Empty State */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {projects.map(project => (
            <ProjectCard key={project.code || project.id} project={project} />
          ))}
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#6e857c]">
          Loading your projects...
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-[#1c332b] rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] bg-[#0e1915]/50">
          <div className="w-12 h-12 rounded-xl bg-[#142620] border border-[#1f3a30] flex items-center justify-center text-[#10b981] mb-4 shadow-sm">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">
            Start your first project
          </h3>
          <p className="text-sm text-[#8ca398] max-w-sm mb-6 leading-relaxed">
            Projects hold your team's tasks as they move from to-do to done. Create one and invite your team.
          </p>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create project</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};

export default Projects;