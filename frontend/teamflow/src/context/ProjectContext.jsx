import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getProjects,
  getProject,
  createProject as apiCreateProject,
  updateProjectStatus as apiUpdateProjectStatus,
  deleteProject as apiDeleteProject,
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  getMyTasks,
  addComment as apiAddComment,
  inviteMember as apiInviteMember,
  getProjectAssignees as apiGetProjectAssignees
} from '../api/client';

const ProjectContext = createContext();

// Helper to preview project code from title (e.g. "Marketing site launch" -> "MSL-01")
export const generateProjectCode = (title, existingProjects = []) => {
  if (!title || !title.trim()) return 'PRJ-01';
  const words = title.trim().split(/\s+/);
  let prefix = '';
  if (words.length >= 2) {
    prefix = words.map(w => w[0].toUpperCase()).filter(c => /[A-Z0-9]/.test(c)).slice(0, 4).join('');
  } else {
    prefix = words[0].substring(0, 3).toUpperCase();
  }
  if (!prefix) prefix = 'PRJ';

  const matchCount = (existingProjects || []).filter(p => p.code?.startsWith(prefix)).length + 1;
  const numSuffix = matchCount < 10 ? `0${matchCount}` : matchCount;
  return `${prefix}-${numSuffix}`;
};

export const ProjectProvider = ({ children }) => {
  // 1. Current Authenticated User state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      return {
        ...parsed,
        name: parsed.username || parsed.name || 'User'
      };
    } catch {
      return null;
    }
  });

  const handleSetCurrentUser = (user) => {
    if (user) {
      setCurrentUser({
        ...user,
        name: user.username || user.name || 'User'
      });
    } else {
      setCurrentUser(null);
    }
  };

  // 2. Core Live Data States
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myTasksList, setMyTasksList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 3. Fetch Projects automatically when authenticated
  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // 4. Fetch a specific Project and its Tasks
  const fetchProjectDetails = async (projectCode) => {
    try {
      setLoading(true);
      const [projData, tasksData] = await Promise.all([
        getProject(projectCode),
        getTasks(projectCode)
      ]);
      setCurrentProject(projData);
      setTasks(tasksData);
      return { project: projData, tasks: tasksData };
    } catch (err) {
      console.error(`Failed to fetch project ${projectCode}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch My Tasks
  const fetchMyTasks = async () => {
    try {
      const data = await getMyTasks();
      setMyTasksList(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch my tasks:', err);
      return [];
    }
  };

  // 6. Project Actions
  const addProject = async ({ title, description, invite_emails = [] }) => {
    try {
      const newProj = await apiCreateProject({ title, description, invite_emails });
      setProjects(prev => [newProj, ...prev]);
      return newProj;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const completeProject = async (projectCode) => {
    try {
      const updated = await apiUpdateProjectStatus(projectCode, 'DONE');
      setProjects(prev =>
        prev.map(p => (p.code === projectCode ? { ...p, status: 'DONE' } : p))
      );
      if (currentProject && currentProject.code === projectCode) {
        setCurrentProject(prev => ({ ...prev, status: 'DONE' }));
      }
      return updated;
    } catch (err) {
      console.error(`Failed to complete project ${projectCode}:`, err);
      throw err;
    }
  };

  const deleteProject = async (projectCode) => {
    try {
      await apiDeleteProject(projectCode);
      setProjects(prev => prev.filter(p => p.code !== projectCode));
    } catch (err) {
      console.error(`Failed to delete project ${projectCode}:`, err);
      throw err;
    }
  };

  const inviteMemberToProject = async (projectCode, email) => {
    try {
      const res = await apiInviteMember(projectCode, email);
      // Refresh project to show updated member/invite list
      await fetchProjectDetails(projectCode);
      return res;
    } catch (err) {
      console.error('Failed to invite member:', err);
      throw err;
    }
  };

  // 7. Task Actions
  const addTask = async (projectCode, taskData) => {
    try {
      const created = await apiCreateTask(projectCode, taskData);
      setTasks(prev => [...prev, created]);
      // Update open task count in projects list
      setProjects(prev =>
        prev.map(p =>
          p.code === projectCode
            ? { ...p, open_tasks_count: (p.open_tasks_count || 0) + 1 }
            : p
        )
      );
      return created;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (projectCode, taskCode, newStatus) => {
    try {
      const updated = await apiUpdateTask(projectCode, taskCode, { status: newStatus });
      setTasks(prev =>
        prev.map(t => (t.code === taskCode ? { ...t, ...updated } : t))
      );
      setMyTasksList(prev =>
        prev.map(t => (t.code === taskCode ? { ...t, ...updated } : t))
      );
      // Refresh projects list count
      fetchProjects();
      return updated;
    } catch (err) {
      console.error(`Failed to update task ${taskCode} status:`, err);
      throw err;
    }
  };

  const editTask = async (projectCode, taskCode, updates) => {
    try {
      const updated = await apiUpdateTask(projectCode, taskCode, updates);
      setTasks(prev =>
        prev.map(t => (t.code === taskCode ? { ...t, ...updated } : t))
      );
      return updated;
    } catch (err) {
      console.error(`Failed to edit task ${taskCode}:`, err);
      throw err;
    }
  };

  const deleteTask = async (projectCode, taskCode) => {
    try {
      await apiDeleteTask(projectCode, taskCode);
      setTasks(prev => prev.filter(t => t.code !== taskCode));
      setMyTasksList(prev => prev.filter(t => t.code !== taskCode));
      if (selectedTaskId === taskCode) {
        setSelectedTaskId(null);
      }
      fetchProjects();
    } catch (err) {
      console.error(`Failed to delete task ${taskCode}:`, err);
      throw err;
    }
  };

  const addComment = async (projectCode, taskCode, commentText) => {
    try {
      const newComment = await apiAddComment(projectCode, taskCode, commentText);
      setTasks(prev =>
        prev.map(t => {
          if (t.code === taskCode) {
            return {
              ...t,
              comments: [...(t.comments || []), newComment]
            };
          }
          return t;
        })
      );
      return newComment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const getAssignees = async (projectCode) => {
    try {
      return await apiGetProjectAssignees(projectCode);
    } catch (err) {
      console.error('Failed to get assignees:', err);
      return [];
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        projects,
        currentProject,
        tasks,
        myTasksList,
        loading,
        error,
        selectedTaskId,
        setSelectedTaskId,
        fetchProjects,
        fetchProjectDetails,
        fetchMyTasks,
        addProject,
        completeProject,
        deleteProject,
        inviteMemberToProject,
        addTask,
        updateTaskStatus,
        editTask,
        deleteTask,
        addComment,
        getAssignees
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
