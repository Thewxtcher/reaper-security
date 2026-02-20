import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, FileText, Clock, User, Globe, Server, Eye, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { value: 'all', label: 'All Posts', icon: FileText },
  { value: 'web_security', label: 'Web Security', icon: Globe },
  { value: 'network', label: 'Network', icon: Server },
  { value: 'osint', label: 'OSINT', icon: Eye },
  { value: 'writeups', label: 'Writeups', icon: FileText },
  { value: 'education', label: 'Education', icon: BookOpen }
];

const categoryColors = {
  web_security: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  network: 'bg-green-500/10 text-green-400 border-green-500/20',
  osint: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  writeups: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  education: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

export default function Research() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['researchPosts', activeCategory],
    queryFn: async () => {
      if (activeCategory === 'all') {
        return base44.entities.ResearchPost.list('-created_date', 50);
      }
      return base44.entities.ResearchPost.filter({ category: activeCategory }, '-created_date', 50);
    },
    initialData: []
  });

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold font-serif text-white mb-6">Security Research</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Technical writeups, security research, and educational content from Mr. J Security.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-[#111] border-white/10 text-white placeholder:text-gray-500 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="bg-[#111] border border-white/10 flex-wrap h-auto p-1 justify-center">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 flex items-center gap-2"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#111] border border-white/5 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-white/5 rounded-lg mb-4" />
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="bg-[#111] border border-white/10 max-w-md mx-auto">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No posts found</h3>
                <p className="text-gray-500">Check back soon for new content</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`ResearchPost?id=${post.id}`)}>
                    <Card className="bg-[#111] border border-white/5 hover:border-white/20 transition-all h-full overflow-hidden group">
                      {post.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge className={`${categoryColors[post.category] || categoryColors.education} border mb-3`}>
                          {post.category?.replace(/_/g, ' ') || 'education'}
                        </Badge>
                        
                        <h3 className="text-white font-semibold mb-2 group-hover:text-gray-300 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author_name || 'Mr. J'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time || 5} min read
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