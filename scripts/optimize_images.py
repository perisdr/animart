"""Regenerate AI Crossover previews and optimized downloads locally with Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]

def encode(source, destination, size=None):
    with Image.open(source) as opened:
        profile = opened.info.get('icc_profile')
        image = ImageOps.exif_transpose(opened).convert('RGB')
        if size and image.size != size:
            image = image.resize(size, Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        options = {'icc_profile': profile} if profile else {}
        image.save(destination, 'WEBP', quality=95, method=6, **options)
        with Image.open(destination) as check:
            assert check.size == image.size and check.format == 'WEBP'
        return {'path': destination.relative_to(ROOT).as_posix(), 'width': image.width,
                'height': image.height, 'bytes': destination.stat().st_size}

def main():
    catalogue = ROOT / 'data/wallpapers.json'
    records = json.loads(catalogue.read_text(encoding='utf-8'))
    audit = []
    for record in records:
        originals = [d for d in record['downloads'] if d['label'].startswith('Uncompressed')]
        folder = (ROOT / originals[0]['path']).parent / 'tinified'
        def preview_source(size):
            return ROOT / min(originals, key=lambda d: (abs(d['width']/d['height'] - size[0]/size[1]), d['width']))['path']
        outputs = []
        old_preview = ROOT / record['preview']
        with Image.open(old_preview) as im:
            size = im.size
        source = preview_source(size)
        destination = folder / (source.stem.rsplit(' X ', 1)[0] + f' X {size[0]}x{size[1]}.webp')
        result = encode(source, destination, size)
        record['preview'] = result['path']
        outputs.append(result)
        for field, old in record['webImage'].items():
            size = (old['width'], old['height'])
            destination = folder / f"{record['id']}-{size[0]}.webp"
            record['webImage'][field] = encode(preview_source(size), destination, size)
            outputs.append(record['webImage'][field])
        for download in record['downloads']:
            if download['label'].startswith('Uncompressed') or download['format'] == 'png':
                continue
            source = ROOT / next(d['path'] for d in originals if d['width'] == download['width'] and d['height'] == download['height'])
            destination = folder / (source.stem + '.webp')
            result = encode(source, destination)
            download.update(result, format='webp', label=f"Optimized WebP {result['height']}p")
            outputs.append(result)
        audit.append({'id': record['id'], 'encoder': 'Pillow WebP', 'quality': 95, 'outputs': outputs})
        print(record['id'], flush=True)
    catalogue.write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT / 'docs/image-optimization.json').write_text(json.dumps(audit, indent=2)+'\n', encoding='utf-8')
    from optimize_png import main as optimize_png
    optimize_png()

if __name__ == '__main__':
    main()
