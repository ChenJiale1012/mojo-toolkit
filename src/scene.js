import {animate} from './animation.js';
import scene from './sunlit-scene.json' with {type:'json'};
export {scene as sceneConfig};

/** The supplied artwork, edge fades and steam share the original source coordinates. */
export function workspaceScene(){
 const {width,height,mug}=scene;
 return `<div class="scene hero-environment"><svg class="workspace-scene" data-workspace-scene viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Sunlit pixel-art workspace with an arched window overlooking the sea, a laptop, an orange mug and a sleeping cat">
  <defs>
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
  <image class="workspace-source" href="${scene.source}" width="${width}" height="${height}" mask="url(#workspace-art-mask)"/>
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
export function mountSceneMotion(root=document){
  const svg=root.querySelector('[data-workspace-scene]');if(!svg)return ()=>{};
  const steam=svg.querySelector('.mug-steam'),wisps=[...svg.querySelectorAll('.steam-wisp')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,visible=false,ready=false,failed=false,elapsed=0,lastTime=null,stopFrame=null;
  function draw(){
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
    svg.dataset.motionState=failed?'asset-unavailable':motion.matches?'reduced':!ready?'loading':elapsed>=SCENE_MOTION_DURATION?'settled':document.hidden?'hidden':!visible?'offscreen':'running';
    if(running()){if(!stopFrame)stopFrame=animate(tick)}else stop();
  }
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}):null;
  if(observer)observer.observe(svg);else visible=true;
  const image=new Image();image.onload=()=>{if(!disposed){ready=true;sync()}};image.onerror=()=>{if(!disposed){failed=true;ready=false;sync()}};image.src=scene.source;
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
  return ()=>{disposed=true;stop();observer?.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);image.onload=null;image.onerror=null};
}
