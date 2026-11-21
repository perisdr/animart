"""Add lossless full-colour PNG downloads. PNG has no lossy quality setting."""
import json
from pathlib import Path
from PIL import Image, ImageChops
ROOT = Path(__file__).resolve().parents[1]

def main():
    catalogue = ROOT / 'data/wallpapers.json'
    records = json.loads(catalogue.read_text(encoding='utf-8'))
    audit = []
    for record in records:
        downloads = []
        for height in (1080, 2160):
            original = next(d for d in record['downloads'] if d['height'] == height and d['label'].startswith('Uncompressed'))
            webp = next(d for d in record['downloads'] if d['height'] == height and d['format'] == 'webp')
            source = ROOT / original['path']
            target = source.parent / 'tinified' / source.name
            with Image.open(source) as image:
                image.load()
                image.save(target, 'PNG', optimize=True, compress_level=9)
                with Image.open(target) as check:
                    assert check.mode == image.mode and check.size == image.size
                    assert ImageChops.difference(image, check).getbbox() is None
                    assert check.info.get('icc_profile') == image.info.get('icc_profile')
            optimized = dict(original, label=f'Optimized PNG {height}p', path=target.relative_to(ROOT).as_posix(), bytes=target.stat().st_size)
            webp['label'] = f'Optimized WebP {height}p'
            downloads.extend([optimized, webp, original])
            audit.append({'source': original['path'], 'output': optimized['path'], 'sourceBytes': source.stat().st_size, 'bytes': optimized['bytes'], 'pixelIdentical': True})
        record['downloads'] = downloads
        print(record['id'], flush=True)
    catalogue.write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT/'docs/png-optimization.json').write_text(json.dumps(audit, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__':
    main()
