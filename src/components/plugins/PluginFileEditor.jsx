/**
 * PluginFileEditor — file manager + editor for multi-file plugins.
 * Supports adding JS/CSS/HTML/JSON/txt files manually or by uploading a zip.
 */
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Upload, File, FileCode, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const FILE_TYPES = ['js', 'css', 'html', 'json', 'txt', 'other'];

const FILE_ICONS = {
  js: <FileCode className="w-3.5 h-3.5 text-yellow-400" />,
  css: <FileCode className="w-3.5 h-3.5 text-blue-400" />,
  html: <Globe className="w-3.5 h-3.5 text-orange-400" />,
  json: <FileText className="w-3.5 h-3.5 text-green-400" />,
  txt: <FileText className="w-3.5 h-3.5 text-gray-400" />,
  other: <File className="w-3.5 h-3.5 text-gray-400" />,
};

function guessType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['js', 'mjs', 'jsx', 'ts', 'tsx'].includes(ext)) return 'js';
  if (['css', 'scss', 'sass'].includes(ext)) return 'css';
  if (['html', 'htm'].includes(ext)) return 'html';
  if (ext === 'json') return 'json';
  if (ext === 'txt') return 'txt';
  return 'other';
}

export default function PluginFileEditor({ files, onChange, entryFile, onEntryChange }) {
  const [activeFile, setActiveFile] = useState(files[0]?.name || null);
  const [newFileName, setNewFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const zipRef = useRef();

  const activeFileObj = files.find(f => f.name === activeFile);

  function addFile() {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    if (files.find(f => f.name === name)) return;
    const type = guessType(name);
    const newFile = { name, path: name, type, content: type === 'html' ? '<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"></head>\n<body>\n\n</body>\n</html>' : '' };
    onChange([...files, newFile]);
    setActiveFile(name);
    setNewFileName('');
  }

  function removeFile(name) {
    const updated = files.filter(f => f.name !== name);
    onChange(updated);
    if (activeFile === name) setActiveFile(updated[0]?.name || null);
    if (entryFile === name) onEntryChange(updated[0]?.name || '');
  }

  function updateContent(content) {
    onChange(files.map(f => f.name === activeFile ? { ...f, content } : f));
  }

  async function handleZipUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // Read zip using JSZip loaded dynamically
      const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
      const zip = await JSZip.loadAsync(file);
      const newFiles = [];
      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        const name = path.split('/').pop();
        const type = guessType(name);
        let content = '';
        if (['js', 'css', 'html', 'json', 'txt'].includes(type)) {
          content = await zipEntry.async('string');
        } else {
          // binary: upload and store url
          const blob = await zipEntry.async('blob');
          const uploadedFile = new File([blob], name);
          const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });
          content = '';
          newFiles.push({ name, path, type: 'other', content: '', url: file_url });
          continue;
        }
        newFiles.push({ name, path, type, content });
      }
      onChange([...files, ...newFiles]);
      if (newFiles.length > 0) setActiveFile(newFiles[0].name);
    } catch(err) {
      console.error('Zip parse error', err);
      alert('Failed to parse zip: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleFileUpload(e) {
    const fileList = Array.from(e.target.files);
    const newFiles = [];
    for (const f of fileList) {
      const type = guessType(f.name);
      if (['js', 'css', 'html', 'json', 'txt'].includes(type)) {
        const content = await f.text();
        newFiles.push({ name: f.name, path: f.name, type, content });
      } else {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        newFiles.push({ name: f.name, path: f.name, type: 'other', content: '', url: file_url });
      }
    }
    onChange([...files, ...newFiles.filter(n => !files.find(f => f.name === n.name))]);
    if (newFiles.length > 0) setActiveFile(newFiles[0].name);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 flex-1">
          <Input
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="new-file.js"
            className="bg-[#0a0a0a] border-white/10 text-white text-xs h-7 flex-1"
            onKeyDown={e => e.key === 'Enter' && addFile()}
          />
          <Button size="sm" onClick={addFile} className="h-7 px-2 bg-white/10 hover:bg-white/20 text-white text-xs">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <label className="cursor-pointer">
          <input type="file" multiple accept=".js,.css,.html,.json,.txt,.png,.jpg,.svg,.woff,.woff2" className="hidden" onChange={handleFileUpload} />
          <span className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded-md transition-colors border border-white/10 cursor-pointer">
            <Upload className="w-3 h-3" /> Upload Files
          </span>
        </label>
        <label className="cursor-pointer">
          <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={handleZipUpload} />
          <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors border cursor-pointer ${uploading ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'}`}>
            {uploading ? '⏳ Extracting...' : '📦 Upload ZIP'}
          </span>
        </label>
      </div>

      {/* File tabs */}
      {files.length > 0 && (
        <div className="flex gap-1 flex-wrap border-b border-white/10 pb-2">
          {files.map(f => (
            <div key={f.name} className={`flex items-center gap-1.5 px-2 py-1 rounded-t text-[10px] cursor-pointer transition-all border-b-2 ${activeFile === f.name ? 'bg-white/10 text-white border-purple-500' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
              onClick={() => setActiveFile(f.name)}>
              {FILE_ICONS[f.type] || FILE_ICONS.other}
              <span className="max-w-[80px] truncate">{f.name}</span>
              {f.name === entryFile && <span className="text-green-500 text-[8px]">▶</span>}
              <button onClick={e => { e.stopPropagation(); removeFile(f.name); }} className="text-gray-600 hover:text-red-400 ml-0.5">×</button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      {activeFileObj ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-[10px] font-mono">{activeFileObj.name}</span>
            <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-green-400 transition-colors">
              <input type="radio" checked={entryFile === activeFileObj.name} onChange={() => onEntryChange(activeFileObj.name)} className="accent-green-500 w-3 h-3" />
              Entry Point
            </label>
          </div>
          {activeFileObj.type === 'other' && activeFileObj.url ? (
            <div className="bg-[#0a0a0a] border border-white/10 rounded p-3 text-xs text-gray-400">
              📎 Binary file uploaded: <a href={activeFileObj.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">{activeFileObj.name}</a>
            </div>
          ) : (
            <textarea
              value={activeFileObj.content || ''}
              onChange={e => updateContent(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-green-400 text-xs font-mono focus:outline-none focus:border-purple-500/50 resize-y"
            />
          )}
        </div>
      ) : (
        <div className="text-gray-600 text-xs text-center py-6 border border-white/5 rounded-lg">
          Add files above or upload a ZIP to get started
        </div>
      )}
    </div>
  );
}