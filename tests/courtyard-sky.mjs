import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {palette} from '../src/content.js';
import {sceneConfig} from '../src/scene.js';
import skyWindow from '../src/courtyard-sky-window.json' with {type:'json'};

const sky=fs.readFileSync('public'+sceneConfig.sky.source);
assert.equal(sky.readUInt32BE(16),sceneConfig.width);assert.equal(sky.readUInt32BE(20),sceneConfig.height);
assert.equal(createHash('sha256').update(sky).digest('hex'),sceneConfig.sky.sourceSha256);
assert.ok(skyWindow.every(([x,y,w,h])=>x>=0&&y>=0&&w>0&&h>0&&y+h<=451));
assert.deepEqual(palette.map(p=>p.hex),['#F06A21','#FFF8F0','#1D1B18','#A7B59E','#35594A']);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const base=process.env.TEST_URL||'http://localhost:5173';await page.goto(base);await page.waitForLoadState('networkidle');
const pixels=await page.evaluate(async()=>{
 const width=1536,height=1024,svg=document.querySelector('.courtyard-scene').cloneNode(true);
 svg.setAttribute('width',width);svg.setAttribute('height',height);svg.querySelector('.mug-steam').remove();
 // Self-contained scene renders allow pixel comparison at the measured source size.
 const urls=new Map();
 for(const image of svg.querySelectorAll('image')){
  const href=image.getAttribute('href');if(!urls.has(href)){
   const blob=await (await fetch(href)).blob();const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});urls.set(href,data);
  }image.setAttribute('href',urls.get(href));
 }
 async function render(element){const image=new Image();image.src='data:image/svg+xml;base64,'+btoa(new XMLSerializer().serializeToString(element));await image.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#FFF8F0';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0);return ctx.getImageData(0,0,width,height).data}
 const after=await render(svg),beforeSvg=svg.cloneNode(true);beforeSvg.querySelector('.courtyard-sky').remove();beforeSvg.querySelector('.sky-window-cutout').remove();const before=await render(beforeSvg);
 const windowSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');windowSvg.setAttribute('width',width);windowSvg.setAttribute('height',height);windowSvg.append(svg.querySelector('#sky-window-mask g').cloneNode(true));
 // Draw the white window over black to determine exactly where edits are allowed.
 windowSvg.insertAdjacentHTML('afterbegin','<rect width="1536" height="1024" fill="black"/>');const mask=await render(windowSvg);
 let protectedChanges=0,groundChanges=0,changedSky=0;
 for(let p=0;p<after.length;p+=4){const changed=after[p]!==before[p]||after[p+1]!==before[p+1]||after[p+2]!==before[p+2];if(!changed)continue;if(mask[p]===0)protectedChanges++;else changedSky++;if(Math.floor(p/4/width)>=451)groundChanges++}
 const sample=(array,x,y)=>[...array.slice((y*width+x)*4,(y*width+x)*4+3)];
 const foreground=[[1310,613],[1200,650],[1270,200],[1180,312],[1100,365],[980,580],[1460,850]];
 return {protectedChanges,groundChanges,changedSky,topEdge:sample(after,800,0),upper:sample(after,1100,210),foreground:foreground.map(([x,y])=>({before:sample(before,x,y),after:sample(after,x,y)}))};
});
assert.equal(pixels.protectedChanges,0,'All pixels outside the controlled sky window are unchanged');
assert.equal(pixels.groundChanges,0,'No edit or blue leak below the upper background');
assert.ok(pixels.changedSky>50000,'Sky actually appears');assert.ok(pixels.upper[2]>pixels.upper[0]+20,'Blue replaces the baked cream patch beneath the canopy');
assert.deepEqual(pixels.topEdge,[255,248,240],'Upper sky edge resolves into cream without a letterbox seam');
for(const sample of pixels.foreground)assert.deepEqual(sample.after,sample.before,'Mug, table, architecture, plants and ground are unchanged');
for(const width of [1920,1440,1024,768,390,320]){
 await page.setViewportSize({width,height:1000});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForLoadState('networkidle');
 const geometry=await page.locator('.courtyard-scene').evaluate(svg=>{const m=svg.getScreenCTM();return [...svg.querySelectorAll(':scope > image,.mug-steam')].every(e=>{const c=e.getScreenCTM();return ['a','b','c','d','e','f'].every(k=>Math.abs(m[k]-c[k])<.001)})});assert.ok(geometry,'Sky, original foreground and motion share coordinates');
 assert.equal(await page.locator('.courtyard-sky').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'.playwright/v0.9-overview-'+width+'.png'});
}
await browser.close();console.log('PASS: edited sky on first render, protected foreground pixels, no ground leakage, unchanged primary palette, static clouds and shared scene coordinates across six widths.');
