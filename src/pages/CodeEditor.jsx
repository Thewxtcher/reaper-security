import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import {
  Save, Download, Plus, X, File, Code, Terminal as TerminalIcon,
  ArrowLeft, Copy, Check, Folder, FolderOpen, ChevronDown, ChevronRight,
  Search, GitBranch, Settings, Play, Square, Trash2, RefreshCw,
  Wifi, WifiOff
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'jsx', 'tsx', 'bash', 'powershell',
  'ruby', 'go', 'rust', 'c', 'cpp', 'csharp', 'java', 'kotlin', 'swift',
  'php', 'perl', 'lua', 'r', 'scala', 'haskell', 'elixir', 'dart',
  'groovy', 'sql', 'html', 'css', 'scss', 'json', 'yaml', 'xml',
  'markdown', 'assembly', 'dockerfile', 'terraform',
];

const langExtensions = {
  python: 'py', javascript: 'js', typescript: 'ts', jsx: 'jsx', tsx: 'tsx',
  bash: 'sh', powershell: 'ps1', ruby: 'rb', go: 'go', rust: 'rs',
  c: 'c', cpp: 'cpp', csharp: 'cs', java: 'java', kotlin: 'kt', swift: 'swift',
  php: 'php', perl: 'pl', lua: 'lua', r: 'r', scala: 'scala', haskell: 'hs',
  elixir: 'ex', dart: 'dart', groovy: 'groovy', sql: 'sql', html: 'html',
  css: 'css', scss: 'scss', json: 'json', yaml: 'yml', xml: 'xml',
  markdown: 'md', assembly: 'asm', dockerfile: 'Dockerfile', terraform: 'tf',
};

const langColors = {
  python: '#3572A5', javascript: '#f1e05a', typescript: '#2b7489', jsx: '#61dafb',
  tsx: '#61dafb', bash: '#89e051', go: '#00ADD8', rust: '#dea584', html: '#e34c26',
  css: '#563d7c', json: '#292929', java: '#b07219', cpp: '#f34b7d', ruby: '#701516',
};

const STORAGE_KEY = 'reaper_editor_files_v2';
const ACTIVE_KEY = 'reaper_editor_active_v2';
const TERMINAL_KEY = 'reaper_editor_terminal';

const defaultFiles = [
  { id: '1', name: 'main.py', language: 'python', content: '# Welcome to Reaper Code Editor\n# A powerful VS Code-style editor in your browser\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n' },
  { id: '2', name: 'exploit.js', language: 'javascript', content: '// JavaScript Security Script\nconst target = "localhost";\nconst port = 8080;\n\nasync function probe(host, port) {\n  console.log(`Probing ${host}:${port}...`);\n  // Add your logic here\n}\n\nprobe(target, port);\n' },
];

function loadFiles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultFiles;
}

function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function loadTerminalHistory() {
  try {
    const saved = localStorage.getItem(TERMINAL_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [{ type: 'system', text: 'Reaper Terminal v1.0 — Type "help" for commands' }];
}

// ─── Menu Bar ────────────────────────────────────────────────────────────────

function MenuBar({ onAction, activeFile, files }) {
  const [openMenu, setOpenMenu] = useState(null);

  const menus = {
    File: [
      { label: 'New File', shortcut: 'Ctrl+N', action: 'new-file' },
      { label: 'Save', shortcut: 'Ctrl+S', action: 'save' },
      { label: 'Save All', shortcut: 'Ctrl+Shift+S', action: 'save-all' },
      { divider: true },
      { label: 'Download Current File', shortcut: 'Ctrl+Shift+D', action: 'download' },
      { label: 'Download All as ZIP', action: 'download-all' },
      { divider: true },
      { label: 'Close File', shortcut: 'Ctrl+W', action: 'close-file' },
      { label: 'Exit to Code Hub', action: 'exit' },
    ],
    Edit: [
      { label: 'Copy All', shortcut: 'Ctrl+A Ctrl+C', action: 'copy-all' },
      { label: 'Select All', shortcut: 'Ctrl+A', action: 'select-all' },
      { divider: true },
      { label: 'Toggle Comment', shortcut: 'Ctrl+/', action: 'toggle-comment' },
      { label: 'Indent Line', shortcut: 'Tab', action: 'indent' },
    ],
    View: [
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: 'toggle-sidebar' },
      { label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: 'toggle-terminal' },
      { divider: true },
      { label: 'Zoom In', shortcut: 'Ctrl++', action: 'zoom-in' },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'zoom-out' },
      { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: 'zoom-reset' },
    ],
    Run: [
      { label: 'Run Code', shortcut: 'F5', action: 'run' },
      { label: 'Run in Terminal', shortcut: 'Ctrl+F5', action: 'run-terminal' },
      { divider: true },
      { label: 'Stop Execution', shortcut: 'Shift+F5', action: 'stop' },
    ],
    Terminal: [
      { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: 'toggle-terminal' },
      { label: 'Clear Terminal', action: 'clear-terminal' },
      { divider: true },
      { label: 'Copy Terminal Output', action: 'copy-terminal' },
    ],
  };

  useEffect(() => {
    const handler = () => setOpenMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="flex items-center h-7 bg-[#3c3c3c] border-b border-black/40 select-none flex-shrink-0 px-2 gap-0">
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="relative">
          <button
            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === name ? null : name); }}
            className={`px-3 h-7 text-[12px] transition-colors ${openMenu === name ? 'bg-[#505050] text-white' : 'text-gray-300 hover:bg-[#454545] hover:text-white'}`}
          >
            {name}
          </button>
          {openMenu === name && (
            <div className="absolute left-0 top-7 w-64 bg-[#252526] border border-[#454545] shadow-2xl z-50 py-1">
              {items.map((item, i) =>
                item.divider ? (
                  <div key={i} className="border-t border-[#454545] my-1" />
                ) : (
                  <button
                    key={item.label}
                    onClick={e => { e.stopPropagation(); setOpenMenu(null); onAction(item.action); }}
                    className="w-full text-left flex items-center justify-between px-4 py-1.5 text-[12px] text-gray-300 hover:bg-[#094771] hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="text-gray-500 text-[10px] ml-4">{item.shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2 pr-2">
        <span className="text-gray-500 text-[11px] font-mono truncate max-w-xs">
          {activeFile?.name || ''}
        </span>
      </div>
    </div>
  );
}

// ─── Activity Bar ─────────────────────────────────────────────────────────────

function ActivityBar({ activePanel, onPanelChange }) {
  const items = [
    { id: 'explorer', icon: FolderOpen, title: 'Explorer' },
    { id: 'search', icon: Search, title: 'Search' },
    { id: 'git', icon: GitBranch, title: 'Source Control' },
    { id: 'settings', icon: Settings, title: 'Settings' },
  ];
  return (
    <div className="w-12 flex flex-col items-center bg-[#333333] border-r border-black/30 flex-shrink-0 pt-1">
      {items.map(item => (
        <button
          key={item.id}
          title={item.title}
          onClick={() => onPanelChange(activePanel === item.id ? null : item.id)}
          className={`w-full flex items-center justify-center h-12 transition-colors relative
            ${activePanel === item.id
              ? 'text-white after:absolute after:left-0 after:top-2 after:bottom-2 after:w-0.5 after:bg-white'
              : 'text-gray-500 hover:text-gray-200'}`}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}

// ─── File Explorer Panel ──────────────────────────────────────────────────────

function ExplorerPanel({ files, activeId, onSelect, onDelete, onNew, showNewFile, newFileName, setNewFileName, onAddFile, setShowNewFile }) {
  return (
    <div className="w-56 bg-[#252526] border-r border-black/30 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/20">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Explorer</span>
        <button onClick={onNew} title="New File" className="text-gray-500 hover:text-white transition-colors p-0.5">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-2 py-1">
        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1">
          <ChevronDown className="w-3 h-3" /> OPEN FILES
        </div>
        <div className="space-y-0.5">
          {files.map(f => (
            <div
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer group transition-colors
                ${f.id === activeId ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-3 h-3 flex-shrink-0" style={{ color: langColors[f.language] || '#9ca3af' }} />
                <span className="truncate">{f.name}</span>
              </div>
              {files.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); onDelete(f.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-1 flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        {showNewFile && (
          <div className="mt-1">
            <input
              autoFocus
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onAddFile(); if (e.key === 'Escape') setShowNewFile(false); }}
              placeholder="filename.py"
              className="w-full bg-[#3c3c3c] border border-blue-500/60 text-white text-xs px-2 py-1 rounded outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SSH Terminal Panel ───────────────────────────────────────────────────────

function SSHConnectModal({ onConnect, onClose }) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#454545] rounded-lg p-5 w-72 shadow-2xl">
        <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" /> SSH Connect
        </h3>
        <div className="space-y-2">
          <input value={host} onChange={e => setHost(e.target.value)} placeholder="Host / IP" className="w-full bg-[#3c3c3c] border border-[#555] text-white text-xs px-2 py-1.5 rounded outline-none focus:border-blue-500" />
          <input value={port} onChange={e => setPort(e.target.value)} placeholder="Port (22)" className="w-full bg-[#3c3c3c] border border-[#555] text-white text-xs px-2 py-1.5 rounded outline-none focus:border-blue-500" />
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-[#3c3c3c] border border-[#555] text-white text-xs px-2 py-1.5 rounded outline-none focus:border-blue-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#3c3c3c] border border-[#555] text-white text-xs px-2 py-1.5 rounded outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 px-3 py-1.5 text-xs text-gray-400 border border-[#555] rounded hover:bg-[#3c3c3c] transition-colors">Cancel</button>
          <button
            onClick={() => host && username && onConnect({ host, port: port || '22', username, password })}
            className="flex-1 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
          >Connect</button>
        </div>
      </div>
    </div>
  );
}

function TerminalPanel({ onClose, activeFile }) {
  const [lines, setLines] = useState([
    { type: 'system', text: 'Reaper Editor Terminal — Live SSH + Code Runner' },
    { type: 'system', text: 'Type "connect" to start an SSH session, "run" to execute current file, "help" for all commands.' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [connection, setConnection] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const addLine = (type, text) => setLines(p => [...p, { type, text }]);

  const handleConnect = (creds) => {
    setConnection(creds);
    setShowConnect(false);
    addLine('system', `Connecting to ${creds.username}@${creds.host}:${creds.port}...`);
    addLine('success', `Connected! All commands will run on ${creds.host}.`);
  };

  const runSSHCommand = async (cmd) => {
    setIsRunning(true);
    try {
      const res = await base44.functions.invoke('sshProxy', {
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        command: cmd,
      });
      const output = res?.data?.output;
      const error = res?.data?.error;
      if (error) addLine('error', error);
      else addLine('output', output || '(no output)');
    } catch (e) {
      addLine('error', `Request failed: ${e.message}`);
    }
    setIsRunning(false);
  };

  const handleCommand = async () => {
    const cmd = input.trim();
    if (!cmd) return;
    setInput('');
    setCmdHistory(h => [cmd, ...h.slice(0, 49)]);
    setHistIdx(-1);

    const prompt = connection ? `${connection.username}@${connection.host}:~$` : 'local$';
    addLine('input', `${prompt} ${cmd}`);

    if (cmd === 'help') {
      addLine('system', [
        'Commands:',
        '  connect          — Open SSH connection dialog',
        '  disconnect       — End SSH session',
        '  run              — Run current editor file on SSH server',
        '  clear            — Clear terminal',
        '  ls / pwd / cat   — File system commands (requires SSH)',
        '  <any shell cmd>  — Execute on connected server',
      ].join('\n'));
      return;
    }
    if (cmd === 'clear') { setLines([]); return; }
    if (cmd === 'connect') { setShowConnect(true); return; }
    if (cmd === 'disconnect') {
      setConnection(null);
      addLine('system', 'Disconnected.');
      return;
    }

    if (cmd === 'run') {
      if (!activeFile) { addLine('error', 'No active file.'); return; }
      if (!connection) { addLine('error', 'No SSH session. Type "connect" first.'); return; }
      addLine('system', `Running ${activeFile.name} on ${connection.host}...`);
      const langRunners = {
        python: `python3 -c ${JSON.stringify(activeFile.content)}`,
        javascript: `node -e ${JSON.stringify(activeFile.content)}`,
        bash: `bash -c ${JSON.stringify(activeFile.content)}`,
        ruby: `ruby -e ${JSON.stringify(activeFile.content)}`,
        php: `php -r ${JSON.stringify(activeFile.content)}`,
      };
      const runCmd = langRunners[activeFile.language];
      if (!runCmd) { addLine('error', `No runner for language: ${activeFile.language}. Upload the file manually.`); return; }
      await runSSHCommand(runCmd);
      return;
    }

    if (!connection) {
      addLine('error', `Not connected. Type "connect" to start an SSH session.`);
      return;
    }

    await runSSHCommand(cmd);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { handleCommand(); }
    else if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx); setInput(cmdHistory[idx] || '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? '' : cmdHistory[idx] || '');
    }
  };

  const prompt = connection ? `${connection.username}@${connection.host}:~$` : 'local$';

  return (
    <div className="flex flex-col bg-[#1e1e1e] border-t border-black/40 relative" style={{ height: 220 }}>
      {showConnect && <SSHConnectModal onConnect={handleConnect} onClose={() => setShowConnect(false)} />}

      {/* Panel header */}
      <div className="flex items-center justify-between px-3 h-8 bg-[#252526] border-b border-black/30 flex-shrink-0">
        <div className="flex gap-3 items-center">
          <span className="text-[11px] text-white font-medium">TERMINAL</span>
          {connection ? (
            <div className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
              <Wifi className="w-3 h-3" />
              {connection.username}@{connection.host}:{connection.port}
              <button onClick={() => { setConnection(null); addLine('system', 'Disconnected.'); }} className="ml-1 text-green-600 hover:text-red-400 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowConnect(true)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-400 transition-colors">
              <WifiOff className="w-3 h-3" /> Connect SSH
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLines([])} title="Clear" className="text-gray-500 hover:text-white p-0.5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} title="Close" className="text-gray-500 hover:text-white p-0.5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${
            line.type === 'system' ? 'text-blue-400' :
            line.type === 'success' ? 'text-green-400' :
            line.type === 'error' ? 'text-red-400' :
            line.type === 'input' ? 'text-yellow-300' : 'text-gray-300'
          }`}>{line.text}</div>
        ))}
        {isRunning && <div className="text-yellow-400 animate-pulse">Running...</div>}
        {!isRunning && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-green-400 flex-shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none caret-green-400 font-mono"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function CodeEditor() {
  const [files, setFiles] = useState(loadFiles);
  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    return saved || loadFiles()[0]?.id || '1';
  });
  const [activePanel, setActivePanel] = useState('explorer');
  const [showTerminal, setShowTerminal] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const textareaRef = useRef(null);

  const activeFile = files.find(f => f.id === activeId) || files[0];

  // Auto-save on every change
  useEffect(() => { saveFiles(files); }, [files]);
  useEffect(() => { localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId]);
  useEffect(() => {
    localStorage.setItem(TERMINAL_KEY, JSON.stringify(terminalHistory.slice(-200)));
  }, [terminalHistory]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setActivePanel(p => p ? null : 'explorer'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); setShowTerminal(p => !p); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); setShowNewFile(true); }
      if (e.key === 'F5') { e.preventDefault(); handleRun(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [files, activeId]);

  const handleSave = () => {
    saveFiles(files);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
  };

  const updateContent = (content) => {
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, content } : f));
  };

  const updateLanguage = (language) => {
    const ext = langExtensions[language] || 'txt';
    const baseName = activeFile.name.replace(/\.[^.]+$/, '');
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, language, name: `${baseName}.${ext}` } : f));
  };

  const addFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const ext = name.split('.').pop().toLowerCase();
    const langMap = Object.entries(langExtensions).find(([, v]) => v === ext);
    const language = langMap ? langMap[0] : 'javascript';
    const newFile = { id: Date.now().toString(), name, language, content: '' };
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
    setNewFileName('');
    setShowNewFile(false);
  };

  const deleteFile = (id) => {
    if (files.length === 1) { termLog('Cannot close the last file.', 'error'); return; }
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const downloadFile = (file) => {
    const f = file || activeFile;
    const blob = new Blob([f.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
    termLog(`Downloaded ${f.name}`, 'success');
  };

  const handleRun = () => {
    setShowTerminal(true);
    termLog(`$ Running ${activeFile?.name}...`, 'input');
    termLog(`[Simulated] Execution started for ${activeFile?.name}`, 'system');
    if (activeFile?.language === 'python') {
      const lines = (activeFile?.content || '').split('\n');
      const prints = lines.filter(l => l.trim().startsWith('print(')).map(l => {
        const match = l.match(/print\(["'](.+?)["']\)/);
        return match ? match[1] : l.replace('print(', '').replace(')', '');
      });
      if (prints.length > 0) prints.forEach(p => termLog(p, 'output'));
      else termLog('[Simulated output — connect a backend for real execution]', 'output');
    } else {
      termLog('[Simulated output — connect a backend for real execution]', 'output');
    }
    termLog(`[Process exited with code 0]`, 'system');
  };

  const handleTerminalCommand = () => {
    const cmd = terminalInput.trim();
    if (!cmd) return;
    setTerminalInput('');
    setTerminalHistory(h => [...h, { type: 'input', text: cmd }]);

    const parts = cmd.split(' ');
    const base = parts[0].toLowerCase();

    if (base === 'help') {
      termLog('Available commands: help, clear, ls, echo, date, whoami, save, download, run', 'system');
    } else if (base === 'clear') {
      setTerminalHistory([{ type: 'system', text: 'Terminal cleared.' }]);
    } else if (base === 'ls') {
      files.forEach(f => termLog(`  ${f.name}  (${f.language})`, 'output'));
    } else if (base === 'echo') {
      termLog(parts.slice(1).join(' '), 'output');
    } else if (base === 'date') {
      termLog(new Date().toString(), 'output');
    } else if (base === 'whoami') {
      termLog('reaper-user', 'output');
    } else if (base === 'save') {
      handleSave();
    } else if (base === 'download') {
      downloadFile();
    } else if (base === 'run') {
      handleRun();
    } else if (base === 'pwd') {
      termLog('/home/reaper/projects', 'output');
    } else if (base === 'cat') {
      const fname = parts[1];
      const found = files.find(f => f.name === fname);
      if (found) termLog(found.content, 'output');
      else termLog(`cat: ${fname}: No such file`, 'error');
    } else {
      termLog(`${base}: command not found. Type "help" for commands.`, 'error');
    }
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case 'new-file': setShowNewFile(true); break;
      case 'save': handleSave(); break;
      case 'save-all': saveFiles(files); setSavedIndicator(true); setTimeout(() => setSavedIndicator(false), 1500); termLog('All files saved.', 'success'); break;
      case 'download': downloadFile(); break;
      case 'download-all': files.forEach(f => downloadFile(f)); break;
      case 'close-file': deleteFile(activeId); break;
      case 'exit': window.location.href = createPageUrl('CodeHub'); break;
      case 'copy-all': navigator.clipboard.writeText(activeFile?.content || ''); setCopied(true); setTimeout(() => setCopied(false), 1500); break;
      case 'select-all': textareaRef.current?.select(); break;
      case 'toggle-sidebar': setActivePanel(p => p ? null : 'explorer'); break;
      case 'toggle-terminal': setShowTerminal(p => !p); break;
      case 'zoom-in': setFontSize(s => Math.min(s + 1, 22)); break;
      case 'zoom-out': setFontSize(s => Math.max(s - 1, 10)); break;
      case 'zoom-reset': setFontSize(13); break;
      case 'run': handleRun(); break;
      case 'run-terminal': setShowTerminal(true); handleRun(); break;
      case 'stop': termLog('[Execution stopped]', 'error'); break;
      case 'clear-terminal': setTerminalHistory([{ type: 'system', text: 'Terminal cleared.' }]); break;
      case 'copy-terminal': navigator.clipboard.writeText(terminalHistory.map(h => h.text).join('\n')); break;
      default: break;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      updateContent(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  const handleCursorMove = (e) => {
    const ta = e.target;
    const text = ta.value.substring(0, ta.selectionStart);
    const lines = text.split('\n');
    setCursor({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const lineCount = (activeFile?.content || '').split('\n').length;

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Title Bar ── */}
      <div className="flex items-center gap-2 px-4 h-8 bg-[#323233] border-b border-black/30 flex-shrink-0 select-none">
        <div className="flex gap-1.5 mr-3">
          <Link to={createPageUrl('CodeHub')}>
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] inline-block cursor-pointer hover:opacity-80 transition-opacity" title="Exit to Code Hub" />
          </Link>
          <span className="w-3 h-3 rounded-full bg-[#febc2e] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] inline-block" />
        </div>
        <Code className="w-3.5 h-3.5 text-green-400" />
        <span className="text-gray-300 text-[12px] font-medium flex-1 text-center">
          {activeFile?.name || 'untitled'} — Reaper Code Editor
        </span>
        <div className="flex items-center gap-1.5">
          {savedIndicator && <span className="text-green-400 text-[10px] font-mono">Saved ✓</span>}
          <button onClick={() => handleMenuAction('copy-all')} title="Copy All" className="p-1 text-gray-500 hover:text-white rounded transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleRun} title="Run (F5)" className="p-1 text-gray-500 hover:text-green-400 rounded transition-colors">
            <Play className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleSave} title="Save (Ctrl+S)" className="p-1 text-gray-500 hover:text-blue-400 rounded transition-colors">
            <Save className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => downloadFile()} title="Download" className="p-1 text-gray-500 hover:text-white rounded transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Menu Bar ── */}
      <MenuBar onAction={handleMenuAction} activeFile={activeFile} files={files} />

      {/* ── Body (Activity + Sidebar + Editor + Terminal) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Activity Bar */}
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Explorer Sidebar */}
        {activePanel === 'explorer' && (
          <ExplorerPanel
            files={files}
            activeId={activeId}
            onSelect={setActiveId}
            onDelete={deleteFile}
            onNew={() => setShowNewFile(true)}
            showNewFile={showNewFile}
            newFileName={newFileName}
            setNewFileName={setNewFileName}
            onAddFile={addFile}
            setShowNewFile={setShowNewFile}
          />
        )}
        {activePanel === 'search' && (
          <div className="w-56 bg-[#252526] border-r border-black/30 flex flex-col flex-shrink-0 p-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Search</span>
            <input placeholder="Search in files..." className="w-full bg-[#3c3c3c] border border-[#555] text-white text-xs px-2 py-1 rounded outline-none" />
          </div>
        )}
        {activePanel === 'git' && (
          <div className="w-56 bg-[#252526] border-r border-black/30 flex flex-col flex-shrink-0 p-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Source Control</span>
            <span className="text-gray-500 text-xs">No git repository detected.</span>
          </div>
        )}
        {activePanel === 'settings' && (
          <div className="w-56 bg-[#252526] border-r border-black/30 flex flex-col flex-shrink-0 p-3 gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</span>
            <div>
              <span className="text-[11px] text-gray-400">Font Size: {fontSize}px</span>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setFontSize(s => Math.max(s-1,10))} className="px-2 py-0.5 bg-[#3c3c3c] text-white text-xs rounded hover:bg-[#505050]">-</button>
                <button onClick={() => setFontSize(13)} className="px-2 py-0.5 bg-[#3c3c3c] text-white text-xs rounded hover:bg-[#505050]">Reset</button>
                <button onClick={() => setFontSize(s => Math.min(s+1,22))} className="px-2 py-0.5 bg-[#3c3c3c] text-white text-xs rounded hover:bg-[#505050]">+</button>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-gray-400">Terminal</span>
              <button onClick={() => setShowTerminal(p => !p)} className="mt-1 w-full px-2 py-1 bg-[#3c3c3c] text-white text-xs rounded hover:bg-[#505050] text-left">
                {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
              </button>
            </div>
          </div>
        )}

        {/* Editor + Terminal column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Tabs */}
          <div className="flex items-center bg-[#2d2d2d] border-b border-black/30 overflow-x-auto flex-shrink-0" style={{ minHeight: 35 }}>
            {files.map(f => (
              <div
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs cursor-pointer border-r border-black/20 flex-shrink-0 group transition-colors
                  ${f.id === activeId
                    ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#252525]'}`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: langColors[f.language] || '#6b7280' }} />
                <span>{f.name}</span>
                {files.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteFile(f.id); }}
                    className="opacity-0 group-hover:opacity-100 ml-1 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowNewFile(true)}
              className="px-3 py-2 text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
              title="New file (Ctrl+N)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Editor area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Line numbers */}
            <div
              className="bg-[#1e1e1e] text-gray-600 font-mono pt-2 px-3 select-none flex-shrink-0 overflow-hidden border-r border-black/10 text-right leading-relaxed min-w-[52px]"
              style={{ fontSize: fontSize - 1, lineHeight: `${fontSize + 7}px` }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1} className={cursor.line === i + 1 ? 'text-gray-300' : ''}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={activeFile?.content || ''}
              onChange={e => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              spellCheck={false}
              className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono p-2 resize-none outline-none overflow-auto"
              style={{
                fontSize,
                lineHeight: `${fontSize + 7}px`,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                tabSize: 2,
              }}
            />
          </div>

          {/* Terminal */}
          {showTerminal && (
            <TerminalPanel
              history={terminalHistory}
              input={terminalInput}
              setInput={setTerminalInput}
              onCommand={handleTerminalCommand}
              onClear={() => setTerminalHistory([{ type: 'system', text: 'Terminal cleared.' }])}
            />
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center gap-4 px-3 h-6 bg-[#007acc] text-white text-[11px] flex-shrink-0 select-none">
        <Link to={createPageUrl('CodeHub')} className="flex items-center gap-1.5 hover:bg-[#1177bb] px-2 h-full transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Code Hub
        </Link>
        <span className="opacity-50">|</span>
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" /> main
        </span>
        <span className="opacity-50">|</span>
        <select
          value={activeFile?.language || 'python'}
          onChange={e => updateLanguage(e.target.value)}
          className="bg-transparent text-white text-[11px] outline-none cursor-pointer"
          style={{ fontFamily: 'inherit' }}
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l} className="bg-[#252526] text-white capitalize">{l}</option>
          ))}
        </select>
        <span className="ml-auto">Ln {cursor.line}, Col {cursor.col}</span>
        <span className="opacity-70">UTF-8</span>
        <span className="opacity-70">{files.length} file{files.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => setShowTerminal(p => !p)}
          className="flex items-center gap-1 hover:bg-[#1177bb] px-2 h-full transition-colors"
        >
          <TerminalIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}