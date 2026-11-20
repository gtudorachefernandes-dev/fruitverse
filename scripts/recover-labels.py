"""Recover visible cylindrical print from approved photography. Requires Pillow and NumPy."""
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
# Cylinder centre at top and bottom, radius, and print limits after roll correction.
fits = {"strawberry": (610, 611, 178, 190, 1176), "mango": (577, 594, 183, 186, 1145),
        "blueberry": (558, 597, 176, 195, 1140), "lime": (567, 613, 175, 198, 1158)}
for name, (top, bottom, radius, start, end) in fits.items():
    photo = Image.open(root / f"public/flavors/layers/{name}-base.webp")
    pixels = np.asarray(photo.rotate(15, Image.Resampling.BICUBIC, expand=True).convert("RGB"))
    height, width = 1024, 1024
    v = np.linspace(0, 1, height)[:, None]
    angle = np.linspace(-np.pi, np.pi, width)[None, :]
    # Only the central arc is observable. Fade oblique margins into unprinted rear stock.
    centre = top + (bottom-top)*v
    y = np.clip(start + (end-start)*v + 13*np.cos(angle), start, end).astype(int)
    x = (centre + radius*np.sin(np.clip(angle, -1.25, 1.25))).astype(int)
    front = pixels[y, x].astype(float)
    stock = np.median(pixels[start+18:start+46, int(top)-74:int(top)+74], axis=(0,1))
    blend = np.clip((1.32-np.abs(angle))/.24, 0, 1)[...,None]
    atlas = front*blend + stock*(1-blend)
    Image.fromarray(atlas.astype("uint8")).save(root / f"src/labels/{name}.webp", quality=92)
