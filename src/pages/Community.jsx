import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ServerSidebar from '../components/community/ServerSidebar';
import ChannelSidebar from '../components/community/ChannelSidebar';
import ChatPanel from '../components/community/ChatPanel';
import CodeChannelPanel from '../components/community/CodeChannelPanel';
import MemberPanel from '../components/community/MemberPanel';
import CreateServerModal from '../components/community/CreateServerModal';
import AddChannelModal from '../components/community/AddChannelModal';

export default function Community() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [addChannelCategory, setAddChannelCategory] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch servers where user is a member (or just all servers for simplicity)
  const { data: servers = [] } = useQuery({
    queryKey: ['servers'],
    queryFn: () => base44.entities.Server.list('created_date', 50),
    enabled: !!user,
  });

  // Fetch channels for active server
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', activeServer?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: activeServer.id }, 'position', 100),
    enabled: !!activeServer?.id,
  });

  // Fetch members for active server
  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }, 'role', 100),
    enabled: !!activeServer?.id,
    refetchInterval: 10000,
  });

  // Auto-join server as member if not already
  const joinMutation = useMutation({
    mutationFn: async (server) => {
      const existing = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_email: user.email
      });
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({
          server_id: server.id,
          user_email: user.email,
          user_name: user.full_name || user.email,
          role: server.owner_email === user.email ? 'owner' : 'member',
          role_color: '#9ca3af',
          status: 'online',
          joined_at: new Date().toISOString(),
        });
        // Update member count
        await base44.entities.Server.update(server.id, {
          member_count: (server.member_count || 1) + 1
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', activeServer?.id] }),
  });

  const handleSelectServer = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    if (server && user) joinMutation.mutate(server);
  };

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels]);

  const myMember = members.find(m => m.user_email === user?.email);
  const memberRole = myMember?.role;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 bg-[#0a0a0a]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 mb-8">Join the Reaper Security community.</p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-gradient-to-r from-red-600 to-green-600"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  // No server selected — show home/server list
  if (!activeServer) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] pt-16 overflow-hidden">
        <ServerSidebar
          servers={servers}
          activeServerId={null}
          onSelectServer={handleSelectServer}
          onCreateServer={() => setShowCreateServer(true)}
          onDiscoverServer={() => {}}
        />
        <div className="flex-1 flex items-center justify-center bg-[#111]">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3 font-serif">Welcome to Community</h2>
            <p className="text-gray-500 mb-6">
              {servers.length === 0
                ? 'No servers yet. Create one to get started!'
                : 'Select a server from the sidebar to start chatting.'}
            </p>
            <Button
              onClick={() => setShowCreateServer(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
            >
              Create a Server
            </Button>
          </div>
        </div>

        {showCreateServer && (
          <CreateServerModal
            user={user}
            onClose={() => setShowCreateServer(false)}
            onCreated={(server) => {
              queryClient.invalidateQueries({ queryKey: ['servers'] });
              handleSelectServer(server);
            }}
          />
        )}
      </div>
    );
  }

  const isCodeChannel = activeChannel?.type === 'code';

  return (
    <div className="flex h-screen bg-[#0a0a0a] pt-16 overflow-hidden">
      {/* Server sidebar */}
      <ServerSidebar
        servers={servers}
        activeServerId={activeServer?.id}
        onSelectServer={handleSelectServer}
        onCreateServer={() => setShowCreateServer(true)}
        onDiscoverServer={() => {}}
      />

      {/* Channel sidebar */}
      <ChannelSidebar
        server={activeServer}
        channels={channels}
        activeChannelId={activeChannel?.id}
        onSelectChannel={setActiveChannel}
        onAddChannel={(category) => setAddChannelCategory(category)}
        user={user}
        memberRole={memberRole}
      />

      {/* Main content */}
      {isCodeChannel ? (
        <CodeChannelPanel channel={activeChannel} server={activeServer} user={user} />
      ) : (
        <ChatPanel channel={activeChannel} server={activeServer} user={user} />
      )}

      {/* Member panel */}
      <MemberPanel
        members={members}
        onMemberClick={setSelectedMember}
      />

      {/* Modals */}
      {showCreateServer && (
        <CreateServerModal
          user={user}
          onClose={() => setShowCreateServer(false)}
          onCreated={(server) => {
            queryClient.invalidateQueries({ queryKey: ['servers'] });
            handleSelectServer(server);
          }}
        />
      )}

      {addChannelCategory !== null && (
        <AddChannelModal
          server={activeServer}
          category={addChannelCategory}
          onClose={() => setAddChannelCategory(null)}
        />
      )}
    </div>
  );
}