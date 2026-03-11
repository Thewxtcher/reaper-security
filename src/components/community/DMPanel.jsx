import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, X, Edit2, Check, Smile, Reply, Trash2, Users, Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaPicker from './MediaPicker';

const EMOJIS = ['👍','❤️','😂','😮','😢','🔥','💯','🎉'];

function Avatar({ name, size = 8, color = 'from-red-500 to-green-600' }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function DMMessage({ msg, user, prevMsg, onReact, onDelete, onEdit }) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(msg.content);
  const [showEmoji, setShowEmoji] = useState(false);

  const isOwn = msg.author_email === user?.email;
  const grouped = prevMsg?.author_email === msg.author_email &&
    (new Date(msg.created_date) - new Date(prevMsg.created_date)) / 60000 < 5;

  if (msg.is_deleted) return <div className="px-4 py-0.5 text-gray-600 italic text-xs">Message deleted</div>;

  return (
    <div
      className={`px-4 relative group ${grouped ? 'py-0.5' : 'pt-3 pb-0.5'}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowEmoji(false); }}
    >
      <div className="flex items-start gap-3">
        {!grouped ? (
          <Avatar name={msg.author_name} size={8} />
        ) : (
          <div className="w-8 flex-shrink-0">
            {hovering && <span className="text-[10px] text-gray-600 block text-right leading-8">
              {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {!grouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-white text-sm font-medium">{msg.author_name || msg.author_email?.split('@')[0]}</span>
              <span className="text-gray-600 text-xs">{new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {editing ? (
            <div className="flex gap-2">
              <input className="flex-1 bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none" value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onEdit(msg.id, editVal); setEditing(false); } if (e.key === 'Escape') setEditing(false); }} autoFocus />
              <button onClick={() => { onEdit(msg.id, editVal); setEditing(false); }} className="text-green-400"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditing(false)} className="text-gray-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <>
              {msg.attachments?.map((att, i) => (
                <div key={i} className="mt-1 max-w-xs">
                  {att.type === 'gif' || att.type === 'image' ? (
                    <img src={att.url} alt={att.name} className="rounded-lg max-w-full max-h-60 object-cover" />
                  ) : att.type === 'video' ? (
                    <video src={att.url} controls className="rounded-lg max-w-full max-h-60" />
                  ) : att.url ? (
                    <a href={att.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-colors">
                      <span className="text-2xl">📎</span>
                      <span className="text-blue-400 text-sm truncate hover:underline">{att.name}</span>
                    </a>
                  ) : null}
                </div>
              ))}
              {msg.content && !(msg.attachments?.length === 1 && (msg.attachments[0].type === 'gif' || msg.attachments[0].type === 'image') && msg.content === msg.attachments[0].name) && (
                <p className="text-gray-300 text-sm leading-relaxed break-words">{msg.content}{msg.is_edited && <span className="text-gray-600 text-xs ml-1">(edited)</span>}</p>
              )}
            </>
          )}
          {msg.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {msg.reactions.map((r, i) => (
                <button key={i} onClick={() => onReact(msg.id, r.emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${r.users?.includes(user?.email) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                  {r.emoji} {r.users?.length || 0}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {hovering && !editing && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.1 }}
            className="absolute right-4 top-1 flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-1 py-0.5 shadow-lg z-10">
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 text-gray-400 hover:text-white rounded"><Smile className="w-4 h-4" /></button>
              {showEmoji && (
                <div className="absolute right-0 bottom-full mb-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex gap-1 shadow-xl">
                  {EMOJIS.map(e => <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false); }} className="text-xl hover:scale-125 transition-transform">{e}</button>)}
                </div>
              )}
            </div>
            {isOwn && <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-white rounded"><Edit2 className="w-4 h-4" /></button>}
            {isOwn && <button onClick={() => onDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DMPanel({ conversation, user }) {
  const [input, setInput] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['dms', conversation?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: conversation.id }, 'created_date', 100),
    enabled: !!conversation?.id,
    refetchInterval: 2000,
  });

  useEffect(() => {
    const unsub = base44.entities.DirectMessage.subscribe(event => {
      if (event.data?.conversation_id === conversation?.id) {
        queryClient.invalidateQueries({ queryKey: ['dms', conversation.id] });
      }
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.DirectMessage.create(data),
    onSuccess: async (msg) => {
      queryClient.invalidateQueries({ queryKey: ['dms', conversation.id] });
      await base44.entities.Conversation.update(conversation.id, {
        last_message: input.slice(0, 80),
        last_message_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const editMutation = useMutation({
    mutationFn: ({ id, content }) => base44.entities.DirectMessage.update(id, { content, is_edited: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dms', conversation.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DirectMessage.update(id, { is_deleted: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dms', conversation.id] }),
  });

  const reactMutation = useMutation({
    mutationFn: ({ id, emoji }) => {
      const msg = messages.find(m => m.id === id);
      const reactions = [...(msg?.reactions || [])];
      const idx = reactions.findIndex(r => r.emoji === emoji);
      if (idx === -1) reactions.push({ emoji, users: [user.email] });
      else {
        const users = reactions[idx].users || [];
        if (users.includes(user.email)) {
          reactions[idx] = { ...reactions[idx], users: users.filter(u => u !== user.email) };
          if (reactions[idx].users.length === 0) reactions.splice(idx, 1);
        } else reactions[idx] = { ...reactions[idx], users: [...users, user.email] };
      }
      return base44.entities.DirectMessage.update(id, { reactions });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dms', conversation.id] }),
  });

  const doSend = (content, attachments = []) => {
    sendMutation.mutate({
      conversation_id: conversation.id,
      author_email: user.email,
      author_name: user.full_name || user.email.split('@')[0],
      content,
      attachments,
      read_by: [user.email],
    });
    base44.entities.Conversation.update(conversation.id, {
      last_message: content.slice(0, 80),
      last_message_at: new Date().toISOString(),
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    doSend(input.trim());
    setInput('');
  };

  const handleEmojiSelect = (emoji) => setInput(prev => prev + emoji);

  const handleGifSelect = async (gifUrl, title) => {
    doSend(gifUrl, [{ url: gifUrl, name: title || 'GIF', type: 'gif' }]);
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
      doSend(file.name, [{ url: file_url, name: file.name, type }]);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const otherName = conversation?.type === 'group'
    ? conversation.name
    : conversation?.participant_names?.find(n => n !== (user?.full_name || user?.email)) || 'User';

  // Mark messages as read on open
  useEffect(() => {
    if (!messages.length || !user?.email) return;
    messages.filter(m => !m.read_by?.includes(user.email)).forEach(m => {
      base44.entities.DirectMessage.update(m.id, { read_by: [...(m.read_by || []), user.email] });
    });
  }, [messages.length]);

  const lastMsg = messages[messages.length - 1];
  const isLastRead = lastMsg?.read_by?.some(e => e !== user.email);

  return (
    <div className="flex-1 flex flex-col bg-[#111] min-w-0">
      <div className="h-12 px-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
        <Avatar name={otherName} size={8} />
        <div>
          <div className="text-white font-semibold text-sm">{otherName}</div>
          {conversation?.type === 'group' && (
            <div className="text-gray-500 text-xs">{conversation.participant_emails?.length} members</div>
          )}
        </div>
        {conversation?.type === 'group' && (
          <div className="ml-auto flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Avatar name={otherName} size={16} />
            <h3 className="text-white font-semibold mt-4 mb-1">{otherName}</h3>
            <p className="text-gray-500 text-sm">Start a conversation.</p>
          </div>
        ) : messages.map((msg, i) => (
          <DMMessage key={msg.id} msg={msg} user={user} prevMsg={messages[i - 1]}
            onReact={(id, emoji) => reactMutation.mutate({ id, emoji })}
            onEdit={(id, content) => editMutation.mutate({ id, content })}
            onDelete={(id) => deleteMutation.mutate(id)} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Read receipt */}
      {isLastRead && lastMsg?.author_email === user?.email && (
        <div className="px-4 pb-1 flex justify-end">
          <span className="text-[10px] text-blue-400 flex items-center gap-1">
            <Check className="w-3 h-3" />Seen
          </span>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="relative flex items-center gap-2 bg-[#1a1a1a] rounded-xl border border-white/10 px-4 py-2">
          <AnimatePresence>
            {showPicker && (
              <MediaPicker
                onSelectEmoji={handleEmojiSelect}
                onSelectGif={handleGifSelect}
                onUpload={handleFileUpload}
                onClose={() => setShowPicker(false)}
              />
            )}
          </AnimatePresence>
          <button onClick={() => setShowPicker(!showPicker)}
            className={`p-1 rounded flex-shrink-0 transition-colors ${showPicker ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
            title="Emoji / GIF / File">
            <Smile className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={uploading ? 'Uploading...' : `Message ${otherName}`}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-600 focus:outline-none"
          />
          <button onClick={handleSend} disabled={(!input.trim() && !uploading) || sendMutation.isPending || uploading}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white transition-colors flex-shrink-0">
            {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}