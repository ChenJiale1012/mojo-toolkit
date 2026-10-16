import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';
import {chapters,meta} from '../src/content.js';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);fs.mkdirSync('.playwright',{recursive:true});
 const nav=page.getByRole('navigation'),links=nav.locator('.nav-link');
 assert.equal(await links.count(),12);assert.equal(await nav.getByRole('link',{name:'Requests & updates',exact:true}).count(),1);
 assert.equal(await page.locator('.sidebar-bottom,.sidebar-utility-link,.toolkit-status,.hero-foot,.bottom-band').count(),0);
 assert.equal(await page.getByText('Less searching. More making.').count(),0);assert.equal(await page.getByText('A living, growing toolkit').count(),0);
 assert.ok(await page.getByRole('heading',{name:'Explore the toolkit.',exact:true}).isVisible());
 assert.equal(await page.locator('.sidebar-label').evaluate(e=>getComputedStyle(e).fontSize),'30px');
 const subjects=await nav.locator('.nav-icon').evaluateAll(es=>es.map(e=>e.innerHTML));assert.equal(new Set(subjects).size,12,'Distinct custom subjects');
 for(const [width,height] of [[1440,900],[1024,600],[801,480]]){
  await page.setViewportSize({width,height});
  const rows=await links.evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect(),i=e.querySelector('.nav-icon'),t=e.querySelector('.nav-label'),ib=i.getBoundingClientRect(),tb=t.getBoundingClientRect(),s=getComputedStyle(t);return {height:b.height,icon:[ib.width,ib.height],gap:tb.x-ib.right,labelWidth:tb.width,labelScroll:t.scrollWidth,textOverflow:s.textOverflow,whiteSpace:s.whiteSpace,font:s.fontFamily,hidden:i.getAttribute('aria-hidden'),viewBox:i.getAttribute('viewBox')}}));
  for(const row of rows){assert.equal(row.height,44,'Compact single-line desktop rows '+width);assert.deepEqual(row.icon,[20,20]);assert.equal(row.gap,11);assert.ok(row.labelScroll<=row.labelWidth+1);assert.equal(row.textOverflow,'clip');assert.equal(row.whiteSpace,'normal');assert.match(row.font,/Nunito Sans/);assert.equal(row.hidden,'true');assert.equal(row.viewBox,'0 0 20 20')}
  for(const item of [{id:'overview',title:'Better Together'},...chapters]){
   const link=nav.locator(`a[href="#${item.id}"]`);await link.scrollIntoViewIfNeeded();
   const box=await link.boundingBox();await link.hover();assert.deepEqual(await link.boundingBox(),box,'Hover does not shift row');
   assert.equal(await link.evaluate(e=>getComputedStyle(e).boxShadow),'none');await link.click();await page.waitForFunction(title=>document.querySelector('h1').textContent===title+'.',item.title);
   assert.equal(await nav.locator('[aria-current="page"]').count(),1);assert.equal(await nav.locator('[aria-current="page"]').getAttribute('href'),'#'+item.id);
   const visible=await nav.locator('[aria-current="page"]').evaluate(e=>{const r=e.getBoundingClientRect(),n=e.closest('nav').getBoundingClientRect();return r.top>=n.top-1&&r.bottom<=n.bottom+1});assert.ok(visible,'Active link remains in scrolled nav after rendering');
  }
  await page.screenshot({path:`.playwright/navigation-${width}x${height}.png`});
 }
 assert.equal(await nav.getByRole('link',{name:'Merchandise',exact:true}).getAttribute('href'),'#campus');assert.equal(await nav.getByRole('link',{name:'Quick guide',exact:true}).getAttribute('href'),'#downloads');
 assert.ok((await page.locator('.release-info').textContent()).includes('Version '+meta.version));
 await page.setViewportSize({width:390,height:500});
 for(const c of chapters){await page.getByRole('button',{name:'Menu'}).click();const link=nav.locator(`a[href="#${c.id}"]`);await link.scrollIntoViewIfNeeded();await link.click();await page.waitForFunction(title=>document.querySelector('h1').textContent===title+'.',c.title);assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'),'false')}
 await page.getByRole('button',{name:'Menu'}).click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'mobile-menu');
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/#colour');const swatches=page.locator('.swatch');
 const plain=async()=>{for(const swatch of await swatches.all()){const c=await swatch.evaluate(e=>{const c=getComputedStyle(e);return [c.borderTopWidth,c.outlineStyle,c.boxShadow,getComputedStyle(e,'::before').content,getComputedStyle(e,'::after').content]});assert.deepEqual(c,['0px','none','none','none','none'],'No swatch edge or pseudo-element ring')}};
 await plain();await swatches.first().hover();await plain();await page.mouse.down();await plain();await page.mouse.up();await plain();await page.waitForTimeout(1900);await plain();
 await page.keyboard.press('Tab');await swatches.nth(2).focus();await plain();assert.equal(await swatches.nth(2).locator('strong').evaluate(e=>getComputedStyle(e).textDecorationLine),'underline');
 assert.equal(await page.locator('#search-input').evaluate(e=>getComputedStyle(e).outlineStyle),'none');await page.locator('.top-guide').focus();assert.equal(await page.locator('.top-guide').evaluate(e=>getComputedStyle(e).outlineWidth),'2px','One visible focus outline');assert.equal(await page.locator('.top-guide').evaluate(e=>getComputedStyle(e).outlineColor),'rgb(29, 27, 24)','Focus stays visible outside the dark keycap');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#search-input').focus();await page.mouse.move(0,0);await page.waitForTimeout(550);
 const baseline=await swatches.locator('.hex-code').first().evaluate(e=>e.getBoundingClientRect().y);
 for(const index of [0,1,2,3,4,3,2,1,0]){
  await swatches.nth(index).hover();
  for(let sample=0;sample<4;sample++){
   await page.waitForTimeout(40);const metrics=await swatches.evaluateAll(es=>es.map(e=>({y:e.querySelector('.hex-code').getBoundingClientRect().y,height:e.getBoundingClientRect().height,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));
   assert.ok(metrics.every(m=>Math.abs(m.y-baseline)<1&&m.height===240),'Stable labels/height during transitions');
   const r=await page.locator('.swatches').boundingBox();assert.ok(Math.abs(metrics[0].left-r.x)<1&&Math.abs(metrics.at(-1).right-(r.x+r.width))<1,'The expanding row always fills its width');
   assert.equal(await page.locator('.swatch:hover').count(),1);
  }
  await page.waitForTimeout(400);const shares=await swatches.evaluateAll(es=>es.map(e=>Number(getComputedStyle(e).flexGrow)));assert.equal(shares.filter(x=>Math.abs(x-2.4)<.01).length,1,'Exactly one expanded swatch');
 }
 // Rasterize the actual assets to check artwork bounds, hotspot pixels and crisp edges.
 const cursorBounds=await page.evaluate(async()=>{
  const bounds=[];for(const [name,x,y] of [['arrow',1,1],['pointer',8,1]]){
   const img=new Image();img.src='/cursors/'+name+'.svg';await img.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=19;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,19,19).data;let minX=19,minY=19,maxX=0,maxY=0,soft=0;
   for(let j=0;j<19;j++)for(let i=0;i<19;i++){const a=data[(j*19+i)*4+3];if(a){minX=Math.min(minX,i);maxX=Math.max(maxX,i);minY=Math.min(minY,j);maxY=Math.max(maxY,j);if(a!==255)soft++}}
   bounds.push({name,natural:[img.naturalWidth,img.naturalHeight],height:maxY-minY+1,width:maxX-minX+1,hotspot:data[(y*19+x)*4+3],soft});
  }return bounds;
 });
 for(const b of cursorBounds){assert.deepEqual(b.natural,[19,19]);assert.ok(b.height>=16&&b.height<=19);assert.equal(b.hotspot,255,'Hotspot lands on the tip');assert.equal(b.soft,0,'Pixel edges remain crisp')};console.log('Cursor artwork bounds:',cursorBounds);
 await page.goto(base+'/#typography');assert.match(await page.locator('#specimen').evaluate(e=>getComputedStyle(e).cursor),/text\.svg.*9 9/);assert.equal(await page.locator('#specimen').evaluate(e=>getComputedStyle(e).resize),'vertical');
 await page.goto(base+'/#components');assert.equal(await page.locator('button:disabled').evaluate(e=>getComputedStyle(e).cursor),'not-allowed');
 await page.goto(base+'/downloads/quick-guide.html');assert.equal(await page.locator('.guide-intro').count(),0);assert.equal(await page.locator('.swatch').count(),5);await page.locator('.swatch').first().click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'#F06A21');
 assert.deepEqual(errors,[]);console.log('PASS: all navigation links on desktop/laptop/mobile, compact rows, custom icons, no duplicate sidebar content, native scrolling, border-free swatch states, stable expansion and 19px crisp cursor bounds/hotspots.');await context.close();
} finally {await browser.close()}
