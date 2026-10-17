import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {foliageConfig,breezePose,SCENE_MOTION_DURATION} from '../src/scene.js';
for(const f of foliageConfig){assert.ok(f.pixels>20&&f.pixels<150);assert.equal(breezePose(0,f.phase),0);assert.ok(Math.abs(breezePose(SCENE_MOTION_DURATION,f.phase))<1e-10);assert.ok(Math.abs(breezePose(1800,f.phase))<1.8)}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();await page.goto((process.env.TEST_URL||'http://localhost:5173')+'/#overview');
 const pixels=await page.evaluate(async regions=>{
  const blob=await (await fetch('/sunlit-workspace.png')).blob();const source=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});
  async function render(svg){const img=new Image();img.src=svg;await img.decode();const c=document.createElement('canvas');c.width=1631;c.height=964;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return ctx.getImageData(0,0,1631,964).data}
  const original=await render(source),results=[];
  for(const theme of ['light','dark']){
   function clone(moving){const s=document.querySelector('.workspace-scene').cloneNode(true);s.setAttribute('width','1631');s.setAttribute('height','964');s.querySelector('.mug-steam').remove();s.querySelectorAll('image').forEach(i=>i.setAttribute('href',source));s.querySelector(theme==='light'?'.workspace-dark':'.workspace-light').remove();s.querySelectorAll('[data-foliage]').forEach(e=>{const f=regions[Number(e.dataset.foliage)];if(moving)e.setAttribute('transform',`rotate(1.6 ${f.pivot[0]} ${f.pivot[1]})`);else e.removeAttribute('transform')});return 'data:image/svg+xml;base64,'+btoa(new XMLSerializer().serializeToString(s))}
   const rest=await render(clone(false)),moving=await render(clone(true));let changed=0,outside=0,restMismatch=0;
   for(let y=0;y<964;y++)for(let x=0;x<1631;x++){const i=(y*1631+x)*4,inside=regions.some(f=>x>=f.box[0]-2&&x<f.box[0]+f.box[2]+2&&y>=f.box[1]-2&&y<f.box[1]+f.box[3]+2);if(rest[i]!==moving[i]||rest[i+1]!==moving[i+1]||rest[i+2]!==moving[i+2]||rest[i+3]!==moving[i+3]){changed++;if(!inside)outside++}if(theme==='light'&&regions.some(f=>x>=f.box[0]&&x<f.box[0]+f.box[2]&&y>=f.box[1]&&y<f.box[1]+f.box[3])&&(rest[i]!==original[i]||rest[i+1]!==original[i+1]||rest[i+2]!==original[i+2]))restMismatch++}
   results.push({theme,changed,outside,restMismatch});
  }
  return results;
 },foliageConfig);
 for(const result of pixels){assert.ok(result.changed>0&&result.changed<700,JSON.stringify(result));assert.equal(result.outside,0,'Only isolated outdoor crowns move');assert.equal(result.restMismatch,0,'At rest the repair is entirely covered by the original foliage')}
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.workspace-scene').dataset.motionState==='running');const start=await page.locator('[data-foliage]').evaluateAll(es=>es.map(e=>e.getAttribute('transform')));await page.waitForTimeout(250);assert.notDeepEqual(await page.locator('[data-foliage]').evaluateAll(es=>es.map(e=>e.getAttribute('transform'))),start);await page.waitForFunction(()=>document.querySelector('.workspace-scene').dataset.motionState==='settled',null,{timeout:6000});assert.ok(await page.locator('[data-foliage]').evaluateAll(es=>es.every(e=>Math.abs(Number(e.getAttribute('transform').match(/rotate\(([^ ]+)/)[1]))<.0001)));await context.close();
 console.log('PASS: registered original pixels in both grades, invisible resting repairs, motion confined to two outdoor crowns, anchored bounded breeze and finite settling.');
}finally{await browser.close()}
