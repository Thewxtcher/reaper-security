import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Hash, Volume2, Video, Code2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const channelTypes = [
  { value: 'text', label: 'Text Channel', icon: Hash, desc: 'Send messages, images, and files' },
  { value: 'voice', label: 'Voice Channel', icon: Volume2, desc: 'Hang out with voice' },
  { value: 'video', label: 'Video Channel', icon: Video, desc: 'Video calls' },
  { value: 'code', label: 'Code Channel', icon: Code2, desc: 'Collaborative code editor' },
  { value: 'admin', label: 'Admin Channel', icon: Shield, desc: 'Staff only' },
];

export default function AddChannelModal({ server, category, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Channel.create({
      server_id: server.id,
      name: name.toLowerCase().replace(/\s+/g, '-').trim(),
      type,
      category: category || 'Text Channels',
      position: 99,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', server.id] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl font-serif">Create Channel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selection */}
        <div className="space-y-2 mb-4">
          <Label className="text-gray-300 text-xs uppercase tracking-wide">Channel Type</Label>
          <div className="space-y-1">
            {channelTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  type === t.value
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <t.icon className={`w-5 h-5 ${type === t.value ? 'text-red-400' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className={`text-sm font-medium ${type === t.value ? 'text-white' : 'text-gray-300'}`}>
                    {t.label}
                  </div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-gray-300 text-xs uppercase tracking-wide">Channel Name</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="new-channel"
            className="mt-1 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">Cancel</Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Channel'}
          </Button>
        </div>
      </div>
    </div>
  );
}