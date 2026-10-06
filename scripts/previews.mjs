/** Render every thumbnail from the actual editable file, after embedded fonts load. */
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import templates from '../src/templates.json' with {type:'json'};
const base=process.env.TEST_URL||'http://localhost:5173';
fs.mkdirSync('public/previews',{recursive:true});fs.mkdirSync('.playwright/template-fonts',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1400,height:1100},reducedMotion:'reduce'});
for(const template of templates){
 await page.goto(base+'/downloads/'+template.id+'.html');
 for(const family of ['MojoDraft','MojoRefined','Inter']){
  const count=await page.evaluate(async family=>(await document.fonts.load(`40px ${family}`)).length,family);
  if(!count)throw new Error('Missing embedded font '+family+' in '+template.id);
 }
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.canvas').first().screenshot({path:'public/previews/'+template.id+'.png'});
 await page.pdf({path:'.playwright/template-fonts/'+template.id+'.pdf',printBackground:true,preferCSSPageSize:true});
 const fonts=execFileSync('pdffonts',['.playwright/template-fonts/'+template.id+'.pdf'],{encoding:'utf8'});
 if(!/MojoPixelSerif/.test(fonts)||!/MojoSerif/.test(fonts)||!/Inter/.test(fonts))throw new Error('Font substitution in '+template.id+': '+fonts);
 const names=fonts.split('\n').slice(2).filter(line=>line.trim()).map(line=>line.trim().split(/\s+/)[0]);
 if(names.some(name=>!/MojoPixelSerif|MojoSerif|Inter/.test(name)))throw new Error('Unexpected fallback font in '+template.id+': '+names.join(', '));
 console.log('Preview and PDF fonts verified:',template.id);
}
await page.goto(base+'/downloads/quick-guide.html');await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:'public/previews/quick-guide.png',fullPage:true});
await browser.close();
// Store matching previews beside the actual files in the starter archive.
fs.mkdirSync('public/downloads/previews',{recursive:true});
for(const name of fs.readdirSync('public/previews'))fs.copyFileSync(path.join('public/previews',name),path.join('public/downloads/previews',name));
execFileSync('python3',['-c',`from pathlib import Path\nimport zipfile\np=Path('public/downloads')\nwith zipfile.ZipFile(p/'mojo-starter-pack.zip','w',zipfile.ZIP_DEFLATED) as z:\n for file in sorted(p.rglob('*')):\n  if file.is_file() and file.name!='mojo-starter-pack.zip':z.write(file,str(file.relative_to(p)))`]);
