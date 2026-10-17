"""Check shipped archives against the supplied font bytes and shared statuses."""
import json
import base64
import zipfile
from hashlib import sha256
from fontTools.ttLib import TTFont
from pathlib import Path

root = Path(__file__).resolve().parents[1]
brand = json.loads((root / 'src/brand-content.json').read_text())
downloads = root / 'public/downloads'
renames = json.loads((root / 'scripts/font-renames.json').read_text())
for spec in renames:
    path = root / 'public/fonts' / spec['filename']
    font = TTFont(path, lazy=True, recalcTimestamp=False, recalcBBoxes=False)
    # Compare raw SFNT tables with the original supplied fonts, independently
    # of FontTools' naming API and without reserializing outlines or metrics.
    assert set(font.reader.keys()) == set(spec['preservedTables']) | {'name'}
    for tag, expected in spec['preservedTables'].items():
        data = font.reader[tag]
        if tag == 'head':
            data = data[:8] + b'\0' * 4 + data[12:]
        assert sha256(data).hexdigest() == expected, (spec['family'], tag)
    expected_names = {1: spec['family'], 2: 'Regular', 3: spec['family'].replace(' ', '') + '-Regular;' + spec['version'],
                      4: spec['family'] + ' Regular', 6: spec['family'].replace(' ', '') + '-Regular',
                      16: spec['family'], 17: 'Regular'}
    for name_id, expected in expected_names.items():
        records = [n for n in font['name'].names if n.nameID == name_id]
        assert records and {n.toUnicode() for n in records} == {expected}, (spec['family'], name_id)
    for record in spec['preservedNames']:
        assert font['name'].getName(record['id'], record['platform'], record['encoding'], record['language']).toUnicode() == record['text']
    for folder in ['fonts', 'downloads']:
        for filename in [spec['filename'], spec['legacyFilename']]:
            assert (root / 'public' / folder / filename).read_bytes() == path.read_bytes(), filename
print('PASS: installed Mojo Pixel/Serif naming metadata, byte-identical original non-naming tables, copyright/version records and legacy URL aliases.')
for archive in ['mojo-fonts.zip', 'mojo-starter-pack.zip']:
    with zipfile.ZipFile(downloads / archive) as pack:
        assert pack.testzip() is None, archive
        assert not {f['legacyFilename'] for f in renames} & set(pack.namelist()), archive
        for font in brand['fonts']:
            supplied = (root / 'public' / font['source'].lstrip('/')).read_bytes()
            assert pack.read(Path(font['path']).name) == supplied, (archive, font['name'])
            assert (root / 'public' / font['path'].lstrip('/')).read_bytes() == supplied
        for name in ['NunitoSans-OFL.txt', 'Font-usage.txt', 'NunitoSans-Variable.woff2', 'NunitoSans-Italic-Variable.woff2', 'NunitoSans-source.json']:
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
print('PASS: four current font files, Nunito Sans licence, guide/status data, original cat and palette in both valid archives.')

assert len(json.loads((root/'src/templates.json').read_text()))==5
assert brand['contact'] in guide and brand['contact'] in readme
assert 'Download cat SVG' in guide and 'cat only' in guide
assert 'Under development' in guide
print('PASS: five category references, precise cat label and contact; retired templates and previews absent from files and pack.')

# The downloadable vectors are byte-identical to the implemented cursor sources.
import xml.etree.ElementTree as ET
cursors=json.loads((root/'src/cursors.json').read_text())
with zipfile.ZipFile(downloads/'mojo-cursors.zip') as pack:
    assert pack.testzip() is None
    for cursor in cursors:
        path=root/'public'/cursor['path'].lstrip('/')
        assert pack.read(path.name)==path.read_bytes()
        assert (downloads/'cursors'/path.name).read_bytes()==path.read_bytes()
        svg=ET.fromstring(path.read_text())
        assert svg.attrib['width']==svg.attrib['height']==str(cursor['size'])
        assert 'viewBox' in svg.attrib
        assert all(e.tag.rsplit('}',1)[-1] not in ['image','script','foreignObject'] for e in svg.iter())
        assert str(cursor['hotspot'][0])+' '+str(cursor['hotspot'][1]) in pack.read('README.txt').decode()
with zipfile.ZipFile(downloads/'mojo-starter-pack.zip') as pack:
    assert pack.read('mojo-cursors.zip')==(downloads/'mojo-cursors.zip').read_bytes()
print('PASS: three genuine standalone cursor SVGs, exact runtime bytes, display sizes/hotspots/fallback README and bundled cursor ZIP.')

# The supplied icon ZIP, its extracted docs/assets and starter pack must agree.
icon_zip=downloads/'mojo-toolkit-favicon-cream.zip'
with zipfile.ZipFile(icon_zip) as supplied, zipfile.ZipFile(downloads/'mojo-starter-pack.zip') as starter:
    assert supplied.testzip() is None
    assert starter.read(icon_zip.name)==icon_zip.read_bytes()
    for name in supplied.namelist():
        assert starter.read('toolkit-icons/'+name)==supplied.read(name), name
        assert (downloads/'toolkit-icons'/name).read_bytes()==supplied.read(name), name
        if name.startswith('favicon'):
            assert (root/'public'/name).read_bytes()==supplied.read(name), name
    geometry=json.loads(supplied.read('geometry.json'))
    assert geometry['catSourceBounds']==[1189,1026]
    assert geometry['background']=='#FFF8F0' and geometry['canvas']==64
    assert geometry['catWidth']==.75*64 and geometry['cornerRadius']==.1875*64
    assert abs(geometry['catHeight']-.75*64*1026/1189)<1e-12
    assert geometry['marginHorizontal']==.125*64
    assert abs(geometry['marginVertical']-(64-geometry['catHeight'])/2)<1e-12
    doc=supplied.read('BRAND-GUIDELINES.md').decode()
    for formula in ['0.75 × S','0.75 × S × 1026 / 1189','0.125 × S','(S − cat height) / 2','0.1875 × S']:
        assert formula in doc, formula
for filename,alias in [('favicon-32.png','favicon.png'),('favicon-180.png','apple-touch-icon.png'),('favicon-192.png','icon-192.png'),('favicon-512.png','icon-512.png')]:
    assert (root/'public'/filename).read_bytes()==(root/'public/icons'/alias).read_bytes()
print('PASS: exact supplied cream icon ZIP/assets, source geometry, construction formulas, legacy aliases and starter-pack contents.')
