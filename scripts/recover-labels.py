"""Recover visible cylindrical print from approved photography. Requires Pillow and NumPy."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("flavors", nargs="*")
selection = parser.parse_args().flavors

root = Path(__file__).resolve().parents[1]
# Cylinder centre at top and bottom, radius, and print limits after roll correction.
fits = {"strawberry": (610, 611, 178, 190, 1176), "mango": (577, 594, 183, 186, 1145),
        "blueberry": (558, 597, 176, 195, 1140), "lime": (567, 613, 175, 198, 1158)}
for name, (top, bottom, radius, start, end) in fits.items():
    if selection and name not in selection:
        continue
    photo = Image.open(root / f"public/flavors/layers/{name}-base.webp")
    pixels = np.asarray(photo.rotate(15, Image.Resampling.BICUBIC, expand=True).convert("RGB"))
    height, width = 1024, 2048
    v = np.linspace(0, 1, height)[:, None]
    angle = np.linspace(-np.pi, np.pi, width)[None, :]
    # Only the central arc is observable. Fade oblique margins into unprinted rear stock.
    centre = top + (bottom-top)*v
    y = np.clip(start + (end-start)*v + 13*np.cos(angle), start, end).astype(int)
    x = (centre + radius*np.sin(np.clip(angle, -1.25, 1.25))).astype(int)
    front = pixels[y, x].astype(float)
    stock = np.median(pixels[start+18:start+46, int(top)-74:int(top)+74], axis=(0,1))
    blend = np.clip((1.32-np.abs(angle))/.24, 0, 1)[...,None]
    atlas = front*blend + np.clip(stock*1.22, 0, 255)*(1-blend)
    # Lay out the back across the UV seam, then roll it into place.
    rng = np.random.default_rng(412)
    grain = rng.normal(0, 1.7, (height, width, 1))
    image = Image.fromarray(np.clip(atlas + grain*(1-blend), 0, 255).astype("uint8")).convert("RGBA")
    image = Image.fromarray(np.roll(np.asarray(image), width//2, axis=1))
    draw = ImageDraw.Draw(image)
    title = {"strawberry":"STRAWBERRY RUSH","mango":"MANGO SUNSET","blueberry":"BLUEBERRY GALAXY","lime":"LIME ENERGY"}[name]
    ink = (250,235,203,255)
    for x in [width//4, 3*width//4]:
        fruit = Image.open(root / f"public/flavors/layers/{name}-{1 if x<width//2 else 2}.webp").convert("RGBA")
        fruit.thumbnail((310,425),Image.Resampling.LANCZOS)
        image.alpha_composite(fruit,(x-fruit.width//2,(385 if x<width//2 else 515)-fruit.height//3))
    # A screened fruit medallion extends the side illustration onto the back panel.
    medallion = Image.open(root / f"public/flavors/layers/{name}-1.webp").convert("RGBA")
    medallion.thumbnail((168,176),Image.Resampling.LANCZOS)
    medallion.putalpha(medallion.getchannel("A").point(lambda alpha: round(alpha*.77)))
    image.alpha_composite(medallion,(width//2-medallion.width//2,84))
    for y in [290,303,692,705]:
        draw.line((840,y,1208,y), fill=ink,width=2)
    for text,y,size in [("FRUITVERSE",389,58),("BEYOND THE FLAVOR",460,32),(title,578,26)]:
        font = ImageFont.truetype("DejaVuSansCondensed-Bold.ttf",size)
        draw.text((width//2,y),text,fill=ink,font=font,anchor="mm")
    Image.fromarray(np.roll(np.asarray(image.convert("RGB")),width//2,axis=1)).save(root / f"src/labels/{name}.webp", quality=92)
