import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash, Volume2, Video, Lock, ChevronDown, Plus, Settings,
  Code2, Shield, Users
} from 'lucide-react';

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  code: Code2,
  admin: Shield,
};

function ChannelItem({ channel, isActive, onClick }) {
  const Icon = channelIcons[channel.type] || Hash;

  return (
    <button
      onClick={() => onClick(channel)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all group ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate flex-1 text-left">{channel.name}</span>
      {channel.is_locked && <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />}
      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-50 flex-shrink-0" />
    </button>
  );
}

function CategoryGroup({ category, channels, activeChannelId, onSelectChannel, onAddChannel }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-2 mb-1 group">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          />
          {category}
        </button>
        <button
          onClick={() => onAddChannel(category)}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {channels.map(ch => (
              <ChannelItem
                key={ch.id}
                channel={ch}
                isActive={activeChannelId === ch.id}
                onClick={onSelectChannel}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelSidebar({ server, channels, activeChannelId, onSelectChannel, onAddChannel, user, memberRole }) {
  const grouped = channels.reduce((acc, ch) => {
    const cat = ch.category || 'Text Channels';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  const categoryOrder = ['Text Channels', 'Voice Channels', 'Video Channels', 'Code Channels', 'Admin Channels'];
  const sortedCategories = [
    ...categoryOrder.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !categoryOrder.includes(c))
  ];

  return (
    <div className="w-60 bg-[#0f0f0f] flex flex-col border-r border-white/5 flex-shrink-0">
      {/* Server header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/10 shadow-sm">
        <h2 className="text-white font-semibold truncate">{server?.name || 'Server'}</h2>
        <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sortedCategories.map(cat => (
          <CategoryGroup
            key={cat}
            category={cat}
            channels={grouped[cat] || []}
            activeChannelId={activeChannelId}
            onSelectChannel={onSelectChannel}
            onAddChannel={onAddChannel}
          />
        ))}
      </div>

      {/* User info bar */}
      <div className="h-14 bg-[#080808] px-3 flex items-center gap-2 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {user?.full_name?.[0] || user?.email?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">
            {user?.full_name || 'User'}
          </div>
          <div className="text-gray-500 text-xs truncate">{memberRole || 'member'}</div>
        </div>
        <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}