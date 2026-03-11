import React from 'react';
import { Crown, Shield } from 'lucide-react';

const statusColors = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-600',
};

const roleIcons = {
  owner: <Crown className="w-3 h-3 text-yellow-400" />,
  admin: <Shield className="w-3 h-3 text-red-400" />,
  moderator: <Shield className="w-3 h-3 text-blue-400" />,
};

const roleOrder = ['owner', 'admin', 'moderator', 'member'];
const roleLabels = { owner: 'Owner', admin: 'Admin', moderator: 'Moderator', member: 'Members' };

function MemberItem({ member, onClick }) {
  const isOffline = member.status === 'offline';
  return (
    <button
      onClick={() => onClick(member)}
      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
    >
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
          isOffline ? 'opacity-40' : ''
        }`} style={{ backgroundColor: member.role_color || '#374151' }}>
          {(member.nickname || member.user_name || member.user_email)?.[0]?.toUpperCase() || '?'}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f0f0f] ${statusColors[member.status] || 'bg-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className={`text-sm font-medium truncate flex items-center gap-1 ${isOffline ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>
          {member.nickname || member.user_name || member.user_email?.split('@')[0]}
          {roleIcons[member.role]}
        </div>
      </div>
    </button>
  );
}

export default function MemberPanel({ members, onMemberClick }) {
  const grouped = roleOrder.reduce((acc, role) => {
    const list = members.filter(m => m.role === role && m.status !== 'offline');
    if (list.length) acc[role] = list;
    return acc;
  }, {});

  const offline = members.filter(m => m.status === 'offline');
  if (offline.length) grouped['offline_group'] = offline;

  return (
    <div className="w-60 bg-[#0f0f0f] flex flex-col border-l border-white/5 flex-shrink-0 overflow-y-auto">
      <div className="h-12 px-4 flex items-center border-b border-white/10">
        <span className="text-white font-semibold text-sm">Members — {members.length}</span>
      </div>
      <div className="flex-1 px-2 py-3">
        {Object.entries(grouped).map(([role, list]) => (
          <div key={role} className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-2 mb-1">
              {roleLabels[role] || 'Offline'} — {list.length}
            </div>
            {list.map(member => (
              <MemberItem key={member.id} member={member} onClick={onMemberClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}