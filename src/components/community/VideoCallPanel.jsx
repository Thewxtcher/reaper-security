import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff,
  Hand, Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

const SIGNAL_POLL_MS = 1500;

export default function VideoCallPanel({ channel, user, onLeave }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteVideos, setRemoteVideos] = useState({}); // email -> stream
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [joining, setJoining] = useState(true);
  const [peers, setPeers] = useState([]); // [{ email, name }]

  const localVideoRef = useRef(null);
  const peerConns = useRef({}); // email -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const shareStreamRef = useRef(null);
  const pollingRef = useRef(null);
  const myEmail = user?.email;
  const channelId = channel?.id;

  // Cleanup old signals (> 30s old) for this channel
  const cleanupSignals = async () => {
    try {
      const old = await base44.entities.WebRTCSignal.filter({ channel_id: channelId, to_email: myEmail });
      for (const s of old) await base44.entities.WebRTCSignal.delete(s.id);
    } catch {}
  };

  const sendSignal = async (toEmail, type, payload) => {
    await base44.entities.WebRTCSignal.create({
      channel_id: channelId,
      from_email: myEmail,
      to_email: toEmail,
      type,
      payload: JSON.stringify(payload),
    });
  };

  const createPeer = (remoteEmail, stream, initiator) => {
    if (peerConns.current[remoteEmail]) {
      peerConns.current[remoteEmail].close();
    }
    const pc = new RTCPeerConnection(ICE_CONFIG);

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (e.streams[0]) {
        setRemoteVideos(prev => ({ ...prev, [remoteEmail]: e.streams[0] }));
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal(remoteEmail, 'ice-candidate', e.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteVideos(prev => { const n = { ...prev }; delete n[remoteEmail]; return n; });
        setPeers(prev => prev.filter(p => p.email !== remoteEmail));
      }
    };

    peerConns.current[remoteEmail] = pc;

    if (initiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then(offer => pc.setLocalDescription(offer))
        .then(() => sendSignal(remoteEmail, 'offer', pc.localDescription));
    }

    return pc;
  };

  const handleSignal = async (signal) => {
    const from = signal.from_email;
    const stream = localStreamRef.current;
    if (!stream) return;

    if (signal.type === 'presence') {
      // New peer joined — initiate offer
      if (!peerConns.current[from]) {
        setPeers(prev => prev.find(p => p.email === from) ? prev : [...prev, { email: from, name: JSON.parse(signal.payload || '{}').name || from }]);
        createPeer(from, stream, true);
      }
    } else if (signal.type === 'offer') {
      const pc = createPeer(from, stream, false);
      const offer = JSON.parse(signal.payload);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal(from, 'answer', pc.localDescription);
      setPeers(prev => prev.find(p => p.email === from) ? prev : [...prev, { email: from, name: from }]);
    } else if (signal.type === 'answer') {
      const pc = peerConns.current[from];
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.payload)));
      }
    } else if (signal.type === 'ice-candidate') {
      const pc = peerConns.current[from];
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(signal.payload))); } catch {}
      }
    } else if (signal.type === 'leave') {
      peerConns.current[from]?.close();
      delete peerConns.current[from];
      setRemoteVideos(prev => { const n = { ...prev }; delete n[from]; return n; });
      setPeers(prev => prev.filter(p => p.email !== from));
    }

    // Delete processed signal
    await base44.entities.WebRTCSignal.delete(signal.id);
  };

  const pollSignals = async () => {
    try {
      const signals = await base44.entities.WebRTCSignal.filter({ channel_id: channelId, to_email: myEmail });
      for (const s of signals) await handleSignal(s);
    } catch {}
  };

  // Broadcast presence to all existing participants
  const broadcastPresence = async () => {
    try {
      const others = await base44.entities.WebRTCSignal.filter({ channel_id: channelId });
      const emails = [...new Set(others.map(s => s.from_email).filter(e => e !== myEmail))];
      for (const email of emails) {
        await sendSignal(email, 'presence', { name: user?.full_name || myEmail });
      }
      // Also broadcast to channel members who may be polling
      await sendSignal('*', 'presence', { name: user?.full_name || myEmail });
    } catch {}
  };

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          setLocalStream(stream);
          setIsCamOff(true);
        } catch (err) {
          setPermissionError('Camera and microphone access denied. Please allow permissions in your browser and try again.');
        }
      }

      setJoining(false);
      await cleanupSignals();
      await broadcastPresence();

      pollingRef.current = setInterval(pollSignals, SIGNAL_POLL_MS);
    };

    start();

    return () => {
      clearInterval(pollingRef.current);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      shareStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peerConns.current).forEach(pc => pc.close());
      // Notify peers we left
      Object.keys(peerConns.current).forEach(email => {
        sendSignal(email, 'leave', {}).catch(() => {});
      });
    };
  }, []);

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
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
        // Replace video track in all peer connections
        const videoTrack = shareStream.getVideoTracks()[0];
        Object.values(peerConns.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
        shareStream.getVideoTracks()[0].onended = () => toggleScreenShare();
      } catch {}
    }
  };

  const handleLeave = async () => {
    clearInterval(pollingRef.current);
    // Notify peers
    for (const email of Object.keys(peerConns.current)) {
      try { await sendSignal(email, 'leave', {}); } catch {}
    }
    localStream?.getTracks().forEach(t => t.stop());
    shareStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peerConns.current).forEach(pc => pc.close());
    onLeave();
  };

  if (permissionError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <MicOff className="w-12 h-12 text-red-500" />
        <p className="text-white font-semibold">Permission Denied</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">{permissionError}</p>
        <button onClick={onLeave} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">Leave</button>
      </div>
    );
  }

  const totalParticipants = 1 + peers.length;

  return (
    <div className={`flex-1 flex flex-col bg-[#0a0a0a] min-w-0 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0 bg-[#111]">
        <Video className="w-5 h-5 text-green-400" />
        <span className="text-white font-semibold">{channel?.name}</span>
        <span className="text-gray-500 text-sm">{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</span>
        <div className="ml-auto">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-gray-500 hover:text-white p-1">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-3 overflow-auto">
        {joining ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Joining call...</p>
            </div>
          </div>
        ) : (
          <div className={`h-full grid gap-3 ${totalParticipants === 1 ? '' : 'grid-cols-2'}`}
            style={{ gridAutoRows: totalParticipants > 2 ? '50%' : '100%' }}>
            {/* Local */}
            <div className={`relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 ${isSharing ? 'ring-2 ring-green-500' : ''}`}>
              {isCamOff && !isSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center text-xl font-bold text-white">
                      {user?.full_name?.[0] || '?'}
                    </div>
                    {/* Talking indicator rings when cam off */}
                    {!isMuted && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-40" style={{ animationDuration: '1.2s' }} />
                        <span className="absolute -inset-2 rounded-full border border-green-500/30 animate-ping opacity-20" style={{ animationDuration: '1.8s' }} />
                      </>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm mt-3">{user?.full_name || user?.email}</span>
                  {!isMuted && (
                    <div className="flex items-end gap-0.5 mt-2">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="w-1 bg-green-400 rounded-full"
                          style={{ height: `${6 + Math.random() * 10}px`, animation: `soundBar 0.6s ease-in-out ${i * 0.1}s infinite alternate` }} />
                      ))}
                    </div>
                  )}
                  <style>{`@keyframes soundBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
                </div>
              )}
              <video ref={localVideoRef} autoPlay muted playsInline
                className={`w-full h-full object-cover ${isCamOff && !isSharing ? 'opacity-0' : ''}`} />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">You{isSharing ? ' (screen)' : ''}</span>
                {isMuted && <span className="bg-red-600 rounded-full p-0.5"><MicOff className="w-3 h-3 text-white" /></span>}
                {handRaised && <span>✋</span>}
              </div>
            </div>

            {/* Remote participants */}
            {peers.map(peer => (
              <RemoteVideo key={peer.email} peer={peer} stream={remoteVideos[peer.email]} />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-20 flex items-center justify-center gap-3 border-t border-white/10 bg-[#111] flex-shrink-0">
        <ControlBtn onClick={toggleMute} active={!isMuted}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white" inactiveClass="bg-red-600 hover:bg-red-500 text-white"
          Icon={isMuted ? MicOff : Mic} label={isMuted ? 'Unmute' : 'Mute'} />
        <ControlBtn onClick={toggleCamera} active={!isCamOff}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white" inactiveClass="bg-red-600 hover:bg-red-500 text-white"
          Icon={isCamOff ? VideoOff : Video} label={isCamOff ? 'Start Cam' : 'Stop Cam'} />
        <ControlBtn onClick={toggleScreenShare} active={!isSharing}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white" inactiveClass="bg-green-600 hover:bg-green-500 text-white"
          Icon={isSharing ? MonitorOff : Monitor} label={isSharing ? 'Stop Share' : 'Share'} />
        <ControlBtn onClick={() => setHandRaised(!handRaised)} active={!handRaised}
          activeClass="bg-[#1a1a1a] hover:bg-white/10 text-white" inactiveClass="bg-yellow-600 hover:bg-yellow-500 text-white"
          Icon={Hand} label="Hand" />
        <button onClick={handleLeave}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center gap-0.5 transition-all">
          <PhoneOff className="w-5 h-5" />
          <span className="text-[9px] opacity-70">Leave</span>
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ peer, stream }) {
  const videoRef = useRef(null);
  const [isTalking, setIsTalking] = useState(false);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Audio analysis for talking detection
      try {
        const ac = new AudioContext();
        const src = ac.createMediaStreamSource(stream);
        const an = ac.createAnalyser();
        an.fftSize = 256;
        src.connect(an);
        analyserRef.current = an;
        const data = new Uint8Array(an.frequencyBinCount);
        const check = () => {
          an.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setIsTalking(avg > 12);
          animFrameRef.current = requestAnimationFrame(check);
        };
        check();
      } catch {}
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some(t => t.enabled);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-[#1a1a1a] border transition-all ${isTalking ? 'border-green-500/60 shadow-[0_0_12px_rgba(34,197,94,0.3)]' : 'border-white/10'}`}>
      {(!stream || !hasVideo) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              {peer.name?.[0] || '?'}
            </div>
            {isTalking && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-50" style={{ animationDuration: '0.9s' }} />
                <span className="absolute -inset-2 rounded-full border border-green-500/30 animate-ping opacity-25" style={{ animationDuration: '1.4s' }} />
              </>
            )}
          </div>
          <span className="text-gray-400 text-sm mt-3">{peer.name || peer.email}</span>
          {isTalking ? (
            <div className="flex items-end gap-0.5 mt-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-1 bg-green-400 rounded-full"
                  style={{ height: `${6 + Math.random() * 10}px`, animation: `soundBar 0.6s ease-in-out ${i * 0.1}s infinite alternate` }} />
              ))}
            </div>
          ) : (
            !stream && <span className="text-gray-600 text-xs mt-1">Connecting...</span>
          )}
          <style>{`@keyframes soundBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${(!stream || !hasVideo) ? 'opacity-0' : ''}`} />
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">{peer.name || peer.email}</span>
        {isTalking && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
      </div>
    </div>
  );
}

function ControlBtn({ onClick, active, activeClass, inactiveClass, Icon, label }) {
  return (
    <button onClick={onClick} title={label}
      className={`w-12 h-12 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all ${active ? activeClass : inactiveClass}`}>
      <Icon className="w-5 h-5" />
      <span className="text-[9px] opacity-70 hidden sm:block">{label}</span>
    </button>
  );
}