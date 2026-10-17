import {themeControl} from './theme-control.js';
import {sidebarNavigation} from './navigation.js';
import {mountPageScroll} from './scroll.js';
import './style.css';
import './working-pages.css';
import './refinement.css';
import './selection-controls.css';
import './palette.css';
import './key-guidance.css';
import {brandSignature} from './brand.js';
import {startIntro} from './intro.js';
import {workspaceScene,mountSceneMotion} from './scene.js';
import './scene.css';
import './header.css';
import './typography.css';
import './page-flow.css';
import './cursor.css';
import './theme.css';
import {foundationsPage} from './foundations.js';
import {logoPage,colourPage,typographyPage} from './reference-pages.js';
import {meta,palette,chapters,assets,foundations,brandLine,brandStatuses,templates} from './content.js';
import {copyButton,pixelIcon,searchControl,bindCopyControls,bindSearchControls} from './controls.js';
import {assetCard,colourCards,badge} from './ui.js';
import {voicePage,templatesPage,imageryPage,componentsPage,requestsPage,campusPage} from './working-pages.js';
let active='overview',query='',filter='All',disposeScene=()=>{};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function luminance(h){let v=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722}
const ratio=(a,b)=>{let x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const download=a=>a.path?`<a class="download" href="${a.path}" download aria-label="Download ${esc(a.name)}">Download ${a.format} <span>↓</span></a>`:`<span class="missing">${a.status==='Unavailable'?'File not supplied':'Download permission pending'}</span>`;
function colours(){return colourCards(palette)}

function overview(){return `<section class="hero overview-hero" data-motion-scene><img class="hero-surface" src="/hero-surface.svg" alt="" aria-hidden="true" draggable="false">${workspaceScene()}<div class="hero-copy"><h1>Better Together.</h1><p>Find brand guidance and download the supplied assets.</p><div class="actions"><a class="button primary" href="/downloads/mojo-starter-pack.zip" download>Download brand assets <span>↓</span></a><a class="button subtle" href="/downloads/quick-guide.html">View quick guide <span>↗</span></a></div></div></section><section class="section-block"><div class="section-heading"><div><h2>Explore the toolkit.</h2></div></div><div class="shortcut-grid">${[['logos','02','Logo & mascot','Usage rules and the supplied cat SVG.','identity'],['templates','06','Templates','Social, presentation, email, meeting and event formats.','template'],['typography','04','Typography','Font specimens, usage and downloads.','type'],['downloads','10','Quick guide','Print the essentials or download the starter pack.','guide']].map(([id,n,t,d,c])=>`<a class="shortcut ${c}" href="#${id}"><div class="shortcut-art">${c==='identity'?'<img class="mascot-shortcut" src="/brand/mojo-cat-transparent.svg" alt="Original Mojo cat mascot">':c==='template'?pixelIcon('presentation'):c==='type'?'<span class="type-art">Aa<span>↗</span></span>':'<div class="guide-cover"><b>Mojo.<br>Better together.</b></div>'}</div><div class="shortcut-text">${c==='identity'?badge(brandStatuses.signature):c==='template'?badge(brandStatuses.templates):c==='guide'?badge('Proposed'):''}<h3>${t} <span>↗</span></h3><p>${d}</p></div></a>`).join('')}</div></section><section class="section-block"><div class="section-heading"><div><h2>Primary colour palette.</h2>${badge(brandStatuses.primaryPalette)}</div><a class="text-link" href="#colour">Colour guidance ↗</a></div>${colours()}</section>`}
function catalogue(){let matches=assets.filter(a=>(filter==='All'||a.type===filter)&&`${a.name} ${a.use} ${a.status} ${a.format}`.toLowerCase().includes(query.toLowerCase()));return `<div class="catalogue-tools"><label class="asset-search">${pixelIcon('search')} <input id="asset-search" placeholder="Search assets, formats, or status…" value="${esc(query)}" aria-label="Search assets"></label><div class="filters" role="group" aria-label="Asset type">${['All','Logos','Fonts','Guides'].map(t=>`<button class="filter ${t===filter?'selected':''}" data-filter="${t}" aria-pressed="${t===filter}">${t}</button>`).join('')}</div></div><p class="technical">${matches.length} resources</p><div class="asset-grid">${matches.map(assetCard).join('')||'<p class="empty-state">No matching resources. Try another search or filter.</p>'}</div>`}
function chapter(c){
 const pages={foundations:foundationsPage,logos:logoPage,colour:()=>colourPage(colours),typography:typographyPage,voice:voicePage,templates:templatesPage,imagery:imageryPage,components:componentsPage,requests:requestsPage,campus:campusPage};
 if(pages[c.id])return pages[c.id]();
 let body=`<div class="guidance-grid">${c.items.map(([t,d])=>`<article class="guidance"><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>`;
 if(c.id==='downloads')body=`<div class="actions"><a class="button primary" href="/downloads/mojo-starter-pack.zip" download>Download starter pack ↓</a><a class="button subtle" href="/downloads/quick-guide.html">Open Quick Guide ↗</a></div><div id="catalogue">${catalogue()}</div>`;
 return `<div class="chapter-heading"><h1>${c.title}.</h1><p>${c.description}</p></div>${body}`;
}
function searchResults(s){let term=s.toLowerCase(),cs=chapters.filter(c=>(JSON.stringify(c)+(c.id==='foundations'?JSON.stringify(foundations):'')).toLowerCase().includes(term)),ts=templates.filter(t=>`${t.name} ${t.description} under development`.toLowerCase().includes(term)),as=assets.filter(a=>`${a.name} ${a.use} ${a.format} ${a.status}`.toLowerCase().includes(term));return `<h1>Search results.</h1><p>“${esc(s)}”</p><div class="search-results">${cs.map(c=>`<a href="#${c.id}"><h3>${c.title} ↗</h3><p>${c.description}</p></a>`).join('')}${ts.map(t=>`<a href="#templates/${t.id}">${badge('Under development')}<h3>${esc(t.name)} ↗</h3><p>${esc(t.description)}</p></a>`).join('')}${as.map(a=>`<div>${badge(a.status)}<h3>${a.name}</h3>${download(a)}</div>`).join('')}${!cs.length&&!as.length&&!ts.length?'<p>No results. Try “colour”, “campus”, or “font”.</p>':''}</div>`}
function render(restoreScroll=false){const navScroll=document.querySelector('.sidebar nav')?.scrollTop||0;disposeScene();let search=location.hash.startsWith('#search=')?decodeURIComponent(location.hash.slice(8)):null;active=search!==null?'search':location.hash.slice(1).split('/')[0]||'overview';let c=chapters.find(c=>c.id===active);document.title=`${c?.title||'Brand toolkit'} — Mojo`;document.querySelector('#app').innerHTML=`<a class="skip" href="#main">Skip to content</a><header class="toolkit-header"><span class="sidebar-label">Brand Toolkit</span><div class="topbar"><a class="wordmark logo-home header-logo" href="#overview" aria-label="Mojo toolkit home">${brandSignature()}</a>${themeControl('mobile')}<button id="mobile-menu" aria-expanded="false" aria-controls="navigation" aria-label="Menu"><span class="menu-label">Menu </span><span aria-hidden="true">☰</span></button><div class="header-controls">${themeControl()}${searchControl('global-search','search-input',search||'')}<a href="/downloads/quick-guide.html" class="top-guide"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 3h6l2 2 2-2h6v13h-6l-2 2-2-2H2zM10 5v13"/></svg>Quick guide</a></div></div></header><aside class="sidebar">${sidebarNavigation(active)}</aside><div class="shell"><main id="main" tabindex="-1">${search!==null?searchResults(search):active==='overview'?overview():c?chapter(c):'<h1>Section not found.</h1><a href="#overview">Back to overview</a>'}</main></div><div id="toast" role="status" aria-live="polite"></div>`.replaceAll('↗','<svg class="inline-icon arrow" aria-hidden="true" viewBox="0 0 16 16"><path d="M3 13 13 3M4 3h9v9"/></svg>').replaceAll('✳','<svg class="inline-icon star" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 1v22M1 12h22M4 4l16 16M4 20 20 4"/></svg>');accentHeadings();bind();window.MojoTheme?.syncControls();document.querySelector('.sidebar nav').scrollTop=navScroll;syncHeaderScroll();disposeScene=mountSceneMotion(document);measurePairings();let section=location.hash.split('/')[1];if(section&&!restoreScroll){document.getElementById(section)?.scrollIntoView();document.getElementById(section)?.focus({preventScroll:true})}}
function toast(t){let el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500)}
function bind(){
 document.querySelectorAll('[data-logo-bg]').forEach(b=>b.addEventListener('change',()=>{const preview=document.querySelector('.logo-preview');preview.style.background=b.dataset.logoBg;preview.style.setProperty('--logo-wordmark-color',b.dataset.logoText);document.querySelector('[data-logo-preview-note]').textContent=b.dataset.logoText==='#FFF8F0'?'Use the cream wordmark on a Soft ink background.':'Use the dark logo on a light background.'}));
 document.querySelector('#mobile-menu').onclick=e=>{let open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',open);document.querySelector('.sidebar').classList.toggle('open',open)};
 document.querySelector('#asset-search')?.addEventListener('input',e=>{query=e.target.value;refreshCatalogue()});
}
function refreshCatalogue(focusFilter){let el=document.querySelector('#catalogue');el.innerHTML=catalogue();let input=el.querySelector('input');if(focusFilter)el.querySelector(`[data-filter="${focusFilter}"]`).focus();else{input.focus();input.setSelectionRange(query.length,query.length);}input.addEventListener('input',e=>{query=e.target.value;refreshCatalogue()})}
bindCopyControls(document,toast);bindSearchControls(document,term=>{const hash='#search='+encodeURIComponent(term);explicitNavigation=location.hash!==hash;location.hash=hash});
document.addEventListener('click',e=>{const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;refreshCatalogue(filter)}});
function syncHeaderScroll(){document.querySelector('.toolkit-header')?.classList.toggle('is-scrolled',window.scrollY>1)}
window.addEventListener('scroll',syncHeaderScroll,{passive:true});
// Preserve native history scroll restoration on back/forward navigation.
let restoringHistory=false,explicitNavigation=false;
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');if(!link||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 if(link.classList.contains('skip')){event.preventDefault();document.querySelector('#main').focus({preventScroll:true});document.querySelector('#main').scrollIntoView();return}
 if(link.hash!==location.hash)explicitNavigation=true;
});
window.addEventListener('popstate',()=>{restoringHistory=true});
window.addEventListener('hashchange',()=>{render(restoringHistory&&!explicitNavigation);if((explicitNavigation||!restoringHistory)&&!location.hash.includes('/'))window.scrollTo(0,0);if(explicitNavigation&&!location.hash.includes('/'))document.querySelector('#main').focus({preventScroll:true});restoringHistory=false;explicitNavigation=false;syncHeaderScroll()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.sidebar.open')){document.querySelector('.sidebar').classList.remove('open');const menu=document.querySelector('#mobile-menu');menu.setAttribute('aria-expanded','false');menu.focus()}});
const disposeScroll=mountPageScroll();
render();startIntro();
if(import.meta.hot)import.meta.hot.dispose(()=>{disposeScroll();disposeScene()});

function accentHeadings(){document.querySelectorAll('h1,h2,h3,.font-sample,.mini-word,.paper b,.guide-cover b,.type-example b').forEach(el=>{let walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){if(!node.textContent.includes('.'))continue;const fragment=document.createDocumentFragment();for(const part of node.textContent.split(/(\S*\.)/g)){if(!part)continue;if(part.endsWith('.')){let span=document.createElement('span');span.className='punctuated-word';span.append(document.createTextNode(part.slice(0,-1)));let dot=document.createElement('span');dot.className='title-period';dot.textContent='.';span.append(dot);fragment.append(span)}else fragment.append(document.createTextNode(part))}node.replaceWith(fragment)}})}
function measurePairings(){document.querySelectorAll('.pair').forEach(el=>{const css=getComputedStyle(el),hex=s=>'#'+s.match(/\d+/g).slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join('');const r=ratio(hex(css.color),hex(css.backgroundColor));el.querySelector('b').textContent=`${r.toFixed(2)}:1 · ${r>=4.5?'AA normal text':r>=3?'AA large text only':'Does not meet AA'}`})}
