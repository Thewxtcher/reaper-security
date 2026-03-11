import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, UserPlus, Users, Plus, Search, Settings, Pin, X
} from 'lucide-react';
import StartDMModal from './StartDMModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { id: 'friends', label: 'Find Friends', Icon: UserPlus },
  { id: 'create-group', label: 'New Group DM', Icon: Users },
];

function ConvItem({ conv, user, isActive, onClick }) {
  const isGroup = conv.type === 'group';
  const otherName = isGroup
    ? conv.name || 'Group Chat'
    : conv.participant_names?.find(n => n !== (user?.full_name || user?.email)) || 'User';

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
        isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {isGroup ? <Users className="w-4 h-4" /> : otherName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{otherName}</div>
        {conv.last_message && <div className="text-xs text-gray-600 truncate">{conv.last_message}</div>}
      </div>
      {conv.pinned && <Pin className="w-3 h-3 text-gray-600 flex-shrink-0" />}
    </button>
  );
}

export default function DMSidebar({ user, activeView, activeConvId, onSelectConv, onSelectView }) {
  const [search, setSearch] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupEmails, setGroupEmails] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_at', 50);
      return all.filter(c => c.participant_emails?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 3000,
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const emails = [user.email, ...groupEmails.split(',').map(e => e.trim()).filter(Boolean)];
      const names = emails.map(e => e.split('@')[0]);
      return base44.entities.Conversation.create({
        type: 'group',
        name: groupName || 'Group Chat',
        participant_emails: emails,
        participant_names: names,
        created_by: user.email,
      });
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onSelectConv(conv);
      setShowGroupModal(false);
      setGroupName('');
      setGroupEmails('');
    }
  });

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const isGroup = c.type === 'group';
    const name = isGroup ? c.name : c.participant_names?.find(n => n !== (user?.full_name || user?.email));
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-60 bg-[#0f0f0f] flex flex-col border-r border-white/5 flex-shrink-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/10">
        <span className="text-white font-semibold">Messages</span>
        <button onClick={() => setShowGroupModal(true)} className="text-gray-500 hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <div className="px-2 pt-2">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => item.id === 'create-group' ? setShowGroupModal(true) : onSelectView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left mb-0.5 ${
              activeView === item.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}>
            <item.Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="px-2 my-2">
        <div className="h-px bg-white/5" />
      </div>

      {/* Search */}
      <div className="px-2 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search DMs"
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-md pl-8 pr-3 py-1.5 text-gray-300 text-xs placeholder:text-gray-600 focus:outline-none focus:border-white/20" />
        </div>
      </div>

      {/* Conversations */}
      <div className="px-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-1">Direct Messages</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filtered.map(conv => (
          <ConvItem key={conv.id} conv={conv} user={user}
            isActive={activeConvId === conv.id}
            onClick={() => onSelectConv(conv)} />
        ))}
        {filtered.length === 0 && !search && (
          <p className="text-gray-600 text-xs text-center py-4">No messages yet</p>
        )}
      </div>

      {/* User bar */}
      <div className="h-14 bg-[#080808] px-3 flex items-center gap-2 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {user?.full_name?.[0] || user?.email?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">{user?.full_name || 'User'}</div>
          <div className="text-gray-500 text-xs">online</div>
        </div>
        <Settings className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
      </div>

      {/* Create group modal */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Create Group DM</h2>
                <button onClick={() => setShowGroupModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Group Name</label>
                  <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="My Group"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Add Users (comma-separated emails)</label>
                  <input value={groupEmails} onChange={e => setGroupEmails(e.target.value)} placeholder="alice@example.com, bob@example.com"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none placeholder:text-gray-600" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowGroupModal(false)} className="flex-1 border-gray-700 text-gray-300">Cancel</Button>
                <Button onClick={() => createGroupMutation.mutate()} disabled={createGroupMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}