import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  MessageSquare, Code, Star, Trophy, Flame, TrendingUp,
  FileText, Zap
} from 'lucide-react';

export default function ActivityFeed({ posts, projects, challenges, skills }) {
  const activities = [
    ...((posts || []).slice(0, 3).map(p => ({
      type: 'post',
      id: p.id,
      icon: MessageSquare,
      color: 'text-blue-400 bg-blue-500/10',
      title: p.title,
      subtitle: `by ${p.author_name || 'Unknown'}`,
      timestamp: p.created_date,
      link: `${createPageUrl('ForumThread')}?id=${p.id}`,
      details: `${p.reply_count || 0} replies`
    }))),
    ...((projects || []).slice(0, 3).map(proj => ({
      type: 'code',
      id: proj.id,
      icon: Code,
      color: 'text-green-400 bg-green-500/10',
      title: proj.name,
      subtitle: `by ${proj.author_name || 'Unknown'}`,
      timestamp: proj.created_date,
      link: `${createPageUrl('CodeProject')}?id=${proj.id}`,
      details: `${proj.votes || 0} ⭐ · ${proj.downloads || 0} 📥`
    }))),
    ...((skills || []).slice(0, 3).map(s => ({
      type: 'user',
      id: s.id,
      icon: Trophy,
      color: 'text-yellow-400 bg-yellow-500/10',
      title: `${s.user_name || 'User'} reached ${s.tier} tier`,
      subtitle: `${s.xp} XP earned`,
      timestamp: s.updated_date,
      details: `${s.challenges_solved || 0} challenges solved`
    }))),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-sm">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No recent activity
        </div>
      ) : activities.map((activity, i) => {
        const Icon = activity.icon;
        const timeAgo = new Date(activity.timestamp);
        const diff = Date.now() - timeAgo;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const timeStr = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : 'Just now';

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={activity.link}>
              <div className={`${activity.color} border border-white/5 rounded-lg p-3 hover:border-white/10 transition-all cursor-pointer group`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${activity.color.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${activity.color.split(' ')[0]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium group-hover:text-blue-300 transition-colors truncate">
                      {activity.title}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                      {activity.subtitle}
                    </div>
                    {activity.details && (
                      <div className="text-gray-600 text-[10px] mt-1">
                        {activity.details}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-600 text-[10px] flex-shrink-0 whitespace-nowrap">
                    {timeStr}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}