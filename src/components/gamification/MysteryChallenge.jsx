import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Unlock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MYSTERY_DATE_KEY = 'reaper_mystery_date';
const MYSTERY_IDX_KEY = 'reaper_mystery_idx';
const MYSTERY_DISMISSED_KEY = 'reaper_mystery_dismissed';

export default function MysteryChallenge({ challenges = [], user, mySubmissions = [], onSolve }) {
  const [challenge, setChallenge] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [flagInput, setFlagInput] = useState('');

  useEffect(() => {
    if (!challenges.length || !user) return;

    const today = new Date().toDateString();
    const lastDismissed = localStorage.getItem(MYSTERY_DISMISSED_KEY);
    if (lastDismissed === today) { setDismissed(true); return; }

    // Seed index by today's date for consistency
    const dateHash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    if (localStorage.getItem(MYSTERY_DATE_KEY) !== today) {
      localStorage.setItem(MYSTERY_DATE_KEY, today);
      localStorage.setItem(MYSTERY_IDX_KEY, (dateHash % challenges.length).toString());
    }

    const idx = parseInt(localStorage.getItem(MYSTERY_IDX_KEY) || '0') % challenges.length;
    setChallenge(challenges[idx]);
  }, [challenges, user]);

  const handleDismiss = () => {
    localStorage.setItem(MYSTERY_DISMISSED_KEY, new Date().toDateString());
    setDismissed(true);
  };

  const alreadySolved = challenge && mySubmissions.some(s => s.challenge_id === challenge.id && s.is_correct);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const correct = flagInput.trim() === challenge.flag?.trim();
      await base44.entities.LabSubmission.create({
        challenge_id: challenge.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        flag_submitted: flagInput.trim(),
        is_correct: correct,
        xp_earned: correct ? (challenge.xp_reward || 100) : 0,
      });
      if (correct) onSolve((challenge.xp_reward || 100) * 2); // 2× XP bonus
      return correct;
    },
  });

  if (!challenge || !user || dismissed) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <div className="relative overflow-hidden bg-[#0d0d0d] border border-purple-500/40 rounded-xl p-5 shadow-lg shadow-purple-900/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-gray-600 hover:text-gray-400 z-10 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">🎭 Daily Mystery Challenge</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-bold animate-pulse">
              2× XP BONUS
            </span>
          </div>

          {!revealed ? (
            <div className="text-center py-6">
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl mb-3"
              >🔒</motion.div>
              <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                A classified challenge is available today. Solving it grants <strong className="text-green-400">double XP</strong>.
              </p>
              <Button onClick={() => setRevealed(true)} className="bg-purple-600 hover:bg-purple-500">
                <Unlock className="w-4 h-4 mr-2" /> Reveal Mystery Challenge
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{challenge.category === 'web' ? '🌐' : challenge.category === 'crypto' ? '🔐' : challenge.category === 'osint' ? '🔍' : '🎯'}</span>
                <h3 className="text-white font-bold">{challenge.title}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

              {alreadySolved ? (
                <p className="text-green-400 text-sm font-medium">✅ Already solved! Bonus XP was awarded.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={flagInput}
                      onChange={e => setFlagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && flagInput && submitMutation.mutate()}
                      placeholder="flag{...}"
                      className="bg-[#0a0a0a] border-purple-500/30 focus:border-purple-500/60 text-white font-mono text-sm"
                    />
                    <Button
                      onClick={() => submitMutation.mutate()}
                      disabled={!flagInput.trim() || submitMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-500 shrink-0"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                  {submitMutation.isSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs mt-2 font-medium ${submitMutation.data ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {submitMutation.data ? '🎉 Mystery solved! 2× XP has been awarded!' : '❌ Wrong flag. Try again.'}
                    </motion.p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}