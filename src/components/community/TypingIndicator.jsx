import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Shared typing state per channel stored in a simple entity polling approach
// We use a presence heartbeat in the ServerMember entity for online/idle/offline

export function usePresence(user, serverId) {
  useEffect(() => {
    if (!user?.email || !serverId) return;
    // Set online
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

    const handleFocus = () => setStatus('online');
    const handleBlur = () => setStatus('idle');
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      setStatus('offline');
    };
  }, [user?.email, serverId]);
}

export function useTyping(channelId, user) {
  const [typingUsers, setTypingUsers] = useState([]);
  const typingRef = useRef({});
  const isTypingRef = useRef(false);
  const timerRef = useRef(null);

  // Poll for typing state via a lightweight key in localStorage + entity subscription
  useEffect(() => {
    if (!channelId || !user?.email) return;

    const key = `typing_${channelId}`;
    const checkTyping = () => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) { setTypingUsers([]); return; }
        const data = JSON.parse(raw);
        const now = Date.now();
        const active = Object.entries(data)
          .filter(([email, ts]) => email !== user.email && now - ts < 4000)
          .map(([email]) => email.split('@')[0]);
        setTypingUsers(active);
      } catch {}
    };

    checkTyping();
    const interval = setInterval(checkTyping, 500);
    return () => clearInterval(interval);
  }, [channelId, user?.email]);

  const startTyping = () => {
    if (!channelId || !user?.email) return;
    const key = `typing_${channelId}`;
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : {};
      data[user.email] = Date.now();
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => stopTyping(), 3000);
  };

  const stopTyping = () => {
    if (!channelId || !user?.email) return;
    const key = `typing_${channelId}`;
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : {};
      delete data[user.email];
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
    if (timerRef.current) clearTimeout(timerRef.current);
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
        {[0,1,2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
        ))}
      </div>
      <span className="text-gray-500 text-xs italic">{text}</span>
    </div>
  );
}