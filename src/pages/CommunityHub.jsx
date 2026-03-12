import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MessageSquare, TrendingUp, Users, Zap, Code, Trophy,
  Shield, ArrowLeft, Flame, Activity, FileText
} from 'lucide-react';
import ActivityFeed from '../components/community/ActivityFeed';
import TrendingTopics from '../components/community/TrendingTopics';

export default function CommunityHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async auth => {
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
    });
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['hub-posts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 50),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['hub-projects'],
    queryFn: () => base44.entities.CodeProject.list('-created_date', 50),
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['hub-leaderboard'],
    queryFn: () => base44.entities.UserSkill.list('-xp', 20),
  });

  const { data: servers = [] } = useQuery({
    queryKey: ['hub-servers'],
    queryFn: () => base44.entities.Server.list('-created_date', 12),
  });

  const stats = [
    { label: 'Active Discussions', value: posts.length, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Code Projects', value: projects.length, icon: Code, color: 'text-green-400' },
    { label: 'Community Servers', value: servers.length, icon: Users, color: 'text-purple-400' },
    { label: 'Top Contributors', value: skills.length, icon: Trophy, color: 'text-yellow-400' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Login Required</h1>
          <p className="text-gray-400 mb-6">View community activity and connect with other security professionals.</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#0d0d0d] border-b border-white/5 flex items-center px-4 z-40">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Back</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Community Hub</h1>
              <p className="text-gray-400">Real-time activity, trending discussions, and platform insights</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111]/80 border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" />
                <h2 className="text-white font-bold">Recent Activity</h2>
              </div>
              <Link to={createPageUrl('Forum')} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                View all →
              </Link>
            </div>
            <ActivityFeed posts={posts} projects={projects} challenges={[]} skills={skills} />
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-red-400" />
                <h2 className="text-white font-bold">Trending</h2>
              </div>
              <TrendingTopics posts={posts} />
            </div>

            {/* Featured Servers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-bold">Featured Servers</h2>
              </div>
              <div className="space-y-2">
                {servers.slice(0, 5).map((server, i) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    <Link to={createPageUrl('Community')}>
                      <div className="group bg-white/5 border border-white/10 rounded-lg p-3 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                        {server.icon && (
                          <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-lg">
                            {server.icon}
                          </div>
                        )}
                        <div className="text-white text-xs font-medium group-hover:text-purple-300 truncate">
                          {server.name}
                        </div>
                        <div className="text-gray-600 text-[10px] mt-1">
                          {server.member_count || 0} members
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white font-bold">Quick Links</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Join Community', to: 'Community', icon: '💬' },
                  { label: 'Browse Forum', to: 'Forum', icon: '📝' },
                  { label: 'View Code Hub', to: 'CodeHub', icon: '💻' },
                  { label: 'Cyber Labs', to: 'CyberLabs', icon: '🧪' },
                ].map(link => (
                  <Link
                    key={link.to}
                    to={createPageUrl(link.to)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all text-xs text-gray-400 hover:text-white"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}