import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995223a811449e76d0ebadb/741e36bb4_ChatGPTImageFeb18202606_16_37PM.png';

export default function PushNotifications({ user }) {
  useEffect(() => {
    if (!user) return;

    // Request browser/OS notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Real-time subscription to Notification entity
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type !== 'create') return;
      const notif = event.data;
      if (!notif || notif.user_email !== user.email) return;

      // Try browser/desktop push notification first
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const n = new Notification(notif.title || 'Reaper Security', {
            body: notif.body || '',
            icon: LOGO,
            badge: LOGO,
            tag: notif.id,
          });
          // Click notification → focus app
          n.onclick = () => { window.focus(); n.close(); };
        } catch (e) {
          // Fallback to in-app toast
          toast(notif.title, { description: notif.body });
        }
      } else {
        // In-app toast fallback
        toast(notif.title, { description: notif.body });
      }
    });

    return unsubscribe;
  }, [user?.email]);

  return null;
}