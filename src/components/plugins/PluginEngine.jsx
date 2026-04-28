/**
 * PluginEngine — runs enabled plugins as real JS on the client.
 */
import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { execPlugin, cleanupPlugin } from './PluginRunner';

export default function PluginEngine({ userEmail }) {
  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins-active', userEmail],
    queryFn: () => base44.entities.SitePlugin.filter({ is_public: true }, '-created_date', 100),
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const prevEnabled = useRef(new Set());

  useEffect(() => {
    if (!userEmail || !plugins.length) return;

    const nowEnabled = new Set(
      plugins.filter(p => p.enabled_by?.includes(userEmail)).map(p => p.id)
    );

    plugins.forEach(p => {
      if (nowEnabled.has(p.id) && !prevEnabled.current.has(p.id)) {
        execPlugin(p);
      }
    });

    prevEnabled.current.forEach(id => {
      if (!nowEnabled.has(id)) cleanupPlugin(id);
    });

    prevEnabled.current = nowEnabled;
  }, [plugins, userEmail]);

  useEffect(() => {
    return () => {
      [...prevEnabled.current].forEach(cleanupPlugin);
    };
  }, []);

  return null;
}