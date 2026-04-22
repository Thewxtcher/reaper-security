/**
 * PluginEngine — runs enabled plugins as real JS on the client.
 * Mounts / unmounts plugin scripts when enabled_by list changes.
 */
import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const runningPlugins = {}; // id -> cleanup fn

function execPlugin(plugin) {
  if (runningPlugins[plugin.id]) return; // already running
  try {
    const cleanupFns = [];
    // Track DOM nodes added by this plugin so we can remove them on unload
    const addedNodes = [];
    const origAppendChild = document.body.appendChild.bind(document.body);
    const origInsertBefore = document.body.insertBefore.bind(document.body);

    // Temporarily patch body to intercept injected nodes
    document.body.appendChild = (node) => { addedNodes.push(node); return origAppendChild(node); };
    document.body.insertBefore = (node, ref) => { addedNodes.push(node); return origInsertBefore(node, ref); };

    const pluginAPI = {
      onUnload: (fn) => cleanupFns.push(fn),
    };
    window.__pluginAPI = pluginAPI;
    // eslint-disable-next-line no-new-func
    const fn = new Function('pluginAPI', plugin.code);
    fn(pluginAPI);

    // Restore originals
    document.body.appendChild = origAppendChild;
    document.body.insertBefore = origInsertBefore;

    // Also track style tags added to head
    const headNodes = [];
    document.head.appendChild = (node) => { headNodes.push(node); return node; };

    runningPlugins[plugin.id] = () => {
      try { cleanupFns.forEach(f => f()); } catch {}
      // Remove all DOM nodes injected by this plugin
      addedNodes.forEach(node => { try { node.parentNode?.removeChild(node); } catch {} });
      headNodes.forEach(node => { try { node.parentNode?.removeChild(node); } catch {} });
    };
  } catch (e) {
    console.warn(`[Plugin: ${plugin.name}] Error:`, e.message);
  }
}

function cleanupPlugin(pluginId) {
  if (runningPlugins[pluginId]) {
    runningPlugins[pluginId]();
    delete runningPlugins[pluginId];
  }
}

export default function PluginEngine({ userEmail }) {
  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins-active', userEmail],
    queryFn: () => base44.entities.SitePlugin.filter({ is_public: true }, '-created_date', 100),
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const prevEnabled = useRef(new Set());

  useEffect(() => {
    if (!userEmail || !plugins.length) return;

    const nowEnabled = new Set(
      plugins.filter(p => p.enabled_by?.includes(userEmail)).map(p => p.id)
    );

    // Start newly enabled
    plugins.forEach(p => {
      if (nowEnabled.has(p.id) && !prevEnabled.current.has(p.id)) {
        execPlugin(p);
      }
    });

    // Stop newly disabled
    prevEnabled.current.forEach(id => {
      if (!nowEnabled.has(id)) cleanupPlugin(id);
    });

    prevEnabled.current = nowEnabled;
  }, [plugins, userEmail]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      Object.keys(runningPlugins).forEach(cleanupPlugin);
    };
  }, []);

  return null; // invisible engine
}