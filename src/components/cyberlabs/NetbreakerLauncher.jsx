import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, Zap, Trophy, Target } from 'lucide-react';

const GAME_URL = "https://media.base44.com/files/public/69b1d8c2b8ddf9df46c6610d/514ba80ed_812400612_netbreaker-v55.html";

export default function NetbreakerLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Launch Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-[#111] to-[#0a0a0a] overflow-hidden cursor-pointer group hover:border-green-400/50 transition-all"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-4 p-5">
          {/* Animated icon */}
          <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-2xl select-none">🕹️</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg tracking-wide font-mono">NETBREAKER</h3>
              <span className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-[10px] font-bold uppercase tracking-wider">LIVE</span>
            </div>
            <p className="text-gray-400 text-sm leading-snug">
              Browser-based hacking experience. Break through network defenses, solve puzzles, and learn real cybersecurity concepts.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-green-400"><Zap className="w-3 h-3" />Earn XP</span>
              <span className="flex items-center gap-1 text-xs text-yellow-400"><Trophy className="w-3 h-3" />Leaderboard</span>
              <span className="flex items-center gap-1 text-xs text-blue-400"><Target className="w-3 h-3" />Skill Building</span>
            </div>
          </div>

          <button
            className="flex-shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            onClick={e => { e.stopPropagation(); setOpen(true); }}
          >
            <Gamepad2 className="w-4 h-4" />
            Launch
          </button>
        </div>

        {/* Scanline decoration */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
        <div className="px-5 py-2 flex items-center gap-2 bg-black/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-600 text-[10px] font-mono tracking-widest">SYSTEM ONLINE // NETBREAKER v5.5 // CLICK TO LAUNCH</span>
        </div>
      </motion.div>

      {/* Fullscreen Game Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 h-10 bg-[#0d0d0d] border-b border-green-500/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-mono font-bold text-sm tracking-widest">NETBREAKER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-700 text-[10px] font-mono">ACTIVE SESSION</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs px-3 py-1 rounded border border-white/10 hover:border-white/30"
              >
                <X className="w-3.5 h-3.5" /> Exit Game
              </button>
            </div>

            {/* Game iframe */}
            <iframe
              src={GAME_URL}
              className="flex-1 w-full border-none"
              title="NETBREAKER"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}