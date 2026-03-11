import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Shield, BookOpen, Users, MessageSquare, Code, Mail,
  Store, LogIn, Menu, Bell, Bot, FlaskConical, Zap, BarChart2,
  User, Palette, MessageCircle, Terminal, Rocket, Briefcase,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import SoundSystem, { sfx } from './components/SoundSystem';

const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { name: 'Home', icon: Home, page: 'Home' },
      { name: 'Services', icon: Shield, page: 'Services' },
      { name: 'Contact', icon: Mail, page: 'Contact' },
    ]
  },
  {
    label: 'COMMUNITY',
    items: [
      { name: 'Community', icon: Users, page: 'Community' },
      { name: 'Forum', icon: MessageSquare, page: 'Forum' },
    ]
  },
  {
    label: 'LEARN & HACK',
    items: [
      { name: 'Learning', icon: BookOpen, page: 'Learning' },
      { name: 'Cyber Labs', icon: FlaskConical, page: 'CyberLabs' },
      { name: 'Threat Intel', icon: Zap, page: 'ThreatIntel' },
      { name: 'AI Assistant', icon: Bot, page: 'AIAssistant' },
    ]
  },
  {
    label: 'CODE',
    items: [
      { name: 'Code Hub', icon: Code, page: 'CodeHub' },
      { name: 'SSH Terminal', icon: Terminal, page: 'SSHTerminal' },
    ]
  },
  {
    label: 'MARKETPLACE',
    items: [
      { name: 'Marketplace', icon: Store, page: 'Marketplace' },
      { name: 'Site Upgrades', icon: Rocket, page: 'Upgrades' },
      { name: 'Apply as Provider', icon: Briefcase, page: 'ServiceProviderApply' },
    ]
  },
];

function NotificationBell({ user }) {
  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });
  const unread = notifs.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Notifications">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 w-72" side="right" align="end" sideOffset={8}>
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
          <span className="text-white font-medium text-sm">Notifications</span>
          {unread > 0 && <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">{unread} new</span>}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="px-4 py-6 text-gray-500 text-sm text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              All caught up!
            </div>
          ) : notifs.slice(0, 10).map(n => (
            <DropdownMenuItem key={n.id}
              onClick={() => base44.entities.Notification.update(n.id, { is_read: true })}
              className="px-3 py-3 cursor-pointer flex flex-col items-start gap-0.5 border-b border-white/5 last:border-0">
              <span className="text-white text-sm font-medium">{n.title}</span>
              {n.body && <span className="text-gray-400 text-xs leading-snug">{n.body}</span>}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav({ currentPageName, collapsed, user, isAuthenticated, isAdminUser, onClose }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-white/5 flex-shrink-0">
        <Link to={createPageUrl('Home')} className="flex items-center gap-3 min-w-0" onClick={onClose}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995223a811449e76d0ebadb/741e36bb4_ChatGPTImageFeb18202606_16_37PM.png"
            alt="Reaper Security"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-red-500 font-bold tracking-wide text-sm leading-none font-mono">REAPER</div>
              <div className="text-red-400/70 font-bold tracking-[0.2em] text-[9px] font-mono mt-0.5">SECURITY</div>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-3 last:mb-0">
            {!collapsed && (
              <div className="text-[9px] font-bold text-gray-700 tracking-[0.18em] px-3 py-1 uppercase mb-0.5 flex items-center gap-1.5">
                <span className="w-3 h-px bg-gray-700 inline-block" />
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={onClose}
                    onMouseEnter={() => sfx.hover()}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500 pl-[10px]'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border-l-2 border-transparent'
                      } ${collapsed ? 'justify-center pl-3' : ''}`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-red-400' : ''}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdminUser && (
          <div className="mb-3 pt-2 border-t border-white/5">
            {!collapsed && (
              <div className="text-[9px] font-bold text-red-700/50 tracking-[0.18em] px-3 py-1 uppercase mb-0.5 flex items-center gap-1.5">
                <span className="w-3 h-px bg-red-700/50 inline-block" />
                ADMIN
              </div>
            )}
            <Link
              to={createPageUrl('AdminDashboard')}
              onClick={onClose}
              title={collapsed ? 'Admin Panel' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${currentPageName === 'AdminDashboard'
                  ? 'bg-red-600/15 text-red-400 border-l-2 border-red-500 pl-[10px]'
                  : 'text-red-500/50 hover:text-red-400 hover:bg-red-500/5 border-l-2 border-transparent'
                } ${collapsed ? 'justify-center pl-3' : ''}`}
            >
              <BarChart2 className="w-4 h-4 flex-shrink-0" />
              {!collapsed && 'Admin Panel'}
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom user bar */}
      <div className="border-t border-white/5 p-3 flex-shrink-0">
        {isAuthenticated && user ? (
          <div className={`flex items-center gap-1 ${collapsed ? 'flex-col items-center' : ''}`}>
            {!collapsed && (
              <Link
                to={createPageUrl('Community') + '?view=dm'}
                title="Direct Messages"
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
            )}
            <NotificationBell user={user} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors ${collapsed ? '' : 'flex-1 min-w-0'}`}
                  title={collapsed ? (user?.full_name || 'Account') : undefined}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  {!collapsed && (
                    <span className="text-gray-300 text-xs truncate flex-1 text-left">
                      {user?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 w-48" side="right" align="end">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-white text-xs font-medium truncate">{user?.full_name || user?.email}</div>
                  <div className="text-gray-500 text-[10px] truncate">{user?.email}</div>
                </div>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Profile')} className="text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer text-sm">
                    <User className="w-3.5 h-3.5" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Themes')} className="text-gray-300 hover:text-white flex items-center gap-2 cursor-pointer text-sm">
                    <Palette className="w-3.5 h-3.5" /> Themes
                  </Link>
                </DropdownMenuItem>
                {isAdminUser && (
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('AdminDashboard')} className="text-red-400 hover:text-red-300 flex items-center gap-2 cursor-pointer text-sm">
                      <BarChart2 className="w-3.5 h-3.5" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => base44.auth.logout()}
                  className="text-red-400 hover:text-red-300 cursor-pointer text-sm"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className={`${collapsed ? 'w-9 h-9 p-0 justify-center' : 'w-full'} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs`}
            size="sm"
          >
            <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span className="ml-1.5">Sign In</span>}
          </Button>
        )}
      </div>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const { data: themes = [] } = useQuery({
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
    base44.auth.isAuthenticated().then(async (auth) => {
      setIsAuthenticated(auth);
      if (auth) {
        const u = await base44.auth.me();
        setUser(u);
        if (u.email === 'reaperappofficial@gmail.com' || u.role === 'admin') {
          setIsAdminUser(true);
        } else {
          const mods = await base44.entities.AdminModerator.filter({ user_email: u.email, is_active: true });
          setIsAdminUser(mods.length > 0);
        }
      }
    });
  }, []);

  const isCommunity = currentPageName === 'Community';

  const bg = activeTheme?.background_color || '#0a0a0a';
  const card = activeTheme?.card_color || '#111111';
  const primary = activeTheme?.primary_color || '#ef4444';
  const secondary = activeTheme?.secondary_color || '#22c55e';
  const text = activeTheme?.text_color || '#ffffff';

  const themeStyles = `
    :root { --primary: ${primary}; --secondary: ${secondary}; --background: ${bg}; --card: ${card}; --text: ${text}; }
    body { background-color: ${bg} !important; color: ${text} !important; }
  `;

  const navProps = {
    currentPageName, collapsed,
    user, isAuthenticated, isAdminUser,
    onClose: () => setMobileOpen(false),
  };

  if (isCommunity) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: bg, color: text }}>
        <SoundSystem />
        <style>{themeStyles}</style>
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: bg, color: text }}>
      <SoundSystem />
      <style>{themeStyles}</style>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative
          ${collapsed ? 'w-16' : 'w-64'} bg-[#0d0d0d] border-r border-white/5`}
      >
        <SidebarNav {...navProps} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 w-6 h-6 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:border-red-500/40 transition-all z-10 shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 flex flex-col bg-[#0d0d0d] border-r border-white/5 z-50 lg:hidden shadow-2xl"
            >
              <SidebarNav {...navProps} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-[#0d0d0d] border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995223a811449e76d0ebadb/741e36bb4_ChatGPTImageFeb18202606_16_37PM.png"
              className="w-7 h-7 object-contain"
            />
            <span className="text-red-500 font-bold text-sm tracking-wide font-mono">REAPER SECURITY</span>
          </Link>
          {isAuthenticated && user && (
            <div className="ml-auto">
              <NotificationBell user={user} />
            </div>
          )}
          {!isAuthenticated && (
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-500 text-white text-xs"
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />Sign In
            </Button>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}