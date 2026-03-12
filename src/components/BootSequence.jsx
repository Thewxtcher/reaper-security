import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: '> INITIALIZING REAPER SECURITY NETWORK...', delay: 300 },
  { text: '> LOADING ENCRYPTION MODULES [████████████] 100%', delay: 750 },
  { text: '> ESTABLISHING SECURE CONNECTION...', delay: 1200 },
  { text: '> BYPASSING FIREWALL PROTOCOLS...', delay: 1650 },
  { text: '> SCANNING PERIMETER... OK', delay: 2100 },
  { text: '> ALL SYSTEMS NOMINAL', delay: 2550 },
  { text: '> ACCESS GRANTED ✓', delay: 3000, accent: true },
];

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    BOOT_LINES.forEach(({ text, delay, accent }) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, { text, accent }]);
      }, delay);
    });

    setTimeout(() => {
      setShowWelcome(true);
      runGlitch();
    }, 3500);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 700);
    }, 6200);
  }, []);

  const runGlitch = () => {
    let count = 0;
    const next = () => {
      if (count >= 18) return;
      setGlitchActive(true);
      setTimeout(() => {
        setGlitchActive(false);
        count++;
        setTimeout(next, Math.random() * 280 + 60);
      }, Math.random() * 90 + 30);
    };
    next();
  };

  return (
    <motion.div
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.7 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)' }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
      />

      <div
        className="relative z-20 w-full max-w-xl px-6"
        style={{ transform: glitchActive ? 'translate(2px, -1px)' : 'none', transition: 'transform 0.05s' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995223a811449e76d0ebadb/741e36bb4_ChatGPTImageFeb18202606_16_37PM.png"
              alt="Reaper"
              className="w-24 h-24 object-contain relative z-10"
              style={{
                filter: glitchActive
                  ? 'brightness(2) saturate(3) hue-rotate(20deg) drop-shadow(0 0 12px #ef4444)'
                  : 'drop-shadow(0 0 6px rgba(239,68,68,0.4))',
                transform: glitchActive ? 'scale(1.03)' : 'scale(1)',
                transition: 'filter 0.05s, transform 0.05s',
              }}
            />
            {glitchActive && (
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl scale-150" />
            )}
          </div>
        </div>

        {/* Terminal */}
        <div className="bg-black border border-green-500/20 rounded-lg p-4 mb-6 min-h-[168px]">
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12 }}
              className={`text-xs mb-1 font-mono ${line.accent ? 'text-green-400 font-bold' : 'text-green-600/60'}`}
            >
              {line.text}
            </motion.div>
          ))}
          {visibleLines.length < BOOT_LINES.length && (
            <span className="inline-block w-2 h-3.5 bg-green-500 opacity-80 animate-pulse" />
          )}
        </div>

        {/* Welcome */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              {/* WELCOME TO */}
              <div className="relative inline-block">
                {glitchActive && (
                  <>
                    <div className="absolute inset-0 text-3xl sm:text-5xl font-black tracking-widest text-red-500 opacity-90"
                      style={{ transform: 'translate(-4px, 1px)', clipPath: 'inset(15% 0 55% 0)' }}>
                      WELCOME TO
                    </div>
                    <div className="absolute inset-0 text-3xl sm:text-5xl font-black tracking-widest text-cyan-400 opacity-70"
                      style={{ transform: 'translate(4px, -1px)', clipPath: 'inset(55% 0 10% 0)' }}>
                      WELCOME TO
                    </div>
                  </>
                )}
                <div
                  className="text-3xl sm:text-5xl font-black tracking-widest"
                  style={{
                    color: '#ef4444',
                    textShadow: glitchActive
                      ? '3px 0 #00ffff, -3px 0 #ff0000, 0 0 20px rgba(239,68,68,1)'
                      : '0 0 15px rgba(239,68,68,0.6)',
                  }}
                >
                  WELCOME TO
                </div>
              </div>

              {/* THE REAPER'S NEST */}
              <div className="relative mt-1">
                {glitchActive && (
                  <div className="absolute inset-0 text-2xl sm:text-4xl font-black tracking-[0.2em] text-red-500 opacity-60"
                    style={{ transform: 'translate(5px, 2px)', clipPath: 'inset(40% 0 25% 0)' }}>
                    THE REAPER'S NEST
                  </div>
                )}
                <div
                  className="text-2xl sm:text-4xl font-black tracking-[0.2em]"
                  style={{
                    color: '#ffffff',
                    textShadow: glitchActive
                      ? '-3px 0 #ef4444, 0 0 25px rgba(255,255,255,0.8)'
                      : '0 0 8px rgba(255,255,255,0.15)',
                  }}
                >
                  THE REAPER'S NEST
                </div>
              </div>

              {/* Animated underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mt-4 mx-auto"
                style={{ maxWidth: '320px', transformOrigin: 'center' }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[10px] text-gray-700 tracking-[0.5em] mt-3 font-mono uppercase"
              >
                Entering secure network...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}