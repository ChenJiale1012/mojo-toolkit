// Preserve the supplied cream favicon exports and original brand artwork.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
const brand=JSON.parse(fs.readFileSync('src/brand-content.json','utf8'));
const brandLine=brand.name+'. '+brand.catchphrase+'.';
const original=fs.readFileSync('public/brand/mojo-cat-transparent.svg','utf8');
const data='data:image/svg+xml;base64,'+Buffer.from(original).toString('base64');
fs.mkdirSync('public/icons',{recursive:true});
for(const [source,alias] of [['favicon-32.png','favicon.png'],['favicon-180.png','apple-touch-icon.png'],['favicon-192.png','icon-192.png'],['favicon-512.png','icon-512.png']])fs.copyFileSync(`public/${source}`,`public/icons/${alias}`);
if(process.argv.includes('--favicon-only')){console.log('Preserved supplied cream favicon exports and refreshed legacy aliases.');process.exit(0)}
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();
await p.goto('http://localhost:5173/#foundations');await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>sessionStorage.setItem('mojo-brand-intro-seen','1'));await p.setViewportSize({width:1200,height:630});await p.setContent(`<style>@font-face{font-family:Logo;src:url('http://localhost:5173/fonts/MojoPixel-Regular.ttf')}body{margin:0;background:#FFF8F0;color:#1D1B18;display:grid;place-items:center;height:630px}main{text-align:center}.logo{display:flex;align-items:center;justify-content:center;gap:30px}.logo img{width:120px}.logo span{font:140px Logo}p{font:30px Arial}small{font:18px Arial;letter-spacing:4px;color:#35594A}</style><main><div class="logo"><img src="${data}"><span>mojo</span></div><p>${brandLine}</p><small>BRAND TOOLKIT / INTERNAL WORKING RESOURCE</small></main>`);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'public/icons/link-preview.png'});await b.close();console.log('Supplied cream toolkit favicon aliases and link preview generated.');
