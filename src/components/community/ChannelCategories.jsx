import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Hash, Volume2, Video, Code, Lock } from 'lucide-react';
import { useState } from 'react';

const DEFAULT_CATEGORIES = [
  { id: 'general', name: 'GENERAL', channels: ['announcements', 'introductions', 'general-chat'] },
  { id: 'cyber', name: 'CYBERSECURITY', channels: ['security-news', 'learning-help', 'tools-resources', 'pentesting'] },
  { id: 'dev', name: 'DEVELOPMENT', channels: ['coding-help', 'projects', 'plugins-themes', 'code-review'] },
  { id: 'arena', name: 'CHALLENGE ARENA', channels: ['challenge-discuss', 'challenge-help', 'leaderboard'] },
  { id: 'market', name: 'MARKETPLACE', channels: ['service-offers', 'collaboration', 'job-board'] },
];

export default function ChannelCategories({ channels, activeChannelId, onSelectChannel }) {
  const [expanded, setExpanded] = useState({});

  const getChannelIcon = (type) => {
    switch(type) {
      case 'voice': return <Volume2 className="w-3.5 h-3.5 text-green-400" />;
      case 'video': return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'code': return <Code className="w-3.5 h-3.5 text-yellow-400" />;
      case 'admin': return <Lock className="w-3.5 h-3.5 text-red-400" />;
      default: return <Hash className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const channelsByCategory = channels.reduce((acc, ch) => {
    const cat = ch.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  return (
    <div className="space-y-1">
      {Object.entries(channelsByCategory).map(([category, cats]) => (
        <div key={category}>
          <button
            onClick={() => setExpanded(p => ({ ...p, [category]: !p[category] }))}
            className="flex items-center gap-1.5 px-3 py-1.5 w-full text-gray-500 hover:text-gray-400 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded[category] ? '' : '-rotate-90'}`} />
            <span>{category}</span>
          </button>
          
          {expanded[category] !== false && (
            <div className="space-y-0.5 mt-1">
              {cats.map(ch => (
                <motion.button
                  key={ch.id}
                  onClick={() => onSelectChannel(ch)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs w-full transition-all ${
                    activeChannelId === ch.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {getChannelIcon(ch.type)}
                  <span className="truncate">{ch.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}