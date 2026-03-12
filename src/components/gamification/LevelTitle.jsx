import React from 'react';
import { motion } from 'framer-motion';

const TITLES = [
  { minXP: 0,     title: 'Script Kiddie',      icon: '💻', color: 'text-gray-400',   border: 'border-gray-600/30' },
  { minXP: 50,    title: 'Curious Hacker',      icon: '🔍', color: 'text-green-400',  border: 'border-green-600/30' },
  { minXP: 150,   title: 'Recon Operative',     icon: '📡', color: 'text-green-400',  border: 'border-green-600/30' },
  { minXP: 300,   title: 'Code Breaker',        icon: '🧩', color: 'text-blue-400',   border: 'border-blue-600/30' },
  { minXP: 500,   title: 'Penetration Trainee', icon: '🔓', color: 'text-blue-400',   border: 'border-blue-600/30' },
  { minXP: 750,   title: 'Network Ghost',       icon: '👻', color: 'text-purple-400', border: 'border-purple-600/30' },
  { minXP: 1000,  title: 'Exploit Engineer',    icon: '⚙️', color: 'text-purple-400', border: 'border-purple-600/30' },
  { minXP: 1500,  title: 'Ethical Hacker',      icon: '🛡️', color: 'text-yellow-400', border: 'border-yellow-500/40' },
  { minXP: 2000,  title: 'Red Team Operative',  icon: '🎯', color: 'text-red-400',    border: 'border-red-500/40' },
  { minXP: 2500,  title: 'Shadow Analyst',      icon: '🌑', color: 'text-red-400',    border: 'border-red-500/40' },
  { minXP: 3500,  title: 'Cyber Specter',       icon: '👁️', color: 'text-cyan-400',   border: 'border-cyan-500/40' },
  { minXP: 4000,  title: 'Platinum Operator',   icon: '💎', color: 'text-cyan-400',   border: 'border-cyan-500/40' },
  { minXP: 6000,  title: 'Shadow Broker',       icon: '🔐', color: 'text-orange-400', border: 'border-orange-500/40' },
  { minXP: 8000,  title: 'Void Walker',         icon: '🌀', color: 'text-pink-400',   border: 'border-pink-500/40' },
  { minXP: 10000, title: 'Elite Ghost',         icon: '💀', color: 'text-red-400',    border: 'border-red-500/60' },
];

export function getLevelTitle(xp = 0) {
  return [...TITLES].reverse().find(t => xp >= t.minXP) || TITLES[0];
}

export function getNextTitle(xp = 0) {
  return TITLES.find(t => t.minXP > xp) || null;
}

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1',
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

export default function LevelTitle({ xp = 0, size = 'md', showNext = false }) {
  const t = getLevelTitle(xp);
  const next = showNext ? getNextTitle(xp) : null;
  const isElite = xp >= 10000;

  return (
    <div className="flex flex-col gap-1">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center rounded-full font-bold border bg-white/5
          ${SIZE_CLASSES[size]} ${t.color} ${t.border}
          ${isElite ? 'animate-pulse shadow-lg shadow-red-500/20' : ''}`}
      >
        <span>{t.icon}</span>
        <span>{t.title}</span>
      </motion.span>
      {next && showNext && (
        <span className="text-[10px] text-gray-600">
          Next: {next.icon} {next.title} at {next.minXP} XP
        </span>
      )}
    </div>
  );
}