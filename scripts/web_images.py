"""Build web-only derivatives with Pillow; leave downloads and source images intact."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]

def save_webp(source, destination, width, quality=85):
    with Image.open(ROOT / source) as image:
        image = ImageOps.exif_transpose(image).convert('RGBA' if 'A' in image.getbands() else 'RGB')
        image.thumbnail((width, width), Image.Resampling.LANCZOS)
        target = ROOT / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, 'WEBP', quality=quality, method=6)
        return {'path':destination, 'width':image.width, 'height':image.height, 'bytes':target.stat().st_size}

def main():
    catalogue = ROOT / 'data/wallpapers.json'
    records = json.loads(catalogue.read_text(encoding='utf-8'))
    audit = []
    logo = 'Assets/branding/animart-on-dark-v1.png'
    result = save_webp(logo, 'Assets/branding/animart-on-dark-v1.webp', 378, 90)
    audit.append({'source':logo, 'beforeBytes':(ROOT / logo).stat().st_size, 'outputs':[result]})
    for record in records:
        source = next(d['path'] for d in record['downloads'] if d['label']=='Uncompressed 1080p')
        outputs = [save_webp(source, f"previews/web/{record['id']}-{width}.webp", width) for width in (320,1280,1920)]
        record['webImage'] = {'thumbnail':outputs[0], 'medium':outputs[1], 'large':outputs[2]}
        old = next(d for d in record['downloads'] if d['label']=='Tinified 1080p')
        audit.append({'source':source, 'beforeBytes':old['bytes'], 'outputs':outputs})
    catalogue.write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ROOT / 'docs/image-optimization.json').write_text(json.dumps(audit, indent=2)+'\n', encoding='utf-8')
    print('Logo:',audit[0]['beforeBytes'],'->',audit[0]['outputs'][0]['bytes'])
    print('Viewer totals:',sum(r['beforeBytes'] for r in audit[1:]),'->',sum(r['outputs'][-1]['bytes'] for r in audit[1:]))

if __name__ == '__main__':
    main()
