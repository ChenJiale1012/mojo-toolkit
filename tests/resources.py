"""Check shipped archives against the supplied font bytes and shared statuses."""
import json
import base64
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
brand = json.loads((root / 'src/brand-content.json').read_text())
downloads = root / 'public/downloads'
for archive in ['mojo-fonts.zip', 'mojo-starter-pack.zip']:
    with zipfile.ZipFile(downloads / archive) as pack:
        assert pack.testzip() is None, archive
        for font in brand['fonts']:
            supplied = (root / 'public' / font['source'].lstrip('/')).read_bytes()
            assert pack.read(Path(font['path']).name) == supplied, (archive, font['name'])
            assert (root / 'public' / font['path'].lstrip('/')).read_bytes() == supplied
        for name in ['Inter-LICENSE.txt', 'Font-usage.txt']:
            assert pack.read(name) == (downloads / name).read_bytes(), (archive, name)
        if archive == 'mojo-starter-pack.zip':
            for name in ['README.txt', 'quick-guide.html', 'palette.css', 'mojo-cat-transparent.svg', 'mojo-fonts.zip']:
                assert pack.read(name) == (downloads / name).read_bytes(), name
            for template in json.loads((root / 'src/templates.json').read_text()):
                name = template['id'] + '.html'
                assert pack.read(name) == (downloads / name).read_bytes(), name
                image = template['id'] + '.png'
                assert pack.read('previews/' + image) == (root / 'public/previews' / image).read_bytes(), image
            assert pack.read('mojo-cat-transparent.svg') == (root / 'public/brand/mojo-cat-transparent.svg').read_bytes()

guide = (downloads / 'quick-guide.html').read_text()
readme = (downloads / 'README.txt').read_text()
for value in brand['statuses'].values():
    assert value in guide and value in readme, value
for stale in ['palette approved', 'approved colour values', 'one quarter', 'minimum 32']:
    assert stale not in (guide + readme).lower(), stale
for colour in ['#F06A21', '#FFF8F0', '#1D1B18', '#A7B59E', '#35594A']:
    assert colour in guide
print('PASS: four unchanged font files, Inter licence, guide/status data, original cat and palette in both valid archives.')

for template in json.loads((root / 'src/templates.json').read_text()):
    content = (downloads / (template['id'] + '.html')).read_text()
    for font in brand['fonts']:
        if font['id'] == 'inter-italic':
            continue
        encoded = base64.b64encode((root / 'public' / font['source'].lstrip('/')).read_bytes()).decode()
        assert encoded in content, (template['id'], font['name'])
    assert 'data-field=' in content
    if template.get('format') != 'HTML':
        assert (downloads / (template['id'] + '.svg')).read_text() in content, template['id']
    for stale in ['Unlock your potential', 'Build the future', 'A little magic', 'palette approved']:
        assert stale.lower() not in content.lower(), (template['id'], stale)
print('PASS: actual embedded font bytes and editable fields in eight templates; archived files and previews match.')
