"""Fit volumes to original fruit cutouts. Generate polar outlines and normalized height profiles."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter

root = Path(__file__).resolve().parents[1]
shapes = {}
for file in sorted((root / "public/flavors/layers").glob("*-[123].webp")):
    rgba = np.asarray(Image.open(file).convert("RGBA"))
    mask = rgba[:,:,3] > 95
    distance = distance_transform_edt(mask)
    cy, cx = np.unravel_index(np.argmax(gaussian_filter(distance, 3)), mask.shape)
    h, w = mask.shape
    spokes = []
    for angle in np.linspace(0, 2*np.pi, 96, endpoint=False):
        r = np.arange(max(w,h)*1.5)
        x = np.rint(cx + np.cos(angle)*r).astype(int)
        y = np.rint(cy + np.sin(angle)*r).astype(int)
        valid = (x>=0)&(x<w)&(y>=0)&(y<h)
        end = np.where(mask[y[valid], x[valid]])[0].max()
        spokes.append([int(x[end]),int(y[end])])
    shapes[file.stem] = dict(size=[w,h], center=[int(cx),int(cy)], outline=spokes)
(root / "src/3d/fruit-outlines.json").write_text(json.dumps(shapes, separators=(",",":"))+"\n")
