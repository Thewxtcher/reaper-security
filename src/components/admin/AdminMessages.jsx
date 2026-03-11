import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, AlertTriangle, Trash2, MessageSquare, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminMessages({ user }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('server');
  const queryClient = useQueryClient();

  const { data: serverMessages = [] } = useQuery({
    queryKey: ['adminServerMessages'],
    queryFn: () => base44.entities.Message.list('-created_date', 200),
  });

  const { data: dms = [] } = useQuery({
    queryKey: ['adminDMs'],
    queryFn: () => base44.entities.DirectMessage.list('-created_date', 200),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['adminConversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date', 100),
  });

  const deleteServerMsg = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_deleted: true, content: '[Deleted by admin]' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminServerMessages'] }),
  });

  const deleteDM = useMutation({
    mutationFn: (id) => base44.entities.DirectMessage.update(id, { is_deleted: true, content: '[Deleted by admin]' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDMs'] }),
  });

  const getConvName = (convId) => {
    const c = conversations.find(c => c.id === convId);
    return c ? (c.name || c.participant_emails?.join(', ')) : convId?.slice(0, 8);
  };

  const filteredServer = serverMessages.filter(m =>
    !search || m.content?.toLowerCase().includes(search.toLowerCase()) || m.author_email?.includes(search)
  );

  const filteredDMs = dms.filter(m =>
    !search || m.content?.toLowerCase().includes(search.toLowerCase()) || m.author_email?.includes(search)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 text-sm">Server channel messages and direct messages</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-400 text-sm mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Handle user data responsibly. Deletions soft-delete message content.
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('server')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === 'server' ? 'bg-red-600/20 text-red-400 border border-red-600/20' : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'}`}>
          <MessageSquare className="w-4 h-4" />Server Messages
          <Badge className="bg-white/5 text-gray-500 text-xs">{serverMessages.length}</Badge>
        </button>
        <button onClick={() => setTab('dm')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${tab === 'dm' ? 'bg-red-600/20 text-red-400 border border-red-600/20' : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'}`}>
          <Lock className="w-4 h-4" />Direct Messages
          <Badge className="bg-white/5 text-gray-500 text-xs">{dms.length}</Badge>
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by content or email..."
          className="pl-9 bg-[#111] border-white/10 text-white" />
      </div>

      {tab === 'server' && (
        <div className="space-y-2">
          {filteredServer.slice(0, 150).map(m => (
            <Card key={m.id} className="bg-[#111] border-white/5">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {m.author_email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-sm truncate">{m.is_deleted ? '[Deleted]' : m.content}</div>
                  <div className="text-gray-600 text-xs">{m.author_email} · ch:{m.channel_id?.slice(0, 8)}</div>
                </div>
                <div className="text-xs text-gray-600 shrink-0">{new Date(m.created_date).toLocaleString()}</div>
                {!m.is_deleted && (
                  <Button size="icon" variant="ghost" onClick={() => deleteServerMsg.mutate(m.id)}
                    className="text-gray-500 hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredServer.length === 0 && <div className="text-center py-12 text-gray-600">No messages found</div>}
        </div>
      )}

      {tab === 'dm' && (
        <div className="space-y-2">
          {filteredDMs.slice(0, 150).map(m => (
            <Card key={m.id} className="bg-[#111] border-white/5">
              <CardContent className="p-3 flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {m.author_email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-sm truncate">{m.is_deleted ? '[Deleted]' : m.content}</div>
                  <div className="text-gray-600 text-xs">{m.author_email} → conv:{getConvName(m.conversation_id)}</div>
                </div>
                <div className="text-xs text-gray-600 shrink-0">{new Date(m.created_date).toLocaleString()}</div>
                {!m.is_deleted && (
                  <Button size="icon" variant="ghost" onClick={() => deleteDM.mutate(m.id)}
                    className="text-gray-500 hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredDMs.length === 0 && <div className="text-center py-12 text-gray-600">No DMs found</div>}
        </div>
      )}
    </div>
  );
}