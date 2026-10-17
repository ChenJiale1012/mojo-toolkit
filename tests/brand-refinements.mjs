import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '@playwright/test';
import {palette} from '../src/content.js';
const base=process.env.TEST_URL||'http://localhost:5173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 fs.mkdirSync('.playwright',{recursive:true});
 await p.goto(base+'/#colour');await p.evaluate(()=>document.fonts.ready);
 const swatches=p.locator('.swatch'), widths=()=>swatches.evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));
 assert.equal(await swatches.count(),5);assert.equal(await swatches.locator('button,a').count(),0,'No nested interactive controls');
 assert.deepEqual(await swatches.locator('.hex-code').allTextContents(),palette.map(c=>c.hex));
 const rest=await widths();assert.ok(Math.max(...rest)-Math.min(...rest)<1);
 const rowWidth=await p.locator('.swatches').evaluate(e=>e.getBoundingClientRect().width);
 await swatches.nth(0).hover();await p.waitForTimeout(550);let w=await widths();assert.ok(Math.abs((w[0]-40)/(w[1]-40)-2.4)<.02,'Hover flex share');
 assert.equal(await p.locator('.swatches').evaluate(e=>e.getBoundingClientRect().width),rowWidth);
 assert.equal(await swatches.first().locator('.swatch-rgb').evaluate(e=>getComputedStyle(e).opacity),'1');
 await p.keyboard.press('Tab');await swatches.nth(2).focus();await swatches.nth(0).hover();await p.waitForTimeout(550);
 w=await widths();assert.ok(Math.abs((w[2]-40)/(w[0]-40)-2.4)<.02,'Keyboard focus wins over hover');
 assert.equal(await swatches.nth(2).evaluate(e=>getComputedStyle(e).outlineStyle),'none');
 assert.equal(await swatches.nth(2).locator('strong').evaluate(e=>getComputedStyle(e).textDecorationLine),'underline');
 const alignment=await swatches.locator('.hex-code').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));assert.ok(Math.max(...alignment)-Math.min(...alignment)<1);
 for(let i=0;i<5;i++){
  await swatches.nth(i).focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('#toast').textContent==='Copied');
  assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),palette[i].hex);
 }
 await p.mouse.move(0,0);await p.locator('#search-input').focus();await p.waitForTimeout(550);w=await widths();assert.ok(Math.max(...w)-Math.min(...w)<1,'Return to equal widths');
 const contrast=await swatches.evaluateAll(es=>{
  const luminance=s=>s.match(/\d+/g).slice(0,3).map(v=>Number(v)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  return es.map(e=>{const c=getComputedStyle(e),a=luminance(c.color),b=luminance(c.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
 });assert.ok(contrast.every(r=>r>=4.5),'Every swatch has readable text');console.log('Swatch contrast ratios:',contrast.map(r=>r.toFixed(2)).join(', '));
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
 await swatches.first().click();await p.waitForFunction(()=>document.querySelector('.swatch').classList.contains('copy-failed'));
 assert.ok((await p.locator('#toast').textContent()).includes('Could not copy'));assert.equal(await swatches.first().evaluate(e=>e.classList.contains('copied')),false);
 await p.reload();await p.evaluate(()=>document.fonts.ready);await swatches.first().hover();await p.waitForTimeout(600);await p.screenshot({path:'.playwright/refinements-colour.png',fullPage:true});
 assert.match(await p.locator('body').evaluate(e=>getComputedStyle(e).cursor),/arrow\.svg.*1 1/);
 assert.match(await swatches.first().evaluate(e=>getComputedStyle(e).cursor),/pointer\.svg.*8 1/);
 assert.match(await p.locator('#search-input').evaluate(e=>getComputedStyle(e).cursor),/text\.svg.*9 9/);
 for(const path of ['/cursors/arrow.svg','/cursors/pointer.svg'])assert.equal((await context.request.get(base+path)).status(),200);
 await p.goto(base+'/#typography');await p.evaluate(()=>document.fonts.ready);
 assert.deepEqual(await p.locator('.type-table tbody td:first-of-type').allTextContents(),['64px','48px','32px','24px','18px','16px','14px','12px']);
 assert.deepEqual(await p.locator('.font-specimen-row h2').allTextContents(),['Mojo Pixel','Mojo Serif','Nunito Sans']);
 assert.match(await p.locator('#specimen').evaluate(e=>getComputedStyle(e).cursor),/text\.svg.*9 9/);
 assert.equal(await p.locator('#specimen').evaluate(e=>getComputedStyle(e).resize),'vertical');
 assert.equal(await p.locator('h1').evaluate(e=>getComputedStyle(e).fontSize),'48px');
 assert.equal(await p.locator('.typography-rules h2').evaluate(e=>getComputedStyle(e).lineHeight),'32px');
 await p.screenshot({path:'.playwright/refinements-typography.png',fullPage:true});
 for(const width of [320,390,768,1024,1440,1920]){
  await p.setViewportSize({width,height:1000});
  for(const route of ['overview','colour','typography','foundations','templates','downloads','requests']){
   await p.goto(base+'/#'+route);await p.evaluate(()=>document.fonts.ready);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+route+' '+width);
  }
 }
 await p.setViewportSize({width:1440,height:1000});await p.goto(base+'/#colour');
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await swatches.first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 assert.equal(await p.evaluate(()=>{const e=new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true});document.querySelector('main').dispatchEvent(e);return e.defaultPrevented}),false);
 await p.emulateMedia({reducedMotion:'no-preference'});
 // Wheel detents ease to their full distance with an immediate response and no overshoot.
 await p.mouse.move(1100,650);await p.evaluate(()=>scrollTo(0,0));await p.mouse.wheel(0,400);await p.waitForTimeout(30);const first=await p.evaluate(()=>scrollY);assert.ok(first>0&&first<400,'Immediate but eased wheel response');
 await p.waitForTimeout(500);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-400)<=1,'Wheel settles at requested distance');
 assert.equal(await p.locator('.toolkit-header').evaluate(e=>e.getBoundingClientRect().top),0);
 // Small frequent deltas model a trackpad, without multiplying its native momentum.
 await p.evaluate(()=>scrollTo(0,0));for(let i=0;i<12;i++){await p.mouse.wheel(0,5);await p.waitForTimeout(8)}await p.waitForTimeout(500);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-60)<=1,'Trackpad-sized deltas accumulate exactly');
 await p.mouse.wheel(0,300);await p.keyboard.press('Home');await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>scrollY),0,'Keyboard cancels pending easing');
 await p.mouse.wheel(0,300);await p.evaluate(()=>scrollTo(0,100));await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>scrollY),100,'External scrolling cancels easing');
 // An independently scrollable panel must retain native wheel behaviour.
 await p.evaluate(()=>{const panel=document.createElement('div');panel.id='scroll-test-panel';panel.style.cssText='position:fixed;right:0;top:200px;width:150px;height:100px;overflow:auto;z-index:100';panel.innerHTML='<div style="height:1000px">Panel</div>';document.body.append(panel)});
 const before=await p.evaluate(()=>scrollY);await p.locator('#scroll-test-panel').hover();await p.mouse.wheel(0,100);await p.waitForTimeout(200);assert.ok(await p.locator('#scroll-test-panel').evaluate(e=>e.scrollTop>0));assert.equal(await p.evaluate(()=>scrollY),before);await p.locator('#scroll-test-panel').evaluate(e=>e.remove());
 await p.evaluate(()=>scrollTo(0,300));await p.getByRole('navigation').getByRole('link',{name:'Typography',exact:true}).click();await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>scrollY),0,'Section navigation starts at top');
 await p.goBack();await p.waitForTimeout(200);assert.ok(Math.abs(await p.evaluate(()=>scrollY)-300)<=1,'Back restores scroll position');await p.goForward();await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>scrollY),0,'Forward restores scroll position');
 await p.goto(base+'/#colour');await p.evaluate(()=>scrollTo(0,300));await p.locator('#search-input').fill('font');await p.locator('#search-input').press('Enter');await p.waitForSelector('.search-results');assert.equal(await p.evaluate(()=>scrollY),0,'Search starts at top');
 await p.locator('.skip').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'main');assert.equal(await p.locator('.search-results').count(),1,'Skip link preserves current page');
 await p.setViewportSize({width:1440,height:500});await p.goto(base+'/#colour');await p.locator('.sidebar nav').hover();await p.mouse.wheel(0,200);await p.waitForTimeout(200);assert.ok(await p.locator('.sidebar nav').evaluate(e=>e.scrollTop>0),'Sidebar remains independently scrollable');assert.equal(await p.evaluate(()=>scrollY),0);await p.setViewportSize({width:1440,height:1000});
 // Exercise teardown without the application mount masking a leaked listener.
 await context.route('**/scroll-harness',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="height:4000px"><script type="module">import {mountPageScroll} from "/src/scroll.js";window.disposeScroll=mountPageScroll();</script>'}));
 const harness=await context.newPage();await harness.goto(base+'/scroll-harness');await harness.waitForFunction(()=>typeof window.disposeScroll==='function');
 assert.equal(await harness.evaluate(()=>{const e=new WheelEvent('wheel',{deltaY:300,bubbles:true,cancelable:true});document.body.dispatchEvent(e);return e.defaultPrevented}),true);
 await harness.evaluate(()=>window.disposeScroll());const stopped=await harness.evaluate(()=>scrollY);await harness.waitForTimeout(200);assert.equal(await harness.evaluate(()=>scrollY),stopped,'Dispose stops pending frames');
 assert.equal(await harness.evaluate(()=>{const e=new WheelEvent('wheel',{deltaY:300,bubbles:true,cancelable:true});document.body.dispatchEvent(e);return e.defaultPrevented}),false,'Dispose removes wheel handler');await harness.close();
 const touch=await browser.newContext({viewport:{width:768,height:1000},isMobile:true,hasTouch:true,permissions:['clipboard-read','clipboard-write']});const tablet=await touch.newPage();await tablet.goto(base+'/#colour');
 assert.equal(await tablet.locator('.swatches').evaluate(e=>getComputedStyle(e).display),'grid');assert.equal(await tablet.locator('.swatch-rgb').first().evaluate(e=>getComputedStyle(e).opacity),'1');
 assert.doesNotMatch(await tablet.locator('body').evaluate(e=>getComputedStyle(e).cursor),/cursors/);
 assert.equal(await tablet.evaluate(()=>{const e=new WheelEvent('wheel',{deltaY:80,bubbles:true,cancelable:true});document.querySelector('main').dispatchEvent(e);return e.defaultPrevented}),false);
 await tablet.locator('.swatch').first().tap();assert.equal(await tablet.evaluate(()=>navigator.clipboard.readText()),'#F06A21','Touch tap copies HEX');
 const cdp=await touch.newCDPSession(tablet);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:700,y:800}]});
 for(const y of [740,680,620,560,500]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:700,y}]});await tablet.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tablet.waitForTimeout(200);assert.ok(await tablet.evaluate(()=>scrollY>0),'Native touch swipe scrolls');assert.equal(await tablet.locator('.toolkit-header').evaluate(e=>e.getBoundingClientRect().top),0);
 await tablet.evaluate(()=>scrollTo(0,0));await tablet.screenshot({path:'.playwright/refinements-tablet.png',fullPage:true});await touch.close();
 assert.deepEqual(errors,[]);await context.close();
 console.log('PASS: expanding palette, focus precedence, aligned HEX, clipboard success/failure, contrast, typography, cursors, responsive layouts, wheel/trackpad easing, native panels/touch/reduced motion and history restoration.');
} finally {await browser.close()}
