import {animate} from './animation.js';

/** Ease only desktop wheel input on the document. All other scroll paths stay native. */
export function mountPageScroll() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let target = scrollY, written = scrollY, last = 0, direction = 0, stopFrame = null;
  const maximum = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const clamp = value => Math.max(0, Math.min(maximum(), value));
  function cancel() { stopFrame?.(); stopFrame = null; last = 0; direction = 0; target = written = scrollY; }
  function tick(time) {
    if (Math.abs(scrollY - written) > 1) { cancel(); return; }
    target = clamp(target);
    const dt = last ? Math.min(time - last, 40) : 16.67;
    last = time;
    const remaining = target - scrollY;
    const next = Math.abs(remaining) < 3 ? target : scrollY + remaining * (1 - Math.exp(-dt / 65));
    window.scrollTo({top: next, behavior: 'instant'});
    written = scrollY;
    if (Math.abs(target - written) < 1) cancel();
  }
  function wheel(event) {
    if (!fine.matches || reduced.matches || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.shiftKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    // Leave scrollable panels, inputs and dialogs entirely under native control,
    // including their boundary behaviour. Never hijack zoom gestures.
    for (const node of event.composedPath()) {
      if (!(node instanceof Element) || node === document.body || node === document.documentElement) continue;
      if (node.matches('input,textarea,select,dialog,[contenteditable="true"],.sidebar')) return;
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return;
    }
    if (!stopFrame) target = scrollY;
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1);
    if (direction && direction !== Math.sign(delta)) target = scrollY;
    direction = Math.sign(delta);
    const nextTarget = clamp(target + delta);
    if (nextTarget === target) return;
    event.preventDefault();
    target = nextTarget;
    // A small immediate response keeps both wheel detents and trackpad input direct.
    const immediate = clamp(scrollY + delta * .25);
    window.scrollTo({top: immediate, behavior: 'instant'});
    written = scrollY;
    if (!stopFrame) stopFrame = animate(tick);
  }
  // Keyboard, scrollbar/touch input, navigation and external scrolls take priority.
  const interrupt = () => cancel();
  const events = ['pointerdown','touchstart','keydown','hashchange','popstate','pagehide','resize'];
  window.addEventListener('wheel', wheel, {passive: false});
  events.forEach(type => window.addEventListener(type, interrupt, {passive: true}));
  fine.addEventListener('change', cancel); reduced.addEventListener('change', cancel);
  return () => {
    cancel(); window.removeEventListener('wheel', wheel);
    events.forEach(type => window.removeEventListener(type, interrupt));
    fine.removeEventListener('change', cancel); reduced.removeEventListener('change', cancel);
  };
}
