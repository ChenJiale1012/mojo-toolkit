"""Build the actual editable resources from supplied fonts and shared content."""
from pathlib import Path
import base64, html, json, re, shutil, subprocess, textwrap, zipfile

root=Path(__file__).resolve().parents[1]
out=root/'public/downloads'; out.mkdir(exist_ok=True)
brand=json.loads((root/'src/brand-content.json').read_text())
templates=json.loads((root/'src/templates.json').read_text())
line=brand['name']+'. '+brand['catchphrase']+'.'
statuses=brand['statuses']
radius=int(re.search(r'--radius:(\d+)px',(root/'src/design-tokens.css').read_text())[1])
cat='data:image/svg+xml;base64,'+base64.b64encode((root/'public/brand/mojo-cat-transparent.svg').read_bytes()).decode()
font_css=''
for family,name in [('MojoDraft','MojoPixelSerif-Draft-Regular.ttf'),('MojoRefined','MojoSerif-Refined-Regular.ttf'),('Inter','Inter-Variable.ttf')]:
 data=base64.b64encode((root/'public/fonts'/name).read_bytes()).decode()
 font_css+=f'@font-face{{font-family:{family};src:url(data:font/ttf;base64,{data}) format("truetype");font-weight:{"100 900" if family=="Inter" else "400"};font-style:normal}}'
svg_style=font_css+'text{fill:#1D1B18;font-family:Inter;font-weight:400}.display{font-family:MojoDraft}.subtitle{font-family:MojoRefined}.label{fill:#35594A}'

def rect(x,y,w,h,fill,stroke=None):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>'
def text(value,x,y,size=28,kind='',field=None,wrap=40,field_label=None):
 lines=textwrap.wrap(value,width=wrap,break_long_words=False) or ['']
 attr=f' data-field="{field}" data-label="{html.escape(field_label or field.replace("-"," "))}" data-wrap="{wrap}" data-value="{html.escape(value,quote=True)}"' if field else ''
 spans=[]
 for i,v in enumerate(lines):
  content=html.escape(v)
  if kind in ['display','subtitle']:content=html.escape(v).replace('.', '<tspan fill="#35594A">.</tspan>')
  spans.append(f'<tspan x="{x}" dy="{0 if i==0 else round(size*1.25)}">{content}</tspan>')
 return f'<text x="{x}" y="{y}" font-size="{size}" class="{kind}"{attr}>'+''.join(spans)+'</text>'
def logo():
 return f'<g aria-label="Approved cat and lowercase mojo"><image href="{cat}" x="64" y="54" width="70" height="61"/>'+text('mojo',151,114,80,'display')+'</g>'
def frame(body,title,w=1080,h=1080):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)} — editable proposed layout</title><style>{svg_style}</style>'+rect(0,0,w,h,'#FFF8F0')+body+'</svg>'
def image_panel(label,x,y,w,h):
 return rect(x,y,w,h,'#A7B59E')+text(label,x+32,y+70,32,'subtitle','image-note',max(18,int(w/19)))
def action(value,x,y,w):
 return rect(x,y,w,74,'#F06A21')+text(value,x+24,y+46,24,'','next-step',max(18,int(w/14)))
def field_block(label,value,x,y,wrap=28,index=0):
 return text(label.upper(),x,y,20,'label')+text(value,x,y+49,30,'',f'detail-{index}',wrap,label)

for t in templates[:6]:
 body=logo()+text(t['name'].upper(),640,102,19,'label')
 body+=text(t['title'],64,252,90,'display','headline',23)+text(t['subtitle'],64,326,37,'subtitle','supporting-line',44)
 fields=t['fields'];key=t['id']
 if key in ['social','spotlight']:
  body+=image_panel(t['panel'],64,380,952,325 if key=='social' else 370)
  for i,(label,value) in enumerate(fields):body+=field_block(label,value,64+i*480,800 if key=='social' else 850,26,i)
  body+=action(t['action'],64,945,952)
 elif key=='demo':
  body+=image_panel(t['panel'],64,380,570,490)
  for i,(label,value) in enumerate(fields):body+=field_block(label,value,682,430+i*175,18,i)
  body+=action(t['action'],682,797,334)
 elif key in ['campus','recruitment']:
  body+=image_panel(t['panel'],620,380,396,460)
  for i,(label,value) in enumerate(fields):body+=field_block(label,value,64,430+i*188,26,i)
  body+=action(t['action'],64,927,952)
 else:
  body+=image_panel(t['panel'],64,380,952,190)
  for i,(label,value) in enumerate(fields):
   x=64+i*486;body+=rect(x,605,466,246,'#A7B59E')+field_block(label,value,x+25,655,24,i)
  body+=action(t['action'],64,927,952)
 body+=text(line,64,1050,18,'label')
 (out/f'{key}.svg').write_text(frame(body,t['name']))

# Browser editors keep the same inline SVG, embedded font bytes, and native editable text.
editor_css='''body{margin:0;background:#FFF8F0;color:#1D1B18;font:14px/1.7 Inter,Arial,sans-serif}*{box-sizing:border-box}main{max-width:1250px;margin:32px auto;padding:24px}h1{font:38px/1.2 MojoDraft,Georgia,serif}h2{font:25px MojoRefined,Georgia,serif}.editor-head{max-width:80ch}.status{color:#35594A}.editor-layout{display:grid;grid-template-columns:300px 1fr;gap:28px;align-items:start}.editor-fields{padding:22px;background:#e7ecdf;border-radius:var(--radius)}label{display:block;margin:14px 0 5px;font-weight:500;text-transform:capitalize}input{width:100%;font:14px Inter;padding:10px;background:#FFF8F0;border:1px solid #A7B59E;border-radius:var(--radius)}.canvas{border:1px solid #A7B59E;border-radius:var(--radius);overflow:hidden;margin:0 0 24px}.canvas svg{display:block;width:100%;height:auto}.toolbar{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}button,a{border-radius:var(--radius);padding:10px 15px;border:1px solid #A7B59E;background:#FFF8F0;color:#35594A;text-decoration:none;cursor:pointer}.primary{background:#F06A21;color:#1D1B18;border-color:#F06A21}button:hover,a:hover{background:#e7ecdf}.primary:hover{background:#df5b13}button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #35594A;outline-offset:3px}@media(max-width:750px){main{padding:18px}.editor-layout{grid-template-columns:1fr}.editor-fields{order:2}h1{font-size:30px}}@media print{@page{margin:0;size:210mm 210mm}body,main{margin:0;padding:0}.editor-head,.editor-fields,.toolbar,.editor-note{display:none}.editor-layout{display:block}.canvas{border:0;border-radius:0;margin:0;break-after:page;break-inside:avoid}.canvas svg{width:100%;height:auto}}'''
editor_js='''const fields=document.querySelector('.editor-fields');fields.innerHTML='<h2>Your content</h2>';document.querySelectorAll('svg text[data-field]').forEach((node,index)=>{const input=document.createElement('input');input.id='field-'+index;input.value=node.dataset.value;input.maxLength=110;const label=document.createElement('label');label.htmlFor=input.id;label.textContent=node.dataset.label;fields.append(label,input);input.addEventListener('input',()=>{node.dataset.value=input.value;const words=input.value.split(/\\s+/);const lines=[''];const wrap=Number(node.dataset.wrap);for(const word of words){const last=lines.length-1;if(lines[last]&&(lines[last]+' '+word).length>wrap)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word}node.replaceChildren();for(const [i,value] of lines.entries()){const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('x',node.getAttribute('x'));span.setAttribute('dy',i?Math.round(Number(node.getAttribute('font-size'))*1.25):0);if(node.classList.contains('display')||node.classList.contains('subtitle')){for(const [j,part] of value.split('.').entries()){if(j){const dot=document.createElementNS('http://www.w3.org/2000/svg','tspan');dot.setAttribute('fill','#35594A');dot.textContent='.';span.append(dot)}span.append(document.createTextNode(part))}}else span.textContent=value;node.append(span)}})});document.querySelector('[data-print]').onclick=()=>window.print();document.querySelector('[data-save]').onclick=()=>{const clone=document.documentElement.cloneNode(true);const serialized='<!doctype html>'+clone.outerHTML;const blob=new Blob([serialized],{type:'text/html'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=document.body.dataset.file;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)};'''
email_js = r"""const exportEmail=document.querySelector('[data-email-export]');if(exportEmail)exportEmail.onclick=()=>{const get=name=>document.querySelector('svg text[data-field="'+name+'"]').dataset.value;const esc=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const cat=document.querySelector('svg image').getAttribute('href');const fonts=document.querySelector('svg style').textContent;const html='<!doctype html><html lang="en"><meta charset="utf-8"><title>Mojo email signature</title><style>'+fonts+'</style><body style="margin:24px;background:#FFF8F0;color:#1D1B18"><table role="presentation" style="border-collapse:collapse;font-family:Inter,Arial,sans-serif"><tr><td style="padding-bottom:18px"><img src="'+cat+'" width="48" alt="Mojo cat" style="vertical-align:middle"><span style="font-family:MojoDraft,Georgia,serif;font-size:52px;vertical-align:middle;margin-left:12px">mojo</span></td></tr><tr><td style="font-family:MojoDraft,Georgia,serif;font-size:28px;padding-bottom:8px">'+esc(get('name')).replaceAll('.', '<span style="color:#35594A">.</span>')+'</td></tr><tr><td style="font-family:MojoRefined,Georgia,serif;font-size:20px;padding-bottom:15px">'+esc(get('role'))+'</td></tr><tr><td style="padding-bottom:8px">'+esc(get('email'))+'</td></tr><tr><td style="padding-bottom:15px">'+esc(get('website'))+'</td></tr><tr><td style="color:#35594A">Mojo. Better together.</td></tr></table></body></html>';const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));const a=document.createElement('a');a.href=url;a.download='email-signature.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};"""
def editor(name,svgs,key,note=''):
 css=(root/'src/design-tokens.css').read_text()+re.search(r':root\{[^}]+\}',(root/'src/resource-style.css').read_text())[0]+editor_css+(root/'src/shared-controls.css').read_text()
 svgs=[svg if i==0 else svg.replace(font_css,'') for i,svg in enumerate(svgs)]
 extra_button='<button data-email-export>Export email HTML ↓</button>' if key=='signature' else ''
 extra_script=email_js if key=='signature' else ''
 if key=='slides':css+='@media print{@page{size:297mm 167mm}}'
 if key=='signature':css+='@media print{@page{size:210mm 157.5mm}}'
 return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{name} · Mojo editable template</title><style>{css}</style></head><body data-file="{key}.html"><main><header class="editor-head"><h1>{name}.</h1><p class="status">Layout: Proposed · Primary palette: {statuses["primaryPalette"]} · Primary signature: {statuses["signature"]}</p><p>Edit the bracketed placeholders using the labelled fields. The supplied Mojo Draft, Mojo Refined, and Inter fonts are embedded in this file.</p></header><div class="toolbar"><button class="primary" data-save>Save edited HTML ↓</button><button data-print>Print / save as PDF</button>{extra_button}</div><div class="editor-layout"><aside class="editor-fields"><h2>Your content</h2></aside><div>'+''.join('<div class="canvas">'+svg+'</div>' for svg in svgs)+f'</div></div><p class="editor-note">{note or "SVG editors may discard embedded fonts. Install the supplied TTFs before editing SVG; check exported typography. Browser PDF export uses the embedded fonts."}</p></main><script>{editor_js}{extra_script}</script></body></html>'
for t in templates[:6]:
 (out/f'{t["id"]}.html').write_text(editor(t['name'],[(out/f'{t["id"]}.svg').read_text()],t['id']))

slides=[]
for i,title in enumerate(['[Presentation topic].','[Key points].','[Product or screen].','[What the data shows].',line]):
 body=logo()+text(title,64,245,75,'display',f'slide-{i+1}-title',35)
 if i==0:body+=text('[Speaker] / [Date]',64,330,40,'subtitle','speaker',38)+rect(64,400,1168,200,'#A7B59E')+text(line,96,515,55,'display')
 if i==1:
  for j in range(3):
   x=64+j*399;body+=rect(x,355,370,260,'#A7B59E')+text(f'[Point {j+1}].',x+25,418,38,'subtitle',f'point-{j+1}',18)+text('[Supporting fact]',x+25,480,26,'',f'fact-{j+1}',19)
 if i==2:body+=rect(64,320,1168,325,'#A7B59E')+text('[Add a real product screenshot]',96,398,35,'subtitle','screenshot-note',50)
 if i==3:body+=rect(64,320,1168,255,'#A7B59E')+text('[Insert verified data and units]',96,392,36,'subtitle','data-note',50)+text('[Source and date]',64,633,28,'','data-source',60)
 if i==4:body+=text('[Next step]',64,355,44,'subtitle','next-step',48)+text('[Verified contact or link]',64,437,30,'','contact',60)
 body+=text(f'{i+1} / 5',1150,690,20,'label')
 slides.append(frame(body,'Presentation slide '+str(i+1),1296,729))
(out/'slides.html').write_text(editor('Presentation slides',slides,'slides'))
body=logo()+rect(64,185,952,560,'#A7B59E')+text('[Your name].',100,320,75,'display','name',26)+text('[Your role]',100,407,44,'subtitle','role',35)+text('[Verified email]',100,507,32,'','email',40)+text('[Verified website]',100,574,32,'','website',40)+text(line,100,680,25,'label')
(out/'signature.html').write_text(editor('Email signature',[frame(body,'Email signature',1080,810)],'signature','Export email HTML to get an editable table signature with your details. Browser/PDF preview uses the supplied fonts. Email clients may substitute fonts or reject embedded SVG/data images; check the signature in your mail application.'))

(out/'palette.css').write_text(':root {\n'+''.join(f'  --mojo-{n}: {v};\n' for n,v in [('mojo-orange','#F06A21'),('warm-cream','#FFF8F0'),('soft-ink','#1D1B18'),('sage','#A7B59E'),('forest','#35594A')])+'}\n')
for f in brand['fonts']:shutil.copyfile(root/'public'/f['source'].lstrip('/'),root/'public'/f['path'].lstrip('/'))
shutil.copyfile(root/'public/brand/mojo-cat-transparent.svg',out/'mojo-cat-transparent.svg')
shutil.copyfile(root/'public/workspace-scene.svg',out/'workspace-scene.svg')
shutil.copyfile(root/'node_modules/@fontsource/inter/LICENSE',out/'Inter-LICENSE.txt')
(out/'Font-usage.txt').write_text('Mojo font usage\n'+''.join(f"{f['name']} v{f['version']}: {f['role']}. Supplied TTF.\n" for f in brand['fonts'])+'Browser template editors embed the actual Draft, Refined, and Inter regular files; SVG editors may ignore embedded fonts, so install the supplied fonts and verify exports. Email font support varies by client. Custom licence documents and separate WOFF/WOFF2 sources have not been supplied. Inter licence is included.\n')
(out/'README.txt').write_text('Mojo Toolkit — resource refinement\n'+''.join(f'{k}: {v}.\n' for k,v in statuses.items())+brand['contact']+'\nHTML editors: open locally, change the labelled fields, Save edited HTML, or Print / save as PDF. Fonts and original cat are embedded. SVG sources: edit text in a compatible vector editor; install the supplied TTFs if embedded fonts are ignored. Email signature font support varies by mail client. Preview PNGs are rendered from the actual source files.\nQuick Guide: full-section links work when served by the running toolkit; standalone font downloads refer to files in this folder.\n')
subprocess.run(['node','scripts/guide.mjs'],cwd=root,check=True)
with zipfile.ZipFile(out/'mojo-fonts.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in brand['fonts']:z.write(root/'public'/f['path'].lstrip('/'),Path(f['path']).name)
 for name in ['Font-usage.txt','Inter-LICENSE.txt']:z.write(out/name,name)
# The preview renderer refreshes this pack after adding its actual-file previews.
with zipfile.ZipFile(out/'mojo-starter-pack.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file() and p.name!='mojo-starter-pack.zip':z.write(p,str(p.relative_to(out)))
print('Generated eight editable templates, six SVG sources, guide and font archives.')
