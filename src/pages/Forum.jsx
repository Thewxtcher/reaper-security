import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Search, ChevronUp, MessageSquare, Clock, User,
  Tag, LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'web_security', label: 'Web Security' },
  { value: 'network', label: 'Network' },
  { value: 'osint', label: 'OSINT' },
  { value: 'career', label: 'Career' },
  { value: 'tools', label: 'Tools' },
  { value: 'ctf', label: 'CTF' }
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

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['forumPosts', activeCategory],
    queryFn: async () => {
      if (activeCategory === 'all') {
        return base44.entities.ForumPost.list('-created_date', 50);
      }
      return base44.entities.ForumPost.filter({ category: activeCategory }, '-created_date', 50);
    },
    initialData: []
  });

  const voteMutation = useMutation({
    mutationFn: async ({ postId, currentVotes }) => {
      return base44.entities.ForumPost.update(postId, { votes: currentVotes + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-5xl font-bold font-serif text-white mb-6">Community Forum</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discuss security topics, share knowledge, and learn from the community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Community Guidelines Banner */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-green-500/20">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-serif text-lg mb-1">Ethical Security Community</h3>
                <p className="text-gray-400 text-sm mb-2">
                  This community exists for ethical security education, research discussion, and professional growth. 
                  Unauthorized activity, exploit trading, or illegal instruction is strictly prohibited.
                </p>
                <Link to={createPageUrl('ForumRules')} className="text-green-400 text-sm hover:text-green-300 transition-colors">
                  View Community Rules →
                </Link>
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
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            {isAuthenticated ? (
              <Link to={createPageUrl('CreateForumPost')}>
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
                  Create Post
                </Button>
              </Link>
            ) : (
              <Button onClick={handleLogin} variant="outline" className="border-gray-700 text-gray-300">
                <LogIn className="w-4 h-4 mr-2" />
                Login to Post
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

      {/* Posts List */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#111] border border-white/5 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="bg-[#111] border border-white/10">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No posts found. Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`ForumThread?id=${post.id}`)}>
                    <Card className="bg-[#111] border border-white/5 hover:border-white/20 transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (isAuthenticated) {
                                  voteMutation.mutate({ postId: post.id, currentVotes: post.votes || 0 });
                                }
                              }}
                              className="text-gray-500 hover:text-green-500 transition-colors"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                            <span className="text-gray-400 text-sm font-medium">{post.votes || 0}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${categoryColors[post.category] || categoryColors.general} border text-xs`}>
                                <Tag className="w-3 h-3 mr-1" />
                                {post.category?.replace(/_/g, ' ') || 'general'}
                              </Badge>
                            </div>
                            
                            <h3 className="text-white font-medium mb-1 truncate">
                              {post.title}
                            </h3>
                            <p className="text-gray-500 text-sm truncate">{post.content}</p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {post.author_name || 'Anonymous'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(post.created_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
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