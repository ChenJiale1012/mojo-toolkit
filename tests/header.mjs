import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const base=process.env.TEST_URL||'http://localhost:5173';
const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('.playwright',{recursive:true});
const header=page.locator('.toolkit-header');
const controls=['.header-logo','#global-search','.top-guide'];
// Browser zoom reduces the CSS viewport and increases physical pixel density.
// Check both desktop breakpoints at the requested 100%, 125% and 150% scales.
for(const desktopWidth of [1440,1920])for(const zoom of [1,1.25,1.5]){
 const zoomContext=await browser.newContext({viewport:{width:Math.round(desktopWidth/zoom),height:Math.round(1000/zoom)},deviceScaleFactor:zoom,reducedMotion:'reduce'});
 const zoomPage=await zoomContext.newPage();await zoomPage.goto(base+'/#foundations');await zoomPage.evaluate(()=>document.fonts.ready);
 async function boundary(){return zoomPage.evaluate(()=>{
  const header=document.querySelector('.toolkit-header'),sidebar=document.querySelector('.sidebar');
  const line=getComputedStyle(header,'::after'),side=getComputedStyle(sidebar),h=header.getBoundingClientRect(),s=sidebar.getBoundingClientRect();
  const right=h.x+parseFloat(line.left)+parseFloat(line.width);
  return {header:[right-parseFloat(line.borderRightWidth),right],sidebar:[s.right-parseFloat(side.borderRightWidth),s.right],height:h.height,top:h.top};
 })}
 const initial=await boundary();assert.deepEqual(initial.header,initial.sidebar,'Same border interval at '+desktopWidth+' / '+zoom);
 assert.equal(initial.header[1]-initial.header[0],1,'One border only');
 await zoomPage.evaluate(()=>window.scrollTo(0,700));await zoomPage.waitForTimeout(50);
 assert.deepEqual(await boundary(),initial,'Sticky divider does not shift');
 await zoomPage.screenshot({path:`.playwright/divider-${desktopWidth}-${zoom}.png`});await zoomContext.close();
}
async function baselines(){
 return page.evaluate(()=>['.sidebar-label','.topbar .brand-word'].map(selector=>{
  // A zero-height inline box exposes the font baseline, including its actual metrics.
  const marker=document.createElement('span');
  marker.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
  document.querySelector(selector).append(marker);
  const y=marker.getBoundingClientRect().y;marker.remove();return y;
 }));
}
for(const width of [1920,1440,1024,801,800,768,390,320]){
 await page.setViewportSize({width,height:900});
 for(const route of ['foundations','logos','downloads','search=Mojo']){
  await page.goto(base+'/#'+route);await page.evaluate(()=>document.fonts.ready);
  const initial=await header.boundingBox();
  assert.equal(initial.y,0);assert.equal(initial.height,width>800?76:128);
  assert.equal(await header.evaluate(e=>getComputedStyle(e).position),'sticky');
  assert.equal(await header.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 248, 240)');
  const before=await Promise.all(controls.map(s=>page.locator(s).boundingBox()));
  if(width>800){
   const [title,word]=await baselines();assert.ok(Math.abs(title-word)<1,'Loaded-font baseline '+width);
   assert.equal((await page.locator('.sidebar').boundingBox()).y,initial.height);
  }
  for(const fraction of [.5,1]){
   await page.evaluate(f=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f),fraction);
   await page.waitForTimeout(50);
   assert.deepEqual(await header.boundingBox(),initial,'Stable sticky row '+width+' '+route);
   assert.deepEqual(await Promise.all(controls.map(s=>page.locator(s).boundingBox())),before,'Stable controls');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow');
   if(await page.evaluate(()=>scrollY>1))assert.notEqual(await header.evaluate(e=>getComputedStyle(e).boxShadow),'none');
  }
  if(route==='logos')await page.screenshot({path:'.playwright/sticky-header-'+width+'.png'});
 }
 // Search can be focused, populated and submitted while the page is scrolled.
 await page.locator('#search-input').focus();await page.locator('#search-input').fill('Event Posters');
 assert.equal((await header.boundingBox()).y,0);
 await page.locator('#search-input').press('Enter');await page.waitForURL('**/#search=Event%20Posters');
 await page.locator('.search-results a[href="#templates/event-posters"]').click();
 await page.waitForFunction(()=>document.activeElement.id==='event-posters');
 assert.ok((await page.locator('#event-posters h2').boundingBox()).y>=(await header.boundingBox()).height,'Search anchor clears header');
 await page.goto(base+'/#logos/animations');await page.evaluate(()=>document.fonts.ready);
 assert.ok((await page.locator('#animations').boundingBox()).y>=(await header.boundingBox()).height,'Deep link clears header');
 if(width<=800){
  await page.getByRole('button',{name:'Menu'}).click();
  assert.equal((await page.locator('.sidebar').boundingBox()).y,(await header.boundingBox()).height);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'mobile-menu');
  await page.getByRole('button',{name:'Menu'}).click();
  await page.getByRole('navigation').getByRole('link',{name:'Colour',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Colour.');assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'),'false');
  assert.ok(await page.locator('.top-guide').isVisible());
 }
}
// Native dialog top layer and the session introduction must remain above the header.
await page.evaluate(()=>{const dialog=document.createElement('dialog');dialog.textContent='Dialog';document.body.append(dialog);dialog.showModal()});
assert.ok(await page.evaluate(()=>{const d=document.querySelector('dialog'),r=d.getBoundingClientRect();return d.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}));
await page.evaluate(()=>document.querySelector('dialog').remove());
await page.emulateMedia({reducedMotion:'no-preference'});
await page.evaluate(()=>sessionStorage.clear());await page.reload();
await page.locator('.brand-intro').waitFor();
assert.ok(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.brand-intro')).zIndex)>Number(getComputedStyle(document.querySelector('.toolkit-header')).zIndex)));
await page.waitForFunction(()=>!document.querySelector('.brand-intro'));
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS: continuous divider at 100/125/150% zoom scales, loaded-font baseline, stable sticky header and controls on four long pages/eight widths, mobile menu, search, deep links and overlay stacking.');
