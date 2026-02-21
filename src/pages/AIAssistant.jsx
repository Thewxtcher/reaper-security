import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Trash2, Shield, Code, Search, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

const PROMPTS = [
  { icon: Shield, label: 'Explain a vulnerability', text: 'Explain SQL Injection vulnerability, how it works, and how to prevent it.' },
  { icon: Code, label: 'Review code for security', text: 'Review this code for security flaws:\n```python\nquery = "SELECT * FROM users WHERE id=" + user_id\n```' },
  { icon: Search, label: 'Summarize a thread', text: 'Summarize what XSS (Cross-Site Scripting) is in 3 bullet points for a beginner.' },
  { icon: FileText, label: 'Mitigation strategy', text: 'What is the best mitigation strategy for a server with open SSH on port 22 exposed to the internet?' },
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-red-400" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-white/10 text-white' : 'bg-[#1a1a1a] border border-white/5 text-gray-200'}`}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs text-gray-400">You</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your Reaper Security AI Assistant. I can help you:\n\n- **Explain vulnerabilities** in plain language\n- **Review code** for security flaws\n- **Suggest mitigations** for security issues\n- **Summarize** complex security topics\n\nWhat can I help you with today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const history = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional cybersecurity AI assistant for the Reaper Security platform.
You specialize in ethical hacking, penetration testing concepts, vulnerability analysis, and security education.
Always add a disclaimer that you promote ethical, authorized security research only.
Keep responses clear, structured with markdown, and educational.

Conversation history:
${history}

User: ${userMsg}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-red-400" /> AI Security Analyst
            </h1>
            <p className="text-gray-400 text-sm mt-1">Powered by advanced AI • For educational purposes only</p>
          </div>
          <Button variant="outline" onClick={() => setMessages([messages[0]])}
            className="border-gray-700 text-gray-400 hover:text-red-400">
            <Trash2 className="w-4 h-4 mr-2" /> Clear
          </Button>
        </motion.div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PROMPTS.map((p, i) => (
              <button key={i} onClick={() => send(p.text)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-white/5 hover:border-white/20 text-left transition-all group">
                <p.icon className="w-4 h-4 text-red-400 group-hover:text-red-300 flex-shrink-0" />
                <span className="text-gray-400 group-hover:text-gray-200 text-sm">{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 bg-[#111] border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-4 mb-4" style={{ minHeight: '400px', maxHeight: '60vh' }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-red-400" />
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about vulnerabilities, code review, mitigations..."
            className="bg-[#111] border-white/10 text-white placeholder:text-gray-600 flex-1" />
          <Button onClick={() => send()} disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-5">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}