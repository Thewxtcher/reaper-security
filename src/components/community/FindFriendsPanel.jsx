import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, UserPlus, UserCheck, UserX, Clock, MessageCircle, CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function FriendRequestCard({ friendship, user, onAccept, onDecline }) {
  const isIncoming = friendship.receiver_email === user.email;
  const otherName = isIncoming ? friendship.requester_name : friendship.receiver_name;
  const otherEmail = isIncoming ? friendship.requester_email : friendship.receiver_email;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-white/10">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
        {otherName?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{otherName || otherEmail?.split('@')[0]}</div>
        <div className="text-gray-500 text-xs truncate">{otherEmail}</div>
      </div>
      {friendship.status === 'pending' && isIncoming ? (
        <div className="flex gap-2">
          <button onClick={() => onAccept(friendship.id)} className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center text-white transition-colors">
            <UserCheck className="w-4 h-4" />
          </button>
          <button onClick={() => onDecline(friendship.id)} className="w-8 h-8 rounded-full bg-red-600/30 hover:bg-red-600 flex items-center justify-center text-red-400 hover:text-white transition-colors">
            <UserX className="w-4 h-4" />
          </button>
        </div>
      ) : friendship.status === 'pending' ? (
        <span className="text-xs text-yellow-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
      ) : (
        <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Friends</span>
      )}
    </motion.div>
  );
}

export default function FindFriendsPanel({ user, onStartDM }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // all | pending | add
  const [addEmail, setAddEmail] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Friendship.filter({ requester_email: user.email });
      const received = await base44.entities.Friendship.filter({ receiver_email: user.email });
      return [...sent, ...received];
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (email) => {
      // Check not already friends
      const existing = friendships.find(f =>
        (f.requester_email === user.email && f.receiver_email === email) ||
        (f.receiver_email === user.email && f.requester_email === email)
      );
      if (existing) throw new Error('Already connected');
      return base44.entities.Friendship.create({
        requester_email: user.email,
        requester_name: user.full_name || user.email,
        receiver_email: email.trim(),
        receiver_name: email.trim().split('@')[0],
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      setAddMsg('Friend request sent!');
      setAddEmail('');
      setTimeout(() => setAddMsg(''), 3000);
    },
    onError: (e) => { setAddMsg(e.message || 'Failed to send request'); setTimeout(() => setAddMsg(''), 3000); }
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.update(id, { status: 'accepted' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships'] }),
  });

  const declineMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships'] }),
  });

  const accepted = friendships.filter(f => f.status === 'accepted');
  const pending = friendships.filter(f => f.status === 'pending');
  const filtered = (tab === 'pending' ? pending : accepted).filter(f => {
    const name = f.requester_email === user.email ? f.receiver_name : f.requester_name;
    return !search || name?.toLowerCase().includes(search.toLowerCase());
  });

  const tabs = [
    { id: 'all', label: 'All Friends', count: accepted.length },
    { id: 'pending', label: 'Pending', count: pending.length },
    { id: 'add', label: 'Add Friend' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#111] min-w-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
        <UserPlus className="w-5 h-5 text-green-400" />
        <span className="text-white font-semibold">Friends</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${t.id === 'pending' ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'add' ? (
        <div className="p-6 max-w-md">
          <h3 className="text-white font-semibold mb-1">Add Friend</h3>
          <p className="text-gray-400 text-sm mb-4">You can add friends by entering their email address.</p>
          <div className="flex gap-2">
            <Input value={addEmail} onChange={e => setAddEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEmail && sendRequestMutation.mutate(addEmail)}
              placeholder="user@example.com"
              className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600" />
            <Button onClick={() => addEmail && sendRequestMutation.mutate(addEmail)}
              disabled={!addEmail.trim() || sendRequestMutation.isPending}
              className="bg-green-600 hover:bg-green-500 shrink-0">
              Send
            </Button>
          </div>
          {addMsg && (
            <p className={`mt-2 text-sm ${addMsg.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>{addMsg}</p>
          )}
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..." className="pl-9 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserPlus className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">
                  {tab === 'pending' ? 'No pending requests' : 'No friends yet. Add some!'}
                </p>
              </div>
            ) : filtered.map(f => (
              <FriendRequestCard key={f.id} friendship={f} user={user}
                onAccept={(id) => acceptMutation.mutate(id)}
                onDecline={(id) => declineMutation.mutate(id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}