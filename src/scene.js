import {animate} from './animation.js';
import scene from './sunlit-scene.json' with {type:'json'};
import foliage from './foliage.json' with {type:'json'};
export {foliage as foliageConfig};
export {scene as sceneConfig};

/** The supplied artwork, edge fades and steam share the original source coordinates. */
export function workspaceScene(){
 const {width,height,mug}=scene;
 return `<div class="scene hero-environment"><svg class="workspace-scene" data-workspace-scene viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Mojo pixel-art workspace with an arched window overlooking the sea, a laptop, an orange mug and a sleeping cat">
  <defs>
   <filter id="workspace-blue-hour" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".45 0 0 0 0  0 .38 0 0 0  -.10 0 .43 0 .015  0 0 0 1 0"/></filter>
   <filter id="workspace-warm-light" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".76 0 0 0 0  0 .65 0 0 0  0 0 .51 0 0  0 0 0 1 0"/></filter>
   <radialGradient id="workspace-lamplight"><stop offset="0" stop-color="white"/><stop offset=".45" stop-color="#bbb"/><stop offset="1" stop-color="black"/></radialGradient>
   <mask id="workspace-warm-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><ellipse cx="1230" cy="825" rx="600" ry="285" fill="url(#workspace-lamplight)"/></mask>
   <clipPath id="window-motion-clip"><path d="M1132 180H1294V679H1132Z M1321 180H1565V684H1321Z"/></clipPath>
   ${foliage.map((f,i)=>`<clipPath id="foliage-cut-${i}"><path d="${f.path}"/></clipPath>`).join('')}
   <g id="workspace-pixels">
    <image class="workspace-source" href="${scene.source}" width="${width}" height="${height}"/>
    <g clip-path="url(#window-motion-clip)">${foliage.map((f,i)=>`<g clip-path="url(#foliage-cut-${i})"><image href="${scene.source}" x="-${f.backgroundOffset}" width="${width}" height="${height}"/></g><g class="outdoor-foliage" data-foliage="${i}"><g clip-path="url(#foliage-cut-${i})"><image href="${scene.source}" width="${width}" height="${height}"/></g></g>`).join('')}</g>
   </g>
   <linearGradient id="workspace-side-fade" x1="0" x2="1">
    <stop offset="0" stop-color="black"/><stop offset=".12" stop-color="black"/>
    <stop offset=".30" stop-color="#333"/><stop offset=".48" stop-color="#aaa"/>
    <stop offset=".64" stop-color="white"/><stop offset="1" stop-color="white"/>
   </linearGradient>
   <linearGradient id="workspace-edge-fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="black"/><stop offset=".10" stop-color="white"/>
    <stop offset=".89" stop-color="white"/><stop offset=".96" stop-color="#aaa"/>
    <stop offset="1" stop-color="black"/>
   </linearGradient>
   <mask id="workspace-side-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><rect width="${width}" height="${height}" fill="url(#workspace-side-fade)"/></mask>
   <mask id="workspace-art-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><rect width="${width}" height="${height}" fill="url(#workspace-edge-fade)" mask="url(#workspace-side-mask)"/></mask>
   <clipPath id="mug-steam-clip"><rect x="${mug.clip.x}" y="${mug.clip.y}" width="${mug.clip.width}" height="${mug.clip.height}"/></clipPath>
  </defs>
  <g mask="url(#workspace-art-mask)">
   <use class="workspace-light" href="#workspace-pixels"/>
   <g class="workspace-dark"><use href="#workspace-pixels" filter="url(#workspace-blue-hour)"/><use href="#workspace-pixels" filter="url(#workspace-warm-light)" mask="url(#workspace-warm-mask)"/></g>
  </g>
  <g class="mug-steam" clip-path="url(#mug-steam-clip)" fill="#FFF8F0" aria-hidden="true" pointer-events="none" shape-rendering="crispEdges">${mug.origins.map((origin,i)=>`<g class="steam-wisp" data-wisp="${i}" transform="translate(${origin.x} ${origin.y})" opacity="0"><path d="M-1 0h2v-3h2v-4H1v2h-2Z"/></g>`).join('')}</g>
 </svg></div>`;
}

/** A zero-opacity seam and bounded drift keep every loop inside the mug region. */
export function steamPose(elapsed,origin){
  const mug=scene.mug,t=((elapsed+origin.phase)%mug.duration)/mug.duration;
  return {x:origin.x+mug.drift*Math.sin(2*Math.PI*t),y:origin.y-mug.rise*t,opacity:mug.peakOpacity*Math.sin(Math.PI*t)**2};
}

/** One finite, visible-time flourish; background/offscreen time never advances it. */
export const SCENE_MOTION_DURATION=4800;

/** A tiny anchored breeze with a zero-motion start/end, shared by both grades. */
export function breezePose(elapsed,phase=0){
 const t=Math.max(0,Math.min(1,elapsed/SCENE_MOTION_DURATION));
 return Math.sin(t*Math.PI*2.2+phase)*Math.sin(Math.PI*t)**2*1.8;
}

export function mountSceneMotion(root=document){
  const svg=root.querySelector('[data-workspace-scene]');if(!svg)return ()=>{};
  const branches=[...svg.querySelectorAll('[data-foliage]')];
  const steam=svg.querySelector('.mug-steam'),wisps=[...svg.querySelectorAll('.steam-wisp')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,visible=false,ready=false,failed=false,elapsed=0,lastTime=null,stopFrame=null;
  function draw(){
    branches.forEach(branch=>{const f=foliage[Number(branch.dataset.foliage)],angle=breezePose(elapsed,f.phase);branch.setAttribute('transform',`rotate(${angle.toFixed(4)} ${f.pivot[0]} ${f.pivot[1]})`)});
    const fade=Math.max(0,Math.min(1,(SCENE_MOTION_DURATION-elapsed)/800)),envelope=fade*fade*(3-2*fade);
    wisps.forEach((wisp,i)=>{const pose=steamPose(elapsed,scene.mug.origins[i]);wisp.setAttribute('transform',`translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)})`);wisp.setAttribute('opacity',(pose.opacity*envelope).toFixed(4))});
  }
  function stop(){stopFrame?.();stopFrame=null;lastTime=null}
  function running(){return !disposed&&ready&&visible&&!document.hidden&&!motion.matches&&elapsed<SCENE_MOTION_DURATION}
  function tick(time){
    if(!running())return;
    if(lastTime!==null)elapsed=Math.min(SCENE_MOTION_DURATION,elapsed+Math.max(0,time-lastTime));
    lastTime=time;draw();if(elapsed>=SCENE_MOTION_DURATION)sync();
  }
  function sync(){
    if(disposed)return;
    steam.style.display=motion.matches||!ready?'none':'';
    if(motion.matches)branches.forEach(branch=>branch.removeAttribute('transform'));
    svg.dataset.motionState=failed?'asset-unavailable':motion.matches?'reduced':!ready?'loading':elapsed>=SCENE_MOTION_DURATION?'settled':document.hidden?'hidden':!visible?'offscreen':'running';
    if(running()){if(!stopFrame)stopFrame=animate(tick)}else stop();
  }
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}):null;
  if(observer)observer.observe(svg);else visible=true;
  const image=new Image();image.onload=()=>{if(!disposed){ready=true;sync()}};image.onerror=()=>{if(!disposed){failed=true;ready=false;sync()}};image.src=scene.source;
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
  return ()=>{disposed=true;stop();observer?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);image.onload=null;image.onerror=null};
}
