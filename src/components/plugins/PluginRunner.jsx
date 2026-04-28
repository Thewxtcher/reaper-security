/**
 * PluginRunner — executes a plugin based on its type.
 * Types: js (single script), html (iframe app), multi (multi-file project)
 */

const runningPlugins = {}; // id -> cleanup fn

function makeDragBar(node, pluginName) {
  const pos = getComputedStyle(node).position;
  if (pos === 'static' || pos === '') node.style.position = 'fixed';

  const dragBar = document.createElement('div');
  dragBar.style.cssText = [
    'position:absolute', 'top:0', 'left:0', 'right:0', 'height:22px',
    'background:rgba(0,0,0,0.4)', 'cursor:grab', 'border-radius:inherit',
    'display:flex', 'align-items:center', 'padding:0 6px',
    'user-select:none', 'z-index:2147483647',
  ].join(';');

  const label = document.createElement('span');
  label.textContent = `⠿ ${pluginName}`;
  label.style.cssText = 'color:rgba(255,255,255,0.5);font-size:10px;flex:1;pointer-events:none;font-family:monospace;';
  dragBar.appendChild(label);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'background:transparent;border:none;color:#fff;font-size:16px;line-height:1;cursor:pointer;opacity:0.7;padding:0 4px;';
  closeBtn.onclick = (e) => { e.stopPropagation(); node.parentNode?.removeChild(node); };
  dragBar.appendChild(closeBtn);

  node.style.paddingTop = '22px';
  node.appendChild(dragBar);

  let ox = 0, oy = 0, dragging = false;
  dragBar.addEventListener('mousedown', (e) => {
    if (e.target === closeBtn) return;
    dragging = true; dragBar.style.cursor = 'grabbing';
    const rect = node.getBoundingClientRect();
    ox = e.clientX - rect.left; oy = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    node.style.left = (e.clientX - ox) + 'px';
    node.style.top = (e.clientY - oy) + 'px';
    node.style.right = 'auto'; node.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', () => { dragging = false; dragBar.style.cursor = 'grab'; });
}

function observeAndDecorate(pluginName, injectedNodes) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          injectedNodes.push(node);
          try { makeDragBar(node, pluginName); } catch {}
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: false });
  setTimeout(() => observer.disconnect(), 800);
  return observer;
}

// ── JS plugin ─────────────────────────────────────────────────
function execJS(plugin) {
  const cleanupFns = [];
  const injectedNodes = [];
  const observer = observeAndDecorate(plugin.name, injectedNodes);
  const pluginAPI = { onUnload: (fn) => cleanupFns.push(fn) };
  window.__pluginAPI = pluginAPI;
  // eslint-disable-next-line no-new-func
  new Function('pluginAPI', plugin.code)(pluginAPI);
  runningPlugins[plugin.id] = () => {
    observer.disconnect();
    try { cleanupFns.forEach(f => f()); } catch {}
    injectedNodes.forEach(n => { try { n.parentNode?.removeChild(n); } catch {} });
  };
}

// ── HTML iframe plugin ─────────────────────────────────────────
function execHTML(plugin) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;bottom:80px;right:80px;z-index:9990;width:480px;height:360px;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.8);border:1px solid rgba(124,45,214,0.4);resize:both;';

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

  const html = plugin.plugin_type === 'html' ? plugin.code : buildMultiFileHTML(plugin);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);
  try { makeDragBar(wrapper, plugin.name); } catch {}

  runningPlugins[plugin.id] = () => {
    URL.revokeObjectURL(url);
    try { wrapper.parentNode?.removeChild(wrapper); } catch {}
  };
}

// ── Multi-file project ─────────────────────────────────────────
function buildMultiFileHTML(plugin) {
  const files = plugin.files || [];
  const entry = plugin.entry_file || 'index.html';
  const entryFile = files.find(f => f.name === entry || f.path === entry);

  if (!entryFile) {
    // Try to auto-detect: if there's an index.html use it, else wrap JS files
    const htmlFile = files.find(f => f.type === 'html');
    if (htmlFile) return injectFilesIntoHTML(htmlFile.content, files);
    return wrapJSFilesAsHTML(plugin);
  }

  if (entryFile.type === 'html') {
    return injectFilesIntoHTML(entryFile.content, files.filter(f => f !== entryFile));
  }
  return wrapJSFilesAsHTML(plugin);
}

function injectFilesIntoHTML(htmlContent, otherFiles) {
  // Inject CSS and JS files referenced in HTML or append them
  let result = htmlContent;
  const cssFiles = otherFiles.filter(f => f.type === 'css');
  const jsFiles = otherFiles.filter(f => f.type === 'js');

  const inlineCss = cssFiles.map(f => `<style>/* ${f.name} */\n${f.content}</style>`).join('\n');
  const inlineJs = jsFiles.map(f => `<script>/* ${f.name} */\n${f.content}<\/script>`).join('\n');

  // Inject before </head> or at top
  if (result.includes('</head>')) {
    result = result.replace('</head>', `${inlineCss}\n</head>`);
  } else {
    result = inlineCss + result;
  }
  if (result.includes('</body>')) {
    result = result.replace('</body>', `${inlineJs}\n</body>`);
  } else {
    result += inlineJs;
  }
  return result;
}

function wrapJSFilesAsHTML(plugin) {
  const files = plugin.files || [];
  const cssFiles = files.filter(f => f.type === 'css');
  const jsFiles = files.filter(f => f.type === 'js');
  const entryJs = plugin.entry_file
    ? jsFiles.find(f => f.name === plugin.entry_file) || jsFiles[0]
    : jsFiles[0];

  const cssBlocks = cssFiles.map(f => `<style>${f.content}</style>`).join('\n');
  const depJs = jsFiles.filter(f => f !== entryJs).map(f => `<script>${f.content}<\/script>`).join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>body{margin:0;background:#0d0d0d;color:#fff;font-family:monospace;}</style>${cssBlocks}</head>
<body>${depJs}${entryJs ? `<script>${entryJs.content}<\/script>` : ''}</body></html>`;
}

function execMulti(plugin) {
  const files = plugin.files || [];
  const entry = plugin.entry_file || '';
  const hasHTML = files.some(f => f.type === 'html') || entry.endsWith('.html');
  const hasJS = files.some(f => f.type === 'js') || (!hasHTML && plugin.code);

  if (hasHTML || (hasJS && files.length > 1)) {
    execHTML(plugin); // render in iframe
  } else if (hasJS) {
    // Single entry JS — run directly but also inject deps
    const cssFiles = files.filter(f => f.type === 'css');
    const injectedNodes = [];

    // Inject CSS
    cssFiles.forEach(f => {
      const style = document.createElement('style');
      style.textContent = f.content;
      style.dataset.pluginId = plugin.id;
      document.head.appendChild(style);
      injectedNodes.push(style);
    });

    // Run JS files in order
    const jsFiles = files.filter(f => f.type === 'js' && f.name !== plugin.entry_file);
    const entryFile = files.find(f => f.name === plugin.entry_file) || files.find(f => f.type === 'js');
    const allJs = [...jsFiles, ...(entryFile ? [entryFile] : [])];

    const cleanupFns = [];
    const pluginAPI = { onUnload: (fn) => cleanupFns.push(fn) };
    window.__pluginAPI = pluginAPI;

    const observer = observeAndDecorate(plugin.name, injectedNodes);
    allJs.forEach(f => {
      try { new Function('pluginAPI', f.content)(pluginAPI); } catch(e) { console.warn(`[Plugin:${plugin.name}/${f.name}]`, e.message); }
    });

    runningPlugins[plugin.id] = () => {
      observer.disconnect();
      try { cleanupFns.forEach(fn => fn()); } catch {}
      injectedNodes.forEach(n => { try { n.parentNode?.removeChild(n); } catch {} });
    };
  }
}

export function execPlugin(plugin) {
  if (runningPlugins[plugin.id]) return;
  try {
    const type = plugin.plugin_type || 'js';
    if (type === 'html') execHTML(plugin);
    else if (type === 'multi') execMulti(plugin);
    else execJS(plugin); // default: js
  } catch(e) {
    console.warn(`[Plugin: ${plugin.name}] Error:`, e.message);
  }
}

export function cleanupPlugin(pluginId) {
  if (runningPlugins[pluginId]) {
    runningPlugins[pluginId]();
    delete runningPlugins[pluginId];
  }
}