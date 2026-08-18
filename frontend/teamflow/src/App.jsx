import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import ActivityPage from './pages/ActivityPage';
import TaskDetail from './pages/TaskDetail';
import Authentication from './pages/Authentication';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import { ProjectProvider, useProjectContext } from './context/ProjectContext';

const AppContent = () => {
  const { selectedTaskId, setSelectedTaskId } = useProjectContext();
  const location = useLocation();

  const isLandingOrAuth = 
    location.pathname === '/' || 
    location.pathname === '/login' || 
    location.pathname === '/auth';

  if (isLandingOrAuth) {
    return (
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0c1512] text-[#e2e8f0] font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto max-h-screen">
        <Routes>
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </main>

      {/* Global Slide-over Drawer for Task Details */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;