"""Build only the current supplied assets and reference downloads."""
from pathlib import Path
import json
import shutil
import subprocess
import zipfile
root=Path(__file__).resolve().parents[1]
out=root/'public/downloads';out.mkdir(exist_ok=True)
brand=json.loads((root/'src/brand-content.json').read_text())
# Remove retired template files and their previews so none can enter the packs.
retired=['social','demo','spotlight','recruitment','campus','partnership','slides','signature']
for name in retired:
 for extension in ['svg','html']:(out/(name+'.'+extension)).unlink(missing_ok=True)
 for folder in [root/'public/previews',out/'previews']:(folder/(name+'.png')).unlink(missing_ok=True)
(out/'palette.css').write_text(':root {\n'+''.join(f'  --mojo-{n}: {v};\n' for n,v in [('mojo-orange','#F06A21'),('warm-cream','#FFF8F0'),('soft-ink','#1D1B18'),('sage','#A7B59E'),('forest','#35594A')])+'}\n')
for font in brand['fonts']:shutil.copyfile(root/'public'/font['source'].lstrip('/'),root/'public'/font['path'].lstrip('/'))
shutil.copyfile(root/'public/brand/mojo-cat-transparent.svg',out/'mojo-cat-transparent.svg')
# The old diagram was a template-era resource, not either supplied illustration.
(out/'workspace-scene.svg').unlink(missing_ok=True)
shutil.copyfile(root/'node_modules/@fontsource/inter/LICENSE',out/'Inter-LICENSE.txt')
(out/'Font-usage.txt').write_text('Mojo font usage\n'+''.join(f"{f['name']} v{f['version']}: {f['role']}. Supplied TTF.\n" for f in brand['fonts'])+'Custom licence documents and separate WOFF/WOFF2 sources have not been supplied. Inter licence is included.\n')
(out/'README.txt').write_text('Mojo Toolkit — current brand resources\n'+''.join(f'{k}: {v}.\n' for k,v in brand['statuses'].items())+brand['contact']+'\nIncludes supplied fonts, Inter licence, original cat SVG, primary palette tokens and Quick Guide. The cat SVG does not contain a wordmark or combined logo. Templates are under development; this pack contains no templates.\nQuick Guide: full-section links work when served by the running toolkit; standalone downloads refer to files in this folder.\n')
subprocess.run(['node','scripts/guide.mjs'],cwd=root,check=True)
with zipfile.ZipFile(out/'mojo-fonts.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in brand['fonts']:z.write(root/'public'/f['path'].lstrip('/'),Path(f['path']).name)
 for name in ['Font-usage.txt','Inter-LICENSE.txt']:z.write(out/name,name)
with zipfile.ZipFile(out/'mojo-starter-pack.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file() and p.name!='mojo-starter-pack.zip':z.write(p,str(p.relative_to(out)))
print('Generated supplied assets, Quick Guide and archives; retired templates removed.')
