import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Shield, Code, MessageSquare, Star, Edit2, Save, X,
  Trophy, Zap, BookOpen, Settings, LogOut, Camera, BarChart2,
  Github, Twitter, Linkedin, Globe, Upload, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const TIER_COLORS = {
  bronze: 'text-orange-400 bg-orange-400/10',
  silver: 'text-gray-300 bg-gray-300/10',
  gold: 'text-yellow-400 bg-yellow-400/10',
  platinum: 'text-cyan-400 bg-cyan-400/10',
  elite: 'text-purple-400 bg-purple-400/10',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) {
        const u = await base44.auth.me();
        setUser(u);
      }
      setIsLoading(false);
    });
  }, []);

  const { data: skill } = useQuery({
    queryKey: ['mySkill', user?.email],
    queryFn: async () => {
      const res = await base44.entities.UserSkill.filter({ user_email: user.email });
      return res[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ['myPosts', user?.email],
    queryFn: () => base44.entities.ForumPost.filter({ author_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: myProjects = [] } = useQuery({
    queryKey: ['myProjects', user?.email],
    queryFn: () => base44.entities.CodeProject.filter({ author_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: mySolves = [] } = useQuery({
    queryKey: ['mySolves', user?.email],
    queryFn: () => base44.entities.LabSubmission.filter({ user_email: user.email, is_correct: true }),
    enabled: !!user?.email,
  });

  const saveSkillMutation = useMutation({
    mutationFn: async (data) => {
      if (skill?.id) {
        return base44.entities.UserSkill.update(skill.id, data);
      } else {
        return base44.entities.UserSkill.create({ ...data, user_email: user.email, user_name: user.full_name || user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySkill'] });
      setEditing(false);
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (skill?.id) {
        await base44.entities.UserSkill.update(skill.id, { avatar_url: file_url });
      } else {
        await base44.entities.UserSkill.create({ user_email: user.email, user_name: user.full_name || user.email, avatar_url: file_url });
      }
      queryClient.invalidateQueries({ queryKey: ['mySkill'] });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const startEdit = () => {
    setEditForm({
      bio: skill?.bio || '',
      skills: (skill?.skills || []).join(', '),
      looking_to_collaborate: skill?.looking_to_collaborate || false,
      github_url: skill?.github_url || '',
      twitter_url: skill?.twitter_url || '',
      linkedin_url: skill?.linkedin_url || '',
      website_url: skill?.website_url || '',
    });
    setEditing(true);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="text-center">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-red-600 hover:bg-red-500 mt-4">
          Login
        </Button>
      </div>
    </div>
  );

  const tier = skill?.tier || 'bronze';
  const xp = skill?.xp || 0;
  const initials = user?.full_name?.[0] || user?.email?.[0] || '?';

  return (
    <div className="min-h-screen py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-[#111] border border-white/10 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-red-900/40 via-black to-green-900/40" />
            <CardContent className="px-6 pb-6 -mt-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                {/* Avatar with upload */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl border-4 border-[#111] overflow-hidden">
                    {skill?.avatar_url ? (
                      <img src={skill.avatar_url} alt={user?.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
                        {initials.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 border-2 border-[#111] flex items-center justify-center transition-colors"
                  >
                    {uploadingAvatar ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white">{user?.full_name || 'Anonymous'}</h1>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_COLORS[tier]}`}>
                      {tier}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />{xp} XP
                    </span>
                    {skill?.looking_to_collaborate && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Open to Collaborate</span>
                    )}
                  </div>
                  {/* Social links display */}
                  {(skill?.github_url || skill?.twitter_url || skill?.linkedin_url || skill?.website_url) && (
                    <div className="flex items-center gap-3 mt-2">
                      {skill.github_url && <a href={skill.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                      {skill.twitter_url && <a href={skill.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sky-400 transition-colors"><Twitter className="w-4 h-4" /></a>}
                      {skill.linkedin_url && <a href={skill.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors"><Linkedin className="w-4 h-4" /></a>}
                      {skill.website_url && <a href={skill.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition-colors"><Globe className="w-4 h-4" /></a>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {!editing ? (
                    <Button onClick={startEdit} variant="outline" className="border-white/10 text-gray-300 hover:text-white" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />Edit Profile
                    </Button>
                  ) : null}
                  <Link to={createPageUrl('Themes')}>
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white" size="sm">
                      <Settings className="w-4 h-4 mr-2" />Themes
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to={createPageUrl('AdminDashboard')}>
                      <Button size="sm" className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/20">
                        <Shield className="w-4 h-4 mr-2" />Admin
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <Card className="bg-[#111] border border-white/10">
              <CardHeader className="pb-3"><CardTitle className="text-white text-sm">Stats</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: MessageSquare, label: 'Forum Posts', value: myPosts.length, color: 'text-blue-400' },
                  { icon: Code, label: 'Code Projects', value: myProjects.length, color: 'text-green-400' },
                  { icon: Trophy, label: 'CTF Solves', value: mySolves.length, color: 'text-yellow-400' },
                  { icon: Star, label: 'Contribution XP', value: skill?.contribution_score || 0, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-gray-400 text-sm">{s.label}</span>
                    </div>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#111] border border-white/10">
              <CardHeader className="pb-3"><CardTitle className="text-white text-sm">Skills</CardTitle></CardHeader>
              <CardContent>
                {skill?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skill.skills.map(s => (
                      <Badge key={s} variant="outline" className="text-xs border-white/10 text-gray-300">{s}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs">No skills listed yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#111] border border-white/10">
              <CardContent className="p-3 space-y-1">
                <Link to={createPageUrl('Themes')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
                  <BarChart2 className="w-4 h-4" />Manage Themes
                </Link>
                <Link to={createPageUrl('Marketplace')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors">
                  <BookOpen className="w-4 h-4" />Marketplace
                </Link>
                <button onClick={() => base44.auth.logout()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-6">
            {/* Edit form */}
            {editing ? (
              <Card className="bg-[#111] border border-white/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-sm">Edit Profile</CardTitle>
                  <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-400 text-xs uppercase tracking-wide">Bio</Label>
                    <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={3}
                      placeholder="Tell the community about yourself..."
                      className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs uppercase tracking-wide">Skills (comma-separated)</Label>
                    <Input value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})}
                      placeholder="web, network, osint, python..."
                      className="mt-1 bg-[#0a0a0a] border-white/10 text-white" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1"><Github className="w-3 h-3" />GitHub</Label>
                      <Input value={editForm.github_url} onChange={e => setEditForm({...editForm, github_url: e.target.value})}
                        placeholder="https://github.com/username"
                        className="mt-1 bg-[#0a0a0a] border-white/10 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1"><Twitter className="w-3 h-3" />Twitter/X</Label>
                      <Input value={editForm.twitter_url} onChange={e => setEditForm({...editForm, twitter_url: e.target.value})}
                        placeholder="https://twitter.com/username"
                        className="mt-1 bg-[#0a0a0a] border-white/10 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1"><Linkedin className="w-3 h-3" />LinkedIn</Label>
                      <Input value={editForm.linkedin_url} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 bg-[#0a0a0a] border-white/10 text-white text-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs uppercase tracking-wide flex items-center gap-1"><Globe className="w-3 h-3" />Website</Label>
                      <Input value={editForm.website_url} onChange={e => setEditForm({...editForm, website_url: e.target.value})}
                        placeholder="https://yoursite.com"
                        className="mt-1 bg-[#0a0a0a] border-white/10 text-white text-sm" />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                    <input type="checkbox" checked={editForm.looking_to_collaborate}
                      onChange={e => setEditForm({...editForm, looking_to_collaborate: e.target.checked})}
                      className="w-4 h-4 accent-green-500" />
                    Open to collaborate
                  </label>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => saveSkillMutation.mutate({
                      bio: editForm.bio,
                      skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
                      looking_to_collaborate: editForm.looking_to_collaborate,
                      github_url: editForm.github_url,
                      twitter_url: editForm.twitter_url,
                      linkedin_url: editForm.linkedin_url,
                      website_url: editForm.website_url,
                    })} disabled={saveSkillMutation.isPending} className="bg-green-600 hover:bg-green-500">
                      <Save className="w-4 h-4 mr-2" />{saveSkillMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="border-gray-700 text-gray-300">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ) : skill?.bio ? (
              <Card className="bg-[#111] border border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-white text-sm">About</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">{skill.bio}</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Recent Posts */}
            <Card className="bg-[#111] border border-white/10">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />Forum Posts
                </CardTitle>
                <Link to={createPageUrl('Forum')} className="text-xs text-gray-500 hover:text-white">View All</Link>
              </CardHeader>
              <CardContent className="p-0">
                {myPosts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-600 text-sm">No posts yet.</div>
                ) : myPosts.slice(0, 5).map(post => (
                  <Link key={post.id} to={createPageUrl(`ForumThread?id=${post.id}`)}
                    className="block px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <div className="text-white text-sm truncate">{post.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{new Date(post.created_date).toLocaleDateString()}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-[#111] border border-white/10">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-400" />Code Projects
                </CardTitle>
                <Link to={createPageUrl('CodeHub')} className="text-xs text-gray-500 hover:text-white">View All</Link>
              </CardHeader>
              <CardContent className="p-0">
                {myProjects.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-600 text-sm">No projects yet.</div>
                ) : myProjects.slice(0, 5).map(proj => (
                  <Link key={proj.id} to={createPageUrl(`CodeProject?id=${proj.id}`)}
                    className="block px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <div className="text-white text-sm truncate">{proj.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{proj.category} • {new Date(proj.created_date).toLocaleDateString()}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}