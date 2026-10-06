import {brandSignature} from './brand.js';
const sessionKey='mojo-brand-intro-seen';
export function startIntro(){
  try{if(sessionStorage.getItem(sessionKey))return;sessionStorage.setItem(sessionKey,'1')}catch{ /* Storage restrictions must not prevent access. */ }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const overlay=document.createElement('div');
  overlay.className='brand-intro';overlay.setAttribute('aria-label','Mojo brand introduction');
  overlay.innerHTML=`<div class="intro-centre" aria-hidden="true">${brandSignature('intro-signature')}<span class="intro-caret"></span></div><button class="intro-skip">Skip intro <span aria-hidden="true">↗</span></button>`;
  document.body.append(overlay);
  const timers=new Set();let finished=false;
  const schedule=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);fn()},ms);timers.add(t);return t};
  const cleanup=()=>{if(finished)return;finished=true;timers.forEach(clearTimeout);timers.clear();overlay.remove();document.removeEventListener('keydown',onKey);window.removeEventListener('pagehide',cleanup);motion.removeEventListener('change',onMotion)};
  const exit=()=>{if(finished)return;overlay.classList.add('intro-exit');schedule(cleanup,180)};
  const onKey=e=>{if(e.key==='Escape'||e.key==='Tab'){cleanup()}};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');const onMotion=e=>{if(e.matches)cleanup()};
  motion.addEventListener('change',onMotion);document.addEventListener('keydown',onKey);window.addEventListener('pagehide',cleanup);
  overlay.querySelector('button').onclick=cleanup;
  // No focus capture, inert content, or scroll lock. A watchdog always removes it.
  schedule(cleanup,1800);
  Promise.all([document.fonts.load('400 64px "Mojo Draft Logo"'),new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src='/brand/mojo-cat-transparent.svg'})]).then(([fonts])=>{
    if(finished)return;if(!fonts.length){cleanup();return}
    const word=overlay.querySelector('.brand-word');overlay.classList.add('intro-ready');word.textContent='';
    ['m','mo','moj','mojo'].forEach((text,i)=>schedule(()=>{word.textContent=text},i*170));
    schedule(()=>overlay.classList.add('intro-cat-visible'),660);schedule(exit,1190);
  }).catch(cleanup);
}
