import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Code, Search, Star, Download, FolderOpen, User, Terminal,
  LogIn, Folder, GitFork, GitBranch, Plus, Clock, TrendingUp, Box,
  Skull, Lock, ShieldAlert, Zap, Eye, AlertTriangle
} from 'lucide-react';
import CodeFoldersPanel from '../components/codehub/CodeFoldersPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion as m } from 'framer-motion';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'tools', label: 'Tools' },
  { value: 'scripts', label: 'Scripts' },
  { value: 'exploits', label: 'Exploits' },
  { value: 'frameworks', label: 'Frameworks' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'educational', label: 'Educational' }
];

const categoryColors = {
  tools: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  scripts: 'bg-green-500/10 text-green-400 border-green-500/20',
  exploits: 'bg-red-500/10 text-red-400 border-red-500/20',
  frameworks: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  educational: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

const langColors = {
  python: 'text-yellow-400', javascript: 'text-yellow-300', bash: 'text-green-400',
  go: 'text-cyan-400', rust: 'text-orange-400', c: 'text-blue-400',
  'c++': 'text-blue-400', ruby: 'text-red-400', php: 'text-purple-400',
  java: 'text-orange-300', typescript: 'text-blue-300',
};

const sortOptions = [
  { value: 'new', label: 'New', icon: Clock },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'starred', label: 'Stars', icon: Star },
];

function RepoCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={createPageUrl(`CodeProject?id=${project.id}`)}>
        <div className="bg-[#111]/80 border border-white/5 hover:border-green-500/20 rounded-xl p-5 transition-all hover:-translate-y-0.5 group h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <Code className="w-4 h-4 text-green-400" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold text-sm truncate group-hover:text-green-300 transition-colors">
                  {project.author_name || 'anon'} / <span className="font-bold">{project.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <GitBranch className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-600 text-[10px] font-mono">{project.version || 'v1.0.0'}</span>
                </div>
              </div>
            </div>
            <Badge className={`${categoryColors[project.category] || categoryColors.tools} border text-[10px] px-2 py-0 flex-shrink-0`}>
              {project.category || 'tools'}
            </Badge>
          </div>

          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {project.description || 'No description provided.'}
          </p>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-mono border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-white/5">
            {project.language && (
              <span className={`flex items-center gap-1.5 text-xs ${langColors[project.language?.toLowerCase()] || 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full inline-block ${langColors[project.language?.toLowerCase()] || 'text-gray-400'} bg-current`} />
                {project.language}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-600 text-xs ml-auto">
              <Star className="w-3 h-3" />{project.votes || 0}
            </span>
            <span className="flex items-center gap-1 text-gray-600 text-xs">
              <Download className="w-3 h-3" />{project.downloads || 0}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CodeHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [sortBy, setSortBy] = useState('new');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
    });
  }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['codeProjects', activeCategory],
    queryFn: () => activeCategory === 'all'
      ? base44.entities.CodeProject.list('-created_date', 50)
      : base44.entities.CodeProject.filter({ category: activeCategory }, '-created_date', 50),
  });

  let filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === 'starred') filteredProjects = [...filteredProjects].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  if (sortBy === 'popular') filteredProjects = [...filteredProjects].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

  const tabs = [
    { id: 'browse', label: 'Explore', icon: FolderOpen },
    { id: 'folders', label: 'My Folders', icon: Folder },
    { id: 'extreme', label: 'Extreme Tools', icon: Skull },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            CODE // REPOSITORY HUB
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Code Hub</h1>
              <p className="text-gray-500 text-sm mt-1">Discover, share, and collaborate on cybersecurity tools and scripts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to={createPageUrl('CodeEditor')}>
                <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white hover:border-white/20 gap-2 text-sm">
                  <Terminal className="w-3.5 h-3.5" />Editor
                </Button>
              </Link>
              <Link to={createPageUrl('SSHTerminal')}>
                <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white hover:border-white/20 gap-2 text-sm">
                  <Terminal className="w-3.5 h-3.5" />SSH
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to={createPageUrl('CreateCodeProject')}>
                  <Button className="bg-green-600 hover:bg-green-500 text-white gap-2 text-sm">
                    <Plus className="w-3.5 h-3.5" />New Repo
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} variant="outline" className="border-white/10 text-gray-400 gap-2 text-sm">
                  <LogIn className="w-3.5 h-3.5" />Login to Share
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-[#111] border border-white/5 rounded-lg p-1 mb-6 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${tab.id === 'extreme'
                  ? activeTab === tab.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-red-500/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent'
                  : activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
              {tab.id === 'extreme' && <Lock className="w-3 h-3 opacity-60" />}
            </button>
          ))}
        </div>

        {/* Folders view */}
        {activeTab === 'folders' && (
          isAuthenticated && user ? (
            <CodeFoldersPanel user={user} />
          ) : (
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-12 text-center">
              <Folder className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">Login to manage your folders</p>
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-red-600 hover:bg-red-500">
                <LogIn className="w-4 h-4 mr-2" />Login
              </Button>
            </div>
          )
        )}

        {/* Browse view */}
        {activeTab === 'browse' && (
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block w-44 flex-shrink-0">
              <div className="bg-[#111]/60 border border-white/5 rounded-xl p-3 sticky top-4">
                <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2 px-1">Categories</div>
                <div className="space-y-0.5">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${activeCategory === cat.value
                          ? 'bg-green-500/10 text-green-400 border-l-2 border-green-500'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                  <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2 px-1">Sort</div>
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all
                        ${sortBy === opt.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                      <opt.icon className="w-3 h-3" />{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/30"
                />
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
                <Box className="w-3.5 h-3.5" />
                <span>{filteredProjects.length} repositories</span>
                {activeCategory !== 'all' && (
                  <span className="text-gray-700">in <span className="text-gray-400">{activeCategory}</span></span>
                )}
              </div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#111]/80 border border-white/5 rounded-xl h-40 animate-pulse" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="bg-[#111]/60 border border-white/5 rounded-xl p-12 text-center">
                  <Code className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No projects found. Be the first to share your code!</p>
                  {isAuthenticated && (
                    <Link to={createPageUrl('CreateCodeProject')}>
                      <Button className="mt-4 bg-green-600 hover:bg-green-500 text-sm">Share Project</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredProjects.map((project, index) => (
                    <RepoCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}