import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const STREAK_KEY = 'reaper_streak_count';
const LAST_LOGIN_KEY = 'reaper_last_login_date';

export function getStreakData() {
  const today = new Date().toDateString();
  const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
  const storedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0');
  let streak = storedStreak;
  let updated = false;

  if (!lastLogin) {
    streak = 1; updated = true;
  } else if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streak = lastLogin === yesterday.toDateString() ? storedStreak + 1 : 1;
    updated = true;
  }

  if (updated) {
    localStorage.setItem(STREAK_KEY, streak.toString());
    localStorage.setItem(LAST_LOGIN_KEY, today);
  }
  return streak;
}

export function getXPMultiplier(streak, userXP = 0) {
  let m = 1;
  // Skill Tree amplifiers (unlocked passively by XP)
  if (userXP >= 10000) m += 1.0;
  else if (userXP >= 2500) m += 0.25;
  else if (userXP >= 750) m += 0.10;
  // Streak bonuses
  if (streak >= 30) m += 1.0;
  else if (streak >= 14) m += 0.5;
  else if (streak >= 7) m += 0.25;
  else if (streak >= 3) m += 0.15;
  else if (streak >= 2) m += 0.05;
  // Power Hour: 6pm-8pm local
  const h = new Date().getHours();
  if (h >= 18 && h < 20) m += 0.5;
  return Math.round(m * 10) / 10;
}

export default function StreakTracker({ isAuth, userXP = 0 }) {
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    setStreak(getStreakData());
    setMounted(true);
  }, [isAuth]);

  if (!mounted || !isAuth) return null;

  const multiplier = getXPMultiplier(streak, userXP);
  const isPowerHour = (() => { const h = new Date().getHours(); return h >= 18 && h < 20; })();
  const flameColor = streak >= 14 ? 'text-red-400' : streak >= 7 ? 'text-orange-400' : 'text-yellow-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-[#111] border border-orange-500/20 rounded-xl px-4 py-3 mb-6"
    >
      <div className="relative flex-shrink-0">
        <Flame className={`w-8 h-8 ${flameColor}`} />
        {streak >= 7 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`absolute inset-0 ${flameColor}`}
          >
            <Flame className={`w-8 h-8 ${flameColor} opacity-40`} />
          </motion.div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold text-sm">
            {streak === 0 ? 'No streak yet' : `${streak}-Day Streak!`}
          </span>
          {streak >= 7 && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">🔥 ON FIRE</span>}
          {streak >= 30 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">☄️ LEGEND</span>}
        </div>
        <p className="text-xs text-gray-500">
          {streak <= 1 ? 'Return tomorrow to start a streak bonus!' : `${streak} consecutive days — keep going!`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {multiplier > 1 && (
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full"
          >
            {multiplier}× XP
          </motion.span>
        )}
        {isPowerHour && (
          <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full animate-pulse">
            ⚡ Power Hour
          </span>
        )}
      </div>
    </motion.div>
  );
}