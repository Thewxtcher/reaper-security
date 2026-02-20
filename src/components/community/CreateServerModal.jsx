import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateServerModal({ user, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create server
      const server = await base44.entities.Server.create({
        name: name.trim(),
        description: description.trim(),
        owner_email: user.email,
        invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        member_count: 1,
      });
      // Create default channels
      const defaultChannels = [
        { name: 'general', type: 'text', category: 'Text Channels', position: 0 },
        { name: 'announcements', type: 'text', category: 'Text Channels', position: 1 },
        { name: 'voice-chat', type: 'voice', category: 'Voice Channels', position: 2 },
        { name: 'code-lab', type: 'code', category: 'Code Channels', position: 3 },
      ];
      for (const ch of defaultChannels) {
        await base44.entities.Channel.create({ ...ch, server_id: server.id });
      }
      // Add owner as member
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        role: 'owner',
        role_color: '#ef4444',
        status: 'online',
        joined_at: new Date().toISOString(),
      });
      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      onCreated(server);
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl font-serif">Create a Server</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-green-500/20 flex items-center justify-center">
            <Server className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-300 text-xs uppercase tracking-wide">Server Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Security Server"
              className="mt-1 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-gray-300 text-xs uppercase tracking-wide">Description</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this server about?"
              className="mt-1 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Server'}
          </Button>
        </div>
      </div>
    </div>
  );
}