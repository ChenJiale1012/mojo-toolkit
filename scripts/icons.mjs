// Preserve the supplied forest-green favicon exports and original brand artwork.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
const brand=JSON.parse(fs.readFileSync('src/brand-content.json','utf8'));
const brandLine=brand.name+'. '+brand.catchphrase+'.';
const original=fs.readFileSync('public/brand/mojo-cat-transparent.svg','utf8');
const data='data:image/svg+xml;base64,'+Buffer.from(original).toString('base64');
fs.mkdirSync('public/icons',{recursive:true});
const favicon='data:image/svg+xml;base64,'+fs.readFileSync('public/favicon.svg').toString('base64');
for(const [source,alias] of [['favicon-32.png','favicon.png'],['favicon-180.png','apple-touch-icon.png'],['favicon-512.png','icon-512.png']])fs.copyFileSync(`public/${source}`,`public/icons/${alias}`);
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();
// The upload has no 192px export; render that manifest size from its exact SVG.
const icon192=await p.evaluate(async source=>{const i=new Image();i.src=source;await i.decode();const c=document.createElement('canvas');c.width=c.height=192;c.getContext('2d').drawImage(i,0,0,192,192);return c.toDataURL('image/png')},favicon);
fs.writeFileSync('public/icons/icon-192.png',Buffer.from(icon192.split(',')[1],'base64'));
if(process.argv.includes('--favicon-only')){await b.close();console.log('Preserved supplied favicon exports; updated aliases and the 192px manifest icon.');process.exit(0)}
await p.goto('http://localhost:5173/#foundations');await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>sessionStorage.setItem('mojo-brand-intro-seen','1'));await p.setViewportSize({width:1200,height:630});await p.setContent(`<style>@font-face{font-family:Logo;src:url('http://localhost:5173/fonts/MojoPixel-Regular.ttf')}body{margin:0;background:#FFF8F0;color:#1D1B18;display:grid;place-items:center;height:630px}main{text-align:center}.logo{display:flex;align-items:center;justify-content:center;gap:30px}.logo img{width:120px}.logo span{font:140px Logo}p{font:30px Arial}small{font:18px Arial;letter-spacing:4px;color:#35594A}</style><main><div class="logo"><img src="${data}"><span>mojo</span></div><p>${brandLine}</p><small>BRAND TOOLKIT / INTERNAL WORKING RESOURCE</small></main>`);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'public/icons/link-preview.png'});await b.close();console.log('Supplied toolkit favicon aliases, 192px manifest icon and link preview generated.');
