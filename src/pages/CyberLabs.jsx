import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Trophy, Zap, Target, Lock, ChevronUp, Flag, Eye, EyeOff,
  Star, CheckCircle2, Clock, Users, Award, BookOpen, FlaskConical, LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import HackerTerminal from '../components/cyberlabs/HackerTerminal';
import CategoryBadges from '../components/cyberlabs/CategoryBadges';
import XPLevelUpToast from '../components/cyberlabs/XPLevelUpToast';
import GlobalLeaderboard from '../components/cyberlabs/GlobalLeaderboard';
import StreakTracker, { getStreakData, getXPMultiplier } from '../components/gamification/StreakTracker';
import LevelTitle from '../components/gamification/LevelTitle';
import SkillTree from '../components/gamification/SkillTree';
import MysteryChallenge from '../components/gamification/MysteryChallenge';
import EasterEgg from '../components/gamification/EasterEgg';

const TIER_CONFIG = {
  bronze:   { color: 'text-amber-600',   bg: 'bg-amber-600/10',   border: 'border-amber-600/30',   xp: 0 },
  silver:   { color: 'text-gray-400',    bg: 'bg-gray-400/10',    border: 'border-gray-400/30',    xp: 500 },
  gold:     { color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  xp: 1500 },
  platinum: { color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30',    xp: 4000 },
  elite:    { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     xp: 10000 },
};

const DIFF_COLOR = {
  bronze: 'bg-amber-600/20 text-amber-500',
  silver: 'bg-gray-500/20 text-gray-300',
  gold: 'bg-yellow-500/20 text-yellow-400',
  platinum: 'bg-cyan-500/20 text-cyan-400',
  elite: 'bg-red-500/20 text-red-400',
};

const CAT_ICON = { web: '🌐', network: '🔌', osint: '🔍', forensics: '🧪', crypto: '🔐', reverse: '⚙️', pwn: '💥', misc: '🎭' };

function XPBar({ xp }) {
  const tiers = Object.entries(TIER_CONFIG);
  const current = tiers.reduce((acc, [tier, cfg]) => xp >= cfg.xp ? tier : acc, 'bronze');
  const currentIdx = tiers.findIndex(([t]) => t === current);
  const next = tiers[currentIdx + 1];
  const currentXP = TIER_CONFIG[current].xp;
  const nextXP = next ? next[1].xp : TIER_CONFIG[current].xp;
  const progress = next ? Math.min(((xp - currentXP) / (nextXP - currentXP)) * 100, 100) : 100;
  const cfg = TIER_CONFIG[current];

  return (
    <div className="flex items-center gap-3">
      <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${cfg.bg} ${cfg.color} ${cfg.border} border`}>{current}</div>
      <div className="flex-1 bg-white/5 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${current === 'elite' ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-gray-500">{xp} XP</span>
      {next && <span className="text-xs text-gray-600">/ {next[1].xp}</span>}
    </div>
  );
}

function ChallengeCard({ challenge, mySubmissions, user, onSolve, isAdmin }) {
  const [showFlag, setShowFlag] = useState(false);
  const [flagInput, setFlagInput] = useState('');
  const [showHints, setShowHints] = useState(false);
  const solved = mySubmissions?.some(s => s.challenge_id === challenge.id && s.is_correct);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const correct = flagInput.trim() === challenge.flag?.trim();
      await base44.entities.LabSubmission.create({
        challenge_id: challenge.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        flag_submitted: flagInput.trim(),
        is_correct: correct,
        xp_earned: correct ? challenge.xp_reward || 100 : 0,
      });
      if (correct) {
        await base44.entities.LabChallenge.update(challenge.id, { solve_count: (challenge.solve_count || 0) + 1 });
        onSolve(challenge.xp_reward || 100);
      }
      return correct;
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`bg-[#111] border ${solved ? 'border-green-500/40' : 'border-white/5'} hover:border-white/20 transition-all`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{CAT_ICON[challenge.category] || '🎯'}</span>
              <h3 className="text-white font-semibold">{challenge.title}</h3>
              {solved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFF_COLOR[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />{challenge.xp_reward || 100} XP
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

          {challenge.instructions && (
            <div className="bg-[#0a0a0a] rounded-lg p-3 mb-3 text-xs text-gray-300 font-mono whitespace-pre-wrap border border-white/5">
              {challenge.instructions}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{challenge.solve_count || 0} solves</span>
            {challenge.hints?.length > 0 && (
              <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400">
                <Eye className="w-3 h-3" />{showHints ? 'Hide' : 'Show'} hints ({challenge.hints.length})
              </button>
            )}
          </div>

          {showHints && challenge.hints?.map((hint, i) => (
            <div key={i} className="text-xs text-yellow-600 bg-yellow-500/5 border border-yellow-500/20 rounded px-3 py-2 mb-2">
              💡 Hint {i + 1}: {hint}
            </div>
          ))}

          {!solved && user && (
            <div className="flex gap-2 mt-3">
              <Input value={flagInput} onChange={e => setFlagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && flagInput && submitMutation.mutate()}
                placeholder="flag{...}"
                className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600 font-mono text-sm" />
              <Button onClick={() => submitMutation.mutate()} disabled={!flagInput.trim() || submitMutation.isPending}
                className="bg-red-600 hover:bg-red-500 shrink-0">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          )}
          {submitMutation.isSuccess && (
            <p className={`text-xs mt-2 ${submitMutation.data ? 'text-green-400' : 'text-red-400'}`}>
              {submitMutation.data ? '🎉 Correct! XP awarded.' : '❌ Wrong flag. Try again.'}
            </p>
          )}
          {solved && <p className="text-xs text-green-400 mt-2">✅ Already solved</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CyberLabs() {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDiff, setActiveDiff] = useState('all');
  const [xpToast, setXpToast] = useState({ show: false, xpGained: 0, prevXp: 0, newXp: 0 });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuth(auth);
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: challenges = [] } = useQuery({
    queryKey: ['labChallenges', activeCategory, activeDiff],
    queryFn: async () => {
      let all = await base44.entities.LabChallenge.filter({ is_active: true }, 'difficulty', 100);
      if (activeCategory !== 'all') all = all.filter(c => c.category === activeCategory);
      if (activeDiff !== 'all') all = all.filter(c => c.difficulty === activeDiff);
      return all;
    },
  });

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['mySubmissions', user?.email],
    queryFn: () => base44.entities.LabSubmission.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: mySkill } = useQuery({
    queryKey: ['mySkill', user?.email],
    queryFn: async () => {
      const arr = await base44.entities.UserSkill.filter({ user_email: user.email });
      return arr[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.UserSkill.list('-xp', 10),
  });

  const handleSolve = async (xpEarned) => {
    if (!user) return;
    // Apply XP multiplier from streak + skill tree
    const streak = getStreakData();
    const existingSkill = await base44.entities.UserSkill.filter({ user_email: user.email });
    const currentSkill = existingSkill[0];
    const multiplier = getXPMultiplier(streak, currentSkill?.xp || 0);
    const adjustedXP = Math.round(xpEarned * multiplier);

    const prevXp = currentSkill?.xp || 0;
    const newXp = prevXp + adjustedXP;
    const newTier = Object.entries(TIER_CONFIG).reduce((acc, [tier, cfg]) => newXp >= cfg.xp ? tier : acc, 'bronze');
    if (currentSkill) {
      await base44.entities.UserSkill.update(currentSkill.id, {
        xp: newXp, tier: newTier, challenges_solved: (currentSkill.challenges_solved || 0) + 1,
        technical_score: (currentSkill.technical_score || 0) + adjustedXP
      });
    } else {
      await base44.entities.UserSkill.create({
        user_email: user.email, user_name: user.full_name || user.email,
        xp: adjustedXP, tier: newTier, challenges_solved: 1, technical_score: adjustedXP
      });
    }
    setXpToast({ show: true, xpGained: adjustedXP, prevXp, newXp });
    queryClient.invalidateQueries({ queryKey: ['mySkill'] });
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
  };

  const cats = ['all', 'web', 'network', 'osint', 'forensics', 'crypto', 'reverse', 'pwn', 'misc'];
  const diffs = ['all', 'bronze', 'silver', 'gold', 'platinum', 'elite'];

  return (
    <div className="min-h-screen py-20">
      <EasterEgg />
      <XPLevelUpToast
        {...xpToast}
        onDone={() => setXpToast(t => ({ ...t, show: false }))}
      />

      {/* Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HackerTerminal challengeCount={challenges.length} />

          {/* Category badges */}
          {isAuth && mySubmissions.length > 0 && (
            <CategoryBadges mySubmissions={mySubmissions} />
          )}

          {/* User XP bar + streak */}
          {isAuth && mySkill && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto mb-4">
              <StreakTracker isAuth={isAuth} userXP={mySkill.xp || 0} />
              <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white font-bold">
                    {user?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user?.full_name || user?.email}</div>
                    <LevelTitle xp={mySkill.xp || 0} size="xs" showNext />
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-gray-500">{mySkill.challenges_solved || 0} solves</div>
                    <div className="text-yellow-400 font-bold">{mySkill.xp || 0} XP</div>
                  </div>
                </div>
                <XPBar xp={mySkill.xp || 0} />
              </div>
            </motion.div>
          )}
          {isAuth && !mySkill && (
            <p className="text-center text-gray-500 text-sm mb-8">Solve your first challenge to start earning XP!</p>
          )}
          {!isAuth && (
            <div className="text-center mb-8">
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="bg-gradient-to-r from-red-600 to-green-600">
                <LogIn className="w-4 h-4 mr-2" /> Login to Compete
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Main challenges */}
        <div className="flex-1 min-w-0">
          {/* Mystery Challenge */}
          {isAuth && (
            <MysteryChallenge
              challenges={challenges}
              user={user}
              mySubmissions={mySubmissions}
              onSolve={handleSolve}
            />
          )}
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-lg text-sm transition-all capitalize ${activeCategory === c ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {c === 'all' ? 'All' : `${CAT_ICON[c]} ${c}`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {diffs.map(d => (
              <button key={d} onClick={() => setActiveDiff(d)}
                className={`px-3 py-1 rounded-lg text-xs transition-all capitalize ${activeDiff === d ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
                {d === 'all' ? 'All Difficulties' : d}
              </button>
            ))}
          </div>

          {challenges.length === 0 ? (
            <Card className="bg-[#111] border-white/10">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No challenges yet in this category. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {challenges.map(ch => (
                <ChallengeCard key={ch.id} challenge={ch} user={user} mySubmissions={mySubmissions} onSolve={handleSolve} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <GlobalLeaderboard currentUserEmail={user?.email} />
          {isAuth && mySkill && (
            <SkillTree currentXP={mySkill.xp || 0} />
          )}
        </div>
      </div>
    </div>
  );
}