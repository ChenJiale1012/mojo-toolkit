import {brandSignature} from './brand.js';

export function startIntro(){
  // The HTML creates an opaque cover before the application can paint. If it
  // was skipped or expired while the bundle loaded, never start a late intro.
  const overlay=document.querySelector('#brand-intro');
  if(!overlay)return;
  const centre=document.createElement('div');
  centre.className='intro-centre';centre.setAttribute('aria-hidden','true');
  centre.innerHTML=brandSignature('intro-signature');overlay.prepend(centre);
  const timers=new Set();let finished=false;
  const schedule=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);fn()},ms);timers.add(t)};
  const cleanup=()=>{
    if(finished)return;finished=true;
    timers.forEach(clearTimeout);timers.clear();
    overlay.removeEventListener('intro-dismiss',cleanup);
    // Also clears the HTML watchdog and its early skip/keyboard listeners.
    overlay.dispatchEvent(new Event('intro-dismiss'));
  };
  overlay.addEventListener('intro-dismiss',cleanup);
  const exit=()=>{if(finished)return;overlay.classList.add('intro-exit');schedule(cleanup,220)};
  const word=overlay.querySelector('.brand-word');
  word.insertAdjacentHTML('beforebegin','<span class="intro-reserved-word">mojo</span>');
  const space=document.createElement('span');space.className='intro-word-space';word.before(space);space.append(overlay.querySelector('.intro-reserved-word'),word);
  Promise.all([document.fonts.load('400 64px "Mojo Draft Logo"'),new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src='/brand/mojo-cat-transparent.svg'})]).then(([fonts])=>{
    if(finished)return;if(!fonts.length){cleanup();return}
    word.textContent='m';overlay.classList.add('intro-ready');
    [['mo',190],['moj',410],['mojo',590]].forEach(([text,ms])=>schedule(()=>{word.textContent=text},ms));
    schedule(()=>overlay.classList.add('intro-cat-visible'),760);schedule(exit,1160);
  }).catch(cleanup);
}
