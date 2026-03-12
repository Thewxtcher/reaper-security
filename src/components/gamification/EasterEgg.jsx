import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal } from 'lucide-react';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function EasterEgg() {
  const [show, setShow] = useState(false);
  const [buf, setBuf] = useState([]);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Console art easter egg for curious hackers
    console.log(
      '%c\n' +
      '██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗ \n' +
      '██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗\n' +
      '██████╔╝█████╗  ███████║██████╔╝█████╗  ██████╔╝\n' +
      '██╔══██╗██╔══╝  ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗\n' +
      '██║  ██║███████╗██║  ██║██║     ███████╗██║  ██║\n' +
      '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝\n\n' +
      '>> REAPER SECURITY PLATFORM v3.1.4\n' +
      '>> Hello, curious hacker 👀\n' +
      '>> Try the Konami code for a secret: ↑↑↓↓←→←→BA\n' +
      '>> Or... maybe look a little deeper.\n',
      'color: #ef4444; font-family: monospace; font-size: 10px; font-weight: bold;'
    );

    const handler = (e) => {
      setBuf(prev => {
        const next = [...prev, e.key].slice(-KONAMI.length);
        if (next.join(',') === KONAMI.join(',')) {
          setGlitch(true);
          setTimeout(() => { setGlitch(false); setShow(true); }, 600);
        }
        return next;
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Glitch flash overlay */}
      <AnimatePresence>
        {glitch && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{ background: 'linear-gradient(45deg, rgba(239,68,68,0.15), rgba(34,197,94,0.15))' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999]"
              onClick={() => setShow(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.3, rotate: 15 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none px-4"
            >
              <div className="bg-[#0a0a0a] border-2 border-red-500 rounded-2xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-red-500/30 relative overflow-hidden">
                {/* Animated scan line */}
                <motion.div
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-red-500/30 pointer-events-none"
                />
                <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-5">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mb-3"
                  >💀</motion.div>
                  <h2 className="text-red-400 font-mono text-xl font-bold tracking-widest">ACCESS GRANTED</h2>
                  <p className="text-gray-600 text-xs mt-1 font-mono">CLEARANCE LEVEL: MAXIMUM</p>
                </div>

                <div className="bg-[#111] rounded-lg p-4 font-mono text-xs border border-green-500/20 mb-4">
                  <p className="text-gray-600">$ <span className="text-white">whoami</span></p>
                  <p className="text-green-400 mb-2">elite_operator</p>
                  <p className="text-gray-600">$ <span className="text-white">cat /classified/konami.flag</span></p>
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-yellow-400 font-bold"
                  >
                    flag&#123;k0nam1_c0d3_m4st3r_r34p3r&#125;
                  </motion.p>
                  <p className="text-gray-700 mt-2"># Submit this in CyberLabs for secret XP!</p>
                  <p className="text-gray-700"># You are being watched... 👁️</p>
                </div>

                <p className="text-gray-500 text-xs text-center font-mono">
                  You found the Konami Secret. The Elite Watchers are pleased.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}