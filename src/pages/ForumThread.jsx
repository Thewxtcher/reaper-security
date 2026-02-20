import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, ChevronUp, Clock, User, Tag, Send, LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const categoryColors = {
  general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  web_security: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  network: 'bg-green-500/10 text-green-400 border-green-500/20',
  osint: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  career: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  tools: 'bg-red-500/10 text-red-400 border-red-500/20',
  ctf: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

export default function ForumThread() {
  const [replyContent, setReplyContent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

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

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forumPost', postId],
    queryFn: async () => {
      const posts = await base44.entities.ForumPost.filter({ id: postId });
      return posts[0];
    },
    enabled: !!postId
  });

  const { data: replies, isLoading: repliesLoading } = useQuery({
    queryKey: ['forumReplies', postId],
    queryFn: async () => {
      return base44.entities.ForumReply.filter({ post_id: postId }, 'created_date');
    },
    enabled: !!postId,
    initialData: []
  });

  const createReplyMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.ForumReply.create({
        post_id: postId,
        content,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies', postId] });
      setReplyContent('');
    }
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <Link to={createPageUrl('Forum')}>
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={createPageUrl('Forum')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>

        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111] border border-white/10 mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="text-gray-500 hover:text-green-500 transition-colors">
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className="text-gray-400 font-medium">{post.votes || 0}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${categoryColors[post.category] || categoryColors.general} border`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {post.category?.replace(/_/g, ' ') || 'general'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
                  <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author_name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(post.created_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Replies ({replies.length})
          </h2>
          
          {replies.length === 0 ? (
            <Card className="bg-[#111] border border-white/10">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No replies yet. Be the first to respond!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-[#111] border border-white/5">
                    <CardContent className="p-4">
                      <p className="text-gray-300 mb-3">{reply.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {reply.author_name || 'Anonymous'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reply.created_date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <Card className="bg-[#111] border border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add a Reply</h3>
            {isAuthenticated ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                />
                <Button
                  onClick={() => createReplyMutation.mutate(replyContent)}
                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">You must be logged in to reply.</p>
                <Button onClick={handleLogin} variant="outline" className="border-gray-700 text-gray-300">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Reply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}