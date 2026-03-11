import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Search, ChevronUp, MessageSquare, Clock, User,
  Tag, LogIn, TrendingUp, Flame, Star, Filter, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const categories = [
  { value: 'all', label: 'All Posts', color: 'text-gray-400' },
  { value: 'general', label: 'General', color: 'text-gray-400' },
  { value: 'web_security', label: 'Web Security', color: 'text-blue-400' },
  { value: 'network', label: 'Network', color: 'text-green-400' },
  { value: 'osint', label: 'OSINT', color: 'text-purple-400' },
  { value: 'career', label: 'Career', color: 'text-yellow-400' },
  { value: 'tools', label: 'Tools', color: 'text-red-400' },
  { value: 'ctf', label: 'CTF', color: 'text-cyan-400' }
];

const categoryColors = {
  general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  web_security: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  network: 'bg-green-500/10 text-green-400 border-green-500/20',
  osint: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  career: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  tools: 'bg-red-500/10 text-red-400 border-red-500/20',
  ctf: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

const sortOptions = [
  { value: 'new', label: 'New', icon: Clock },
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'top', label: 'Top', icon: TrendingUp },
];

function PostCard({ post, index, isAuthenticated, onVote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <div className="flex bg-[#111]/80 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all hover:-translate-y-[1px]">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 px-3 py-4 bg-[#0d0d0d] border-r border-white/5 min-w-[48px]">
          <button
            onClick={(e) => { e.preventDefault(); if (isAuthenticated) onVote(post.id, post.votes || 0); }}
            className="text-gray-600 hover:text-green-400 transition-colors p-0.5 rounded hover:bg-green-500/10"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={`text-sm font-bold font-mono ${(post.votes || 0) > 0 ? 'text-green-400' : 'text-gray-500'}`}>
            {post.votes || 0}
          </span>
        </div>
        {/* Content */}
        <Link to={createPageUrl(`ForumThread?id=${post.id}`)} className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={`${categoryColors[post.category] || categoryColors.general} border text-[10px] px-2 py-0`}>
              {post.category?.replace(/_/g, ' ') || 'general'}
            </Badge>
            <span className="text-gray-600 text-xs flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="text-gray-400">{post.author_name || 'Anonymous'}</span>
            </span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-gray-600 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(post.created_date).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-red-300 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
            {post.content?.replace(/<[^>]*>/g, '').slice(0, 180)}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-gray-600 text-xs hover:text-blue-400 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.reply_count || 0} replies
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('new');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
    });
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts', activeCategory],
    queryFn: () => activeCategory === 'all'
      ? base44.entities.ForumPost.list('-created_date', 50)
      : base44.entities.ForumPost.filter({ category: activeCategory }, '-created_date', 50),
  });

  const voteMutation = useMutation({
    mutationFn: ({ postId, currentVotes }) =>
      base44.entities.ForumPost.update(postId, { votes: currentVotes + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumPosts'] }),
  });

  let filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === 'top') filteredPosts = [...filteredPosts].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  if (sortBy === 'hot') filteredPosts = [...filteredPosts].sort((a, b) => ((b.votes || 0) + (b.reply_count || 0)) - ((a.votes || 0) + (a.reply_count || 0)));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            COMMUNITY // FORUM
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Community Forum</h1>
              <p className="text-gray-500 text-sm mt-1">Discuss security topics, share knowledge, and learn from the community.</p>
            </div>
            {isAuthenticated ? (
              <Link to={createPageUrl('CreateForumPost')}>
                <Button className="bg-red-600 hover:bg-red-500 text-white gap-2">
                  <Plus className="w-4 h-4" />New Post
                </Button>
              </Link>
            ) : (
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} variant="outline" className="border-white/10 text-gray-400 hover:text-white gap-2">
                <LogIn className="w-4 h-4" />Login to Post
              </Button>
            )}
          </div>
        </div>

        {/* Community rules banner */}
        <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-green-400 text-xs font-semibold">Ethical Community</span>
            <span className="text-gray-500 text-xs ml-2">Unauthorized activity, exploit trading, or illegal instruction is strictly prohibited.</span>
          </div>
          <Link to={createPageUrl('ForumRules')} className="text-green-400 text-xs hover:text-green-300 flex-shrink-0">Rules →</Link>
        </div>

        <div className="flex gap-6">
          {/* Left sidebar — categories */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-3 sticky top-4">
              <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2 px-1">Categories</div>
              <div className="space-y-0.5">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${activeCategory === cat.value
                        ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500'
                        : `${cat.color} hover:bg-white/5 border-l-2 border-transparent`
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main feed */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort bar */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded-lg p-1">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${sortBy === opt.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <opt.icon className="w-3 h-3" />{opt.label}
                  </button>
                ))}
              </div>
              {/* Mobile category filter */}
              <select
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
                className="lg:hidden bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-xs focus:outline-none"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Posts */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-[#111]/80 border border-white/5 rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-[#111]/60 border border-white/5 rounded-xl p-12 text-center">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No posts found. Be the first to start a discussion!</p>
                {isAuthenticated && (
                  <Link to={createPageUrl('CreateForumPost')}>
                    <Button className="mt-4 bg-red-600 hover:bg-red-500 text-sm">Create Post</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={index}
                    isAuthenticated={isAuthenticated}
                    onVote={(id, votes) => voteMutation.mutate({ postId: id, currentVotes: votes })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}