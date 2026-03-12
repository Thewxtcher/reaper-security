import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, MessageCircle, Github, Twitter, Linkedin, Globe, Zap, Crown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_COLORS = {
  bronze: 'text-orange-400 bg-orange-400/10',
  silver: 'text-gray-300 bg-gray-300/10',
  gold: 'text-yellow-400 bg-yellow-400/10',
  platinum: 'text-cyan-400 bg-cyan-400/10',
  elite: 'text-purple-400 bg-purple-400/10',
};

const ROLE_COLORS = { owner: 'text-yellow-400', admin: 'text-red-400', moderator: 'text-blue-400', member: 'text-gray-400' };
const ROLE_ICONS = { owner: Crown, admin: Shield, moderator: Shield };

const STATUS_COLORS = { online: 'bg-green-500', idle: 'bg-yellow-500', dnd: 'bg-red-500', offline: 'bg-gray-600' };
const STATUS_LABELS = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };

export default function MemberProfilePopup({ member, onClose, onStartDM, currentUserEmail }) {
  const { data: skillData = [] } = useQuery({
    queryKey: ['memberSkill', member?.user_email],
    queryFn: () => base44.entities.UserSkill.filter({ user_email: member.user_email }),
    enabled: !!member?.user_email,
  });
  const skill = skillData[0] || null;

  if (!member) return null;

  const displayName = member.nickname || member.user_name || member.user_email?.split('@')[0];
  const initials = displayName?.[0]?.toUpperCase() || '?';
  const RoleIcon = ROLE_ICONS[member.role];
  const isOwnProfile = member.user_email === currentUserEmail;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Banner */}
          <div className="h-16 bg-gradient-to-r from-red-900/50 via-black to-green-900/50" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white z-10">
            <X className="w-4 h-4" />
          </button>

          <div className="px-5 pb-5 -mt-8">
            {/* Avatar */}
            <div className="relative inline-block mb-3">
              <div className="w-16 h-16 rounded-2xl border-4 border-[#111] overflow-hidden">
                {skill?.avatar_url ? (
                  <img src={skill.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: member.role_color || '#374151' }}>
                    {initials}
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#111] ${STATUS_COLORS[member.status] || 'bg-gray-600'}`} />
            </div>

            {/* Name + role */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">{displayName}</h3>
                {RoleIcon && <RoleIcon className={`w-4 h-4 ${ROLE_COLORS[member.role]}`} />}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className={`text-xs font-medium capitalize ${ROLE_COLORS[member.role]}`}>{member.role}</span>
                <span className="text-gray-600 text-xs">•</span>
                <span className="text-xs text-gray-400">{STATUS_LABELS[member.status] || 'Offline'}</span>
                {skill?.tier && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_COLORS[skill.tier]}`}>
                    {skill.tier}
                  </span>
                )}
              </div>
            </div>

            {/* XP */}
            {skill?.xp > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-400 text-xs">{skill.xp} XP</span>
              </div>
            )}

            {/* Bio */}
            {skill?.bio && (
              <p className="text-gray-300 text-sm leading-relaxed mb-3">{skill.bio}</p>
            )}

            {/* Skills */}
            {skill?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {skill.skills.slice(0, 6).map(s => (
                  <Badge key={s} variant="outline" className="text-xs border-white/10 text-gray-400">{s}</Badge>
                ))}
              </div>
            )}

            {/* Social links */}
            <div className="flex items-center gap-2 mb-4">
              {skill?.github_url && (
                <a href={skill.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {skill?.twitter_url && (
                <a href={skill.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-sky-400 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {skill?.linkedin_url && (
                <a href={skill.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {skill?.website_url && (
                <a href={skill.website_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-green-400 transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!isOwnProfile && onStartDM && (
                <Button size="sm" onClick={() => { onStartDM(member.user_email, member.user_name); onClose(); }}
                  className="flex-1 bg-green-600/20 border border-green-600/30 text-green-400 hover:bg-green-600/30">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />Message
                </Button>
              )}
              <Link to={createPageUrl(`UserProfile?email=${member.user_email}`)} className={isOwnProfile ? 'flex-1' : ''}>
                <Button size="sm" variant="outline"
                  className={`border-white/10 text-gray-300 hover:text-white ${isOwnProfile ? 'w-full' : ''}`}>
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}