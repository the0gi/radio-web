"""Render the existing favicon mark as opaque Apple Home Screen PNGs.

Requires Pillow. iOS supplies the rounded icon mask itself.
"""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
scale = 12
icon = Image.new('RGB', (64 * scale, 64 * scale), '#262626')
draw = ImageDraw.Draw(icon)
for x, top, bottom in [(20, 27, 37), (32, 17, 47), (44, 27, 37)]:
    radius = 2.5 * scale
    draw.rounded_rectangle(
        ((x * scale - radius, top * scale - radius),
         (x * scale + radius, bottom * scale + radius)),
        radius=radius,
        fill='#ffffff',
    )
for size, filename in [(120, 'apple-touch-icon-120x120.png'),
                       (180, 'apple-touch-icon.png')]:
    icon.resize((size, size), Image.Resampling.LANCZOS).save(root / 'public' / filename)
