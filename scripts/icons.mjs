// Render exports from the untouched SVG; no geometry, colour, or highlight changes.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
const original=fs.readFileSync('public/brand/mojo-cat-transparent.svg','utf8');
const data='data:image/svg+xml;base64,'+Buffer.from(original).toString('base64');
fs.mkdirSync('public/icons',{recursive:true});
fs.writeFileSync('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#FFF8F0"/><image href="${data}" x="14" y="20" width="100" height="86.29"/></svg>`);
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();
for(const [name,size] of [['favicon',32],['apple-touch-icon',180],['icon-192',192],['icon-512',512]]){
 const url=await p.evaluate(async({data,size})=>{const i=new Image();i.src=data;await i.decode();const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle='#FFF8F0';x.fillRect(0,0,size,size);const w=size*.78,h=w*1026/1189;x.drawImage(i,(size-w)/2,(size-h)/2,w,h);return c.toDataURL('image/png')},{data,size});fs.writeFileSync(`public/icons/${name}.png`,Buffer.from(url.split(',')[1],'base64'));
}
await p.goto('http://localhost:5173/#foundations');await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>sessionStorage.setItem('mojo-brand-intro-seen','1'));await p.setViewportSize({width:1200,height:630});await p.setContent(`<style>@font-face{font-family:Logo;src:url('http://localhost:5173/fonts/MojoPixelSerif-Draft-Regular.ttf')}body{margin:0;background:#FFF8F0;color:#1D1B18;display:grid;place-items:center;height:630px}main{text-align:center}.logo{display:flex;align-items:center;justify-content:center;gap:30px}.logo img{width:120px}.logo span{font:140px Logo}p{font:30px Arial}small{font:18px Arial;letter-spacing:4px;color:#35594A}</style><main><div class="logo"><img src="${data}"><span>mojo</span></div><p>Mojo. In good company.</p><small>BRAND TOOLKIT / INTERNAL WORKING RESOURCE</small></main>`);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'public/icons/link-preview.png'});await b.close();console.log('Padded mascot icons and link preview generated.');
