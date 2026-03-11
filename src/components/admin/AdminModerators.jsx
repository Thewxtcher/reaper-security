import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Shield, Plus, Trash2, Crown, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLE_COLORS = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/20',
  moderator: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
  site_monitor: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
};

export default function AdminModerators({ user, isOwner, ownerEmail }) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('moderator');
  const queryClient = useQueryClient();

  const { data: mods = [] } = useQuery({
    queryKey: ['adminModerators'],
    queryFn: () => base44.entities.AdminModerator.list('-created_date', 50),
  });

  const addMod = useMutation({
    mutationFn: (data) => base44.entities.AdminModerator.create({
      ...data,
      granted_by: user.email,
      is_active: true,
      permissions: data.role === 'admin' ? ['all'] : data.role === 'moderator' ? ['posts', 'messages', 'users'] : ['monitor'],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModerators'] });
      setNewEmail('');
      setNewName('');
      setNewRole('moderator');
    }
  });

  const removeMod = useMutation({
    mutationFn: (id) => base44.entities.AdminModerator.update(id, { is_active: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminModerators'] }),
  });

  const deleteMod = useMutation({
    mutationFn: (id) => base44.entities.AdminModerator.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminModerators'] }),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Team / Moderators</h1>
        <p className="text-gray-400 text-sm">Manage who has access to admin features</p>
      </div>

      {/* Owner card */}
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6">
        <CardContent className="p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-white font-medium text-sm">Site Owner</div>
            <div className="text-gray-400 text-xs">{ownerEmail} — full access, cannot be removed</div>
          </div>
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">👑 Owner</Badge>
        </CardContent>
      </Card>

      {/* Add new */}
      {(isOwner || user) && (
        <Card className="bg-[#111] border-white/5 mb-6">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3 text-sm">Grant Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email address"
                className="bg-[#0a0a0a] border-white/10 text-white" />
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Display name"
                className="bg-[#0a0a0a] border-white/10 text-white" />
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  <SelectItem value="site_monitor" className="text-gray-300">Site Monitor</SelectItem>
                  <SelectItem value="moderator" className="text-gray-300">Moderator</SelectItem>
                  <SelectItem value="admin" className="text-gray-300">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => addMod.mutate({ user_email: newEmail, user_name: newName, role: newRole })}
                disabled={!newEmail || addMod.isPending}
                className="bg-red-600 hover:bg-red-500">
                <Plus className="w-4 h-4 mr-2" />Grant Access
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {mods.filter(m => m.is_active).map(mod => (
          <motion.div key={mod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-[#111] border-white/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(mod.user_name || mod.user_email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{mod.user_name || mod.user_email}</div>
                  <div className="text-gray-500 text-xs">{mod.user_email} • granted by {mod.granted_by}</div>
                </div>
                <Badge className={`border text-xs ${ROLE_COLORS[mod.role] || ROLE_COLORS.moderator}`}>
                  {mod.role}
                </Badge>
                {isOwner && (
                  <Button size="icon" variant="ghost" onClick={() => deleteMod.mutate(mod.id)}
                    className="text-gray-500 hover:text-red-400 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {mods.filter(m => m.is_active).length === 0 && (
          <div className="text-center py-12 text-gray-600">No team members added yet</div>
        )}
      </div>
    </div>
  );
}