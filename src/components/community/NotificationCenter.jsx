import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';

export default function NotificationCenter({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter(
      { user_email: user.email },
      '-created_date',
      20
    ),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.delete(notifId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const getIcon = (type) => {
    switch(type) {
      case 'friend_request': return '👥';
      case 'friend_accept': return '✅';
      case 'message': return '💬';
      case 'mention': return '@';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  return (
    <>
      {/* Trigger button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-12 w-96 max-h-96 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
                      <div className="text-center">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No notifications yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {notifications.map(notif => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3 group ${
                            !notif.is_read ? 'bg-blue-500/5 border-b-blue-500/20' : ''
                          }`}
                          onClick={() => !notif.is_read && markAsReadMutation.mutate(notif.id)}
                        >
                          <span className="text-lg flex-shrink-0">{getIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white text-xs font-semibold line-clamp-1">
                              {notif.title}
                            </h3>
                            {notif.body && (
                              <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">
                                {notif.body}
                              </p>
                            )}
                            {notif.from_name && (
                              <p className="text-gray-600 text-[10px] mt-1">
                                from {notif.from_name}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notif.id);
                            }}
                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
                    <Link
                      to={createPageUrl('Community')}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                      View in Community →
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}