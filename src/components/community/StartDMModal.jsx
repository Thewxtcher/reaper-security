import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function StartDMModal({ user, onClose, onStartDM }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ['allMembersForDM'],
    queryFn: async () => {
      const members = await base44.entities.ServerMember.list('-joined_at', 500);
      const seen = new Set();
      return members.filter(m => {
        if (!m.user_email || seen.has(m.user_email)) return false;
        seen.add(m.user_email);
        return true;
      });
    },
  });

  const filtered = profiles.filter(u =>
    u.user_email !== user.email &&
    (search === '' ||
      u.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStart = async (targetEmail, targetName) => {
    setLoading(true);
    await onStartDM(targetEmail, targetName);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-400" />
              Start Direct Message
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              autoFocus
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-600 text-sm py-6">No users found</p>
            ) : filtered.map((u, i) => (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleStart(u.user_email, u.user_name || u.user_email?.split('@')[0])}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(u.user_name || u.user_email)?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{u.user_name || u.user_email?.split('@')[0]}</div>
                  <div className="text-gray-500 text-xs truncate">{u.user_email}</div>
                </div>
                <span className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">Message →</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}