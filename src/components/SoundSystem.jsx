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
  // Single consistent tick for typing
  type: () => beep(820, 'square', 0.018, 0.018),
  // Short click for buttons
  click: () => beep(1050, 'square', 0.035, 0.022),
  // Subtle hover blip for menu items
  hover: () => beep(660, 'sine', 0.022, 0.012),
  menuOpen: () => { beep(400, 'sine', 0.06, 0.022); setTimeout(() => beep(600, 'sine', 0.05, 0.018), 60); },
  menuClose: () => beep(400, 'sine', 0.05, 0.018),
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
let _lastHover = 0;
let _lastClick = 0;

const throttledType = () => {
  const now = Date.now();
  if (now - _lastType > 40) { sfx.type(); _lastType = now; }
};

export default function SoundSystem() {
  useEffect(() => {
    setTimeout(() => sfx.boot(), 400);

    // Typing sfx — consistent tick on any input/textarea keypress
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

    // Global click sound for buttons, links, and nav items
    const onClick = (e) => {
      const now = Date.now();
      if (now - _lastClick < 60) return;
      const t = e.target.closest('button, a, [role="menuitem"], [role="option"]');
      if (t) { sfx.click(); _lastClick = now; }
    };

    // Hover sound for nav/menu items
    const onMouseOver = (e) => {
      const now = Date.now();
      if (now - _lastHover < 80) return;
      const t = e.target.closest('button, a, [role="menuitem"]');
      if (t) { sfx.hover(); _lastHover = now; }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseover', onMouseOver, true);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mouseover', onMouseOver, true);
    };
  }, []);

  return null;
}