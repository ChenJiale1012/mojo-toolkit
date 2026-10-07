import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {sceneConfig as scene,steamPose} from '../src/scene.js';
const image=fs.readFileSync('public/courtyard.png');assert.equal(image.readUInt32BE(16),scene.width);assert.equal(image.readUInt32BE(20),scene.height);assert.equal(createHash('sha256').update(image).digest('hex'),scene.sourceSha256);
for(const origin of scene.mug.origins){
 const {cx,cy,rx,ry}=scene.mug.opening;assert.ok(((origin.x-cx)/rx)**2+((origin.y-cy)/ry)**2<1,'Emission inside measured opening');
 assert.ok(scene.mug.drift<=2*rx*.1);
 for(let elapsed=0;elapsed<=scene.mug.duration*3;elapsed+=30){const p=steamPose(elapsed,origin),clip=scene.mug.clip;assert.ok(p.x-2>=clip.x&&p.x+3<=clip.x+clip.width);assert.ok(p.y-7>=clip.y&&p.y<=clip.y+clip.height);assert.ok(p.opacity>=0&&p.opacity<=scene.mug.peakOpacity)}
 const seam=(scene.mug.duration-origin.phase)%scene.mug.duration;assert.ok(steamPose(seam,origin).opacity<.0001);assert.ok(steamPose(seam+scene.mug.duration,origin).opacity<.0001);
}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const base=process.env.TEST_URL||'http://localhost:5173';
const context=await browser.newContext({viewport:{width:1920,height:1100},reducedMotion:'no-preference'});await context.addInitScript(()=>sessionStorage.setItem('mojo-brand-intro-seen','1'));const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.locator('.courtyard-scene[data-motion-state=running]').waitFor();
assert.equal(await page.getByText('Unmistakably Mojo.',{exact:true}).count(),1);assert.equal(await page.locator('.overview-wip,.top-logo,.ambient-steam').count(),0);assert.equal(await page.locator('.topbar .brand-signature').count(),1);
for(const width of [1920,1440,1024,768,390,320]){
 await page.setViewportSize({width,height:1100});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForFunction(()=>document.querySelector('.courtyard-scene').dataset.motionState==='running');
 const aligned=await page.locator('.courtyard-scene').evaluate(svg=>{const image=svg.querySelector('.courtyard-source');const m=svg.getScreenCTM(),i=image.getScreenCTM();return ['a','b','c','d','e','f'].every(k=>Math.abs(m[k]-i[k])<.001)});assert.ok(aligned,'Image and steam coordinate system '+width);
 const moving=await page.locator('.steam-wisp').first().getAttribute('transform');await page.waitForTimeout(130);assert.notEqual(await page.locator('.steam-wisp').first().getAttribute('transform'),moving);
 await page.screenshot({path:'.playwright/scene-'+width+'.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await page.getByRole('button',{name:'Pause ambient motion'}).click();const paused=await page.locator('.steam-wisp').first().getAttribute('transform');await page.waitForTimeout(200);assert.equal(await page.locator('.steam-wisp').first().getAttribute('transform'),paused);assert.equal(await page.locator('.courtyard-scene').getAttribute('data-motion-state'),'paused');await page.getByRole('button',{name:'Resume ambient motion'}).click();
await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForFunction(()=>document.querySelector('.courtyard-scene').dataset.motionState==='offscreen');const offscreen=await page.locator('.steam-wisp').first().getAttribute('transform');await page.waitForTimeout(200);assert.equal(await page.locator('.steam-wisp').first().getAttribute('transform'),offscreen);
await page.evaluate(()=>window.scrollTo(0,0));await page.waitForFunction(()=>document.querySelector('.courtyard-scene').dataset.motionState==='running');
// Browser background-tab state can be unreliable in headless mode; exercise the real visibility handler.
await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await page.locator('.courtyard-scene').getAttribute('data-motion-state'),'hidden');const hidden=await page.locator('.steam-wisp').first().getAttribute('transform');await page.waitForTimeout(200);assert.equal(await page.locator('.steam-wisp').first().getAttribute('transform'),hidden);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.mug-steam').evaluate(e=>getComputedStyle(e).display),'none');
await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.courtyard-scene').dataset.motionState==='running');
// A detached scene must stop changing once navigation disposes its shared clock.
await page.evaluate(()=>window.detachedScene=document.querySelector('.courtyard-scene'));await page.goto(base+'/#colour');const detached=await page.evaluate(()=>window.detachedScene.querySelector('.steam-wisp').getAttribute('transform'));await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.detachedScene.querySelector('.steam-wisp').getAttribute('transform')),detached);
await page.goto(base+'/#logos');assert.equal(await page.locator('.logo-preview-footer button[aria-pressed=true]').count(),1);for(const name of ['Cream','Sage','Orange']){await page.getByRole('button',{name,exact:true}).click();assert.equal(await page.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.logo-preview-footer button[aria-pressed=true]').count(),1)}
await page.goto(base+'/#typography');assert.equal(await page.getByText('Make something meaningful.').count(),0);assert.equal(await page.locator('.type-scale').count(),0);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: measured opening, bounded wisps and loop seam; shared SVG geometry across six viewports, pause/offscreen/hidden/reduced motion, navigation cleanup and removed sections.');
