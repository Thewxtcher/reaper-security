import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Code, Trophy, Flame, Award, TrendingUp,
  GitFork, Eye
} from 'lucide-react';

export default function UserCommunityProfile({ userSkill, forumPosts, codeProjects, challenges }) {
  const stats = [
    { label: 'Forum Posts', value: forumPosts?.length || 0, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Code Projects', value: codeProjects?.length || 0, icon: Code, color: 'text-green-400' },
    { label: 'Challenges Solved', value: userSkill?.challenges_solved || 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Total XP', value: userSkill?.xp || 0, icon: TrendingUp, color: 'text-red-400' },
  ];

  const badges = userSkill?.badges || [];
  const skills = userSkill?.skills || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-center"
            >
              <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-600 text-[10px] mt-1">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Skills & Tier */}
      {userSkill && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              {userSkill.tier || 'bronze'} Tier
            </h3>
            {userSkill.contribution_score > 0 && (
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                {userSkill.contribution_score} contribution points
              </span>
            )}
          </div>

          {skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Badges</p>
              <div className="flex flex-wrap gap-2">
                {badges.map(badge => (
                  <span key={badge} className="text-lg" title={badge}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Contributions */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          Recent Contributions
        </h3>
        <div className="space-y-2">
          {forumPosts?.slice(0, 3).map(post => (
            <div key={post.id} className="text-xs bg-white/5 border border-white/10 rounded p-2">
              <div className="text-gray-400">Posted: {post.title?.slice(0, 50)}</div>
              <div className="text-gray-600 text-[10px] mt-1">
                {post.reply_count || 0} replies • {new Date(post.created_date).toLocaleDateString()}
              </div>
            </div>
          ))}

          {codeProjects?.slice(0, 3).map(proj => (
            <div key={proj.id} className="text-xs bg-white/5 border border-white/10 rounded p-2">
              <div className="text-gray-400">Created: {proj.name}</div>
              <div className="text-gray-600 text-[10px] mt-1">
                <Eye className="w-3 h-3 inline mr-1" />
                {proj.votes || 0} votes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}