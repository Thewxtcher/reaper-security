import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Code, Search, ChevronUp, Download, FolderOpen, User, Tag,
  Terminal, LogIn, Folder
} from 'lucide-react';
import CodeFoldersPanel from '../components/codehub/CodeFoldersPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function CodeHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
    };
    checkAuth();
  }, []);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['codeProjects', activeCategory],
    queryFn: async () => {
      if (activeCategory === 'all') {
        return base44.entities.CodeProject.list('-created_date', 50);
      }
      return base44.entities.CodeProject.filter({ category: activeCategory }, '-created_date', 50);
    },
    initialData: []
  });

  const filteredProjects = projects.filter(project => 
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold font-serif text-white mb-6">Code Hub</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Share, discover, and edit security tools and scripts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 mb-8 flex-wrap">
            {[
              { id: 'browse', label: 'Browse Projects', Icon: FolderOpen },
              { id: 'folders', label: 'My Folders', Icon: Folder },
            ].map(tab => (
              <Button key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'bg-white/10 text-white border-white/20' : 'border-gray-700 text-gray-400 hover:text-white'}>
                <tab.Icon className="w-4 h-4 mr-2" />{tab.label}
              </Button>
            ))}
            <Link to={createPageUrl('CodeEditor')}>
              <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
                <Terminal className="w-4 h-4 mr-2" />Code Editor
              </Button>
            </Link>
            <Link to={createPageUrl('SSHTerminal')}>
              <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
                <Terminal className="w-4 h-4 mr-2" />SSH Terminal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Code Repository Banner */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-blue-500/20">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-serif text-lg mb-1">Community Code Repository</h3>
                <p className="text-gray-400 text-sm">
                  Share your security tools, scripts, and educational resources with the community. 
                  All code must be for ethical and educational purposes only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            {isAuthenticated ? (
              <Link to={createPageUrl('CreateCodeProject')}>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600">
                  Share Project
                </Button>
              </Link>
            ) : (
              <Button onClick={handleLogin} variant="outline" className="border-gray-700 text-gray-300">
                <LogIn className="w-4 h-4 mr-2" />
                Login to Share
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-[#111] border border-white/10 flex-wrap h-auto p-1">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#111] border border-white/5 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-full mb-2" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="bg-[#111] border border-white/10">
              <CardContent className="p-12 text-center">
                <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No projects found. Be the first to share your code!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`CodeProject?id=${project.id}`)}>
                    <Card className="bg-[#111] border border-white/5 hover:border-white/20 transition-all h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={`${categoryColors[project.category] || categoryColors.tools} border text-xs`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {project.category || 'tools'}
                          </Badge>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <ChevronUp className="w-3 h-3" />
                              {project.votes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {project.downloads || 0}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-white font-semibold mb-2">{project.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{project.description}</p>
                        
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-white/10 text-gray-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {project.author_name || 'Anonymous'}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}