#!/usr/bin/env python3
"""Assemble theme-patched App.tsx and SakhaThreeScene.tsx from base64 parts."""
from pathlib import Path
import base64, json

root = Path(__file__).resolve().parent
src = root.parent / 'src'

for name in ('App.tsx', 'SakhaThreeScene.tsx'):
    meta = json.loads((root / f'{name}.meta.json').read_text())
    parts = []
    for i in range(meta['parts']):
        parts.append((root / f'{name}.part{i}.b64').read_text().strip())
    data = base64.b64decode(''.join(parts))
    out = src / name
    out.write_bytes(data)
    print(f'wrote {out} ({len(data)} bytes)')

print('Done. Run: npm run build')
