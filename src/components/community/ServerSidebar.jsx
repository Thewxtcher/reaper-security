import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, MessageCircle, UserPlus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function ServerIcon({ server, isActive, onClick, unreadCount }) {
  const [hovered, setHovered] = useState(false);
  const initials = server.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex justify-center mb-2">
            {/* Active indicator */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200 ${
              isActive ? 'h-10' : hovered ? 'h-5' : 'h-0'
            }`} />
            
            <motion.button
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              onClick={onClick}
              animate={{ borderRadius: isActive || hovered ? '12px' : '50%' }}
              transition={{ duration: 0.2 }}
              className={`w-12 h-12 flex items-center justify-center text-sm font-bold overflow-hidden transition-colors relative ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-red-600 hover:text-white'
              }`}
            >
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </motion.button>

            {/* Unread badge */}
            {unreadCount > 0 && !isActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
          {server.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ServerSidebar({ servers, activeServerId, onSelectServer, onCreateServer, onDiscoverServer, onOpenDMs, onOpenFriends, dmView }) {
  return (
    <div className="w-[72px] bg-[#070707] flex flex-col items-center py-3 gap-0 border-r border-white/5 overflow-y-auto flex-shrink-0">
      {/* Direct Messages */}
      <NavIcon
        label="Direct Messages"
        isActive={dmView === 'dm'}
        onClick={onOpenDMs}
        icon={<MessageCircle className="w-5 h-5" />}
      />

      {/* Find Friends */}
      <NavIcon
        label="Find Friends"
        isActive={dmView === 'friends'}
        onClick={onOpenFriends}
        icon={<UserPlus className="w-5 h-5" />}
        color="green"
      />

      {/* Divider */}
      <div className="w-8 h-[2px] bg-white/10 rounded-full mb-2" />

      {/* Server list */}
      <div className="flex flex-col items-center w-full px-3">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onSelectServer(server)}
            unreadCount={0}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-white/10 rounded-full my-2" />

      {/* Add server */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCreateServer}
              className="w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-green-600 hover:rounded-xl text-green-500 hover:text-white flex items-center justify-center transition-all duration-200 mb-2"
            >
              <Plus className="w-6 h-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
            Create Server
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDiscoverServer}
              className="w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-green-600 hover:rounded-xl text-green-500 hover:text-white flex items-center justify-center transition-all duration-200"
            >
              <Compass className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
            Discover Servers
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}