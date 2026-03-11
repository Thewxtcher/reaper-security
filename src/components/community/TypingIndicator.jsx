import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function usePresence(user, serverId) {
  useEffect(() => {
    if (!user?.email || !serverId) return;
    const setStatus = async (status) => {
      try {
        const members = await base44.entities.ServerMember.filter({ server_id: serverId, user_email: user.email });
        if (members.length > 0) {
          await base44.entities.ServerMember.update(members[0].id, { status, last_seen: new Date().toISOString() });
        }
      } catch {}
    };

    setStatus('online');
    const heartbeat = setInterval(() => setStatus('online'), 30000);
    const handleVisible = () => setStatus(document.hidden ? 'idle' : 'online');
    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', () => setStatus('online'));
    window.addEventListener('blur', () => setStatus('idle'));

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisible);
      setStatus('offline');
    };
  }, [user?.email, serverId]);
}

export function useTyping(channelId, user) {
  const [typingUsers, setTypingUsers] = useState([]);
  const timerRef = useRef(null);
  const recordIdRef = useRef(null);

  // Subscribe to typing status changes for this channel
  useEffect(() => {
    if (!channelId || !user?.email) return;

    // Load initial state
    const load = async () => {
      try {
        const records = await base44.entities.TypingStatus.filter({ channel_id: channelId });
        const now = Date.now();
        const active = records.filter(r =>
          r.user_email !== user.email &&
          r.last_typed &&
          now - new Date(r.last_typed).getTime() < 5000
        ).map(r => r.user_name || r.user_email.split('@')[0]);
        setTypingUsers(active);
      } catch {}
    };

    load();

    // Real-time subscription
    const unsub = base44.entities.TypingStatus.subscribe(async () => {
      try {
        const records = await base44.entities.TypingStatus.filter({ channel_id: channelId });
        const now = Date.now();
        const active = records.filter(r =>
          r.user_email !== user.email &&
          r.last_typed &&
          now - new Date(r.last_typed).getTime() < 5000
        ).map(r => r.user_name || r.user_email.split('@')[0]);
        setTypingUsers(active);
      } catch {}
    });

    // Poll every 2s to expire stale typing indicators
    const poll = setInterval(async () => {
      try {
        const records = await base44.entities.TypingStatus.filter({ channel_id: channelId });
        const now = Date.now();
        const active = records.filter(r =>
          r.user_email !== user.email &&
          r.last_typed &&
          now - new Date(r.last_typed).getTime() < 5000
        ).map(r => r.user_name || r.user_email.split('@')[0]);
        setTypingUsers(active);
      } catch {}
    }, 2000);

    return () => { unsub(); clearInterval(poll); };
  }, [channelId, user?.email]);

  const startTyping = async () => {
    if (!channelId || !user?.email) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => stopTyping(), 4000);

    try {
      if (recordIdRef.current) {
        await base44.entities.TypingStatus.update(recordIdRef.current, { last_typed: new Date().toISOString() });
      } else {
        const existing = await base44.entities.TypingStatus.filter({ channel_id: channelId, user_email: user.email });
        if (existing.length > 0) {
          recordIdRef.current = existing[0].id;
          await base44.entities.TypingStatus.update(existing[0].id, { last_typed: new Date().toISOString() });
        } else {
          const rec = await base44.entities.TypingStatus.create({
            channel_id: channelId,
            user_email: user.email,
            user_name: user.full_name || user.email.split('@')[0],
            last_typed: new Date().toISOString(),
          });
          recordIdRef.current = rec.id;
        }
      }
    } catch {}
  };

  const stopTyping = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!recordIdRef.current) return;
    try {
      await base44.entities.TypingStatus.delete(recordIdRef.current);
      recordIdRef.current = null;
    } catch {}
  };

  return { typingUsers, startTyping, stopTyping };
}

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return <div className="h-5" />;

  const text = typingUsers.length === 1
    ? `${typingUsers[0]} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    : `${typingUsers.length} people are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-1 h-5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
        ))}
      </div>
      <span className="text-gray-500 text-xs italic">{text}</span>
    </div>
  );
}