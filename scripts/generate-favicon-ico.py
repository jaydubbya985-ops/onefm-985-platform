"""Render public/favicon.ico from Direction A tokens. Do not use leftover navy/gold."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK = (16, 16, 16)       # #101010
PAPER = (242, 242, 242)  # #F2F2F2
BLUE = (27, 69, 143)     # #1B458F
RED = (229, 22, 54)      # #E51636


def render(size: int) -> Image.Image:
    im = Image.new('RGB', (size, size), INK)
    d = ImageDraw.Draw(im)
    s = size / 64
    radius = max(1, int(14 * s))
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=INK)

    cx, cy, r = 32 * s, 26 * s, 14 * s
    stroke = max(1, round(2.5 * s))
    inner = max(2, r - stroke * 2)
    # Solid red disc drawn as a box so ICO frames keep exact #E51636
    # (ellipse downsample anti-aliases the mark away).
    box = max(3, int(inner))
    d.rectangle((cx - box, cy - box, cx + box, cy + box), fill=RED)
    d.ellipse(
        (cx - r, cy - r, cx + r, cy + r),
        outline=PAPER,
        width=stroke,
    )
    d.line((32 * s, 40 * s, 32 * s, 52 * s), fill=PAPER, width=stroke)
    d.line((24 * s, 52 * s, 40 * s, 52 * s), fill=BLUE, width=max(2, round(3 * s)))

    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', max(6, int(10 * s)))
    except OSError:
        font = ImageFont.load_default()
    text = 'FM'
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((32 * s - tw / 2, 26 * s - th / 2), text, fill=PAPER, font=font)
    return im


def ico_bytes(frames: list[Image.Image]) -> bytes:
    import io
    import struct

    count = len(frames)
    pngs: list[bytes] = []
    for frame in frames:
        buf = io.BytesIO()
        frame.save(buf, format='PNG')
        pngs.append(buf.getvalue())

    offset = 6 + 16 * count
    out = bytearray()
    out += struct.pack('<HHH', 0, 1, count)
    for frame, png in zip(frames, pngs):
        w, h = frame.size
        out += struct.pack('<BBBBHHII', w & 0xFF, h & 0xFF, 0, 0, 1, 32, len(png), offset)
        offset += len(png)
    for png in pngs:
        out += png
    return bytes(out)


def main() -> None:
    frames = [render(n) for n in (16, 32, 48)]
    out = Path('public/favicon.ico')
    out.write_bytes(ico_bytes(frames))
    print(f'wrote {out} ({out.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
