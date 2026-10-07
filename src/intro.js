import {brandSignature} from './brand.js';
const sessionKey='mojo-brand-intro-seen';
export function startIntro(){
  try{if(sessionStorage.getItem(sessionKey))return;sessionStorage.setItem(sessionKey,'1')}catch{ /* Storage restrictions must not prevent access. */ }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const overlay=document.createElement('div');
  overlay.className='brand-intro';overlay.setAttribute('aria-label','Mojo brand introduction');
  overlay.innerHTML=`<div class="intro-centre" aria-hidden="true">${brandSignature('intro-signature')}</div><button class="intro-skip">Skip intro <span aria-hidden="true">↗</span></button>`;
  document.body.append(overlay);
  const timers=new Set();let finished=false;
  const schedule=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);fn()},ms);timers.add(t);return t};
  const cleanup=()=>{if(finished)return;finished=true;timers.forEach(clearTimeout);timers.clear();overlay.remove();document.removeEventListener('keydown',onKey);window.removeEventListener('pagehide',cleanup);motion.removeEventListener('change',onMotion)};
  const exit=()=>{if(finished)return;overlay.classList.add('intro-exit');schedule(cleanup,220)};
  const onKey=e=>{if(e.key==='Escape'||e.key==='Tab'){cleanup()}};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');const onMotion=e=>{if(e.matches)cleanup()};
  motion.addEventListener('change',onMotion);document.addEventListener('keydown',onKey);window.addEventListener('pagehide',cleanup);
  overlay.querySelector('button').onclick=cleanup;
  const word=overlay.querySelector('.brand-word');
  word.insertAdjacentHTML('beforebegin','<span class="intro-reserved-word">mojo</span>');
  const space=document.createElement('span');space.className='intro-word-space';word.before(space);space.append(overlay.querySelector('.intro-reserved-word'),word);
  // No focus capture, inert content, or scroll lock. A watchdog always removes it.
  schedule(cleanup,1800);
  Promise.all([document.fonts.load('400 64px "Mojo Draft Logo"'),new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src='/brand/mojo-cat-transparent.svg'})]).then(([fonts])=>{
    if(finished)return;if(!fonts.length){cleanup();return}
    word.textContent='m';overlay.classList.add('intro-ready');
    [['mo',190],['moj',410],['mojo',590]].forEach(([text,ms])=>schedule(()=>{word.textContent=text},ms));
    schedule(()=>overlay.classList.add('intro-cat-visible'),760);schedule(exit,1160);
  }).catch(cleanup);
}
