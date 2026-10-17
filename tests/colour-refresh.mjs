import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();
 await page.goto((process.env.TEST_URL||'http://localhost:5173')+'/#colour');await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.nav-link[href="#logos"] image').count(),0);assert.equal(await page.locator('.nav-link[href="#logos"] path').count(),1);
 assert.equal(await page.locator('.palette-usage>div').count(),5);
 const cards=page.locator('.swatch');assert.equal(await cards.count(),5);
 for(const width of [1600,1440,1200,1024,800,390,320]){
  await page.setViewportSize({width,height:1000});
  for(let i=0;i<5;i++){
   await cards.nth(i).hover();await page.waitForTimeout(width>=1200?550:10);
   const metrics=await cards.evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e),n=e.querySelector('strong'),h=e.querySelector('.hex-code');return {height:e.clientHeight,overflow:e.scrollWidth>e.clientWidth,font:getComputedStyle(n).fontFamily,nameHeight:n.clientHeight,hexY:h.offsetTop,border:s.borderWidth,shadow:s.boxShadow}}));
   assert.ok(metrics.every(m=>m.height===240&&!m.overflow&&m.border==='0px'&&m.shadow==='none'&&m.font.includes('Mojo Serif')),JSON.stringify({width,metrics}));
   assert.equal(new Set(metrics.map(m=>m.nameHeight)).size,1,'Shared name space');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await cards.first().click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'#F06A21');assert.ok(await cards.first().getAttribute('aria-label'));
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await touch.newPage();await mobile.goto((process.env.TEST_URL||'http://localhost:5173')+'/#downloads');
 assert.ok((await mobile.locator('.top-guide').boundingBox()).height>=44);
 await touch.close();await context.close();console.log('PASS: original navigation mascot, responsive 240px palette, stable label space, borderless hover and copy, aligned usage, touch targets.');
}finally{await browser.close()}
