import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store, Palette, ArrowRight, Package, Plus, Star,
  Download, Check, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const CATEGORIES = ['all', 'ui', 'security', 'analytics', 'social', 'productivity', 'fun', 'other'];

const CAT_COLORS = {
  ui: 'bg-purple-500/20 text-purple-400',
  security: 'bg-red-500/20 text-red-400',
  analytics: 'bg-blue-500/20 text-blue-400',
  social: 'bg-pink-500/20 text-pink-400',
  productivity: 'bg-green-500/20 text-green-400',
  fun: 'bg-yellow-500/20 text-yellow-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const STARTER_CODE = `// Plugin: My Awesome Plugin
// Author: Your Name
// Version: 1.0.0
//
// Available globals: window.reaper, document
// Example: Add a floating widget
(function() {
  const widget = document.createElement('div');
  widget.style.cssText = \`
    position: fixed; bottom: 80px; right: 20px;
    background: #111; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 12px 16px; color: white;
    font-family: monospace; font-size: 12px; z-index: 9999; cursor: pointer;
  \`;
  widget.innerHTML = '🔌 My Plugin Active';
  widget.onclick = () => alert('Hello from my plugin!');
  document.body.appendChild(widget);
  console.log('[Plugin] Loaded!');
})();
`;

function PluginCard({ plugin, user, onEnable, onDisable }) {
  const isEnabled = plugin.enabled_by?.includes(user?.email);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-[#111] border border-white/5 hover:border-white/15 transition-all group">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
              {plugin.icon || '🔌'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-semibold text-sm">{plugin.name}</h3>
                <span className="text-gray-600 text-xs">v{plugin.version}</span>
              </div>
              <div className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${CAT_COLORS[plugin.category] || CAT_COLORS.other}`}>
                {plugin.category}
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{plugin.description}</p>
          {plugin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {plugin.tags.slice(0, 3).map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-500 rounded">{t}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{plugin.downloads || 0}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{plugin.votes || 0}</span>
              <span>by {plugin.author_name || plugin.author_email?.split('@')[0]}</span>
            </div>
            {user && (
              <Button size="sm" onClick={() => isEnabled ? onDisable(plugin) : onEnable(plugin)}
                className={`text-xs h-7 ${isEnabled ? 'bg-green-600/20 text-green-400 hover:bg-red-600/20 hover:text-red-400' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                {isEnabled ? <><Check className="w-3 h-3 mr-1" />Enabled</> : 'Enable'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreatePluginDialog({ open, onClose, user, queryClient }) {
  const [form, setForm] = useState({
    name: '', description: '', category: 'other', icon: '🔌',
    version: '1.0.0', code: STARTER_CODE, tags: '', is_public: true
  });

  const createPlugin = useMutation({
    mutationFn: (data) => base44.entities.SitePlugin.create({
      ...data,
      author_email: user.email,
      author_name: user.full_name || user.email.split('@')[0],
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      downloads: 0, votes: 0, is_active: false, enabled_by: [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      onClose();
      setForm({ name: '', description: '', category: 'other', icon: '🔌', version: '1.0.0', code: STARTER_CODE, tags: '', is_public: true });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-white">Create Plugin</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Icon (emoji)</Label>
              <Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-gray-400 text-xs">Plugin Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="My Awesome Plugin" className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Description *</Label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="What does this plugin do?" rows={2}
              className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {CATEGORIES.filter(c => c !== 'all').map(c => (
                    <SelectItem key={c} value={c} className="text-gray-300 capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Version</Label>
              <Input value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Tags (comma-sep)</Label>
              <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                placeholder="ui, dark" className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Plugin Code (JavaScript)</Label>
            <textarea value={form.code} onChange={e => setForm({...form, code: e.target.value})} rows={12}
              className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-green-400 text-xs font-mono focus:outline-none focus:border-white/30 resize-none" />
          </div>
          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => setForm({...form, is_public: e.target.checked})}
              className="w-4 h-4 accent-red-500" />
            Make this plugin public
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => createPlugin.mutate(form)} disabled={!form.name || !form.description || createPlugin.isPending}
              className="bg-red-600 hover:bg-red-500 flex-1">
              {createPlugin.isPending ? 'Creating...' : 'Publish Plugin'}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => base44.entities.SitePlugin.filter({ is_public: true }, '-created_date', 100),
  });

  const enablePlugin = useMutation({
    mutationFn: (plugin) => base44.entities.SitePlugin.update(plugin.id, {
      enabled_by: [...(plugin.enabled_by || []), user.email],
      downloads: (plugin.downloads || 0) + 1,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plugins'] }),
  });

  const disablePlugin = useMutation({
    mutationFn: (plugin) => base44.entities.SitePlugin.update(plugin.id, {
      enabled_by: (plugin.enabled_by || []).filter(e => e !== user.email),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plugins'] }),
  });

  const filtered = plugins.filter(p => {
    const catMatch = category === 'all' || p.category === category;
    const searchMatch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold font-serif text-white">Marketplace</h1>
              </div>
              <p className="text-gray-400">Themes, plugins, and extensions for the platform.</p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('Themes')}>
                <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                  <Palette className="w-4 h-4 mr-2" />Themes
                </Button>
              </Link>
              {isAuthenticated && (
                <Button onClick={() => setShowCreate(true)} className="bg-red-600 hover:bg-red-500">
                  <Plus className="w-4 h-4 mr-2" />Create Plugin
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plugins..."
              className="pl-9 bg-[#111] border-white/10 text-white" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${category === cat ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No plugins found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(plugin => (
              <PluginCard key={plugin.id} plugin={plugin} user={user}
                onEnable={(p) => enablePlugin.mutate(p)}
                onDisable={(p) => disablePlugin.mutate(p)} />
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">🎨 Themes</h2>
          <Link to={createPageUrl('Themes')}>
            <Card className="bg-[#111] border border-purple-500/20 hover:border-purple-500/40 transition-all group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Custom Themes</h3>
                  <p className="text-gray-400 text-sm">Create and apply color themes to personalize the platform.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {user && showCreate && (
        <CreatePluginDialog open={showCreate} onClose={() => setShowCreate(false)} user={user} queryClient={queryClient} />
      )}
    </div>
  );
}