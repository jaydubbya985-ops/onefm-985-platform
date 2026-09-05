"""Render public/apple-touch-icon.png from Direction A tokens. 180x180 iOS default."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK = (16, 16, 16)
PAPER = (242, 242, 242)
BLUE = (27, 69, 143)
RED = (229, 22, 54)
SIZE = 180


def main() -> None:
    im = Image.new('RGB', (SIZE, SIZE), INK)
    d = ImageDraw.Draw(im)
    s = SIZE / 64
    d.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=int(14 * s), fill=INK)
    cx, cy, r = 32 * s, 26 * s, 14 * s
    stroke = max(2, round(2.5 * s))
    box = max(8, int(r - stroke * 2))
    d.rectangle((cx - box, cy - box, cx + box, cy + box), fill=RED)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=PAPER, width=stroke)
    d.line((32 * s, 40 * s, 32 * s, 52 * s), fill=PAPER, width=stroke)
    d.line((24 * s, 52 * s, 40 * s, 52 * s), fill=BLUE, width=max(4, round(3 * s)))
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(12 * s))
    except OSError:
        font = ImageFont.load_default()
    bbox = d.textbbox((0, 0), 'FM', font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((32 * s - tw / 2, 26 * s - th / 2), 'FM', fill=PAPER, font=font)
    out = Path('public/apple-touch-icon.png')
    im.save(out, format='PNG')
    print(f'wrote {out} ({out.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
