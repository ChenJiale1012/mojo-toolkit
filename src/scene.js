import scene from './courtyard-scene.json' with {type:'json'};
import skyWindow from './courtyard-sky-window.json' with {type:'json'};
export {scene as sceneConfig};
const skyWindowShapes=skyWindow.map(([x,y,width,height])=>`<rect x="${x}" y="${y}" width="${width}" height="${height}"/>`).join('');

/** Edited upper background, original foreground and steam share source coordinates. */
export function courtyardScene(){
  const {width,height,mug}=scene;
  return `<div class="scene hero-environment"><svg class="courtyard-scene" data-courtyard-scene viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Pixel-art courtyard beneath a sunlit blue sky and three cream clouds, with a leafy garden, shared worktable and orange mug">
    <defs>
      <mask id="courtyard-art-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><image href="/courtyard-mask.svg" width="${width}" height="${height}"/><g class="sky-window-cutout" fill="black" shape-rendering="crispEdges">${skyWindowShapes}</g></mask>
      <linearGradient id="sky-ground-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="black"/><stop offset=".08" stop-color="white"/><stop offset=".31" stop-color="white"/><stop offset=".44" stop-color="black"/><stop offset="1" stop-color="black"/>
      </linearGradient>
      <linearGradient id="sky-text-fade" x1="0" x2="1">
        <stop offset="0" stop-color="black"/><stop offset=".30" stop-color="black"/><stop offset=".50" stop-color="white"/><stop offset="1" stop-color="white"/>
      </linearGradient>
      <mask id="sky-window-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><g fill="white" shape-rendering="crispEdges">${skyWindowShapes}</g></mask>
      <mask id="sky-text-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance"><rect width="${width}" height="${height}" fill="url(#sky-text-fade)"/></mask>
      <mask id="sky-background-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:luminance">
        <g mask="url(#sky-window-mask)"><rect width="${width}" height="${height}" fill="url(#sky-ground-fade)" mask="url(#sky-text-mask)"/></g>
      </mask>
      <clipPath id="mug-steam-clip"><rect x="${mug.clip.x}" y="${mug.clip.y}" width="${mug.clip.width}" height="${mug.clip.height}"/></clipPath>
    </defs>
    <image class="courtyard-sky" href="${scene.sky.source}" width="${width}" height="${height}" mask="url(#sky-background-mask)"/>
    <image class="courtyard-source" href="${scene.source}" width="${width}" height="${height}" mask="url(#courtyard-art-mask)"/>
    <g class="mug-steam" clip-path="url(#mug-steam-clip)" fill="#FFF8F0" aria-hidden="true" pointer-events="none" shape-rendering="crispEdges">${mug.origins.map((origin,i)=>`<g class="steam-wisp" data-wisp="${i}" transform="translate(${origin.x} ${origin.y})" opacity="0"><path d="M-1 0h2v-3h2v-4H1v2h-2Z"/></g>`).join('')}</g>
  </svg></div>`;
}

/** A zero-opacity seam and bounded drift keep every loop inside the mug region. */
export function steamPose(elapsed,origin){
  const mug=scene.mug,t=((elapsed+origin.phase)%mug.duration)/mug.duration;
  return {x:origin.x+mug.drift*Math.sin(2*Math.PI*t),y:origin.y-mug.rise*t,opacity:mug.peakOpacity*Math.sin(Math.PI*t)**2};
}

/** One clock; navigation, hidden tabs, offscreen scenes and user pause stop it. */
export function mountCourtyardMotion(root=document){
  const svg=root.querySelector('[data-courtyard-scene]');if(!svg)return ()=>{};
  const hero=svg.closest('[data-motion-scene]'),button=hero.querySelector('[data-motion-toggle]');
  const steam=svg.querySelector('.mug-steam'),wisps=[...svg.querySelectorAll('.steam-wisp')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,visible=false,ready=false,paused=false,elapsed=0,lastTime=null,frame=0;
  function draw(){wisps.forEach((wisp,i)=>{const pose=steamPose(elapsed,scene.mug.origins[i]);wisp.setAttribute('transform',`translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)})`);wisp.setAttribute('opacity',pose.opacity.toFixed(4))})}
  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=null}
  function running(){return !disposed&&ready&&visible&&!paused&&!document.hidden&&!motion.matches}
  function tick(time){frame=0;if(!running())return;if(lastTime!==null)elapsed+=Math.min(time-lastTime,100);lastTime=time;draw();frame=requestAnimationFrame(tick)}
  function sync(){
    if(disposed)return;
    steam.style.display=motion.matches||!ready?'none':'';
    svg.dataset.motionState=motion.matches?'reduced':!ready?'loading':paused?'paused':document.hidden?'hidden':!visible?'offscreen':'running';
    if(running()){if(!frame)frame=requestAnimationFrame(tick)}else stop();
  }
  function toggle(){paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-label',paused?'Resume ambient motion':'Pause ambient motion');hero.classList.toggle('ambient-paused',paused);sync()}
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}):null;
  if(observer)observer.observe(svg);else visible=true;
  const image=new Image();image.onload=()=>{ready=true;sync()};image.onerror=()=>{stop();steam.style.display='none';svg.dataset.motionState='asset-unavailable';button.disabled=true;button.textContent='Static illustration'};image.src=scene.source;
  button.addEventListener('click',toggle);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
  return ()=>{disposed=true;stop();observer?.disconnect();button.removeEventListener('click',toggle);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);image.onload=null;image.onerror=null};
}
