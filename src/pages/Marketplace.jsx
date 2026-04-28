import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Palette, ArrowRight, Package, Plus, Star, Download, Check, Search, Wand2 } from 'lucide-react';
import CreateThemeDialog from '../components/marketplace/CreateThemeDialog';
import PluginFileEditor from '../components/plugins/PluginFileEditor';
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

const STARTER_CODE_JS = `// Plugin: My Awesome Plugin
(function() {
  const widget = document.createElement('div');
  widget.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;color:white;font-family:monospace;font-size:12px;z-index:9999;cursor:pointer;';
  widget.innerHTML = '🔌 Plugin Active';
  widget.onclick = () => alert('Hello from plugin!');
  document.body.appendChild(widget);
})();`;

const STARTER_CODE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #0d0d0d; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; }
    .box { background: #111; border: 1px solid rgba(124,45,214,0.4); border-radius: 12px; padding: 24px; text-align: center; }
    button { background: #7c2dd6; color: white; border: none; border-radius: 8px; padding: 8px 20px; cursor: pointer; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🔌 My HTML Plugin</h2>
    <p>Full HTML app running in an iframe.</p>
    <button onclick="alert('Hello!')">Click Me</button>
  </div>
</body>
</html>`;

const PLUGIN_TYPES = [
  { id: 'js', label: '⚡ JS Script', desc: 'Single JavaScript file injected into the page' },
  { id: 'html', label: '🌐 HTML App', desc: 'Full HTML page rendered in an iframe widget' },
  { id: 'multi', label: '📁 Multi-File Project', desc: 'Multiple JS/CSS/HTML files as a project' },
];

const TIER_COLORS = {
  bronze: 'text-orange-400 bg-orange-400/10',
  silver: 'text-gray-300 bg-gray-300/10',
  gold: 'text-yellow-400 bg-yellow-400/10',
  platinum: 'text-cyan-400 bg-cyan-400/10',
  elite: 'text-purple-400 bg-purple-400/10',
};

function ThemeCard({ theme, user, onApply, onUnapply }) {
  const isActive = theme.is_active;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`bg-[#111] border transition-all ${isActive ? 'border-green-500/50' : 'border-white/5 hover:border-white/15'}`}>
        <CardContent className="p-5">
          <div className="rounded-lg p-3 mb-3 border" style={{ backgroundColor: theme.background_color, borderColor: `${theme.primary_color}40` }}>
            <div className="rounded p-2 mb-2" style={{ backgroundColor: theme.card_color }}>
              <div className="text-xs font-medium mb-1" style={{ color: theme.text_color }}>Sample Card</div>
              <div className="text-xs" style={{ color: `${theme.text_color}80` }}>Preview text</div>
            </div>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: theme.primary_color }}>Primary</div>
              <div className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: theme.secondary_color }}>Secondary</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">{theme.name}</div>
              <div className="text-gray-500 text-xs">by {theme.owner_email?.split('@')[0]}</div>
            </div>
            {user && (
              <Button size="sm" onClick={() => isActive ? onUnapply(theme) : onApply(theme)}
                className={`text-xs h-7 ${isActive ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'}`}>
                {isActive ? <><Check className="w-3 h-3 mr-1" />Active (click to remove)</> : <><Palette className="w-3 h-3 mr-1" />Apply to Site</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PluginCard({ plugin, user, onEnable, onDisable }) {
  const isEnabled = plugin.enabled_by?.includes(user?.email);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-[#111] border border-white/5 hover:border-white/15 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">{plugin.icon || '🔌'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-sm">{plugin.name}</h3>
              <span className="text-gray-600 text-xs">v{plugin.version}</span>
              {plugin.plugin_type === 'html' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">HTML</span>}
              {plugin.plugin_type === 'multi' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">📁 Multi-file</span>}
            </div>
            <div className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${CAT_COLORS[plugin.category] || CAT_COLORS.other}`}>{plugin.category}</div>
          </div>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{plugin.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{plugin.downloads || 0}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{plugin.votes || 0}</span>
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
    version: '1.0.0', code: STARTER_CODE_JS, tags: '', is_public: true,
    plugin_type: 'js', files: [], entry_file: '',
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
    }
  });

  function handleTypeChange(t) {
    setForm(f => ({
      ...f,
      plugin_type: t,
      code: t === 'html' ? STARTER_CODE_HTML : t === 'js' ? STARTER_CODE_JS : f.code,
      files: t === 'multi' ? (f.files.length ? f.files : [{ name: 'index.js', path: 'index.js', type: 'js', content: STARTER_CODE_JS }]) : f.files,
      entry_file: t === 'multi' ? (f.entry_file || 'index.js') : f.entry_file,
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-white/10 text-white max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-white">Create Plugin</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">

          {/* Plugin type selector */}
          <div>
            <Label className="text-gray-400 text-xs mb-2 block">Plugin Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {PLUGIN_TYPES.map(t => (
                <button key={t.id} onClick={() => handleTypeChange(t.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${form.plugin_type === t.id ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/3 border-white/10 text-gray-400 hover:border-white/20'}`}>
                  <div className="font-semibold text-xs mb-0.5">{t.label}</div>
                  <div className="text-[10px] opacity-70 leading-snug">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Icon</Label>
              <Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-gray-400 text-xs">Plugin Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My Plugin" className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-gray-400 text-xs">Description *</Label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="What does this plugin do?"
              className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-400 text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {CATEGORIES.filter(c => c !== 'all').map(c => <SelectItem key={c} value={c} className="text-gray-300 capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Version</Label>
              <Input value={form.version} onChange={e => setForm({...form, version: e.target.value})} className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Tags (comma-sep)</Label>
              <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="ui, dark" className="bg-[#0a0a0a] border-white/10 text-white mt-1" />
            </div>
          </div>

          {/* Code / Files */}
          {form.plugin_type === 'multi' ? (
            <div>
              <Label className="text-gray-400 text-xs mb-2 block">Project Files</Label>
              <PluginFileEditor
                files={form.files}
                onChange={files => setForm(f => ({...f, files}))}
                entryFile={form.entry_file}
                onEntryChange={entry_file => setForm(f => ({...f, entry_file}))}
              />
            </div>
          ) : (
            <div>
              <Label className="text-gray-400 text-xs">{form.plugin_type === 'html' ? 'HTML Code' : 'JavaScript Code'}</Label>
              <textarea value={form.code} onChange={e => setForm({...form, code: e.target.value})} rows={12}
                className={`w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-white/30 resize-y ${form.plugin_type === 'html' ? 'text-orange-300' : 'text-green-400'}`} />
            </div>
          )}

          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => setForm({...form, is_public: e.target.checked})} className="w-4 h-4 accent-red-500" />
            Make this plugin public
          </label>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => createPlugin.mutate(form)} disabled={!form.name || !form.description || createPlugin.isPending} className="bg-red-600 hover:bg-red-500 flex-1">
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
  const [activeTab, setActiveTab] = useState('plugins');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateTheme, setShowCreateTheme] = useState(false);
  const queryClient = useQueryClient();

  const applyThemeCSS = (theme) => {
    document.body.style.backgroundColor = theme.background_color || '#0a0a0a';
    document.body.style.color = theme.text_color || '#ffffff';
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary_color || '#ef4444');
    root.style.setProperty('--secondary', theme.secondary_color || '#22c55e');
    if (theme.font_family && theme.font_family !== 'Inter') {
      const linkId = 'theme-font-link';
      let link = document.getElementById(linkId);
      if (!link) { link = document.createElement('link'); link.id = linkId; link.rel = 'stylesheet'; document.head.appendChild(link); }
      link.href = `https://fonts.googleapis.com/css2?family=${theme.font_family.replace(/ /g,'+')}:wght@400;600;700&display=swap`;
      document.body.style.fontFamily = `'${theme.font_family}', sans-serif`;
    }
  };

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

  const { data: allThemes = [] } = useQuery({
    queryKey: ['allThemes'],
    queryFn: () => base44.entities.Theme.list('-created_date', 100),
  });

  const { data: myThemes = [] } = useQuery({
    queryKey: ['themes', user?.email],
    queryFn: () => base44.entities.Theme.filter({ owner_email: user.email }),
    enabled: !!user?.email,
  });

  // Apply active theme on load
  useEffect(() => {
    if (myThemes.length > 0) {
      const active = myThemes.find(t => t.is_active);
      if (active) applyThemeCSS(active);
    }
  }, [myThemes]);

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

  const applyThemeMutation = useMutation({
    mutationFn: async (theme) => {
      for (const t of myThemes) {
        if (t.is_active) await base44.entities.Theme.update(t.id, { is_active: false });
      }
      await base44.entities.Theme.update(theme.id, { is_active: true });
      return theme;
    },
    onSuccess: (theme) => {
      applyThemeCSS(theme);
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['allThemes'] });
      queryClient.invalidateQueries({ queryKey: ['activeTheme'] });
    },
  });

  const unapplyThemeMutation = useMutation({
    mutationFn: (theme) => base44.entities.Theme.update(theme.id, { is_active: false }),
    onSuccess: () => {
      // Restore defaults
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.fontFamily = '';
      document.documentElement.style.cssText = '';
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['allThemes'] });
      queryClient.invalidateQueries({ queryKey: ['activeTheme'] });
    },
  });

  const filteredPlugins = plugins.filter(p => {
    const catMatch = category === 'all' || p.category === category;
    const searchMatch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const filteredThemes = allThemes.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-20 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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
                  <Palette className="w-4 h-4 mr-2" />My Themes
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Button onClick={() => setShowCreateTheme(true)} className="bg-purple-600 hover:bg-purple-500">
                    <Wand2 className="w-4 h-4 mr-2" />Create Theme
                  </Button>
                  <Button onClick={() => setShowCreate(true)} className="bg-red-600 hover:bg-red-500">
                    <Plus className="w-4 h-4 mr-2" />Create Plugin
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
          {[{ id: 'plugins', label: '🔌 Plugins', count: plugins.length }, { id: 'themes', label: '🎨 Themes', count: allThemes.length }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              {tab.label}
              <span className="ml-2 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={activeTab === 'plugins' ? 'Search plugins...' : 'Search themes...'}
              className="pl-9 bg-[#111] border-white/10 text-white" />
          </div>
          {activeTab === 'plugins' && (
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${category === cat ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'plugins' ? (
          filteredPlugins.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No plugins found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map(plugin => (
                <PluginCard key={plugin.id} plugin={plugin} user={user}
                  onEnable={(p) => enablePlugin.mutate(p)}
                  onDisable={(p) => disablePlugin.mutate(p)} />
              ))}
            </div>
          )
        ) : (
          filteredThemes.length === 0 ? (
            <div className="text-center py-20">
              <Palette className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No themes yet. Be the first to create one!</p>
              {isAuthenticated && (
                <Button onClick={() => setShowCreateTheme(true)} className="bg-purple-600 hover:bg-purple-500 mt-4">
                  <Wand2 className="w-4 h-4 mr-2" />Create Theme
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map(theme => (
                <ThemeCard key={theme.id} theme={theme} user={user}
                  onApply={(t) => applyThemeMutation.mutate(t)}
                  onUnapply={(t) => unapplyThemeMutation.mutate(t)} />
              ))}
            </div>
          )
        )}
      </div>

      {user && showCreate && (
        <CreatePluginDialog open={showCreate} onClose={() => setShowCreate(false)} user={user} queryClient={queryClient} />
      )}
      {user && showCreateTheme && (
        <CreateThemeDialog open={showCreateTheme} onClose={() => setShowCreateTheme(false)} user={user} queryClient={queryClient} />
      )}
    </div>
  );
}