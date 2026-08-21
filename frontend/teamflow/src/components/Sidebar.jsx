import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, CheckSquare, Bell, LogOut, Menu, X } from 'lucide-react';
import Avatar from './Avatar';
import { useProjectContext } from '../context/ProjectContext';

const Sidebar = () => {
  const { currentUser, setCurrentUser, tasks } = useProjectContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = currentUser?.username || currentUser?.name || 'User';
  const userEmail = currentUser?.email || '';

  // Count my open tasks safely
  const myOpenTasksCount = (tasks || []).filter(t => {
    if (t.status === 'DONE') return false;
    const tName = (t.assignee_name || t.membername || '').toLowerCase();
    const tEmail = (t.assignee_email || '').toLowerCase();
    return (
      (userName && tName === userName.toLowerCase()) ||
      (userEmail && tEmail === userEmail.toLowerCase())
    );
  }).length;

  const handleSignOut = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    navigate('/login');
  };

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
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE TOP NAVBAR (< md screen sizes)                                  */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-[#09110e]/95 backdrop-blur-md border-b border-[#152520] select-none">
        {/* Main top bar: Brand + User Action */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#10b981] flex items-center justify-center font-bold text-black text-xs tracking-tight shadow-md">
              TF
            </div>
            <span className="font-semibold text-white text-sm tracking-wide">
              TeamFlow
            </span>
          </div>

          {/* User Profile & Sign Out button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Avatar name={userName} size="sm" />
              <span className="text-xs font-medium text-[#cce3d8] max-w-[90px] truncate hidden sm:inline">
                {userName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded-lg bg-[#13231d] hover:bg-[#1a3128] border border-[#1f382e] text-[#8ca398] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Horizontal Nav Bar (Thumb-friendly tab bar) */}
        <nav className="flex items-center px-2.5 pb-2 gap-1.5 overflow-x-auto no-scrollbar border-t border-[#13231d]/60 pt-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#152721] text-[#34d399] border border-[#214337] shadow-xs'
                    : 'text-[#8da397] hover:text-white hover:bg-[#0f1d19]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#10b981]/25 text-[#34d399] border border-[#10b981]/40 ml-0.5">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VERTICAL SIDEBAR (>= md screen sizes)                         */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 min-w-64 bg-[#09110e] border-r border-[#152520] flex-col justify-between h-screen sticky top-0 select-none">
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
              <Avatar name={userName} size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#09110e] rounded-full"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-white truncate leading-tight">
                {userName}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-[#6e857c] leading-tight truncate max-w-[100px]">
                  {userEmail ? userEmail.split('@')[0] : 'Signed in'}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[11px] text-[#34d399] hover:underline cursor-pointer bg-transparent border-0 p-0 ml-1"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
