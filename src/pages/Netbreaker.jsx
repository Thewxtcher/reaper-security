import React, { useState, useEffect, useRef } from 'react';
import { X, Gamepad2, Zap, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const GAME_URL = "https://media.base44.com/files/public/69b1d8c2b8ddf9df46c6610d/514ba80ed_812400612_netbreaker-v55.html";

export default function Netbreaker() {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetch(GAME_URL)
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: 'text/html' });
        setBlobUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black pt-16">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#0d0d0d] border-b border-green-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-mono font-bold text-sm tracking-widest">NETBREAKER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-700 text-[10px] font-mono hidden sm:block">BROWSER-BASED HACKING GAME</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-green-400"><Zap className="w-3 h-3" />Earn XP</span>
          <span className="flex items-center gap-1 text-yellow-400"><Trophy className="w-3 h-3" />Leaderboard</span>
          <span className="flex items-center gap-1 text-blue-400"><Target className="w-3 h-3" />Skill Building</span>
        </div>
      </div>

      {/* Game */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-green-400 font-mono text-sm animate-pulse mb-2">Loading NETBREAKER...</div>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-1 bg-green-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      ) : blobUrl ? (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          className="flex-1 w-full border-none"
          title="NETBREAKER"
          allow="fullscreen; pointer-lock"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-red-400 font-mono text-sm">Failed to load game. Check your connection.</div>
        </div>
      )}
    </div>
  );
}