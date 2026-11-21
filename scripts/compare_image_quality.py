"""Create isolated Pillow compression samples; never replace catalogue assets."""
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.cache/image-quality-review'


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    report = []
    for title in ('Claymore', 'Naruto'):
        folder = ROOT / 'Assets' / title
        source = next(folder.glob('*Original.png'))
        with Image.open(source) as opened:
            original = ImageOps.exif_transpose(opened).convert('RGB')
        target = OUTPUT / title.lower()
        target.mkdir(exist_ok=True)
        entry = {'title': title, 'source': str(source.relative_to(ROOT)),
                 'nativeSize': list(original.size), 'samples': []}
        comparisons = {}
        for label, size in [('native', original.size), ('640', (640, 360)), ('1080p', (1920, 1080))]:
            # One resize from the original, before encoding. Exact existing sizes
            # allow comparison; 1080p is an upscale, not added source detail.
            reference = original.resize(size, Image.Resampling.LANCZOS)
            reference.save(target / f'{label}-reference.png')
            variants = [('Original resized', reference)]
            if label != 'native':
                suffix = '640x360.webp' if label == '640' else '1080p.png'
                existing = next((folder / 'tinified').glob('*' + suffix))
                with Image.open(existing) as opened:
                    tinified = opened.convert('RGB')
                assert tinified.size == size
                variants.append(('Current Tinified', tinified))
                entry['samples'].append({'size': label, 'encoding': 'current-tinified',
                                         'bytes': existing.stat().st_size})
            for encoding, options in [('q90', {'quality': 90}), ('q95', {'quality': 95}),
                                      ('lossless', {'lossless': True})]:
                path = target / f'{label}-{encoding}.webp'
                reference.save(path, 'WEBP', method=6, **options)
                with Image.open(path) as opened:
                    decoded = opened.convert('RGB')
                assert decoded.size == size
                difference = ImageChops.difference(reference, decoded)
                mae = sum(ImageStat.Stat(difference).mean) / 3
                if encoding == 'lossless':
                    assert difference.getbbox() is None
                entry['samples'].append({'size': label, 'encoding': encoding,
                                         'bytes': path.stat().st_size,
                                         'meanAbsoluteChannelError': round(mae, 4)})
                variants.append((encoding, decoded))
            comparisons[label] = variants
        # Two fixed detail regions, all displayed at 2x nearest-neighbour so
        # presentation adds no smoothing that could hide encoding differences.
        variants = comparisons['1080p']
        crop_size = 240
        sheet = Image.new('RGB', (len(variants) * 480, 1040), '#f4efe5')
        draw = ImageDraw.Draw(sheet)
        for column, (label, sample) in enumerate(variants):
            draw.text((column * 480 + 12, 12), f'{title}: {label}', fill='#211e1b')
            for row, (cx, cy) in enumerate([(0.35, 0.4), (0.68, 0.42)]):
                x, y = int(sample.width * cx) - crop_size // 2, int(sample.height * cy) - crop_size // 2
                crop = sample.crop((x, y, x + crop_size, y + crop_size))
                sheet.paste(crop.resize((480, 480), Image.Resampling.NEAREST), (column * 480, 40 + row * 500))
        sheet.save(target / 'comparison.png')
        report.append(entry)
    (OUTPUT / 'results.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
