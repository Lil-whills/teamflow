import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, CheckSquare, Bell, Sparkles } from 'lucide-react';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const Sidebar = () => {
  const { currentUser, tasks } = useProjectContext();
  const location = useLocation();

  // Count my open tasks
  const myOpenTasksCount = tasks.filter(
    t => t.membername?.toLowerCase() === currentUser.name.toLowerCase() && t.status !== 'DONE'
  ).length;

  const navItems = [
    {
      label: 'Projects',
      to: '/projects',
      icon: LayoutGrid,
      isActive: location.pathname === '/' || location.pathname.startsWith('/project')
    },
    {
      label: 'My tasks',
      to: '/my-tasks',
      icon: CheckSquare,
      badge: myOpenTasksCount > 0 ? myOpenTasksCount : null,
      isActive: location.pathname === '/my-tasks'
    },
    {
      label: 'Activity',
      to: '/activity',
      icon: Bell,
      isActive: location.pathname === '/activity'
    }
  ];

  return (
    <aside className="w-64 min-w-64 bg-[#09110e] border-r border-[#152520] flex flex-col justify-between h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#14231f]">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center font-bold text-black text-sm tracking-tight shadow-md">
            TF
          </div>
          <div>
            <span className="font-semibold text-white text-base tracking-wide flex items-center gap-1.5">
              TeamFlow
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    item.isActive || isActive
                      ? 'bg-[#152721] text-[#34d399] shadow-xs'
                      : 'text-[#94a39b] hover:text-white hover:bg-[#0f1d19]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#14231f] bg-[#0b1612]/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={currentUser.name} size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#09110e] rounded-full"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-white truncate leading-tight">
              {currentUser.name}
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-[#6e857c] leading-tight flex items-center gap-1">
                Signed in
              </span>
              <NavLink
                to="/login"
                className="text-[11px] text-[#34d399] hover:underline"
              >
                Sign out
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
