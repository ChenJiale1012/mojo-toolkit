import {animate} from './animation.js';
import scene from './sunlit-scene.json' with {type:'json'};
import foliage from './foliage.json' with {type:'json'};
import nightFoliage from './night-foliage.json' with {type:'json'};
export {foliage as foliageConfig};
export {nightFoliage as nightFoliageConfig};
export {scene as sceneConfig};

const variants=[{theme:'light',source:scene.source,repair:scene.foliageRepair,regions:foliage},{theme:'dark',source:scene.nightSource,repair:scene.nightFoliageRepair,regions:nightFoliage}];
function artworkPixels({theme,source,repair,regions}){
 return `<g id="workspace-pixels-${theme}"><image class="workspace-source" data-source-theme="${theme}" href="${source}" width="${scene.width}" height="${scene.height}"/><g clip-path="url(#window-motion-clip)">${regions.map((f,i)=>`<g clip-path="url(#foliage-cut-${theme}-${i})"><image class="foliage-repair" href="${repair}" width="${scene.width}" height="${scene.height}"/></g><g class="outdoor-foliage" data-foliage="${i}" data-foliage-theme="${theme}"><g clip-path="url(#foliage-cut-${theme}-${i})"><image href="${source}" width="${scene.width}" height="${scene.height}"/></g></g>`).join('')}</g></g>`;
}

/** The supplied artwork, edge fades and steam share the original source coordinates. */
export function workspaceScene(){
 const {width,height,mug}=scene;
 return `<div class="scene hero-environment"><svg class="workspace-scene" data-workspace-scene viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Mojo pixel-art workspace with an arched window overlooking the sea, a laptop, an orange mug and a sleeping cat">
  <defs>
   <clipPath id="window-motion-clip"><path d="M1132 180H1294V679H1132Z M1321 180H1565V684H1321Z"/></clipPath>
   ${variants.map(({theme,regions})=>regions.map((f,i)=>`<clipPath id="foliage-cut-${theme}-${i}"><path d="${f.path}"/></clipPath>`).join('')).join('')}
   ${variants.map(artworkPixels).join('')}
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
   <use class="workspace-light" href="#workspace-pixels-light"/>
   <use class="workspace-dark" href="#workspace-pixels-dark"/>
  </g>
  <g class="mug-steam" clip-path="url(#mug-steam-clip)" fill="#FFF8F0" aria-hidden="true" pointer-events="none" shape-rendering="crispEdges">${mug.origins.map((origin,i)=>`<g class="steam-wisp" data-wisp="${i}" transform="translate(${origin.x} ${origin.y})" opacity="0"><path d="M-1 0h2v-3h2v-4H1v2h-2Z"/></g>`).join('')}</g>
  <rect data-breeze-visibility x="1146" y="359" width="220" height="99" fill="none" aria-hidden="true"/>
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
 return Math.sin(t*Math.PI*2.4+phase)*Math.sin(Math.PI*t)**2*3.4;
}

export function mountSceneMotion(root=document){
  const svg=root.querySelector('[data-workspace-scene]');if(!svg)return ()=>{};
  const branches=[...svg.querySelectorAll('[data-foliage]')];
  const steam=svg.querySelector('.mug-steam'),wisps=[...svg.querySelectorAll('.steam-wisp')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const loaded={light:false,dark:false},failures={light:false,dark:false};
  let disposed=false,visible=false,ready=false,failed=false,elapsed=0,lastTime=null,stopFrame=null;
  const intro=document.querySelector('#brand-intro');
  let introFinished=!intro;
  function draw(){
    branches.forEach(branch=>{const regions=branch.dataset.foliageTheme==='dark'?nightFoliage:foliage,f=regions[Number(branch.dataset.foliage)],angle=breezePose(elapsed,f.phase);branch.setAttribute('transform',`rotate(${angle.toFixed(4)} ${f.pivot[0]} ${f.pivot[1]})`)});
    const fade=Math.max(0,Math.min(1,(SCENE_MOTION_DURATION-elapsed)/800)),envelope=fade*fade*(3-2*fade);
    wisps.forEach((wisp,i)=>{const pose=steamPose(elapsed,scene.mug.origins[i]);wisp.setAttribute('transform',`translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)})`);wisp.setAttribute('opacity',(pose.opacity*envelope).toFixed(4))});
  }
  function stop(){stopFrame?.();stopFrame=null;lastTime=null}
  function running(){return !disposed&&ready&&introFinished&&visible&&!document.hidden&&!motion.matches&&elapsed<SCENE_MOTION_DURATION}
  function tick(time){
    if(!running())return;
    if(lastTime!==null)elapsed=Math.min(SCENE_MOTION_DURATION,elapsed+Math.max(0,time-lastTime));
    lastTime=time;draw();if(elapsed>=SCENE_MOTION_DURATION)sync();
  }
  function sync(){
    if(disposed)return;
    const desired=document.documentElement.dataset.theme==='dark'?'dark':'light';
    ready=loaded[desired];failed=failures[desired];
    // Keep the current complete layer visible until its destination is decoded.
    if(ready){
      const first=!svg.dataset.artReady;svg.dataset.artTheme=desired;
      // Establish the first opaque frame before enabling later crossfades.
      if(first)void getComputedStyle(svg.querySelector(`.workspace-${desired}`)).opacity;
      svg.dataset.artReady='true';
    }
    steam.style.display=motion.matches||!ready?'none':'';
    if(motion.matches)branches.forEach(branch=>branch.removeAttribute('transform'));
    svg.dataset.motionState=failed?'asset-unavailable':motion.matches?'reduced':!ready?'loading':!introFinished?'intro':elapsed>=SCENE_MOTION_DURATION?'settled':document.hidden?'hidden':!visible?'offscreen':'running';
    if(running()){if(!stopFrame)stopFrame=animate(tick)}else stop();
  }
  // Observe the moving crowns themselves, so a partially visible mobile hero
  // cannot spend its breeze while only the empty wall is in the viewport.
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.5;sync()},{threshold:.5}):null;
  if(observer)observer.observe(svg.querySelector('[data-breeze-visibility]'));else visible=true;
  variants.forEach(({theme,source,repair})=>{
    const images=[source,repair].map(src=>{const image=new Image();image.src=src;return image});
    Promise.all(images.map(image=>image.decode())).then(()=>{loaded[theme]=true;sync()},()=>{failures[theme]=true;sync()});
  });
  const themeObserver=new MutationObserver(sync);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  function finishIntro(){introFinished=true;sync()}
  intro?.addEventListener('intro-dismiss',finishIntro,{once:true});
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
  return ()=>{disposed=true;stop();observer?.disconnect();themeObserver.disconnect();intro?.removeEventListener('intro-dismiss',finishIntro);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync)};
}
