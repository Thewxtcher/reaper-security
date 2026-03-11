import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Users, MessageSquare, Flag, Bell, Package, Wrench, Home, Lock, BarChart2 } from 'lucide-react';

import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPosts from '../components/admin/AdminPosts';
import AdminMessages from '../components/admin/AdminMessages';
import AdminContacts from '../components/admin/AdminContacts';
import AdminChallenges from '../components/admin/AdminChallenges';
import AdminToolSuite from '../components/admin/AdminToolSuite';
import AdminModerators from '../components/admin/AdminModerators';
import AdminPlugins from '../components/admin/AdminPlugins';

const OWNER_EMAIL = 'reaperappofficial@gmail.com';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'tools', label: 'Tool Suite', icon: Wrench },
  { id: 'users', label: 'Users & Access', icon: Users },
  { id: 'moderators', label: 'Team / Mods', icon: Shield },
  { id: 'posts', label: 'Forum Posts', icon: MessageSquare },
  { id: 'messages', label: 'Messages', icon: BarChart2 },
  { id: 'contacts', label: 'Contact Requests', icon: Bell },
  { id: 'challenges', label: 'CTF Challenges', icon: Flag },
  { id: 'plugins', label: 'Site Plugins', icon: Package },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (auth) => {
      if (auth) {
        const u = await base44.auth.me();
        setUser(u);
        if (u.email === OWNER_EMAIL || u.role === 'admin') {
          setIsAdmin(true);
        } else {
          const mods = await base44.entities.AdminModerator.filter({ user_email: u.email, is_active: true });
          setIsAdmin(mods.length > 0);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="text-center">
        <Lock className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400">Admin or moderator privileges required.</p>
      </div>
    </div>
  );

  const isOwner = user?.email === OWNER_EMAIL;

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col fixed top-16 bottom-0 overflow-y-auto z-20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
          {isOwner && <span className="text-xs text-red-400 font-medium">👑 Owner</span>}
        </div>
        <nav className="flex-1 p-2">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                tab === item.id ? 'bg-red-600/20 text-red-400 border border-red-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-56 flex-1 pt-20 pb-8 px-6 min-w-0">
        {tab === 'overview' && <AdminOverview user={user} isOwner={isOwner} />}
        {tab === 'tools' && <AdminToolSuite />}
        {tab === 'users' && <AdminUsers user={user} isOwner={isOwner} />}
        {tab === 'moderators' && <AdminModerators user={user} isOwner={isOwner} ownerEmail={OWNER_EMAIL} />}
        {tab === 'posts' && <AdminPosts />}
        {tab === 'messages' && <AdminMessages user={user} />}
        {tab === 'contacts' && <AdminContacts />}
        {tab === 'challenges' && <AdminChallenges />}
        {tab === 'plugins' && <AdminPlugins user={user} isOwner={isOwner} />}
      </div>
    </div>
  );
}