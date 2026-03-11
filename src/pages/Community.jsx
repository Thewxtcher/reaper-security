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
import VideoCallPanel from '../components/community/VideoCallPanel';
import MemberPanel from '../components/community/MemberPanel';
import CreateServerModal from '../components/community/CreateServerModal';
import AddChannelModal from '../components/community/AddChannelModal';
import ServerSettingsModal from '../components/community/ServerSettingsModal';
import DMSidebar from '../components/community/DMSidebar';
import DMPanel from '../components/community/DMPanel';
import FindFriendsPanel from '../components/community/FindFriendsPanel';
import DiscoverServersPanel from '../components/community/DiscoverServersPanel';
import { usePresence } from '../components/community/TypingIndicator';
import MemberProfilePopup from '../components/community/MemberProfilePopup';

// view modes: 'server' | 'dm' | 'friends'
export default function Community() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') === 'dm' ? 'dm' : 'server';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [viewMode, setViewMode] = useState(initialView); // 'server' | 'dm' | 'friends'
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [dmSubView, setDmSubView] = useState('friends'); // 'friends' | conv id
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [addChannelCategory, setAddChannelCategory] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inVideoCall, setInVideoCall] = useState(false);

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

  // Fetch only servers the user is a member of
  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myMemberships', user?.email],
    queryFn: () => base44.entities.ServerMember.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: allServers = [] } = useQuery({
    queryKey: ['allServersForSidebar'],
    queryFn: () => base44.entities.Server.list('created_date', 100),
    enabled: !!user,
  });

  // Only show servers user is a member of in the sidebar
  const joinedServerIds = new Set(myMemberships.map(m => m.server_id));
  const servers = allServers.filter(s => joinedServerIds.has(s.id));

  const { data: channels = [] } = useQuery({
    queryKey: ['channels', activeServer?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: activeServer.id }, 'position', 100),
    enabled: !!activeServer?.id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }, 'role', 100),
    enabled: !!activeServer?.id,
    refetchInterval: 10000,
  });

  const joinMutation = useMutation({
    mutationFn: async (server) => {
      const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_email: user.email });
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
        await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', activeServer?.id] });
      queryClient.invalidateQueries({ queryKey: ['myMemberships', user?.email] });
    },
  });

  const handleSelectServer = (server) => {
    setViewMode('server');
    setActiveServer(server);
    setActiveChannel(null);
    setInVideoCall(false);
    setShowDiscover(false);
    if (server && user) joinMutation.mutate(server);
  };

  const handleOpenDMs = () => {
    setViewMode('dm');
    setActiveServer(null);
    setInVideoCall(false);
  };

  const handleOpenFriends = () => {
    setViewMode('friends');
    setActiveServer(null);
    setInVideoCall(false);
    setShowDiscover(false);
  };

  const handleDiscover = () => {
    setShowDiscover(true);
    setActiveServer(null);
    setInVideoCall(false);
  };

  const handleStartDM = async (friendEmail, friendName) => {
    // Find or create DM conversation
    const existing = await base44.entities.Conversation.filter({ type: 'dm' });
    const found = existing.find(c =>
      c.participant_emails?.includes(user.email) &&
      c.participant_emails?.includes(friendEmail)
    );
    if (found) {
      setActiveConversation(found);
      setViewMode('dm');
    } else {
      const conv = await base44.entities.Conversation.create({
        type: 'dm',
        participant_emails: [user.email, friendEmail],
        participant_names: [user.full_name || user.email, friendName || friendEmail],
        created_by: user.email,
      });
      setActiveConversation(conv);
      setViewMode('dm');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  };

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels]);

  const myMember = members.find(m => m.user_email === user?.email);
  const memberRole = myMember?.role;

  // Presence tracking
  usePresence(user, activeServer?.id);

  // Handle invite code joins from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode && user && servers.length > 0) {
      const target = servers.find(s => s.invite_code === inviteCode);
      if (target) handleSelectServer(target);
    }
  }, [servers, user]);

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
          <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-gradient-to-r from-red-600 to-green-600">
            <LogIn className="w-4 h-4 mr-2" />Login to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── DM / Friends view ─────────────────────────────────────────
  if (viewMode === 'dm' || viewMode === 'friends') {
    return (
      <div className="flex h-screen bg-[#0a0a0a] pt-16 overflow-hidden">
        <ServerSidebar
          servers={servers}
          activeServerId={null}
          onSelectServer={handleSelectServer}
          onCreateServer={() => setShowCreateServer(true)}
          onDiscoverServer={handleDiscover}
          onOpenDMs={handleOpenDMs}
          onOpenFriends={handleOpenFriends}
          dmView={viewMode === 'friends' ? 'friends' : 'dm'}
        />
        <DMSidebar
          user={user}
          activeView={dmSubView}
          activeConvId={activeConversation?.id}
          onSelectConv={(conv) => { setActiveConversation(conv); setDmSubView('conv'); }}
          onSelectView={(v) => { setDmSubView(v); setActiveConversation(null); }}
          onStartDM={handleStartDM}
        />
        {/* Main panel */}
        {showDiscover ? (
          <DiscoverServersPanel
            user={user}
            joinedServerIds={joinedServerIds}
            onJoin={(server) => { setShowDiscover(false); handleSelectServer(server); queryClient.invalidateQueries({ queryKey: ['myMemberships', user.email] }); }}
            onClose={() => setShowDiscover(false)}
          />
        ) : (viewMode === 'friends' || dmSubView === 'friends') && !activeConversation ? (
          <FindFriendsPanel user={user} onStartDM={handleStartDM} />
        ) : activeConversation ? (
          <DMPanel conversation={activeConversation} user={user} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#111] text-gray-600">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-500 mb-2">No conversation selected</p>
              <p className="text-sm">Pick a DM or find friends to get started</p>
            </div>
          </div>
        )}

        {showCreateServer && (
          <CreateServerModal user={user} onClose={() => setShowCreateServer(false)}
            onCreated={(server) => { queryClient.invalidateQueries({ queryKey: ['servers'] }); handleSelectServer(server); }} />
        )}
      </div>
    );
  }

  // ── Server view ───────────────────────────────────────────────
  const isCodeChannel = activeChannel?.type === 'code';
  const isVideoChannel = activeChannel?.type === 'video' || activeChannel?.type === 'voice';

  return (
    <div className="flex h-screen bg-[#0a0a0a] pt-16 overflow-hidden">
      <ServerSidebar
        servers={servers}
        activeServerId={activeServer?.id}
        onSelectServer={handleSelectServer}
        onCreateServer={() => setShowCreateServer(true)}
        onDiscoverServer={handleDiscover}
        onOpenDMs={handleOpenDMs}
        onOpenFriends={handleOpenFriends}
        dmView={null}
      />

      {!activeServer ? (
        <div className="flex-1 flex items-center justify-center bg-[#111]">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-3 font-serif">Welcome to Community</h2>
            <p className="text-gray-500 mb-6">
              {servers.length === 0 ? 'No servers yet. Create one to get started!' : 'Select a server from the sidebar.'}
            </p>
            <Button onClick={() => setShowCreateServer(true)} className="bg-gradient-to-r from-red-600 to-red-700">
              Create a Server
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ChannelSidebar
            server={activeServer}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onSelectChannel={(ch) => { setActiveChannel(ch); setInVideoCall(false); }}
            onAddChannel={(category) => setAddChannelCategory(category)}
            onOpenSettings={() => setShowServerSettings(true)}
            user={user}
            memberRole={memberRole}
          />

          {/* Main content area */}
          {inVideoCall && (isVideoChannel) ? (
            <VideoCallPanel
              channel={activeChannel}
              server={activeServer}
              user={user}
              members={members}
              onLeave={() => setInVideoCall(false)}
            />
          ) : isCodeChannel ? (
            <CodeChannelPanel channel={activeChannel} server={activeServer} user={user} />
          ) : isVideoChannel ? (
            // Voice/Video channel landing — join button
            <div className="flex-1 flex flex-col items-center justify-center bg-[#111] gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                {activeChannel?.type === 'voice'
                  ? <span className="text-3xl">🎙️</span>
                  : <span className="text-3xl">📹</span>}
              </div>
              <h2 className="text-white font-bold text-xl">{activeChannel?.name}</h2>
              <p className="text-gray-400 text-sm">
                {activeChannel?.type === 'voice' ? 'Voice channel' : 'Video channel'}
              </p>
              <Button onClick={() => setInVideoCall(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-8 py-3 text-lg">
                {activeChannel?.type === 'voice' ? '🎙️ Join Voice' : '📹 Join Video'}
              </Button>
            </div>
          ) : (
            <ChatPanel channel={activeChannel} server={activeServer} user={user} />
          )}

          <MemberPanel members={members} onMemberClick={setSelectedMember} />
        </>
      )}

      {showCreateServer && (
        <CreateServerModal user={user} onClose={() => setShowCreateServer(false)}
          onCreated={(server) => { queryClient.invalidateQueries({ queryKey: ['servers'] }); handleSelectServer(server); }} />
      )}
      {addChannelCategory !== null && (
        <AddChannelModal server={activeServer} category={addChannelCategory} onClose={() => setAddChannelCategory(null)} />
      )}
      {showServerSettings && activeServer && (
        <ServerSettingsModal server={activeServer} user={user} onClose={() => setShowServerSettings(false)} />
      )}
      {selectedMember && (
        <MemberProfilePopup
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onStartDM={(email, name) => { handleStartDM(email, name); }}
          currentUserEmail={user?.email}
        />
      )}
    </div>
  );
}