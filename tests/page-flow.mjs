import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 for(const width of [1920,1440,1024,1000,801,800,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/#foundations');await page.evaluate(()=>document.fonts.ready);
  const controls=await page.locator('.header-controls #global-search,.header-controls .top-guide').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}}));assert.equal(controls.length,2);assert.equal(controls[0].top,controls[1].top);assert.equal(controls[0].bottom,controls[1].bottom);assert.equal(controls[0].height,40);
  assert.equal(await page.locator('#global-search input').evaluate(e=>getComputedStyle(e).fontSize),'14px');assert.equal(await page.locator('#global-search button').evaluate(e=>getComputedStyle(e,'::before').backgroundColor),'rgba(0, 0, 0, 0)');
  const surfaces=await page.locator('.decision-example').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,clipped:e.scrollWidth>e.clientWidth}}));assert.equal(surfaces.length,3);assert.ok(surfaces.every(r=>!r.clipped&&Math.abs(r.w/r.h-4/3)<.01));assert.ok(surfaces.every(r=>Math.abs(r.w-surfaces[0].w)<1&&Math.abs(r.h-surfaces[0].h)<1));if(width>1000)assert.equal(new Set(surfaces.map(r=>r.y)).size,1);
  assert.ok(await page.locator('.palette-example>span').evaluateAll(es=>es.every(e=>e.clientHeight>30)),'All four palette tiles remain visible');
  const proportional=await page.locator('.signature-example img').evaluate(e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-e.naturalWidth/e.naturalHeight)<.01});assert.ok(proportional);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.goto(base+'/#components');await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['light','dark']){
   await page.evaluate(t=>MojoTheme.setPreference(t),theme);
   const searches=await page.locator('#global-search,#reuse-search').evaluateAll(es=>es.map(e=>{
    const measure=n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {width:r.width,height:r.height,padding:s.padding,gap:s.gap,radius:s.borderRadius,font:s.font}};
    const button=e.querySelector('button'),face=getComputedStyle(button,'::before');
    return {form:measure(e),input:measure(e.querySelector('input')),icon:measure(e.querySelector('svg')),button:measure(button),key:{inset:face.inset,radius:face.borderRadius},centred:Math.abs(e.getBoundingClientRect().y+e.clientTop+e.clientHeight/2-button.getBoundingClientRect().y-button.getBoundingClientRect().height/2)<.1};
   }));
   if(width>800)assert.deepEqual(searches[0],searches[1],`Same compact search at ${width}px in ${theme}`);
   else{assert.deepEqual(searches[0].button,searches[1].button);assert.deepEqual(searches[0].icon,searches[1].icon);assert.equal(searches[0].form.height,searches[1].form.height)}
   assert.ok(searches.every(s=>s.centred));
   const row=await page.locator('.reusable-controls').evaluate(e=>[...e.children].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,centre:r.y+r.height/2}}));
   if(Math.abs(row[0].centre-row[1].centre)>1)assert.ok(row[0].bottom<row[1].y,'Narrow rows wrap without overlap');
   else assert.ok(row[0].right<row[1].x,'Individual widths stay separated');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.evaluate(()=>MojoTheme.setPreference('light'));
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/#overview');assert.equal(await page.getByRole('button',{name:/Pause.*motion/i}).count(),0);assert.equal(await page.locator('[data-motion-toggle],.ambient-toggle').count(),0);
 for(const route of ['overview','foundations','logos','colour','typography']){
  await page.goto(base+'/#'+route);const borders=await page.locator('.identity-decisions>article,.logo-preview,.logo-preview-footer,.logo-application,.palette-pending section,.font-specimen-row,.palette-usage>div').evaluateAll(es=>es.map(e=>[getComputedStyle(e).borderTopWidth,getComputedStyle(e).borderBottomWidth]));assert.ok(borders.every(b=>b[0]==='0px'&&b[1]==='0px'),route+' has no ornamental rules');
 }
 await page.goto(base+'/#typography');assert.equal(await page.locator('.type-table td').first().evaluate(e=>getComputedStyle(e).borderBottomWidth),'1px');assert.equal(await page.locator('#global-search').evaluate(e=>getComputedStyle(e).borderTopWidth),'1px');
 await page.locator('#search-input').fill('signature');await page.getByRole('button',{name:'Run search'}).click();await page.waitForSelector('.search-results');assert.ok(await page.locator('.search-results a[href="#foundations"]').count());
 await page.goto(base+'/downloads/quick-guide.html');assert.ok(await page.locator('.guide-section:not(.guide-card),.font-row,.template-summary li').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderTopWidth==='0px'&&getComputedStyle(e).borderBottomWidth==='0px')));
 // Inspect the real local cursor at native size against every brand background.
 const pixels=await page.evaluate(async()=>{const img=new Image();img.src='/cursors/text.svg';await img.decode();const c=document.createElement('canvas');c.width=c.height=19;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,19,19).data,counts={};for(let i=0;i<d.length;i+=4)if(d[i+3]){const color=[...d.slice(i,i+3)].join(',');counts[color]=(counts[color]||0)+1}return counts});assert.ok(pixels['240,106,33']>30);assert.ok(pixels['29,27,24']>0&&pixels['255,248,240']>0);
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await touch.newPage();await mobile.goto(base+'/#typography');const targets=await mobile.locator('.header-controls #global-search,.header-controls .top-guide').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.top,r.height]}));assert.deepEqual(targets[0],targets[1]);assert.equal(targets[0][1],44);assert.equal(await mobile.locator('#specimen').evaluate(e=>getComputedStyle(e).cursor),'text');await touch.close();await context.close();
 console.log('PASS: identical header/preview search dimensions and spacing in both themes, centred and wrapping demonstration controls, aligned header/quiet submit, equal 4:3 preview surfaces, flowing sections, orange cursors and touch targets.');
}finally{await browser.close()}
