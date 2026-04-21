/**
 * PluginSidebar — right-side drawer showing all active plugins with quick controls.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, X, ChevronRight, Settings, Power, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CAT_COLORS = {
  ui: 'bg-purple-500/20 text-purple-400',
  security: 'bg-red-500/20 text-red-400',
  analytics: 'bg-blue-500/20 text-blue-400',
  social: 'bg-pink-500/20 text-pink-400',
  productivity: 'bg-green-500/20 text-green-400',
  fun: 'bg-yellow-500/20 text-yellow-400',
  other: 'bg-gray-500/20 text-gray-400',
};

export default function PluginSidebar({ user }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins-active', user?.email],
    queryFn: () => base44.entities.SitePlugin.filter({ is_public: true }, '-created_date', 100),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const enabledPlugins = plugins.filter(p => p.enabled_by?.includes(user?.email));
  const allPlugins = plugins;

  const togglePlugin = useMutation({
    mutationFn: async (plugin) => {
      const isEnabled = plugin.enabled_by?.includes(user.email);
      await base44.entities.SitePlugin.update(plugin.id, {
        enabled_by: isEnabled
          ? (plugin.enabled_by || []).filter(e => e !== user.email)
          : [...(plugin.enabled_by || []), user.email],
        ...(isEnabled ? {} : { downloads: (plugin.downloads || 0) + 1 }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['plugins-active'] });
    },
  });

  if (!user) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Active Plugins"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1 bg-[#1a1a1a] border border-white/10 border-r-0 rounded-l-lg px-2 py-3 text-gray-400 hover:text-white hover:border-purple-500/40 transition-all group shadow-lg"
      >
        <Puzzle className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
        {enabledPlugins.length > 0 && (
          <span className="w-4 h-4 bg-purple-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {enabledPlugins.length}
          </span>
        )}
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 z-50 bg-[#0d0d0d] border-l border-white/10 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold text-sm">Plugins</span>
                  {enabledPlugins.length > 0 && (
                    <span className="bg-purple-600/30 text-purple-400 text-xs px-2 py-0.5 rounded-full">{enabledPlugins.length} active</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={createPageUrl('Marketplace')} onClick={() => setOpen(false)} title="Browse marketplace" className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => setOpen(false)} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Active plugins */}
                {enabledPlugins.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2">Active</div>
                    <div className="space-y-2">
                      {enabledPlugins.map(plugin => (
                        <div key={plugin.id} className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                          <span className="text-lg flex-shrink-0">{plugin.icon || '🔌'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-semibold truncate">{plugin.name}</div>
                            <div className={`inline-block text-[9px] px-1.5 py-0.5 rounded mt-0.5 ${CAT_COLORS[plugin.category] || CAT_COLORS.other}`}>{plugin.category}</div>
                          </div>
                          <button
                            onClick={() => togglePlugin.mutate(plugin)}
                            className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-red-600/20 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Disable"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All available */}
                <div>
                  <div className="text-[10px] font-bold text-gray-600 tracking-widest uppercase mb-2">All Plugins</div>
                  {allPlugins.length === 0 ? (
                    <div className="text-gray-600 text-xs text-center py-6">
                      No plugins yet.{' '}
                      <Link to={createPageUrl('Marketplace')} onClick={() => setOpen(false)} className="text-purple-400 hover:underline">Browse marketplace</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allPlugins.map(plugin => {
                        const isEnabled = plugin.enabled_by?.includes(user.email);
                        return (
                          <div key={plugin.id} className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${isEnabled ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/3 border-white/5 hover:border-white/10'}`}>
                            <span className="text-base flex-shrink-0">{plugin.icon || '🔌'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-xs font-semibold truncate">{plugin.name}</div>
                              <div className="text-gray-500 text-[10px] truncate leading-snug">{plugin.description}</div>
                            </div>
                            <button
                              onClick={() => togglePlugin.mutate(plugin)}
                              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isEnabled ? 'bg-purple-600/20 text-purple-400 hover:bg-red-600/20 hover:text-red-400' : 'bg-white/5 text-gray-500 hover:bg-purple-600/20 hover:text-purple-400'}`}
                              title={isEnabled ? 'Disable' : 'Enable'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-3 flex-shrink-0">
                <Link to={createPageUrl('Marketplace')} onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs font-medium rounded-lg transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                  Manage in Marketplace
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}