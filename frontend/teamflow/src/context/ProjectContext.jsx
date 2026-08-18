import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

// Helper to auto-generate project code from title (e.g. "Marketing site launch" -> "MSL-01")
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

  // Count existing projects with similar prefix
  const matchCount = existingProjects.filter(p => p.code?.startsWith(prefix)).length + 1;
  const numSuffix = matchCount < 10 ? `0${matchCount}` : matchCount;
  return `${prefix}-${numSuffix}`;
};

const initialProjects = [
  {
    id: 'msl-01',
    code: 'MSL-01',
    title: 'Marketing site launch',
    role: 'owner',
    owner: 'Williams',
    isCompleted: false,
    members: ['Williams', 'Joshua', 'Crispen', 'alice@teamflow.app'],
    description: 'Launch the new marketing website with revamped branding and interactive features.'
  },
  {
    id: 'q3-onb',
    code: 'Q3-CL',
    title: 'Q3 client onboarding',
    role: 'member',
    owner: 'Diana',
    isCompleted: false,
    members: ['Diana', 'Williams', 'Kevin', 'Sam', 'Alice'],
    description: 'Streamlining our onboarding pipeline for high-value enterprise clients.'
  },
  {
    id: 'int-tool',
    code: 'INT-01',
    title: 'Internal tooling cleanup',
    role: 'owner',
    owner: 'Williams',
    isCompleted: false,
    members: ['Williams', 'Evan'],
    description: 'Refactoring deprecated internal microservices and CI/CD pipelines.'
  }
];

const initialTasks = [
  // Marketing site launch tasks
  {
    id: 'task-01',
    projectId: 'msl-01',
    code: 'TASK-01',
    title: 'Fix mobile nav overflow bug',
    membername: 'Crispen',
    duedate: '2026-08-15',
    status: 'TODO',
    createdBy: 'Williams',
    comments: [
      { id: 'c1', author: 'Williams', time: 'Aug 11, 14:20', text: 'Please ensure iOS Safari testing is covered.' }
    ]
  },
  {
    id: 'task-02',
    projectId: 'msl-01',
    code: 'TASK-02',
    title: 'Draft launch announcement',
    membername: 'Williams',
    duedate: '2026-08-22',
    status: 'TODO',
    createdBy: 'Williams',
    comments: []
  },
  {
    id: 'task-03',
    projectId: 'msl-01',
    code: 'TASK-03',
    title: 'Rewrite homepage hero copy',
    membername: 'Joshua',
    duedate: '2026-08-14',
    status: 'IN PROGRESS',
    createdBy: 'Williams',
    comments: [
      { id: 'c2', author: 'Joshua', time: 'Aug 13, 10:15', text: 'First draft is ready for review in Google Docs.' }
    ]
  },
  {
    id: 'task-04',
    projectId: 'msl-01',
    code: 'TASK-04',
    title: 'Set up staging environment',
    membername: 'Crispen',
    duedate: '2026-08-18',
    status: 'IN PROGRESS',
    createdBy: 'Williams',
    comments: [
      { id: 'c3', author: 'Crispen', time: 'Aug 12, 09:14', text: 'Staging DNS is propagating, should be live in an hour.' },
      { id: 'c4', author: 'Williams', time: 'Aug 12, 09:31', text: "Nice, ping me when it's up and I'll run the smoke tests." },
      { id: 'c5', author: 'Crispen', time: 'Aug 12, 10:47', text: 'Live now — SSL cert issued and all health checks passing. Ready for your smoke tests.' }
    ]
  },
  {
    id: 'task-05',
    projectId: 'msl-01',
    code: 'TASK-05',
    title: 'QA pass on checkout flow',
    membername: 'Joshua',
    duedate: '2026-08-09',
    status: 'DONE',
    createdBy: 'Williams',
    comments: []
  },
  {
    id: 'task-06',
    projectId: 'msl-01',
    code: 'TASK-06',
    title: 'Choose hosting provider',
    membername: 'Williams',
    duedate: '2026-08-05',
    status: 'DONE',
    createdBy: 'Williams',
    comments: [
      { id: 'c6', author: 'Williams', time: 'Aug 05, 16:00', text: 'Selected AWS ECS for production hosting.' }
    ]
  },

  // Q3 Client Onboarding tasks
  {
    id: 'task-07',
    projectId: 'q3-onb',
    code: 'TASK-07',
    title: 'Prepare compliance checklists',
    membername: 'Diana',
    duedate: '2026-08-20',
    status: 'IN PROGRESS',
    createdBy: 'Diana',
    comments: []
  },
  {
    id: 'task-08',
    projectId: 'q3-onb',
    code: 'TASK-08',
    title: 'Send welcome packages',
    membername: 'Williams',
    duedate: '2026-08-25',
    status: 'TODO',
    createdBy: 'Diana',
    comments: []
  },
  {
    id: 'task-09',
    projectId: 'q3-onb',
    code: 'TASK-09',
    title: 'Configure SSO integrations',
    membername: 'Kevin',
    duedate: '2026-08-10',
    status: 'DONE',
    createdBy: 'Diana',
    comments: []
  },

  // Internal Tooling tasks
  {
    id: 'task-10',
    projectId: 'int-tool',
    code: 'TASK-10',
    title: 'Upgrade Python dependencies & DRF',
    membername: 'Williams',
    duedate: '2026-08-08',
    status: 'DONE',
    createdBy: 'Williams',
    comments: []
  },
  {
    id: 'task-11',
    projectId: 'int-tool',
    code: 'TASK-11',
    title: 'Audit DB indexes',
    membername: 'Evan',
    duedate: '2026-08-07',
    status: 'DONE',
    createdBy: 'Williams',
    comments: []
  }
];

export const ProjectProvider = ({ children }) => {
  const [currentUser] = useState({ name: 'Williams', email: 'williams@teamflow.app', role: 'owner' });
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const addComment = (taskId, commentText) => {
    if (!commentText.trim()) return;
    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newComment = {
      id: 'c-' + Date.now(),
      author: currentUser.name,
      time: formattedTime,
      text: commentText.trim()
    };

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...(task.comments || []), newComment]
          };
        }
        return task;
      })
    );
  };

  const addTask = (newTask) => {
    const projectTasks = tasks.filter(t => t.projectId === newTask.projectId);
    const taskNumber = projectTasks.length + 1;
    const id = 'task-' + Date.now();
    
    const taskObj = {
      id,
      code: `TASK-${taskNumber < 10 ? '0' + taskNumber : taskNumber}`,
      status: 'TODO', // Strict rule: always default to TODO
      comments: [],
      createdBy: currentUser.name,
      ...newTask
    };
    setTasks(prev => [taskObj, ...prev]);
    return taskObj;
  };

  const editTask = (taskId, updates) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          // Editing preserves the current status (e.g. IN PROGRESS stays IN PROGRESS)
          return {
            ...task,
            ...updates,
            status: updates.status || task.status
          };
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const addProject = (project) => {
    const id = 'proj-' + Date.now();
    const code = project.code || generateProjectCode(project.title, projects);
    const newProj = {
      id,
      code,
      role: 'owner',
      owner: currentUser.name,
      isCompleted: false,
      members: [currentUser.name, ...(project.members || [])],
      ...project
    };
    setProjects(prev => [newProj, ...prev]);
    return newProj;
  };

  const completeProject = (projectId) => {
    setProjects(prev =>
      prev.map(proj =>
        proj.id === projectId ? { ...proj, isCompleted: true } : proj
      )
    );
  };

  const addMemberToProject = (projectId, memberNameOrEmail) => {
    if (!memberNameOrEmail.trim()) return;
    setProjects(prev =>
      prev.map(proj => {
        if (proj.id === projectId && !proj.members.includes(memberNameOrEmail.trim())) {
          return {
            ...proj,
            members: [...proj.members, memberNameOrEmail.trim()]
          };
        }
        return proj;
      })
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        projects,
        tasks,
        selectedTaskId,
        setSelectedTaskId,
        updateTaskStatus,
        addComment,
        addTask,
        editTask,
        deleteTask,
        addProject,
        completeProject,
        addMemberToProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
