import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  X, Settings, Hash, Volume2, Video, Code2, Shield, Lock, Unlock,
  Trash2, Plus, Crown, Users, Link2, RefreshCw, Check, Globe, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TABS = ['General', 'Channels', 'Roles', 'Invite'];

const channelIcons = { text: Hash, voice: Volume2, video: Video, code: Code2, admin: Shield };
const ROLE_OPTIONS = ['owner', 'admin', 'moderator', 'member'];
const ROLE_COLORS = { owner: '#ef4444', admin: '#f97316', moderator: '#3b82f6', member: '#9ca3af' };

export default function ServerSettingsModal({ server, user, onClose }) {
  const [tab, setTab] = useState('General');
  const [name, setName] = useState(server?.name || '');
  const [description, setDescription] = useState(server?.description || '');
  const [isPrivate, setIsPrivate] = useState(server?.is_private || false);
  const [saved, setSaved] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState('text');
  const [newChannelCategory, setNewChannelCategory] = useState('Text Channels');
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery({
    queryKey: ['channels', server?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: server.id }, 'position', 100),
    enabled: !!server?.id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', server?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: server.id }, 'role', 100),
    enabled: !!server?.id,
  });

  const isOwner = server?.owner_email === user?.email;

  const updateServerMutation = useMutation({
    mutationFn: () => base44.entities.Server.update(server.id, { name: name.trim(), description: description.trim(), is_private: isPrivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const addChannelMutation = useMutation({
    mutationFn: () => base44.entities.Channel.create({
      server_id: server.id, name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
      type: newChannelType, category: newChannelCategory, position: channels.length,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['channels', server.id] }); setNewChannelName(''); },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: (id) => base44.entities.Channel.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels', server.id] }),
  });

  const toggleLockMutation = useMutation({
    mutationFn: (ch) => base44.entities.Channel.update(ch.id, { is_locked: !ch.is_locked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels', server.id] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => base44.entities.ServerMember.update(memberId, { role, role_color: ROLE_COLORS[role] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', server.id] }),
  });

  const kickMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', server.id] }),
  });

  const regenerateInviteMutation = useMutation({
    mutationFn: () => base44.entities.Server.update(server.id, { invite_code: Math.random().toString(36).substring(2, 10).toUpperCase() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servers'] }),
  });

  const inviteLink = `${window.location.origin}/Community?invite=${server?.invite_code}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const grouped = channels.reduce((acc, ch) => {
    const cat = ch.category || 'Text Channels';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Server Settings</h2>
            <p className="text-gray-500 text-xs mt-0.5">{server?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar tabs */}
          <div className="w-44 bg-[#0a0a0a] border-r border-white/5 p-3 flex-shrink-0">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                {t}
              </button>
            ))}
            {isOwner && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={async () => {
                    if (confirm('Delete this server? This cannot be undone.')) {
                      await base44.entities.Server.delete(server.id);
                      queryClient.invalidateQueries({ queryKey: ['servers'] });
                      queryClient.invalidateQueries({ queryKey: ['allServersForSidebar'] });
                      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
                      onClose();
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  Delete Server
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* ── GENERAL ── */}
            {tab === 'General' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">General Settings</h3>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Server Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} disabled={!isOwner}
                    className="bg-black border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Description</label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} disabled={!isOwner}
                    className="bg-black border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Server Visibility</label>
                  <div className="flex gap-3">
                    <button onClick={() => isOwner && setIsPrivate(false)}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-colors ${!isPrivate ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                      <Globe className={`w-5 h-5 ${!isPrivate ? 'text-green-400' : 'text-gray-500'}`} />
                      <div className="text-left">
                        <div className={`text-sm font-medium ${!isPrivate ? 'text-green-400' : 'text-gray-400'}`}>Public</div>
                        <div className="text-xs text-gray-600">Anyone can join</div>
                      </div>
                    </button>
                    <button onClick={() => isOwner && setIsPrivate(true)}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-colors ${isPrivate ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                      <Lock className={`w-5 h-5 ${isPrivate ? 'text-red-400' : 'text-gray-500'}`} />
                      <div className="text-left">
                        <div className={`text-sm font-medium ${isPrivate ? 'text-red-400' : 'text-gray-400'}`}>Private</div>
                        <div className="text-xs text-gray-600">Invite only</div>
                      </div>
                    </button>
                  </div>
                </div>
                {isOwner && (
                  <Button onClick={() => updateServerMutation.mutate()} disabled={updateServerMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700">
                    {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : updateServerMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            )}

            {/* ── CHANNELS ── */}
            {tab === 'Channels' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Channel Management</h3>
                {Object.entries(grouped).map(([cat, chs]) => (
                  <div key={cat}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{cat}</div>
                    <div className="space-y-1">
                      {chs.map(ch => {
                        const Icon = channelIcons[ch.type] || Hash;
                        return (
                          <div key={ch.id} className="flex items-center gap-2 p-2 bg-black/30 rounded-lg border border-white/5">
                            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm flex-1 truncate">{ch.name}</span>
                            {ch.is_locked && <Lock className="w-3 h-3 text-yellow-500" />}
                            <div className="flex gap-1">
                              <button onClick={() => toggleLockMutation.mutate(ch)}
                                className="p-1 text-gray-500 hover:text-yellow-400 transition-colors" title={ch.is_locked ? 'Unlock' : 'Lock'}>
                                {ch.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                              {isOwner && (
                                <button onClick={() => { if (confirm(`Delete #${ch.name}?`)) deleteChannelMutation.mutate(ch.id); }}
                                  className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {isOwner && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-white text-sm font-medium mb-3">Add Channel</h4>
                    <div className="space-y-2">
                      <Input value={newChannelName} onChange={e => setNewChannelName(e.target.value)}
                        placeholder="channel-name" className="bg-black border-white/10 text-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={newChannelType} onChange={e => setNewChannelType(e.target.value)}
                          className="bg-black border border-white/10 text-gray-300 text-sm rounded-md px-3 py-1.5">
                          {['text','voice','video','code'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={newChannelCategory} onChange={e => setNewChannelCategory(e.target.value)}
                          className="bg-black border border-white/10 text-gray-300 text-sm rounded-md px-3 py-1.5">
                          {['Text Channels','Voice Channels','Video Channels','Code Channels','Admin Channels'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <Button onClick={() => addChannelMutation.mutate()} disabled={!newChannelName.trim() || addChannelMutation.isPending}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                        <Plus className="w-4 h-4 mr-2" />Add Channel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ROLES ── */}
            {tab === 'Roles' && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Member Roles</h3>
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[m.role] || '#374151' }}>
                      {(m.nickname || m.user_name || m.user_email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{m.nickname || m.user_name || m.user_email}</div>
                      <div className="text-gray-500 text-xs">{m.user_email}</div>
                    </div>
                    {isOwner && m.user_email !== user?.email ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={m.role}
                          onChange={e => updateRoleMutation.mutate({ memberId: m.id, role: e.target.value })}
                          className="bg-black border border-white/10 text-gray-300 text-xs rounded px-2 py-1">
                          {ROLE_OPTIONS.filter(r => r !== 'owner').map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => { if (confirm(`Kick ${m.user_name}?`)) kickMemberMutation.mutate(m.id); }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${ROLE_COLORS[m.role]}20`, color: ROLE_COLORS[m.role] }}>
                        {m.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── INVITE ── */}
            {tab === 'Invite' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Server Invite</h3>
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Invite Code</div>
                  <div className="text-2xl font-mono font-bold text-white tracking-widest">{server?.invite_code}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Invite Link</div>
                  <div className="flex gap-2">
                    <input readOnly value={inviteLink}
                      className="flex-1 bg-black border border-white/10 text-gray-300 text-xs px-3 py-2 rounded-lg font-mono" />
                    <Button onClick={copyInvite} className={inviteCopied ? 'bg-green-600' : 'bg-white/10 hover:bg-white/20 text-white'}>
                      {inviteCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {isOwner && (
                  <Button onClick={() => regenerateInviteMutation.mutate()} variant="outline"
                    className="border-white/10 text-gray-300 hover:text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />Regenerate Invite Code
                  </Button>
                )}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
                  Share this link or code with people you want to invite to <strong>{server?.name}</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}