import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Shield, Users, MessageSquare, Code, Flag, Activity, Eye, Search,
  AlertTriangle, BarChart2, Lock, Trash2, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) base44.auth.me().then(u => {
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      });
    });
  }, []);

  const { data: allPosts = [] } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 50),
    enabled: isAdmin,
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['adminMessages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
    enabled: isAdmin,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: () => base44.entities.CodeProject.list('-created_date', 50),
    enabled: isAdmin,
  });

  const { data: allContacts = [] } = useQuery({
    queryKey: ['adminContacts'],
    queryFn: () => base44.entities.ContactRequest.list('-created_date', 50),
    enabled: isAdmin,
  });

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['adminChallenges'],
    queryFn: () => base44.entities.LabChallenge.list('-created_date', 50),
    enabled: isAdmin,
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="text-center">
        <Lock className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400">Admin privileges required to view this page.</p>
      </div>
    </div>
  );

  const stats = [
    { label: 'Forum Posts', value: allPosts.length, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Server Messages', value: allMessages.length, icon: Activity, color: 'text-green-400' },
    { label: 'Code Projects', value: allProjects.length, icon: Code, color: 'text-purple-400' },
    { label: 'Contact Requests', value: allContacts.length, icon: Flag, color: 'text-red-400' },
    { label: 'CTF Challenges', value: allChallenges.length, icon: Shield, color: 'text-yellow-400' },
    { label: 'Pending Contacts', value: allContacts.filter(c => c.status === 'pending').length, icon: AlertTriangle, color: 'text-orange-400' },
  ];

  const tabs = ['overview', 'posts', 'messages', 'contacts', 'challenges'];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-red-500" />
            <h1 className="text-3xl font-bold font-serif text-white">Admin Dashboard</h1>
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Admin</Badge>
          </div>
          <p className="text-gray-400">Site monitoring and moderation tools. Admin messages are private.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-[#111] border-white/5">
                <CardContent className="p-4 text-center">
                  <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${tab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== 'overview' && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="pl-9 bg-[#111] border-white/10 text-white max-w-md" />
          </div>
        )}

        {/* Content */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#111] border-white/5">
              <CardHeader><CardTitle className="text-white text-sm">Recent Forum Posts</CardTitle></CardHeader>
              <CardContent className="p-0">
                {allPosts.slice(0, 5).map(p => (
                  <div key={p.id} className="px-4 py-3 border-b border-white/5 last:border-0">
                    <div className="text-white text-sm truncate">{p.title}</div>
                    <div className="text-gray-500 text-xs">{p.author_email} • {new Date(p.created_date).toLocaleDateString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-white/5">
              <CardHeader><CardTitle className="text-white text-sm">Pending Contact Requests</CardTitle></CardHeader>
              <CardContent className="p-0">
                {allContacts.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                  <div key={c.id} className="px-4 py-3 border-b border-white/5 last:border-0">
                    <div className="text-white text-sm">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.email} • {c.service_type}</div>
                  </div>
                ))}
                {allContacts.filter(c => c.status === 'pending').length === 0 && (
                  <div className="px-4 py-6 text-gray-600 text-sm text-center">No pending requests</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'posts' && (
          <div className="space-y-2">
            {allPosts.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.author_email?.includes(search)).map(p => (
              <Card key={p.id} className="bg-[#111] border-white/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{p.title}</div>
                    <div className="text-gray-500 text-xs">{p.author_email} • {new Date(p.created_date).toLocaleDateString()}</div>
                    <div className="text-gray-600 text-xs truncate mt-1">{p.content}</div>
                  </div>
                  <Badge className="bg-white/5 text-gray-400 border-0 text-xs">{p.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-2">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-400 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Admin messages are excluded from this view. Only non-admin messages are shown.
            </div>
            {allMessages
              .filter(m => !search || m.content?.toLowerCase().includes(search.toLowerCase()) || m.author_email?.includes(search))
              .slice(0, 50)
              .map(m => (
                <Card key={m.id} className="bg-[#111] border-white/5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-300 text-sm truncate">{m.is_deleted ? '[Deleted]' : m.content}</div>
                      <div className="text-gray-600 text-xs">{m.author_email} • channel:{m.channel_id?.slice(0, 8)}</div>
                    </div>
                    <div className="text-xs text-gray-600">{new Date(m.created_date).toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="space-y-3">
            {allContacts.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search)).map(c => (
              <Card key={c.id} className="bg-[#111] border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-medium">{c.name}</div>
                      <div className="text-gray-400 text-sm">{c.email} {c.company && `• ${c.company}`}</div>
                      <div className="text-gray-300 text-sm mt-2">{c.message}</div>
                    </div>
                    <Badge className={`shrink-0 ${c.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === 'challenges' && (
          <div className="space-y-3">
            {allChallenges.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase())).map(c => (
              <Card key={c.id} className="bg-[#111] border-white/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-white font-medium">{c.title}</div>
                    <div className="text-gray-400 text-sm">{c.category} • {c.difficulty} • {c.xp_reward} XP • {c.solve_count} solves</div>
                  </div>
                  <Badge className={c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                    {c.is_active ? 'Active' : 'Hidden'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}