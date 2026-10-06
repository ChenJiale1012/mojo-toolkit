import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import fs from 'node:fs';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const c=await b.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await c.newPage();const base=process.env.TEST_URL||'http://localhost:5173';
await p.goto(base+'/#foundations');await p.evaluate(()=>document.fonts.ready);
assert.ok((await p.locator('.wordmark .brand-word').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Mojo Draft Logo'));assert.ok(await p.evaluate(()=>document.fonts.check('49px "Mojo Draft Logo"')));
assert.equal(await p.locator('.identity-decisions article').count(),3);
await p.getByRole('button',{name:'Copy brand line'}).click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'Mojo. Better together.');
await p.evaluate(()=>{window.scrollTo(0,0);document.activeElement.blur();document.querySelector('#toast').classList.remove('show')});
await p.screenshot({path:'.playwright/foundations-desktop.png',fullPage:true});
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'.playwright/foundations-mobile.png',fullPage:true});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(const size of [320,768,1024]){await p.setViewportSize({width:size,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Foundations overflow '+size)}
// Load the browser's configured favicon, not an unrelated source image.
const url=await p.locator('link[rel="icon"]').getAttribute('href');assert.ok(url.includes('?v=4'));await p.evaluate(async url=>{const i=new Image();i.src=url;await i.decode();document.body.append(i);i.id='verified-favicon'},url);assert.ok(await p.locator('#verified-favicon').evaluate(i=>i.naturalWidth===128));
for(const path of ['/icons/favicon.png?v=4','/icons/apple-touch-icon.png?v=4','/icons/icon-192.png?v=4','/icons/icon-512.png?v=4','/icons/link-preview.png?v=4']){const r=await c.request.get(base+path);assert.equal(r.status(),200);assert.ok((await r.body()).length>100)}
const manifest=await (await c.request.get(base+'/site.webmanifest?v=4')).json();assert.equal(manifest.icons.length,2);assert.equal(await p.locator('link[rel="apple-touch-icon"]').count(),1);
await p.goto(base+'/#components');await p.getByRole('button',{name:'Copy button markup'}).click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),'<button class="button primary">Download SVG</button>');
await p.goto(base);await p.locator('#search-input').fill('signature');await p.locator('#global-search').evaluate(f=>f.requestSubmit());await p.waitForSelector('.search-results');assert.ok(await p.locator('.search-results a[href="#foundations"]').count());
console.log('PASS: draft-font logo, visual identity decisions, brand/implementation copy, responsive foundations, browser favicon decoding, icon/manifest endpoints, guidance search.');await b.close();
