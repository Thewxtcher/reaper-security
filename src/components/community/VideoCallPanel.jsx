import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff,
  Hand, Users, Maximize2, Minimize2
} from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export default function VideoCallPanel({ channel, user, members, onLeave }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([{ email: user?.email, name: user?.full_name || user?.email, isLocal: true }]);
  const [permissionError, setPermissionError] = useState(null);
  const [joining, setJoining] = useState(true);

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const shareStreamRef = useRef(null);

  // Start local media
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setJoining(false);
      } catch (err) {
        // Try audio only
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(stream);
          setIsCamOff(true);
          setJoining(false);
        } catch {
          setPermissionError('Camera and microphone access denied. Check browser permissions.');
          setJoining(false);
        }
      }
    };
    start();
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      shareStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
    setIsCamOff(!isCamOff);
  };

  const toggleScreenShare = async () => {
    if (isSharing) {
      shareStreamRef.current?.getTracks().forEach(t => t.stop());
      shareStreamRef.current = null;
      setIsSharing(false);
      if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    } else {
      try {
        const shareStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        shareStreamRef.current = shareStream;
        setIsSharing(true);
        if (localVideoRef.current) localVideoRef.current.srcObject = shareStream;
        shareStream.getVideoTracks()[0].onended = () => {
          setIsSharing(false);
          if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
        };
      } catch {
        // User cancelled
      }
    }
  };

  const handleLeave = () => {
    localStream?.getTracks().forEach(t => t.stop());
    shareStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peerConnections.current).forEach(pc => pc.close());
    onLeave();
  };

  if (permissionError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <MicOff className="w-12 h-12 text-red-500" />
        <p className="text-white font-semibold">Permission Denied</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">{permissionError}</p>
        <button onClick={onLeave} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">Leave Call</button>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-[#0a0a0a] min-w-0 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0 bg-[#111]">
        <Video className="w-5 h-5 text-green-400" />
        <span className="text-white font-semibold">{channel?.name}</span>
        <span className="text-gray-500 text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-2">
          {handRaised && <span className="text-yellow-400 text-sm">✋ Hand raised</span>}
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-gray-500 hover:text-white p-1">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 overflow-hidden">
        {joining ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Joining call...</p>
            </div>
          </div>
        ) : (
          <div className="h-full grid gap-3" style={{ gridTemplateColumns: participants.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}>
            {/* Local video */}
            <div className={`relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 ${isSharing ? 'ring-2 ring-green-500' : ''}`}>
              {isCamOff && !isSharing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-2xl font-bold text-white mb-2">
                    {user?.full_name?.[0] || '?'}
                  </div>
                  <span className="text-gray-400 text-sm">{user?.full_name || user?.email}</span>
                </div>
              ) : null}
              <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isCamOff && !isSharing ? 'opacity-0' : ''}`} />
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                  You {isSharing ? '(sharing)' : ''}
                </span>
                {isMuted && <span className="bg-red-600 rounded-full p-0.5"><MicOff className="w-3 h-3 text-white" /></span>}
                {handRaised && <span className="text-lg">✋</span>}
              </div>
            </div>

            {/* Remote participants (placeholder tiles) */}
            {Object.entries(remoteStreams).map(([email, stream]) => (
              <div key={email} className="relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10">
                <video autoPlay playsInline className="w-full h-full object-cover"
                  ref={el => { if (el && stream) el.srcObject = stream; }} />
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">{email.split('@')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-20 flex items-center justify-center gap-3 border-t border-white/10 bg-[#111] flex-shrink-0">
        <ControlBtn
          onClick={toggleMute}
          active={!isMuted}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white"
          inactiveClass="bg-red-600 hover:bg-red-500 text-white"
          Icon={isMuted ? MicOff : Mic}
          label={isMuted ? 'Unmute' : 'Mute'}
        />
        <ControlBtn
          onClick={toggleCamera}
          active={!isCamOff}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white"
          inactiveClass="bg-red-600 hover:bg-red-500 text-white"
          Icon={isCamOff ? VideoOff : Video}
          label={isCamOff ? 'Start Video' : 'Stop Video'}
        />
        <ControlBtn
          onClick={toggleScreenShare}
          active={!isSharing}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white"
          inactiveClass="bg-green-600 hover:bg-green-500 text-white"
          Icon={isSharing ? MonitorOff : Monitor}
          label={isSharing ? 'Stop Share' : 'Share Screen'}
        />
        <ControlBtn
          onClick={() => setHandRaised(!handRaised)}
          active={!handRaised}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white"
          inactiveClass="bg-yellow-600 hover:bg-yellow-500 text-white"
          Icon={Hand}
          label="Raise Hand"
        />
        <button
          onClick={handleLeave}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center gap-0.5 transition-all"
          title="Leave Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-[9px] opacity-70">Leave</span>
        </button>
      </div>
    </div>
  );
}

function ControlBtn({ onClick, active, activeClass, inactiveClass, Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${active ? activeClass : inactiveClass}`}
      title={label}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[9px] opacity-70 hidden sm:block">{label}</span>
    </button>
  );
}