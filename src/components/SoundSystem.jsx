import { useEffect } from 'react';

let _ctx = null;
let _enabled = localStorage.getItem('sfx') !== '0';

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function beep(freq, type = 'square', dur = 0.05, vol = 0.025) {
  if (!_enabled) return;
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.start(c.currentTime);
    o.stop(c.currentTime + dur + 0.01);
  } catch (e) {}
}

export const sfx = {
  type: () => beep(300 + Math.random() * 900, 'square', 0.025, 0.012),
  click: () => beep(1100, 'square', 0.04, 0.02),
  menuOpen: () => { beep(300, 'sawtooth', 0.07, 0.025); setTimeout(() => beep(550, 'sine', 0.05, 0.02), 55); },
  menuClose: () => { beep(550, 'sawtooth', 0.05, 0.02); setTimeout(() => beep(300, 'sine', 0.07, 0.02), 45); },
  send: () => { beep(700, 'sine', 0.08, 0.035); setTimeout(() => beep(950, 'sine', 0.06, 0.025), 70); },
  notif: () => { beep(880, 'sine', 0.1, 0.04); setTimeout(() => beep(1100, 'sine', 0.08, 0.04), 110); },
  join: () => [440, 523, 659].forEach((f, i) => setTimeout(() => beep(f, 'sine', 0.12, 0.035), i * 90)),
  leave: () => [659, 523, 440].forEach((f, i) => setTimeout(() => beep(f, 'sine', 0.1, 0.03), i * 90)),
  error: () => { beep(220, 'sawtooth', 0.14, 0.05); setTimeout(() => beep(180, 'sawtooth', 0.14, 0.05), 120); },
  success: () => [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 'sine', 0.12, 0.035), i * 80)),
  boot: () => {
    const seq = [80, 160, 240, 120, 480];
    seq.forEach((f, i) => setTimeout(() => beep(f, 'sawtooth', 0.12, 0.04), i * 70));
  },
  toggle: () => { _enabled = !_enabled; localStorage.setItem('sfx', _enabled ? '1' : '0'); return _enabled; },
  isEnabled: () => _enabled,
};

let _lastType = 0;
const throttledType = () => {
  const now = Date.now();
  if (now - _lastType > 45) { sfx.type(); _lastType = now; }
};

export default function SoundSystem() {
  useEffect(() => {
    // Play boot sequence once on load
    setTimeout(() => sfx.boot(), 400);

    const onKey = (e) => {
      const skip = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape',
        'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','F1','F2','F3','F4',
        'F5','F6','F7','F8','F9','F10','F11','F12'];
      if (skip.includes(e.key)) return;
      const t = e.target;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) {
        throttledType();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return null;
}