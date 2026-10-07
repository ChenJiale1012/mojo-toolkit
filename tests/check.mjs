import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {chapters,assets,palette,brandLine} from '../src/content.js';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1100}});
const page=await context.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
const base=process.env.TEST_URL||'http://localhost:5173';
await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>!document.querySelector('.brand-intro'));
assert.equal(await page.locator('h1').textContent(),'Better Together');
assert.ok(await page.evaluate(()=>document.fonts.check('14px Inter')));
for(const family of ['Mojo Pixel Serif Draft','Mojo Serif Refined'])assert.ok(await page.evaluate(f=>document.fonts.check(`24px "${f}"`),family));
assert.ok((await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Mojo Pixel Serif Draft'));
assert.ok((await page.locator('h2').first().evaluate(e=>getComputedStyle(e).fontFamily)).includes('Mojo Serif Refined'));
assert.equal(await page.locator('.scene-cat').count(),0);
assert.ok(await page.locator('.courtyard-source').evaluate(async i=>{const image=new Image();image.src=i.getAttribute('href');await image.decode();return image.naturalWidth===1536&&image.naturalHeight===1024}));
fs.mkdirSync('/workspace/mojo-toolkit/.playwright',{recursive:true});
await page.screenshot({path:'.playwright/desktop.png',fullPage:true});
for(const c of chapters){await page.goto(base+'/#'+c.id);await page.waitForSelector('h1');assert.equal(await page.locator('h1').textContent(),c.title+'.');assert.equal(await page.locator('a[aria-current="page"]').count(),1)}
await page.goto(base+'/#colour');await page.getByRole('button',{name:'Copy Mojo orange HEX'}).click();await page.waitForFunction(()=>document.querySelector('#toast').textContent==='Copied');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'#F06A21');
await page.goto(base+'/#typography');await page.evaluate(()=>document.fonts.load('italic 14px Inter'));assert.ok(await page.evaluate(()=>document.fonts.check('italic 14px Inter')));await page.locator('#specimen').fill('Make something lovely.');assert.equal(await page.locator('#specimen').inputValue(),'Make something lovely.');
await page.locator('#search-input').fill('campus');await page.locator('#global-search').evaluate(f=>f.requestSubmit());await page.waitForSelector('.search-results');assert.ok(await page.locator('.search-results a[href="#campus"]').count());
await page.goto(base+'/#downloads');await page.getByRole('button',{name:'Fonts',exact:true}).click();assert.equal(await page.locator('.asset-card').count(),4);await page.locator('#asset-search').fill('Inter');assert.equal(await page.locator('.asset-card').count(),2);await page.locator('#asset-search').fill('zzzzzz');assert.equal(await page.locator('.asset-card').count(),0);assert.ok(await page.getByText('No matching resources.').count());
for(const a of assets.filter(a=>a.path)){const r=await context.request.get(base+a.path);assert.equal(r.status(),200,a.path);assert.ok((await r.body()).length>100,a.path)}
let zip=await context.request.get(base+'/downloads/mojo-starter-pack.zip');assert.equal(zip.status(),200);assert.equal((await zip.body()).subarray(0,2).toString(),'PK');
await page.goto(base+'/#requests');await page.getByRole('button',{name:'Copy request brief'}).click();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).startsWith('Mojo asset request'));
await page.goto(base+'/#components');const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download cat SVG',exact:true}).click();assert.equal((await download).suggestedFilename(),'mojo-cat-transparent.svg');
await page.goto(base);await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.playwright/mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.getByRole('button',{name:'Menu'}).click();await page.getByRole('navigation').getByRole('link',{name:'Colour',exact:true}).click();await page.waitForSelector('.swatches');assert.equal(await page.locator('h1').textContent(),'Colour.');
for(const c of chapters){await page.goto(base+'/#'+c.id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow: '+c.id)}
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);assert.equal(await page.locator('.shortcut').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
assert.deepEqual(errors,[]);console.log(`PASS: ${chapters.length} sections, search, filters, clipboard, specimen, UI action, ${assets.filter(a=>a.path).length} downloads, ZIP, fonts/images, desktop/mobile, reduced motion; no console errors.`);
await browser.close();
