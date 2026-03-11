import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield, Code, Users, Zap, BookOpen, Terminal, FlaskConical,
  ArrowRight, TrendingUp, Star, GitFork, MessageSquare, Eye,
  Activity, Award, ChevronRight, Cpu, Lock, Globe, Bot
} from 'lucide-react';

const STATS = [
  { label: 'Active Members', value: '2.4K+', icon: Users, color: 'text-blue-400' },
  { label: 'Code Projects', value: '890+', icon: Code, color: 'text-green-400' },
  { label: 'Vulnerabilities Found', value: '12K+', icon: Shield, color: 'text-red-400' },
  { label: 'CTF Challenges', value: '340+', icon: FlaskConical, color: 'text-purple-400' },
];

const QUICK_LINKS = [
  { label: 'Cyber Labs', desc: 'Practice hacking challenges', icon: FlaskConical, page: 'CyberLabs', color: 'from-purple-500/10 to-purple-500/5', accent: 'border-purple-500/20 hover:border-purple-500/50', iconColor: 'text-purple-400' },
  { label: 'Code Hub', desc: 'Browse & share repositories', icon: Code, page: 'CodeHub', color: 'from-green-500/10 to-green-500/5', accent: 'border-green-500/20 hover:border-green-500/50', iconColor: 'text-green-400' },
  { label: 'Forum', desc: 'Community discussions', icon: MessageSquare, page: 'Forum', color: 'from-blue-500/10 to-blue-500/5', accent: 'border-blue-500/20 hover:border-blue-500/50', iconColor: 'text-blue-400' },
  { label: 'Threat Intel', desc: 'Live threat intelligence', icon: Zap, page: 'ThreatIntel', color: 'from-yellow-500/10 to-yellow-500/5', accent: 'border-yellow-500/20 hover:border-yellow-500/50', iconColor: 'text-yellow-400' },
  { label: 'AI Assistant', desc: 'Ask security questions', icon: Bot, page: 'AIAssistant', color: 'from-cyan-500/10 to-cyan-500/5', accent: 'border-cyan-500/20 hover:border-cyan-500/50', iconColor: 'text-cyan-400' },
  { label: 'Services', desc: 'Professional engagements', icon: Shield, page: 'Services', color: 'from-red-500/10 to-red-500/5', accent: 'border-red-500/20 hover:border-red-500/50', iconColor: 'text-red-400' },
];

function TerminalLine({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3 }}
      className="font-mono text-xs flex items-center gap-2"
    >
      <span className="text-green-500">›</span>
      <span className="text-gray-400">{children}</span>
    </motion.div>
  );
}

function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-[#111]/80 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all"
    >
      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
        <stat.icon className="w-5 h-5" />
      </div>
      <div>
        <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
        <div className="text-gray-500 text-xs">{stat.label}</div>
      </div>
    </motion.div>
  );
}

function QuickLinkCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.06 }}
    >
      <Link
        to={createPageUrl(item.page)}
        className={`block bg-gradient-to-br ${item.color} border ${item.accent} rounded-xl p-4 transition-all duration-200 group hover:-translate-y-0.5`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${item.iconColor} flex-shrink-0`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm group-hover:text-white transition-colors">{item.label}</div>
            <div className="text-gray-500 text-xs mt-0.5 leading-snug">{item.desc}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

function RecentPostCard({ post, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="bg-[#111]/60 border border-white/5 rounded-xl p-4 hover:border-white/10 hover:bg-[#111]/80 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {post.author_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-500 text-xs">{post.author_name || post.author_email?.split('@')[0]}</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-gray-600 text-xs">{new Date(post.created_date).toLocaleDateString()}</span>
          </div>
          <div className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
            {post.title}
          </div>
          {post.content && (
            <div className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{post.content?.replace(/<[^>]*>/g, '').slice(0, 120)}...</div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-gray-600 text-xs"><TrendingUp className="w-3 h-3" />{post.votes || 0}</span>
            <span className="flex items-center gap-1 text-gray-600 text-xs"><MessageSquare className="w-3 h-3" />{post.reply_count || 0}</span>
            {post.category && (
              <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full capitalize">{post.category?.replace('_', ' ')}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecentCodeCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="bg-[#111]/60 border border-white/5 rounded-xl p-4 hover:border-green-500/20 hover:bg-[#111]/80 transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
          <Code className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm group-hover:text-green-300 transition-colors truncate">{project.name}</div>
          <div className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-snug">{project.description}</div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-gray-600 text-xs"><Star className="w-3 h-3" />{project.votes || 0}</span>
            <span className="flex items-center gap-1 text-gray-600 text-xs"><GitFork className="w-3 h-3" />{project.downloads || 0}</span>
            {project.language && (
              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-mono">{project.language}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardEntry({ skill, rank }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const tierColors = {
    elite: 'text-yellow-400 bg-yellow-500/10',
    platinum: 'text-cyan-400 bg-cyan-500/10',
    gold: 'text-yellow-300 bg-yellow-400/10',
    silver: 'text-gray-300 bg-gray-400/10',
    bronze: 'text-orange-400 bg-orange-500/10',
  };
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm w-5 text-center">{medals[rank] || <span className="text-gray-600 font-mono text-xs">{rank}</span>}</span>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {skill.user_name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-medium truncate">{skill.user_name || skill.user_email?.split('@')[0]}</div>
        <div className="text-gray-600 text-[10px]">{skill.challenges_solved || 0} challenges</div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${tierColors[skill.tier] || 'text-gray-400 bg-white/5'}`}>
        {skill.tier || 'bronze'}
      </span>
    </div>
  );
}

export default function HomePage() {
  const [feedTab, setFeedTab] = useState('All');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async auth => {
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
    });
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['home-posts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 6),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['home-projects'],
    queryFn: () => base44.entities.CodeProject.list('-created_date', 6),
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['home-leaderboard'],
    queryFn: () => base44.entities.UserSkill.list('-xp', 10),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['home-challenges'],
    queryFn: () => base44.entities.LabChallenge.filter({ is_active: true }, '-created_date', 5),
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            {isAuthenticated && user ? (
              <>
                <div className="text-gray-500 text-sm font-mono mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                  {greeting}, <span className="text-green-400">{user.full_name?.split(' ')[0] || 'operator'}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  Welcome back to <span className="text-red-500">Reaper</span>
                </h1>
              </>
            ) : (
              <>
                <div className="text-green-500 text-xs font-mono mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                  SYSTEM ONLINE // REAPER SECURITY v3.0
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                  The Cybersecurity<br />
                  <span className="text-red-500">Operator's Hub</span>
                </h1>
              </>
            )}
            <p className="text-gray-500 text-sm mt-2 max-w-lg leading-relaxed">
              Combining Discord collaboration, Reddit discussions, and GitHub code infrastructure — for security professionals.
            </p>
            {!isAuthenticated && (
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-all"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to={createPageUrl('Forum')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  Browse Community
                </Link>
              </div>
            )}
          </div>

          {/* Mini terminal */}
          <div className="hidden lg:block w-72 flex-shrink-0 bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-[#111]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-gray-600 text-[10px] font-mono ml-2">reaper@terminal:~</span>
            </div>
            <div className="p-4 space-y-2">
              <TerminalLine delay={0}>Initializing platform v3.0...</TerminalLine>
              <TerminalLine delay={300}>Loading security modules... <span className="text-green-500">OK</span></TerminalLine>
              <TerminalLine delay={600}>Community nodes: <span className="text-blue-400">online</span></TerminalLine>
              <TerminalLine delay={900}>Code repositories: <span className="text-green-400">{projects.length} active</span></TerminalLine>
              <TerminalLine delay={1200}>Forum threads: <span className="text-yellow-400">{posts.length} recent</span></TerminalLine>
              <TerminalLine delay={1500}>Lab challenges: <span className="text-purple-400">{challenges.length} available</span></TerminalLine>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1.8, duration: 1, repeat: Infinity }}
                className="font-mono text-xs text-green-500 mt-1"
              >
                █
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>

        {/* Quick links */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-gray-600" />
            <h2 className="text-gray-400 text-xs font-semibold tracking-widest uppercase font-mono">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map((item, i) => <QuickLinkCard key={item.page} item={item} index={i} />)}
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_280px] gap-6">
          {/* Forum Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">Community Feed</h2>
              </div>
              <Link to={createPageUrl('Forum')} className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="bg-[#111]/60 border border-white/5 rounded-xl p-8 text-center text-gray-600 text-sm">
                  No posts yet — be the first to post!
                </div>
              ) : posts.map((post, i) => (
                <Link key={post.id} to={createPageUrl('ForumThread') + `?id=${post.id}`}>
                  <RecentPostCard post={post} index={i} />
                </Link>
              ))}
              <Link to={createPageUrl('Forum')} className="flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-blue-400 text-xs transition-colors border border-dashed border-white/5 rounded-xl hover:border-blue-500/20">
                Browse all discussions <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Code Hub feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-green-400" />
                <h2 className="text-white font-semibold text-sm">Code Repositories</h2>
              </div>
              <Link to={createPageUrl('CodeHub')} className="text-xs text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors">
                Explore <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="bg-[#111]/60 border border-white/5 rounded-xl p-8 text-center text-gray-600 text-sm">
                  No projects yet — share your first tool!
                </div>
              ) : projects.map((proj, i) => (
                <Link key={proj.id} to={createPageUrl('CodeProject') + `?id=${proj.id}`}>
                  <RecentCodeCard project={proj} index={i} />
                </Link>
              ))}
              <Link to={createPageUrl('CreateCodeProject')} className="flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-green-400 text-xs transition-colors border border-dashed border-white/5 rounded-xl hover:border-green-500/20">
                + Share a new project <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Leaderboard */}
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-white font-semibold text-sm">Leaderboard</h3>
                </div>
                <Link to={createPageUrl('Community')} className="text-[10px] text-gray-500 hover:text-yellow-400 transition-colors">View all</Link>
              </div>
              <div>
                {leaderboard.length === 0 ? (
                  <div className="text-gray-600 text-xs text-center py-4">No data yet</div>
                ) : leaderboard.slice(0, 8).map((skill, i) => (
                  <LeaderboardEntry key={skill.id} skill={skill} rank={i + 1} />
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                  <h3 className="text-white font-semibold text-sm">Active Labs</h3>
                </div>
                <Link to={createPageUrl('CyberLabs')} className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors">View all</Link>
              </div>
              <div className="space-y-2">
                {challenges.length === 0 ? (
                  <div className="text-gray-600 text-xs text-center py-4">No challenges yet</div>
                ) : challenges.map((ch, i) => {
                  const diffColors = { bronze: 'text-orange-400 bg-orange-500/10', silver: 'text-gray-300 bg-gray-400/10', gold: 'text-yellow-300 bg-yellow-400/10', platinum: 'text-cyan-400 bg-cyan-500/10', elite: 'text-red-400 bg-red-500/10' };
                  return (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{ch.title}</div>
                        <div className="text-gray-600 text-[10px]">{ch.xp_reward} XP · {ch.category}</div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize font-medium ${diffColors[ch.difficulty] || 'text-gray-400 bg-white/5'}`}>
                        {ch.difficulty}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Platform status */}
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold text-sm">Platform Status</h3>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Community', status: 'Operational' },
                  { name: 'Code Hub', status: 'Operational' },
                  { name: 'Cyber Labs', status: 'Operational' },
                  { name: 'AI Assistant', status: 'Operational' },
                  { name: 'Threat Intel', status: 'Operational' },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{s.name}</span>
                    <span className="flex items-center gap-1.5 text-green-400 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA for guests */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4"
              >
                <Lock className="w-8 h-8 text-red-400 mb-2" />
                <h3 className="text-white font-semibold text-sm mb-1">Join Reaper Security</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                  Access labs, code sharing, community chat, and professional tools.
                </p>
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white text-xs py-2 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}