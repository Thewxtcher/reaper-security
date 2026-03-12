import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Terminal, Plus, X, Maximize2, Minimize2, LogIn, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BANNER = `Reaper SSH Terminal v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Real SSH via backend proxy
Type 'help' for commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

function TerminalTab({ id, title, isActive, onSelect, onClose }) {
  return (
    <button onClick={onSelect}
      className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-white/5 transition-all ${isActive ? 'bg-[#1a1a1a] text-white' : 'bg-[#111] text-gray-500 hover:text-gray-300'}`}>
      <Terminal className="w-3.5 h-3.5" />
      {title}
      <span onClick={e => { e.stopPropagation(); onClose(); }} className="ml-1 hover:text-red-400 transition-colors">
        <X className="w-3 h-3" />
      </span>
    </button>
  );
}

function ConnectModal({ onConnect, onClose }) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (host && username) onConnect({ host, port, username, password });
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-80">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" /> SSH Connect
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input value={host} onChange={e => setHost(e.target.value)}
            placeholder="IP or hostname" className="bg-black border-white/10 text-white" required />
          <Input value={port} onChange={e => setPort(e.target.value)}
            placeholder="Port (default 22)" className="bg-black border-white/10 text-white" />
          <Input value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Username" className="bg-black border-white/10 text-white" required />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" className="bg-black border-white/10 text-white" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 border-white/10 text-gray-400">Cancel</Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-500">Connect</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TerminalPane({ user }) {
  const [lines, setLines] = useState([{ type: 'banner', text: BANNER }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [showConnect, setShowConnect] = useState(false);
  const [connection, setConnection] = useState(null); // { host, port, username, password }
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (type, text) => setLines(prev => [...prev, { type, text }]);

  const handleConnect = (creds) => {
    setConnection(creds);
    setShowConnect(false);
    addLine('system', `Connecting to ${creds.username}@${creds.host}:${creds.port || 22}...`);
    addLine('system', `Connected! Type commands below.`);
  };

  // Client-side warning patterns — purely UX, backend enforces the real block
  const WARN_PATTERNS = [
    { pattern: /\bsudo\s+rm\s+-rf\b/, label: 'recursive deletion' },
    { pattern: /\bchmod\s+777\s+\//, label: 'world-writable root' },
    { pattern: /\bpasswd\b/, label: 'password change' },
    { pattern: /\b(reboot|shutdown|halt|poweroff)\b/, label: 'system restart/shutdown' },
  ];

  const getCommandWarning = (cmd) => {
    for (const { pattern, label } of WARN_PATTERNS) {
      if (pattern.test(cmd)) return label;
    }
    return null;
  };

  const runCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `${connection ? `${connection.username}@${connection.host}:~$` : 'local$'} ${trimmed}`);

    if (trimmed === 'help') {
      addLine('output', `Commands:
  connect            - Open SSH connection dialog
  disconnect         - Disconnect from current session
  clear              - Clear terminal
  <any shell cmd>    - Run on connected server (requires connection)`);
      setInput('');
      return;
    }

    if (trimmed === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    if (trimmed === 'disconnect') {
      setConnection(null);
      addLine('system', 'Disconnected.');
      setInput('');
      return;
    }

    if (trimmed === 'connect') {
      setShowConnect(true);
      setInput('');
      return;
    }

    if (!connection) {
      addLine('error', `No SSH session. Type 'connect' to start one.`);
      setInput('');
      return;
    }

    setIsRunning(true);
    try {
      const res = await base44.functions.invoke('sshProxy', {
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        command: trimmed,
      });
      const output = res?.data?.output;
      const error = res?.data?.error;
      if (error) addLine('error', error);
      else addLine('output', output || '(no output)');
    } catch (e) {
      addLine('error', `Request failed: ${e.message}`);
    }
    setIsRunning(false);

    setHistory(prev => [trimmed, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { runCommand(input); }
    else if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] || '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : history[idx] || '');
    }
  };

  const prompt = connection ? `${connection.username}@${connection.host}:~$` : 'local$';

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] font-mono text-sm relative cursor-text"
      onClick={() => inputRef.current?.focus()}>
      {showConnect && <ConnectModal onConnect={handleConnect} onClose={() => setShowConnect(false)} />}

      {/* Connection status bar */}
      <div className="px-4 py-1.5 flex items-center gap-2 bg-[#111] border-b border-white/5 text-xs">
        {connection ? (
          <>
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400">{connection.username}@{connection.host}:{connection.port || 22}</span>
            <button onClick={() => setShowConnect(true)} className="ml-auto text-gray-500 hover:text-white">Change</button>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-gray-600" />
            <span className="text-gray-500">Not connected</span>
            <button onClick={() => setShowConnect(true)} className="ml-auto text-blue-400 hover:text-blue-300">Connect...</button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all leading-relaxed ${
            line.type === 'banner' ? 'text-red-400' :
            line.type === 'input' ? 'text-green-400' :
            line.type === 'system' ? 'text-blue-400' :
            line.type === 'error' ? 'text-red-400' : 'text-gray-300'
          }`}>{line.text}</div>
        ))}
        {isRunning && <div className="text-yellow-400 animate-pulse">Running...</div>}
        {!isRunning && (
          <div className="flex items-center gap-2">
            <span className="text-green-400">{prompt}</span>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none caret-green-400"
              autoFocus spellCheck={false} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function SSHTerminal() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabs, setTabs] = useState([{ id: 1, title: 'Terminal 1' }]);
  const [activeTab, setActiveTab] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async auth => {
      setIsAuthenticated(auth);
      if (auth) setUser(await base44.auth.me());
      setIsLoading(false);
    });
  }, []);

  const addTab = () => {
    const id = nextId;
    setTabs(prev => [...prev, { id, title: `Terminal ${id}` }]);
    setActiveTab(id);
    setNextId(id + 1);
  };

  const closeTab = (id) => {
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTab === id) setActiveTab(remaining[remaining.length - 1].id);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Terminal className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <p className="text-gray-400 mb-6">Access the SSH terminal with your account.</p>
        <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-red-600 hover:bg-red-500">
          <LogIn className="w-4 h-4 mr-2" />Login
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen py-20'} bg-[#0a0a0a]`}>
      {!isFullscreen && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Terminal className="w-8 h-8 text-green-400" />SSH Terminal
            </h1>
            <p className="text-gray-400">Real SSH via secure backend proxy. Enter your server IP and credentials to connect.</p>
            <div className="mt-3 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 max-w-2xl">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-300 text-sm">Credentials are sent securely to the backend and never stored. Each command runs independently via SSH exec.</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className={`${isFullscreen ? 'h-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`${isFullscreen ? 'h-full' : 'h-[620px]'} flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-2xl`}>
          {/* Terminal Chrome */}
          <div className="flex items-center bg-[#1a1a1a] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 flex overflow-x-auto">
              {tabs.map(tab => (
                <TerminalTab key={tab.id} {...tab} isActive={activeTab === tab.id}
                  onSelect={() => setActiveTab(tab.id)} onClose={() => closeTab(tab.id)} />
              ))}
              <button onClick={addTab} className="px-3 py-2 text-gray-600 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-2 text-gray-500 hover:text-white transition-colors border-l border-white/10">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {tabs.map(tab => (
              <div key={tab.id} className={`h-full ${activeTab === tab.id ? 'block' : 'hidden'}`}>
                <TerminalPane user={user} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}