import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const base=process.env.TEST_URL||'http://localhost:5173';
async function fresh(options={}){let context=await browser.newContext({viewport:{width:1440,height:1000},...options});return {context,page:await context.newPage()}}
let {context,page}=await fresh();
await page.addInitScript(()=>{window.introFrames=[];new MutationObserver(()=>{const w=document.querySelector('.intro-ready .brand-word');if(w){const state={text:w.textContent,width:document.querySelector('.intro-signature').getBoundingClientRect().width,font:document.fonts.check('64px "Mojo Draft Logo"')};if(!window.introFrames.length||window.introFrames.at(-1).text!==state.text)window.introFrames.push(state)}}).observe(document,{childList:true,subtree:true,attributes:true})});
await page.goto(base);await page.locator('.brand-intro').waitFor();await page.locator('.intro-ready').waitFor();assert.equal(await page.locator('.intro-caret').count(),0);
assert.ok(await page.locator('main h1').count());
const start=Date.now();await page.waitForFunction(()=>!document.querySelector('.brand-intro'));assert.ok(Date.now()-start<2000);
const frames=await page.evaluate(()=>window.introFrames);assert.deepEqual(frames.filter(f=>f.text).map(f=>f.text),['m','mo','moj','mojo']);assert.ok(frames.every(f=>f.font));assert.equal(new Set(frames.map(f=>f.width)).size,1);
await page.locator('nav a[href="#colour"]').click();await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Colour.');assert.equal(await page.locator('.brand-intro').count(),0);await page.reload();assert.equal(await page.locator('.brand-intro').count(),0);
assert.equal(await page.evaluate(()=>document.body.style.overflow),'');await context.close();
({context,page}=await fresh());await page.goto(base);await page.getByRole('button',{name:'Skip intro'}).click();assert.equal(await page.locator('.brand-intro').count(),0);await context.close();
({context,page}=await fresh());await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.locator('.brand-intro').count(),0);assert.ok(await page.evaluate(()=>document.activeElement!==document.body));await context.close();
({context,page}=await fresh({reducedMotion:'reduce'}));await page.goto(base);assert.equal(await page.locator('.brand-intro').count(),0);await context.close();
for(const pattern of ['**/MojoPixelSerif-Draft-Regular.ttf','**/brand/mojo-cat-transparent.svg']){
 ({context,page}=await fresh());await page.route(pattern,r=>r.abort());await page.goto(base);await page.waitForFunction(()=>!document.querySelector('.brand-intro'),{},{timeout:2500});assert.equal(await page.evaluate(()=>document.body.style.overflow),'');await page.locator('nav a[href="#colour"]').click();await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Colour.');assert.equal(await page.locator('h1').textContent(),'Colour.');await context.close();
}
({context,page}=await fresh());await page.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new Error('storage unavailable')}}));await page.goto(base);await page.waitForFunction(()=>!document.querySelector('.brand-intro'),{},{timeout:2500});await context.close();
console.log('PASS: fresh-session intro, once per session, navigation/reload, skip, keyboard access, reduced motion, font/mascot failures, unavailable storage, no scroll lock.');await browser.close();
