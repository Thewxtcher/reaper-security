import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Shield, BookOpen, Users, MessageSquare, Code, Mail,
  Store, LogIn, Menu, X, ChevronDown, Bell, Bot, FlaskConical,
  Zap, BarChart2, Settings, User, Palette, ChevronRight, MessageCircle, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Home', icon: Home, page: 'Home' },
      { name: 'Services', icon: Shield, page: 'Services' },
      { name: 'Contact', icon: Mail, page: 'Contact' },
    ]
  },
  {
    label: 'Community',
    items: [
      { name: 'Community', icon: Users, page: 'Community' },
      { name: 'Forum', icon: MessageSquare, page: 'Forum' },
    ]
  },
  {
    label: 'Learn & Hack',
    items: [
      { name: 'Learning', icon: BookOpen, page: 'Learning' },
      { name: 'Cyber Labs', icon: FlaskConical, page: 'CyberLabs' },
      { name: 'Threat Intel', icon: Zap, page: 'ThreatIntel' },
      { name: 'AI Assistant', icon: Bot, page: 'AIAssistant' },
    ]
  },
  {
    label: 'Code',
    items: [
      { name: 'Code Hub', icon: Code, page: 'CodeHub' },
      { name: 'SSH Terminal', icon: Terminal, page: 'SSHTerminal' },
    ]
  },
  {
    label: 'Market',
    items: [
      { name: 'Marketplace', icon: Store, page: 'Marketplace' },
    ]
  },
];

// Flat list for mobile
const allNavItems = navGroups.flatMap(g => g.items);

function NotificationBell({ user }) {
  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const unread = notifs.length;

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 w-80" align="end">
        <div className="px-3 py-2 border-b border-white/10">
          <span className="text-white font-medium text-sm">Notifications</span>
          {unread > 0 && <span className="ml-2 text-xs text-red-400">{unread} unread</span>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="px-4 py-6 text-gray-500 text-sm text-center">All caught up!</div>
          ) : notifs.slice(0, 10).map(n => (
            <DropdownMenuItem key={n.id} onClick={() => markRead(n.id)}
              className="px-3 py-3 cursor-pointer flex flex-col items-start gap-0.5 border-b border-white/5 last:border-0">
              <span className="text-white text-sm font-medium">{n.title}</span>
              {n.body && <span className="text-gray-400 text-xs">{n.body}</span>}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: themes } = useQuery({
    queryKey: ['activeTheme'],
    queryFn: async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          return base44.entities.Theme.filter({ owner_email: currentUser.email, is_active: true });
        }
        return [];
      } catch { return []; }
    },
    initialData: []
  });

  const activeTheme = themes?.[0];

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const isCommunity = currentPageName === 'Community';

  const bg = activeTheme?.background_color || '#0a0a0a';
  const card = activeTheme?.card_color || '#111111';
  const primary = activeTheme?.primary_color || '#ef4444';
  const secondary = activeTheme?.secondary_color || '#22c55e';
  const text = activeTheme?.text_color || '#ffffff';

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: bg, color: text }}>
      <style>{`
        :root {
          --primary: ${primary};
          --secondary: ${secondary};
          --background: ${bg};
          --card: ${card};
          --text: ${text};
        }
        body { background-color: ${bg} !important; color: ${text} !important; }
        .bg-\\[\\#0a0a0a\\], .bg-\\[\\#111\\], .bg-\\[\\#0f0f0f\\] { background-color: ${bg} !important; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995223a811449e76d0ebadb/741e36bb4_ChatGPTImageFeb18202606_16_37PM.png"
                alt="Reaper Security" className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-red-500 font-bold tracking-wide text-sm">REAPER</span>
                <span className="text-red-500 font-bold tracking-widest text-xs -mt-1">SECURITY</span>
              </div>
            </Link>

            {/* Desktop Nav — grouped dropdowns */}
            <div className="hidden lg:flex items-center gap-1 ml-4 flex-1">
              {navGroups.map(group => {
                const isActive = group.items.some(i => i.page === currentPageName);
                if (group.items.length === 1) {
                  const item = group.items[0];
                  return (
                    <Link key={item.page} to={createPageUrl(item.page)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${currentPageName === item.page ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                }
                return (
                  <DropdownMenu key={group.label}>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {group.label}
                        <ChevronDown className="w-3 h-3" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 min-w-[160px]"
                      style={{ animation: 'fadeInDown 0.15s ease' }}>
                      {group.items.map((item, idx) => (
                        <DropdownMenuItem key={item.page} asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}>
                            <Link to={createPageUrl(item.page)}
                              className={`flex items-center gap-2 text-sm cursor-pointer w-full px-2 py-1.5 ${currentPageName === item.page ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                              <item.icon className="w-4 h-4" />
                              {item.name}
                            </Link>
                          </motion.div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}

              {/* Admin link */}
              {isAdminUser && (
                <Link to={createPageUrl('AdminDashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${currentPageName === 'AdminDashboard' ? 'bg-red-600/20 text-red-400' : 'text-red-500/70 hover:text-red-400 hover:bg-red-500/10'}`}>
                  <BarChart2 className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {isAuthenticated && user && (
                <Link to={createPageUrl('Community') + '?view=dm'} title="Direct Messages"
                  className={`p-2 text-gray-400 hover:text-white transition-colors ${currentPageName === 'Community' ? 'text-white' : ''}`}>
                  <MessageCircle className="w-5 h-5" />
                </Link>
              )}
              {isAuthenticated && user && <NotificationBell user={user} />}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-300 hover:text-white gap-2 px-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white">
                        {user?.full_name?.[0] || user?.email?.[0] || '?'}
                      </div>
                      <span className="hidden sm:block text-sm">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1a1a1a] border-white/10" align="end">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Themes')} className="text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer">
                        <Palette className="w-4 h-4" />Themes
                      </Link>
                    </DropdownMenuItem>
                    {user?.email === 'reaperappofficial@gmail.com' && (
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminDashboard')} className="text-red-400 hover:text-red-300 flex items-center gap-2 cursor-pointer">
                          <BarChart2 className="w-4 h-4" />Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-400 hover:text-red-300 cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm px-4">
                  <LogIn className="w-4 h-4 mr-2" />Login
                </Button>
              )}

              {/* Mobile menu */}
              <Button variant="ghost" className="lg:hidden text-white px-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0a] border-t border-white/5 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {allNavItems.map(item => (
                <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPageName === item.page ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              {isAdminUser && (
                <Link to={createPageUrl('AdminDashboard')} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10">
                  <BarChart2 className="w-5 h-5" />Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}