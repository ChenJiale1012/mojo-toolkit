import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';
const base=process.env.TEST_URL||'http://localhost:5173';
const source=fs.readFileSync('public/favicon.svg','utf8');
const transform=source.match(/id="mascot" transform="translate\(([^ ]+) ([^)]+)\) scale\(([^)]+)\)/);
assert.ok(transform);const [tx,ty,scale]=transform.slice(1).map(Number);
assert.equal(tx,8);assert.ok(Math.abs(scale-48/1189)<1e-15);assert.ok(Math.abs(ty-(64-48*1026/1189)/2)<1e-12);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/#logos');await page.evaluate(()=>document.fonts.ready);
 // Chromium exposes float32 SVG transforms; the source above keeps full precision.
 const bounds=await page.evaluate(source=>{
  const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;svg.style.cssText='position:fixed;visibility:hidden;width:64px;height:64px';document.body.append(svg);
  const cat=svg.querySelector('#mascot'),raw=cat.getBBox(),matrix=cat.getCTM(),background=svg.querySelector('#background');
  const values={raw:[raw.x,raw.y,raw.width,raw.height],left:matrix.e,top:matrix.f,width:raw.width*matrix.a,height:raw.height*matrix.d,scale:[matrix.a,matrix.d],canvas:[+background.getAttribute('width'),+background.getAttribute('height')],radius:+background.getAttribute('rx'),fill:background.getAttribute('fill')};svg.remove();return values;
 },source);
 assert.deepEqual(bounds.raw,[0,0,1189,1026]);assert.deepEqual(bounds.canvas,[64,64]);assert.equal(bounds.fill,'#FFF8F0');assert.equal(bounds.radius/64,.1875);
 assert.ok(Math.abs(bounds.width/64-.75)<1e-7);assert.ok(Math.abs(bounds.height-.75*64*1026/1189)<1e-5);assert.equal(bounds.scale[0],bounds.scale[1]);
 assert.ok(Math.abs(bounds.left/64-.125)<1e-12);assert.ok(Math.abs(bounds.top-(64-bounds.height)/2)<1e-5);
 const section=page.locator('#toolkit-icon');assert.equal(await section.getByRole('heading',{name:'Toolkit icon.',exact:true}).count(),1);
 assert.ok((await section.innerText()).includes('Centre the cat on a cream square. Keep it at 75% of the square’s width and preserve its proportions. Use the supplied files for consistent spacing.'));
 const native=await page.evaluate(async()=>{const image=new Image();image.src='/favicon.svg?v=6';await image.decode();const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.drawImage(image,0,0);return [...x.getImageData(32,3,1,1).data]});assert.deepEqual(native,[255,248,240,255]);
 for(const width of [1920,1440,1150,1024,801,800,650,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['light','dark']){
   await page.evaluate(t=>MojoTheme.setPreference(t),theme);
   const diagram=await section.locator('.toolkit-icon-diagram').evaluate(svg=>{
    const image=svg.querySelector('image'),art=image.getBBox(),texts=[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height,size:parseFloat(getComputedStyle(t).fontSize)*svg.getScreenCTM().a}});
    return {href:image.getAttribute('href'),art:[art.x,art.y,art.width,art.height],texts,lines:[...svg.querySelectorAll('.toolkit-icon-dimensions>path')].map(p=>p.getAttribute('d'))};
   });
   assert.equal(diagram.href,await section.locator('.toolkit-icon-art').getAttribute('src'));assert.deepEqual(diagram.art,[72,72,160,160]);
   for(const t of diagram.texts){assert.ok(t.x>=0&&t.y>=0&&t.right<=352&&t.bottom<=320,'Unclipped annotation');assert.ok(t.right<=72||t.x>=232||t.bottom<=72||t.y>=232,'Annotations stay outside the square');assert.ok(t.size>=12,'Readable annotations at '+width)}
   // Dimension projections use the actual master bounds, scaled to this square.
   const left=72+bounds.left/64*160,right=left+bounds.width/64*160;
   const measure=diagram.lines[0].match(/^M([\d.]+) ([\d.]+)H([\d.]+)/);assert.ok(Math.abs(+measure[1]-left)<1e-5&&Math.abs(+measure[3]-right)<1e-5);
   assert.equal(await section.locator('.toolkit-icon-art').evaluate(e=>getComputedStyle(e).filter),'none');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  }
 }
 for(const filename of ['favicon.svg','favicon.ico','favicon-16.png','favicon-32.png','favicon-48.png','favicon-64.png','favicon-180.png','favicon-192.png','favicon-512.png']){
  const r=await context.request.get(base+'/'+filename+'?v=6');assert.equal(r.status(),200);assert.deepEqual(await r.body(),fs.readFileSync('public/'+filename));
 }
 const manifest=await (await context.request.get(base+'/site.webmanifest?v=6')).json();for(const icon of manifest.icons){assert.match(icon.src,/favicon-(192|512)\.png\?v=6/);assert.equal((await context.request.get(base+icon.src)).status(),200)}
 const pending=page.waitForEvent('download');await section.getByRole('link',{name:'Download toolkit icons'}).click();const download=await pending;assert.equal(download.suggestedFilename(),'mojo-toolkit-favicon-cream.zip');assert.deepEqual(fs.readFileSync(await download.path()),fs.readFileSync('public/downloads/mojo-toolkit-favicon-cream.zip'));
 const doc=await context.request.get(base+'/downloads/toolkit-icons/BRAND-GUIDELINES.md');assert.equal(doc.status(),200);assert.ok((await doc.text()).includes('0.75 × S × 1026 / 1189'));
 const touch=await browser.newContext({viewport:{width:320,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),mobile=await touch.newPage();await mobile.goto(base+'/#logos');
 for(const theme of ['light','dark']){await mobile.evaluate(t=>MojoTheme.setPreference(t),theme);const link=mobile.getByRole('link',{name:'Download toolkit icons'});assert.ok((await link.boundingBox()).height>=44);const pending=mobile.waitForEvent('download');await link.tap();assert.equal((await pending).suggestedFilename(),'mojo-toolkit-favicon-cream.zip')}
 assert.deepEqual(errors,[]);await touch.close();await context.close();
 console.log('PASS: supplied cream SVG bounds and exact construction, outside readable annotations at nine widths in both themes, unchanged cream artwork, production asset/manifest paths, exact ZIP/docs and touch downloads.');
}finally{await browser.close()}
