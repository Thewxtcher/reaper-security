import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, Play, Save, Copy, Check, Download, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from 'lodash';

const languages = [
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'bash', label: 'Bash', extension: 'sh' },
  { value: 'powershell', label: 'PowerShell', extension: 'ps1' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'json', label: 'JSON', extension: 'json' }
];

export default function CodeEditor() {
  const [code, setCode] = useState('# Write your code here\nprint("Hello, World!")');
  const [language, setLanguage] = useState('python');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved
  const textareaRef = useRef(null);
  const lastSavedCodeRef = useRef(code);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce((newCode) => {
      if (newCode !== lastSavedCodeRef.current) {
        setSaveStatus('saving');
        // Simulate save - in real app this would save to backend
        setTimeout(() => {
          lastSavedCodeRef.current = newCode;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
      }
    }, 500),
    []
  );

  // Handle code change with single source of truth
  const handleCodeChange = useCallback((e) => {
    const newCode = e.target.value;
    setCode(newCode);
    debouncedSave(newCode);
  }, [debouncedSave]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const lang = languages.find(l => l.value === language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${lang?.extension || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setCode('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle tab key for indentation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  }, [code]);

  // Line numbers calculation
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('CodeHub')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Code Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111] border border-white/10">
            <CardHeader className="border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-white font-serif">Code Editor</CardTitle>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-36 bg-[#0a0a0a] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-gray-300 focus:text-white">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Auto-save indicator */}
                  <div className="flex items-center gap-2">
                    {saveStatus === 'saving' && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 animate-pulse">
                        Saving...
                      </Badge>
                    )}
                    {saveStatus === 'saved' && (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex min-h-[500px] max-h-[70vh] overflow-hidden">
                {/* Line numbers */}
                <div className="flex-shrink-0 bg-[#0a0a0a] border-r border-white/10 px-3 py-4 select-none overflow-hidden">
                  <div className="flex flex-col font-mono text-sm text-gray-600 leading-6">
                    {lineNumbers.map((num) => (
                      <span key={num} className="text-right">{num}</span>
                    ))}
                  </div>
                </div>
                
                {/* Code textarea */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-[#0a0a0a] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none leading-6 overflow-auto"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-gray-300">Tab</kbd> for indentation • 
              Auto-saves after 500ms • 
              <Link to={createPageUrl('CreateCodeProject')} className="text-green-400 hover:text-green-300 ml-1">
                Share your code
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}