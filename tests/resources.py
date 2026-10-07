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
            retired=['social','demo','spotlight','recruitment','campus','partnership','slides','signature']
            for old in retired:
                for extension in ['html','svg']:
                    assert old+'.'+extension not in pack.namelist()
                    assert not (downloads/(old+'.'+extension)).exists()
                assert 'previews/'+old+'.png' not in pack.namelist()
                assert not (root/'public/previews'/(old+'.png')).exists()
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

assert len(json.loads((root/'src/templates.json').read_text()))==5
assert brand['contact'] in guide and brand['contact'] in readme
assert 'Download cat SVG' in guide and 'cat only' in guide
assert 'Under development' in guide
print('PASS: five category references, precise cat label and contact; retired templates and previews absent from files and pack.')
