import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: 'general', label: 'General' },
  { value: 'web_security', label: 'Web Security' },
  { value: 'network', label: 'Network' },
  { value: 'osint', label: 'OSINT' },
  { value: 'career', label: 'Career' },
  { value: 'tools', label: 'Tools' },
  { value: 'ctf', label: 'CTF' }
];

export default function CreateForumPost() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    };
    checkAuth();
  }, []);

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.ForumPost.create({
        ...data,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email
      });
    },
    onSuccess: (newPost) => {
      navigate(createPageUrl(`ForumThread?id=${newPost.id}`));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.content.trim()) {
      createPostMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('Forum')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111] border border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-serif text-2xl">Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your question or topic?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-gray-300 focus:text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-gray-300">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe your question or share your knowledge..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500 min-h-[200px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={!formData.title.trim() || !formData.content.trim() || createPostMutation.isPending}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                  </Button>
                  <Link to={createPageUrl('Forum')}>
                    <Button type="button" variant="outline" className="border-gray-700 text-gray-300">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}