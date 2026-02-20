import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: 'tools', label: 'Tools' },
  { value: 'scripts', label: 'Scripts' },
  { value: 'exploits', label: 'Exploits' },
  { value: 'frameworks', label: 'Frameworks' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'educational', label: 'Educational' }
];

const languages = [
  'python', 'javascript', 'bash', 'powershell', 'ruby', 'go', 'rust', 'c', 'cpp', 'java'
];

export default function CreateCodeProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    language: 'python',
    category: 'tools',
    tags: []
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

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.CodeProject.create({
        ...data,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email
      });
    },
    onSuccess: (newProject) => {
      navigate(createPageUrl(`CodeProject?id=${newProject.id}`));
    }
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.code.trim()) {
      createProjectMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('CodeHub')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Code Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111] border border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-serif text-2xl">Share Your Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Tool"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="language" className="text-gray-300">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData({ ...formData, language: value })}
                    >
                      <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang} className="text-gray-300 focus:text-white">
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your project does..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" className="border-gray-700 text-gray-300">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/10 text-gray-400">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-300">Code</Label>
                  <Textarea
                    id="code"
                    placeholder="Paste your code here..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500 font-mono min-h-[300px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={!formData.name.trim() || !formData.code.trim() || createProjectMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createProjectMutation.isPending ? 'Creating...' : 'Share Project'}
                  </Button>
                  <Link to={createPageUrl('CodeHub')}>
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