import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Users, Globe, LogIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function DiscoverServersPanel({ user, joinedServerIds, onJoin, onClose }) {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: allServers = [] } = useQuery({
    queryKey: ['allServers'],
    queryFn: () => base44.entities.Server.list('member_count', 100),
    enabled: !!user,
  });

  const joinMutation = useMutation({
    mutationFn: async (server) => {
      const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_email: user.email });
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({
          server_id: server.id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          role: 'member',
          role_color: '#9ca3af',
          status: 'online',
          joined_at: new Date().toISOString(),
        });
        await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
      }
      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['myMemberships', user.email] });
      queryClient.invalidateQueries({ queryKey: ['allServers'] });
      onJoin(server);
    },
  });

  const publicServers = allServers.filter(s =>
    !s.is_private &&
    !joinedServerIds.has(s.id) &&
    (search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-white font-bold text-xl">Discover Servers</h2>
          <p className="text-gray-500 text-sm mt-1">Find public communities to join</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search servers..."
            className="bg-black border-white/10 text-white pl-9"
          />
        </div>
      </div>

      {/* Server list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {publicServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No public servers found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {publicServers.map(server => {
              const initials = server.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <motion.div key={server.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-green-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {server.icon ? <img src={server.icon} alt={server.name} className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{server.name}</div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Users className="w-3 h-3" />
                        {server.member_count || 1} member{(server.member_count || 1) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {server.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{server.description}</p>
                  )}
                  <Button
                    onClick={() => joinMutation.mutate(server)}
                    disabled={joinMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm mt-auto"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {joinMutation.isPending ? 'Joining...' : 'Join Server'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}