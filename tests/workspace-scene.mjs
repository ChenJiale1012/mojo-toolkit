import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {sceneConfig as scene} from '../src/scene.js';

assert.equal(createHash('sha256').update(fs.readFileSync('public'+scene.source)).digest('hex'),scene.sourceSha256,'Supplied Sunlit PNG stays unchanged');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.waitForLoadState('networkidle');
assert.equal(await page.locator('.workspace-source').getAttribute('href'),'/sunlit-workspace.png');
assert.equal(await page.locator('.courtyard-source,.courtyard-sky').count(),0);
const pixels=await page.evaluate(async()=>{
 const width=1631,height=964,svg=document.querySelector('.workspace-scene').cloneNode(true);
 svg.setAttribute('width',width);svg.setAttribute('height',height);svg.querySelector('.mug-steam').remove();
 const blob=await (await fetch('/sunlit-workspace.png')).blob();
 const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});
 svg.querySelector('image').setAttribute('href',data);
 async function render(src){const image=new Image();image.src=src;await image.decode();const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.fillStyle='#FFF8F0';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0);return ctx.getImageData(0,0,width,height).data}
 const source=await render(data),masked=await render('data:image/svg+xml;base64,'+btoa(new XMLSerializer().serializeToString(svg)));
 const sample=(a,x,y)=>[...a.slice((y*width+x)*4,(y*width+x)*4+3)];
 return {objects:[[1420,805],[1257,825],[1110,720],[1230,260],[1540,600]].map(([x,y])=>({source:sample(source,x,y),masked:sample(masked,x,y)})),edges:[[0,400],[800,0],[1450,963]].map(([x,y])=>sample(masked,x,y))};
});
for(const p of pixels.objects)assert.deepEqual(p.masked,p.source,'Cat, mug, laptop, window and plant retain source colours and details');
for(const p of pixels.edges)assert.ok(p.every((v,i)=>Math.abs(v-[255,248,240][i])<=2),'Edges resolve into page cream');
for(const width of [1920,1440,1024,768,390,320]){
 await page.setViewportSize({width,height:1000});await page.evaluate(()=>window.scrollTo(0,0));
 const framing=await page.locator('.workspace-scene').evaluate(svg=>{
  const m=svg.getScreenCTM(),hero=svg.closest('.overview-hero').getBoundingClientRect();
  return {scale:[m.a,m.d],points:[[1420,805],[1257,825],[1110,720],[1230,260]].map(([x,y])=>({x:m.a*x+m.e,y:m.d*y+m.f})),bounds:{left:hero.left,right:hero.right,top:hero.top,bottom:hero.bottom}};
 });
 assert.ok(Math.abs(framing.scale[0]-framing.scale[1])<.001,'No image stretching');
 for(const p of framing.points)assert.ok(p.x>=framing.bounds.left&&p.x<=framing.bounds.right&&p.y>=framing.bounds.top&&p.y<=framing.bounds.bottom,'Key objects remain in frame');
 if(width<=800)assert.ok(await page.evaluate(()=>document.querySelector('.workspace-scene').getBoundingClientRect().top>=document.querySelector('.hero-foot').getBoundingClientRect().bottom),'Mobile artwork stays below the text');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'.playwright/sunlit-overview-'+width+'.png'});
}
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS: unchanged Sunlit artwork, protected key objects, cream edge fades, proportional desktop/mobile framing and readable mobile text.');
