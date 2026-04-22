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
            // Make widget draggable and add dismiss × button
            try {
              const pos = getComputedStyle(node).position;
              if (pos === 'static' || pos === '') node.style.position = 'fixed';

              // Drag handle bar at top
              const dragBar = document.createElement('div');
              dragBar.style.cssText = [
                'position:absolute', 'top:0', 'left:0', 'right:0', 'height:22px',
                'background:rgba(0,0,0,0.35)', 'cursor:grab', 'border-radius:inherit',
                'display:flex', 'align-items:center', 'padding:0 6px',
                'user-select:none', 'z-index:1',
              ].join(';');
              dragBar.title = 'Drag to move';

              // Plugin label
              const label = document.createElement('span');
              label.textContent = `⠿ ${plugin.name}`;
              label.style.cssText = 'color:rgba(255,255,255,0.5);font-size:10px;flex:1;pointer-events:none;font-family:monospace;';
              dragBar.appendChild(label);

              // Close button
              const closeBtn = document.createElement('button');
              closeBtn.textContent = '×';
              closeBtn.style.cssText = 'background:transparent;border:none;color:#fff;font-size:16px;line-height:1;cursor:pointer;opacity:0.7;padding:0 2px;';
              closeBtn.onmouseover = () => { closeBtn.style.opacity = '1'; };
              closeBtn.onmouseout = () => { closeBtn.style.opacity = '0.7'; };
              closeBtn.onclick = (e) => { e.stopPropagation(); node.parentNode?.removeChild(node); };
              dragBar.appendChild(closeBtn);

              node.style.paddingTop = '22px';
              node.appendChild(dragBar);

              // Drag logic
              let ox = 0, oy = 0, dragging = false;
              dragBar.addEventListener('mousedown', (e) => {
                if (e.target === closeBtn) return;
                dragging = true;
                dragBar.style.cursor = 'grabbing';
                const rect = node.getBoundingClientRect();
                ox = e.clientX - rect.left;
                oy = e.clientY - rect.top;
                e.preventDefault();
              });
              document.addEventListener('mousemove', (e) => {
                if (!dragging) return;
                node.style.left = (e.clientX - ox) + 'px';
                node.style.top = (e.clientY - oy) + 'px';
                node.style.right = 'auto';
                node.style.bottom = 'auto';
              });
              document.addEventListener('mouseup', () => {
                dragging = false;
                dragBar.style.cursor = 'grab';
              });
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