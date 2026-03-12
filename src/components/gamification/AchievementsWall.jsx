import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

const ACHIEVEMENTS = [
  // First steps
  { id: 'first_blood',  name: 'First Blood',     desc: 'Solve your first challenge',   icon: '🩸', check: (s, solves) => solves >= 1 },
  { id: 'getting_started', name: 'Getting Started', desc: 'Earn 100 XP',              icon: '🌱', check: (s) => (s?.xp||0) >= 100 },
  // XP milestones
  { id: 'xp_500',       name: 'Rising Threat',    desc: 'Earn 500 XP',                icon: '⚡', check: (s) => (s?.xp||0) >= 500 },
  { id: 'xp_1500',      name: 'Gold Status',      desc: 'Earn 1,500 XP',              icon: '🏆', check: (s) => (s?.xp||0) >= 1500 },
  { id: 'xp_4000',      name: 'Platinum Tier',    desc: 'Earn 4,000 XP',              icon: '💎', check: (s) => (s?.xp||0) >= 4000 },
  { id: 'xp_10000',     name: 'Elite Ghost',      desc: 'Earn 10,000 XP',             icon: '💀', check: (s) => (s?.xp||0) >= 10000 },
  // Challenge counts
  { id: 'solves_5',     name: 'Apprentice',       desc: 'Solve 5 challenges',         icon: '🔓', check: (s, solves) => solves >= 5 },
  { id: 'solves_10',    name: 'Expert',           desc: 'Solve 10 challenges',        icon: '🎯', check: (s, solves) => solves >= 10 },
  { id: 'solves_25',    name: 'Veteran',          desc: 'Solve 25 challenges',        icon: '🎖️', check: (s, solves) => solves >= 25 },
  { id: 'solves_50',    name: 'Legend',           desc: 'Solve 50 challenges',        icon: '🌟', check: (s, solves) => solves >= 50 },
  // Community
  { id: 'contributor',  name: 'Contributor',      desc: 'Post in the forum',          icon: '✍️', check: (s, sol, posts) => posts > 0 },
  { id: 'builder',      name: 'Open Source',      desc: 'Share a code project',       icon: '🤝', check: (s, sol, posts, proj) => proj > 0 },
  // Streaks (localStorage)
  { id: 'streak_3',     name: 'Dedicated',        desc: '3-day login streak',         icon: '🔥', check: () => parseInt(localStorage.getItem('reaper_streak_count')||'0') >= 3 },
  { id: 'streak_7',     name: 'On Fire',          desc: '7-day login streak',         icon: '🌋', check: () => parseInt(localStorage.getItem('reaper_streak_count')||'0') >= 7 },
  { id: 'streak_30',    name: 'Unstoppable',      desc: '30-day login streak',        icon: '☄️', check: () => parseInt(localStorage.getItem('reaper_streak_count')||'0') >= 30 },
];

export default function AchievementsWall({ skill, solvesCount = 0, postsCount = 0, projectsCount = 0 }) {
  const earned = ACHIEVEMENTS.filter(a => { try { return a.check(skill, solvesCount, postsCount, projectsCount); } catch { return false; } });

  return (
    <Card className="bg-[#111] border border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Achievements
          <span className="ml-auto text-xs text-gray-500 font-normal">
            {earned.length}/{ACHIEVEMENTS.length}
          </span>
        </CardTitle>
        <div className="bg-white/5 rounded-full h-1.5 mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earned.length / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {ACHIEVEMENTS.map((ach, i) => {
            const isEarned = earned.includes(ach);
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                title={`${ach.name}: ${ach.desc}`}
                className={`group relative flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center cursor-default transition-all
                  ${isEarned
                    ? 'bg-yellow-500/8 border-yellow-500/30 hover:border-yellow-400/60 hover:bg-yellow-500/12'
                    : 'bg-[#0a0a0a] border-white/5 grayscale opacity-35'
                  }`}
              >
                <span className={`text-xl leading-none ${isEarned ? '' : 'opacity-50'}`}>{ach.icon}</span>
                <span className={`text-[9px] font-semibold leading-tight ${isEarned ? 'text-yellow-400' : 'text-gray-700'}`}>
                  {ach.name}
                </span>
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                  {ach.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
        {earned.length === 0 && (
          <p className="text-center text-gray-700 text-xs mt-4">Solve challenges to unlock achievements!</p>
        )}
      </CardContent>
    </Card>
  );
}