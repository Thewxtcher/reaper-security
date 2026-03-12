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

function downloadProject(project) {
  const lang = langExtensions[project.language?.toLowerCase()] || 'txt';
  const blob = new Blob([project.code || ''], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name?.replace(/\s+/g, '_') || 'project'}.${lang}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const langExtensions = {
  python: 'py', javascript: 'js', typescript: 'ts', jsx: 'jsx', tsx: 'tsx',
  bash: 'sh', powershell: 'ps1', ruby: 'rb', go: 'go', rust: 'rs',
  c: 'c', cpp: 'cpp', csharp: 'cs', java: 'java', kotlin: 'kt', swift: 'swift',
  php: 'php', perl: 'pl', lua: 'lua', r: 'r', scala: 'scala', haskell: 'hs',
  elixir: 'ex', dart: 'dart', groovy: 'groovy', sql: 'sql', html: 'html',
  css: 'css', scss: 'scss', json: 'json', yaml: 'yml', xml: 'xml',
  markdown: 'md', assembly: 'asm', dockerfile: 'Dockerfile', terraform: 'tf',
};

function RepoCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="bg-[#111]/80 border border-white/5 hover:border-green-500/20 rounded-xl p-5 transition-all hover:-translate-y-0.5 group h-full relative">
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
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); downloadProject(project); }}
              title="Download source"
              className="flex items-center gap-1 text-gray-600 hover:text-green-400 text-xs transition-colors px-2 py-1 rounded hover:bg-green-500/10 border border-transparent hover:border-green-500/20"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline text-[10px]">Save</span>
            </button>
          </div>
          <Link to={createPageUrl(`CodeProject?id=${project.id}`)} className="absolute inset-0 rounded-xl" />
        </div>
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

        {/* Extreme Tools view */}
        {activeTab === 'extreme' && (
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-5 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-400 font-bold text-sm mb-1 font-mono tracking-wide">⚠ RESTRICTED ACCESS — AUTHORIZED PROFESSIONALS ONLY</div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  This section contains advanced offensive security tools intended <strong className="text-white">exclusively</strong> for licensed penetration testers, 
                  red team operators, and security researchers operating under authorized engagements. Unauthorized use of these tools 
                  is a federal crime under the CFAA (18 U.S.C. § 1030) and equivalent international laws. 
                  By accessing this section you accept full legal responsibility for your actions.
                </p>
              </div>
            </div>

            {/* Premium Gate */}
            <div className="bg-[#111]/80 border border-white/5 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="relative px-6 py-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/10 pointer-events-none" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <Skull className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Black Arsenal</h2>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Premium offensive security tools, zero-day research frameworks, advanced exploitation kits, and real-world attack simulations — reserved for verified security professionals.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-4 py-2 rounded-full font-mono">
                    <Lock className="w-3.5 h-3.5" />
                    PREMIUM SUBSCRIPTION REQUIRED
                  </div>
                </div>
              </div>

              {/* Feature grid */}
              <div className="grid sm:grid-cols-3 gap-px bg-white/5 border-t border-white/5">
                {[
                  { icon: Zap, label: 'Advanced Exploits', desc: 'Cutting-edge CVE exploits, PoCs, and weaponized payloads for authorized testing' },
                  { icon: Eye, label: 'OSINT Frameworks', desc: 'Deep reconnaissance tools, HUMINT modules, and passive intel collection suites' },
                  { icon: ShieldAlert, label: 'Red Team Kits', desc: 'Full adversary simulation toolkits, C2 frameworks, and lateral movement utilities' },
                ].map(f => (
                  <div key={f.label} className="bg-[#0d0d0d] p-5">
                    <f.icon className="w-5 h-5 text-red-400 mb-3" />
                    <div className="text-white font-semibold text-sm mb-1">{f.label}</div>
                    <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <div className="text-white font-semibold text-sm">Unlock the Black Arsenal</div>
                  <div className="text-gray-500 text-xs mt-0.5">Premium membership — coming soon. Join the waitlist.</div>
                </div>
                <button
                  disabled
                  className="px-6 py-2.5 bg-red-600/50 text-red-300 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-not-allowed border border-red-500/20"
                >
                  <Lock className="w-4 h-4" />
                  Coming Soon
                </button>
              </div>
            </div>

            {/* What's included list */}
            <div className="bg-[#111]/60 border border-white/5 rounded-xl p-5">
              <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-4">What Premium Includes</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Advanced CVE exploitation modules',
                  'Custom C2 framework templates',
                  'Active Directory attack chains',
                  'Cloud infrastructure attack tools',
                  'Mobile app penetration kits',
                  'Hardware hacking firmware tools',
                  'Social engineering automation scripts',
                  'Full-spectrum network intrusion suites',
                  'Malware analysis & reverse engineering labs',
                  'Private community of elite practitioners',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
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