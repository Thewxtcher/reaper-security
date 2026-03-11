import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Plus, X, Lightbulb, Rocket, CheckCircle, Clock, Zap, XCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_CONFIG = {
  proposed:     { label: 'Proposed',     color: 'bg-gray-500/20 text-gray-400 border-gray-500/20',     icon: Lightbulb },
  under_review: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', icon: Clock },
  planned:      { label: 'Planned',      color: 'bg-blue-500/20 text-blue-400 border-blue-500/20',      icon: Rocket },
  in_progress:  { label: 'In Progress',  color: 'bg-orange-500/20 text-orange-400 border-orange-500/20', icon: Zap },
  completed:    { label: 'Completed',    color: 'bg-green-500/20 text-green-400 border-green-500/20',   icon: CheckCircle },
  rejected:     { label: 'Rejected',     color: 'bg-red-500/20 text-red-400 border-red-500/20',         icon: XCircle },
};

const CATEGORY_COLORS = {
  ui:          'bg-purple-500/10 text-purple-400',
  features:    'bg-blue-500/10 text-blue-400',
  community:   'bg-green-500/10 text-green-400',
  security:    'bg-red-500/10 text-red-400',
  labs:        'bg-yellow-500/10 text-yellow-400',
  performance: 'bg-cyan-500/10 text-cyan-400',
  other:       'bg-gray-500/10 text-gray-400',
};

export default function Upgrades() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: 'features' });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      if (auth) {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role === 'admin' || u.email === 'reaperappofficial@gmail.com') {
          setIsAdmin(true);
        } else {
          const mods = await base44.entities.AdminModerator.filter({ user_email: u.email, is_active: true });
          setIsAdmin(mods.length > 0);
        }
      }
    });
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['featureRequests'],
    queryFn: () => base44.entities.FeatureRequest.list('-votes', 200),
  });

  const submitRequest = useMutation({
    mutationFn: (data) => base44.entities.FeatureRequest.create({
      ...data,
      author_email: user?.email,
      author_name: user?.full_name || user?.email?.split('@')[0],
      votes: 0,
      voted_by: [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureRequests'] });
      setForm({ title: '', description: '', category: 'features' });
      setShowForm(false);
    },
  });

  const vote = useMutation({
    mutationFn: async (req) => {
      const hasVoted = req.voted_by?.includes(user?.email);
      const newVotes = hasVoted ? (req.votes || 1) - 1 : (req.votes || 0) + 1;
      const newVotedBy = hasVoted
        ? (req.voted_by || []).filter(e => e !== user?.email)
        : [...(req.voted_by || []), user?.email];
      return base44.entities.FeatureRequest.update(req.id, { votes: newVotes, voted_by: newVotedBy });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featureRequests'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, admin_note }) => base44.entities.FeatureRequest.update(id, { status, admin_note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featureRequests'] }),
  });

  const filtered = requests.filter(r => {
    const statusOk = filterStatus === 'all' || r.status === filterStatus;
    const catOk = filterCat === 'all' || r.category === filterCat;
    return statusOk && catOk;
  });

  // Stats
  const stats = {
    total: requests.length,
    planned: requests.filter(r => r.status === 'planned' || r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    proposed: requests.filter(r => r.status === 'proposed').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-8 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 text-red-400 text-sm mb-4">
            <Rocket className="w-4 h-4" /> Site Upgrades & Feature Requests
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Shape the Future of <span className="text-red-500">Reaper Security</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto">Vote on features you want, suggest new ideas, and see what's being built. Your feedback drives the roadmap.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Ideas', value: stats.total, color: 'text-white' },
            { label: 'Proposed', value: stats.proposed, color: 'text-gray-400' },
            { label: 'In Pipeline', value: stats.planned, color: 'text-blue-400' },
            { label: 'Completed', value: stats.completed, color: 'text-green-400' },
          ].map(s => (
            <Card key={s.label} className="bg-[#111] border-white/5 text-center">
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-[#111] border-white/10 text-white w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="all" className="text-gray-300">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-gray-300">{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="bg-[#111] border-white/10 text-white w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="all" className="text-gray-300">All Categories</SelectItem>
              {['ui','features','community','security','labs','performance','other'].map(c => (
                <SelectItem key={c} value={c} className="text-gray-300 capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            {user ? (
              <Button onClick={() => setShowForm(!showForm)}
                className="bg-red-600 hover:bg-red-500 gap-2">
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Suggest Feature'}
              </Button>
            ) : (
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="bg-red-600 hover:bg-red-500 gap-2">
                <LogIn className="w-4 h-4" />Login to Suggest
              </Button>
            )}
          </div>
        </div>

        {/* Submit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6">
              <Card className="bg-[#111] border-red-500/20">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-white font-semibold text-sm">New Feature Suggestion</h3>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Feature title (be specific!)"
                    className="bg-[#0a0a0a] border-white/10 text-white" />
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the feature in detail. Why would it be useful?"
                    className="bg-[#0a0a0a] border-white/10 text-white h-24" />
                  <div className="flex gap-3 items-center">
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {['ui','features','community','security','labs','performance','other'].map(c => (
                          <SelectItem key={c} value={c} className="text-gray-300 capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => submitRequest.mutate(form)}
                      disabled={!form.title || !form.description || submitRequest.isPending}
                      className="bg-red-600 hover:bg-red-500 ml-auto">
                      Submit Suggestion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const hasVoted = req.voted_by?.includes(user?.email);
              const StatusIcon = STATUS_CONFIG[req.status]?.icon || Lightbulb;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="bg-[#111] border-white/5 hover:border-white/10 transition-colors">
                    <CardContent className="p-4 flex gap-4">
                      {/* Vote button */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => user ? vote.mutate(req) : base44.auth.redirectToLogin(window.location.href)}
                          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border transition-all ${
                            hasVoted
                              ? 'bg-red-500/20 border-red-500/40 text-red-400'
                              : 'bg-white/3 border-white/10 text-gray-400 hover:border-red-500/30 hover:text-red-400'
                          }`}>
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-sm font-bold">{req.votes || 0}</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm">{req.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{req.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`text-xs border ${STATUS_CONFIG[req.status]?.color || STATUS_CONFIG.proposed.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_CONFIG[req.status]?.label || 'Proposed'}
                          </Badge>
                          <Badge className={`text-xs capitalize ${CATEGORY_COLORS[req.category] || CATEGORY_COLORS.other}`}>
                            {req.category}
                          </Badge>
                          <span className="text-gray-600 text-xs">by {req.author_name || 'Anonymous'}</span>
                          <span className="text-gray-600 text-xs">· {new Date(req.created_date).toLocaleDateString()}</span>
                        </div>
                        {req.admin_note && (
                          <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-300 text-xs">
                            <span className="font-semibold">Admin note:</span> {req.admin_note}
                          </div>
                        )}
                        {/* Admin controls */}
                        {isAdmin && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.keys(STATUS_CONFIG).map(s => (
                              <button key={s} onClick={() => updateStatus.mutate({ id: req.id, status: s, admin_note: req.admin_note })}
                                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                  req.status === s
                                    ? 'bg-red-600/20 border-red-600/30 text-red-400'
                                    : 'border-white/10 text-gray-600 hover:text-white hover:border-white/20'
                                }`}>
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No suggestions yet — be the first!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}