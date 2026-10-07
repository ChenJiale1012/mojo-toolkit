/** Render only the current guide; template previews are retired. */
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const base=process.env.TEST_URL||'http://localhost:5173';
fs.mkdirSync('public/previews',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1400,height:1100},reducedMotion:'reduce'});
await page.goto(base+'/downloads/quick-guide.html');await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:'public/previews/quick-guide.png',fullPage:true});await browser.close();
fs.mkdirSync('public/downloads/previews',{recursive:true});
fs.copyFileSync('public/previews/quick-guide.png','public/downloads/previews/quick-guide.png');
execFileSync('python3',['-c',`from pathlib import Path\nimport zipfile\np=Path('public/downloads')\nwith zipfile.ZipFile(p/'mojo-starter-pack.zip','w',zipfile.ZIP_DEFLATED) as z:\n for file in sorted(p.rglob('*')):\n  if file.is_file() and file.name!='mojo-starter-pack.zip':z.write(file,str(file.relative_to(p)))`]);
console.log('Updated Quick Guide preview and template-free starter pack.');
