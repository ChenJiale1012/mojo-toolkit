/** Analyse only the connected upper cream sky; never remove cream globally. */
import fs from 'node:fs';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();
await page.goto(process.env.TEST_URL||'http://localhost:5173');
const rectangles=await page.evaluate(async()=>{
 const image=new Image();image.src='/courtyard.png';await image.decode();
 const width=1536,height=451,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,width,height).data,selected=new Uint8Array(width*height);
 // A conservative upper-sky envelope stops before the measured roof silhouettes.
 const envelope=[[0,1370],[100,1370],[160,1310],[210,1250],[250,1240],[290,1180],[330,1135],[360,1090],[450,1070]];
 function rightEdge(y){for(let i=1;i<envelope.length;i++){const [ay,ax]=envelope[i-1],[by,bx]=envelope[i];if(y<=by)return ax+(bx-ax)*(y-ay)/(by-ay)}return 1070}
 function sky(x,y){const p=(y*width+x)*4;return x<=rightEdge(y)&&Math.abs(pixels[p]-253)<=7&&Math.abs(pixels[p+1]-245)<=7&&Math.abs(pixels[p+2]-235)<=7}
 const queue=new Uint32Array(width*height);let start=0,end=0;
 function add(x,y){if(x<0||x>=width||y<0||y>=height)return;const p=y*width+x;if(selected[p]||!sky(x,y))return;selected[p]=1;queue[end++]=p}
 // Sky touches the top and left of the source; foliage and roofs block the flood.
 for(let x=0;x<width;x++)add(x,0);for(let y=0;y<height;y++)add(0,y);
 while(start<end){const p=queue[start++],x=p%width,y=Math.floor(p/width);add(x-1,y);add(x+1,y);add(x,y-1);add(x,y+1)}
 // Combine identical horizontal runs vertically to keep this precise mask small.
 const result=[],open=new Map();
 for(let y=0;y<height;y++){
  const next=new Map();for(let x=0;x<width;){if(!selected[y*width+x]){x++;continue}const left=x;while(x<width&&selected[y*width+x])x++;const key=left+':'+(x-left);const run=open.get(key)||{x:left,y,width:x-left,height:0};run.height++;next.set(key,run)}
  for(const [key,run] of open)if(!next.has(key))result.push(run);open.clear();for(const [key,run] of next)open.set(key,run);
 }
 result.push(...open.values());return result;
});
await browser.close();
fs.writeFileSync('src/courtyard-sky-window.json',JSON.stringify(rectangles.map(r=>[r.x,r.y,r.width,r.height]))+'\n');
console.log(`Generated ${rectangles.length} precise upper-sky mask runs from the original raster.`);
