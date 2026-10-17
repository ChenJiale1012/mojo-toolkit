"""Rename only custom-font naming metadata; keep old URLs as byte-identical aliases."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
RENAMES = json.loads((ROOT / 'scripts/font-renames.json').read_text())


def verify_preserved(font, spec):
    assert set(font.reader.keys()) == set(spec['preservedTables']) | {'name'}
    for tag, expected in spec['preservedTables'].items():
        data = font.reader[tag]
        if tag == 'head':
            # The SFNT checksum necessarily changes when the name table changes.
            data = data[:8] + b'\0' * 4 + data[12:]
        assert sha256(data).hexdigest() == expected, (spec['family'], tag)
    for record in spec['preservedNames']:
        name = font['name'].getName(record['id'], record['platform'], record['encoding'], record['language'])
        assert name and name.toUnicode() == record['text'], record


def rename_fonts():
    for spec in RENAMES:
        canonical = ROOT / 'public/fonts' / spec['filename']
        source = canonical if canonical.exists() else ROOT / 'public/fonts' / spec['legacyFilename']
        font = TTFont(source, lazy=True, recalcTimestamp=False, recalcBBoxes=False)
        verify_preserved(font, spec)
        family = spec['family']
        postscript = family.replace(' ', '') + '-Regular'
        values = {1: family, 2: 'Regular', 3: f"{postscript};{spec['version']}",
                  4: family + ' Regular', 6: postscript, 16: family, 17: 'Regular'}
        identities = {(n.platformID, n.platEncID, n.langID) for n in font['name'].names if n.nameID == 1}
        for platform, encoding, language in identities:
            for name_id, value in values.items():
                font['name'].setName(value, name_id, platform, encoding, language)
        for record in font['name'].names:
            if record.nameID == 10:
                text = record.toUnicode().replace('Draft 0.2', 'Version 0.2').replace('Refined pixel serif Regular', 'Mojo Serif Regular')
                font['name'].setName(text, 10, record.platformID, record.platEncID, record.langID)
        output = BytesIO()
        font.save(output, reorderTables=False)
        data = output.getvalue()
        renamed = TTFont(BytesIO(data), lazy=True, recalcTimestamp=False, recalcBBoxes=False)
        verify_preserved(renamed, spec)
        for folder in ['fonts', 'downloads']:
            for filename in [spec['filename'], spec['legacyFilename']]:
                (ROOT / 'public' / folder / filename).write_bytes(data)
        print(f"Renamed {family}; preserved all non-naming tables and original copyright/version records.")


if __name__ == '__main__':
    rename_fonts()
