import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle2, Zap, ChevronDown } from 'lucide-react';

const SKILLS = [
  { id: 'recon',    name: 'Recon Mode',      xp: 100,   icon: '🔍', desc: '+1 hint auto-revealed per challenge', category: 'osint' },
  { id: 'crypto',   name: 'Crypto Basics',   xp: 300,   icon: '🔐', desc: 'Deeper crypto challenge context unlocked', category: 'crypto' },
  { id: 'netghost', name: 'Network Ghost',   xp: 500,   icon: '📡', desc: 'See top solver names on each challenge', category: 'network' },
  { id: 'xpamp1',  name: 'XP Amplifier I',  xp: 750,   icon: '⚡', desc: '+10% XP bonus automatically applied', category: 'boost' },
  { id: 'mystery', name: 'Mystery Access',  xp: 1000,  icon: '🎭', desc: 'Unlock daily mystery challenges (2× XP)', category: 'special' },
  { id: 'exploit', name: 'Exploit Core',    xp: 1500,  icon: '💥', desc: 'Elite exploit challenge tier unlocked', category: 'pwn' },
  { id: 'xpamp2',  name: 'XP Amplifier II', xp: 2500,  icon: '⚡⚡', desc: '+25% XP bonus automatically applied', category: 'boost' },
  { id: 'shadow',  name: 'Shadow Mode',     xp: 4000,  icon: '🌑', desc: 'Compete anonymously on the leaderboard', category: 'special' },
  { id: 'elite',   name: 'Elite Protocol',  xp: 10000, icon: '💀', desc: '2× XP on all challenges + Elite Ghost title', category: 'boost' },
];

const CAT_COLORS = {
  osint: 'border-blue-500/30 bg-blue-500/5',
  crypto: 'border-yellow-500/30 bg-yellow-500/5',
  network: 'border-purple-500/30 bg-purple-500/5',
  boost: 'border-green-500/30 bg-green-500/5',
  special: 'border-pink-500/30 bg-pink-500/5',
  pwn: 'border-red-500/30 bg-red-500/5',
};

export default function SkillTree({ currentXP = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const unlocked = SKILLS.filter(s => currentXP >= s.xp);
  const visible = expanded ? SKILLS : SKILLS.slice(0, 5);

  return (
    <Card className="bg-[#111] border border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Skill Tree
          <span className="ml-auto flex items-center gap-2">
            <span className="text-xs text-green-400 font-normal">{unlocked.length}/{SKILLS.length} unlocked</span>
          </span>
        </CardTitle>
        {/* Mini progress */}
        <div className="bg-white/5 rounded-full h-1 mt-1">
          <div className="h-1 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-700"
            style={{ width: `${(unlocked.length / SKILLS.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 p-3 pt-0">
        <AnimatePresence>
          {visible.map((skill, i) => {
            const isUnlocked = currentXP >= skill.xp;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200
                  ${isUnlocked
                    ? `${CAT_COLORS[skill.category]} hover:border-white/20`
                    : 'bg-[#0a0a0a] border-white/5 opacity-50'
                  }`}
              >
                <div className={`text-base flex-shrink-0 ${!isUnlocked ? 'grayscale' : ''}`}>{skill.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>{skill.name}</span>
                    {isUnlocked && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                  </div>
                  <p className={`text-[10px] leading-tight ${isUnlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                    {isUnlocked ? skill.desc : `Requires ${skill.xp} XP`}
                  </p>
                </div>
                {!isUnlocked && <Lock className="w-3 h-3 text-gray-700 flex-shrink-0" />}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-gray-400 py-1 transition-colors"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Show less' : `Show ${SKILLS.length - 5} more`}
        </button>
      </CardContent>
    </Card>
  );
}