import React from 'react';
import { Bell, MessageSquare, CheckCircle2, UserPlus, FolderPlus } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useProjectContext } from '../context/ProjectContext';

const ActivityPage = () => {
  const { currentUser, tasks } = useProjectContext();

  const activities = [
    {
      id: 1,
      user: 'Crispen',
      action: 'commented on',
      target: 'Set up staging environment',
      time: '10 minutes ago',
      icon: MessageSquare,
      iconColor: 'text-[#10b981]'
    },
    {
      id: 2,
      user: 'Joshua',
      action: 'completed task',
      target: 'QA pass on checkout flow',
      time: '2 hours ago',
      icon: CheckCircle2,
      iconColor: 'text-[#34d399]'
    },
    {
      id: 3,
      user: 'Williams',
      action: 'created project',
      target: 'Marketing site launch',
      time: 'Yesterday',
      icon: FolderPlus,
      iconColor: 'text-[#38bdf8]'
    },
    {
      id: 4,
      user: 'Williams',
      action: 'invited',
      target: 'Crispen and Joshua',
      time: '2 days ago',
      icon: UserPlus,
      iconColor: 'text-[#a78bfa]'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-[#10b981]" />
          Team Activity
        </h1>
        <p className="text-sm text-[#8ba298] mt-1">
          Recent updates, discussions, and task completions across all projects
        </p>
      </div>

      <div className="bg-[#111e19] border border-[#1b2f28] rounded-2xl p-6 space-y-5">
        {activities.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-4">
              <Avatar name={item.user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#d1d5db]">
                  <span className="font-semibold text-white">{item.user}</span>{' '}
                  <span className="text-[#8ba298]">{item.action}</span>{' '}
                  <span className="font-medium text-white">{item.target}</span>
                </p>
                <span className="text-xs text-[#5d776d] mt-1 block">{item.time}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#152520] border border-[#20372e]">
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityPage;
