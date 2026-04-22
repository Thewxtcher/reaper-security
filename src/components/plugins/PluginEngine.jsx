/**
 * PluginEngine — runs enabled plugins as real JS on the client.
 * Uses MutationObserver to track injected nodes for clean removal.
 */
import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const runningPlugins = {}; // id -> cleanup fn

function execPlugin(plugin) {
  if (runningPlugins[plugin.id]) return;

  try {
    const cleanupFns = [];
    const injectedNodes = [];

    // Watch for any DOM nodes added while plugin runs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            injectedNodes.push(node);
            // Add a dismiss × button to floating widgets
            try {
              const closeBtn = document.createElement('button');
              closeBtn.textContent = '×';
              closeBtn.title = `Disable plugin: ${plugin.name}`;
              closeBtn.style.cssText = [
                'position:absolute', 'top:4px', 'right:6px',
                'background:rgba(0,0,0,0.5)', 'border:none', 'color:#fff',
                'font-size:16px', 'line-height:1', 'cursor:pointer',
                'opacity:0.7', 'z-index:2147483647', 'padding:2px 5px',
                'border-radius:4px',
              ].join(';');
              closeBtn.onmouseover = () => { closeBtn.style.opacity = '1'; };
              closeBtn.onmouseout = () => { closeBtn.style.opacity = '0.7'; };
              closeBtn.onclick = (e) => {
                e.stopPropagation();
                node.parentNode?.removeChild(node);
              };
              const pos = getComputedStyle(node).position;
              if (pos === 'static') node.style.position = 'relative';
              node.appendChild(closeBtn);
            } catch {}
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: false });
    observer.observe(document.head, { childList: true, subtree: false });

    const pluginAPI = { onUnload: (fn) => cleanupFns.push(fn) };
    window.__pluginAPI = pluginAPI;

    // Run plugin code directly — full DOM access, no patching
    // eslint-disable-next-line no-new-func
    new Function('pluginAPI', plugin.code)(pluginAPI);

    // Give async plugins a tick to inject nodes before stopping observer
    setTimeout(() => observer.disconnect(), 500);

    runningPlugins[plugin.id] = () => {
      observer.disconnect();
      try { cleanupFns.forEach(f => f()); } catch {}
      injectedNodes.forEach(node => {
        try { node.parentNode?.removeChild(node); } catch {}
      });
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

    // Start newly enabled plugins
    plugins.forEach(p => {
      if (nowEnabled.has(p.id) && !prevEnabled.current.has(p.id)) {
        execPlugin(p);
      }
    });

    // Stop newly disabled plugins
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

  return null;
}