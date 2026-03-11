import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminUsers({ user, isOwner }) {
  const [search, setSearch] = useState('');

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // Try backend function first to get all users (bypasses security rules)
      try {
        const res = await base44.functions.invoke('getAdminUsers', {});
        if (res.data?.users) return res.data.users;
      } catch {}
      // Fallback
      return base44.entities.User.list('-created_date', 200);
    },
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['allSkills'],
    queryFn: () => base44.entities.UserSkill.list('-xp', 100),
  });

  const filtered = allUsers.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getSkill = (email) => skills.find(s => s.user_email === email);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users & Access</h1>
        <p className="text-gray-400 text-sm">{allUsers.length} total users</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="pl-9 bg-[#111] border-white/10 text-white" />
      </div>

      <div className="space-y-2">
        {filtered.map(u => {
          const skill = getSkill(u.email);
          return (
            <Card key={u.id} className="bg-[#111] border-white/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(u.full_name || u.email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{u.full_name || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {skill && (
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs border">
                      {skill.tier} • {skill.xp} XP
                    </Badge>
                  )}
                  <Badge className={u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-white/5 text-gray-400'}>
                    {u.role}
                  </Badge>
                  <span className="text-gray-600 text-xs">{new Date(u.created_date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}