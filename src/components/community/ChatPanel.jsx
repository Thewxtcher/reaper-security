import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Reply, Smile, Pin, Trash2, Edit2, Check, X, 
  Hash, Paperclip, ChevronDown, Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TypingIndicator, { useTyping } from './TypingIndicator';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '💯', '🎉'];

function MessageBubble({ msg, user, onReply, onDelete, onEdit, onReact, onPin, prevMsg }) {
  const [hovering, setHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);
  const [showEmoji, setShowEmoji] = useState(false);

  const isOwn = msg.author_email === user?.email;
  const isSameAuthor = prevMsg?.author_email === msg.author_email;
  const timeDiff = prevMsg ? (new Date(msg.created_date) - new Date(prevMsg.created_date)) / 1000 / 60 : 999;
  const grouped = isSameAuthor && timeDiff < 5;

  const handleEdit = () => {
    onEdit(msg.id, editContent);
    setEditing(false);
  };

  if (msg.is_deleted) {
    return (
      <div className="px-4 py-0.5">
        <span className="text-gray-600 italic text-sm">Message deleted</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`px-4 relative group ${grouped ? 'py-0.5' : 'pt-3 pb-0.5'}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setShowEmoji(false); }}
    >
      {/* Reply preview */}
      {msg.reply_to_id && msg.reply_to_preview && (
        <div className="flex items-center gap-2 mb-1 ml-10 text-xs text-gray-500">
          <Reply className="w-3 h-3" />
          <span className="truncate">{msg.reply_to_preview}</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {!grouped ? (
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-red-500 to-green-600 mt-0.5">
            {msg.author_name?.[0]?.toUpperCase() || '?'}
          </div>
        ) : (
          <div className="w-8 flex-shrink-0">
            {hovering && (
              <span className="text-[10px] text-gray-600 leading-8 text-right block">
                {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {!grouped && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-white font-medium text-sm">{msg.author_name || msg.author_email?.split('@')[0]}</span>
              <span className="text-gray-600 text-xs">
                {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.is_pinned && <Pin className="w-3 h-3 text-yellow-500" />}
            </div>
          )}

          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/30"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false); }}
                autoFocus
              />
              <button onClick={handleEdit} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <>
              {msg.type === 'code' ? (
                <pre className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono overflow-x-auto mt-1">
                  <code>{msg.content}</code>
                </pre>
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed break-words">{msg.content}
                  {msg.is_edited && <span className="text-gray-600 text-xs ml-1">(edited)</span>}
                </p>
              )}
            </>
          )}

          {/* Reactions */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {msg.reactions.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onReact(msg.id, r.emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    r.users?.includes(user?.email)
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {r.emoji} <span>{r.users?.length || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action toolbar */}
      <AnimatePresence>
        {hovering && !editing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="absolute right-4 top-1 flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-1 py-0.5 shadow-lg z-10"
          >
            <div className="relative">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
                title="Add Reaction"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmoji && (
                <div className="absolute right-0 bottom-full mb-1 bg-[#1a1a1a] border border-white/10 rounded-lg p-2 flex gap-1 shadow-xl">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false); }}
                      className="text-xl hover:scale-125 transition-transform">
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => onReply(msg)} className="p-1.5 text-gray-400 hover:text-white rounded transition-colors" title="Reply">
              <Reply className="w-4 h-4" />
            </button>
            <button onClick={() => onPin(msg.id)} className="p-1.5 text-gray-400 hover:text-yellow-400 rounded transition-colors" title="Pin">
              <Pin className="w-4 h-4" />
            </button>
            {isOwn && (
              <>
                <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-white rounded transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ChatPanel({ channel, server, user }) {
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isCode, setIsCode] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const { typingUsers, startTyping, stopTyping } = useTyping(channel?.id, user);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', channel?.id],
    queryFn: () => base44.entities.Message.filter({ channel_id: channel.id }, 'created_date', 100),
    enabled: !!channel?.id,
    refetchInterval: 2000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!channel?.id) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.channel_id === channel.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', channel.id] });
      }
    });
    return unsub;
  }, [channel?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', channel?.id] }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, content }) => base44.entities.Message.update(id, { content, is_edited: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', channel?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_deleted: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', channel?.id] }),
  });

  const pinMutation = useMutation({
    mutationFn: (id) => {
      const msg = messages.find(m => m.id === id);
      return base44.entities.Message.update(id, { is_pinned: !msg?.is_pinned });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', channel?.id] }),
  });

  const reactMutation = useMutation({
    mutationFn: ({ id, emoji }) => {
      const msg = messages.find(m => m.id === id);
      const reactions = [...(msg?.reactions || [])];
      const idx = reactions.findIndex(r => r.emoji === emoji);
      if (idx === -1) {
        reactions.push({ emoji, users: [user.email] });
      } else {
        const users = reactions[idx].users || [];
        if (users.includes(user.email)) {
          reactions[idx] = { ...reactions[idx], users: users.filter(u => u !== user.email) };
          if (reactions[idx].users.length === 0) reactions.splice(idx, 1);
        } else {
          reactions[idx] = { ...reactions[idx], users: [...users, user.email] };
        }
      }
      return base44.entities.Message.update(id, { reactions });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', channel?.id] }),
  });

  const handleSend = () => {
    if (!input.trim() || !channel) return;
    stopTyping();
    sendMutation.mutate({
      channel_id: channel.id,
      server_id: server.id,
      author_email: user.email,
      author_name: user.full_name || user.email.split('@')[0],
      content: input.trim(),
      type: isCode ? 'code' : 'text',
      reply_to_id: replyTo?.id || null,
      reply_to_preview: replyTo ? `${replyTo.author_name}: ${replyTo.content.slice(0, 60)}` : null,
    });
    setInput('');
    setReplyTo(null);
    setIsCode(false);
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#111]">
        <div className="text-center text-gray-600">
          <Hash className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#111] min-w-0">
      {/* Channel header */}
      <div className="h-12 px-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0 shadow-sm">
        <Hash className="w-5 h-5 text-gray-400" />
        <span className="text-white font-semibold">{channel.name}</span>
        {channel.topic && (
          <>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-gray-500 text-sm truncate">{channel.topic}</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold mb-1">Welcome to #{channel.name}</h3>
            <p className="text-gray-500 text-sm">This is the beginning of #{channel.name}.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                user={user}
                prevMsg={messages[i - 1]}
                onReply={setReplyTo}
                onDelete={(id) => deleteMutation.mutate(id)}
                onEdit={(id, content) => editMutation.mutate({ id, content })}
                onReact={(id, emoji) => reactMutation.mutate({ id, emoji })}
                onPin={(id) => pinMutation.mutate(id)}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 py-2 text-sm text-gray-400 border-t border-white/5">
              <Reply className="w-4 h-4" />
              <span>Replying to <strong className="text-white">{replyTo.author_name}</strong>: {replyTo.content.slice(0, 50)}</span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-600 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className={`flex items-end gap-2 bg-[#1a1a1a] rounded-xl border ${isCode ? 'border-green-500/30' : 'border-white/10'} px-4 py-2`}>
          <button
            onClick={() => setIsCode(!isCode)}
            className={`p-1 rounded transition-colors flex-shrink-0 ${isCode ? 'text-green-400' : 'text-gray-600 hover:text-gray-300'}`}
            title="Toggle code mode"
          >
            <Code className="w-4 h-4" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={`Message #${channel.name}${isCode ? ' (code mode)' : ''}`}
            className={`flex-1 bg-transparent text-white text-sm placeholder:text-gray-600 focus:outline-none resize-none leading-6 max-h-40 ${isCode ? 'font-mono' : ''}`}
            rows={1}
            style={{ height: 'auto', minHeight: '24px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}