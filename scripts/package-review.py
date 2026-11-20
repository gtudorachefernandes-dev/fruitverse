import base64
import json
import mimetypes
import re
from zipfile import ZipFile, ZIP_DEFLATED
from pathlib import Path

dist = Path('dist')
out = Path('review/5.1/FRUITVERSE-5.1.zip')
def uri(data, mime):
    return f'data:{mime};base64,' + base64.b64encode(data).decode('ascii')
def asset(path):
    return uri(path.read_bytes(), mimetypes.guess_type(path)[0] or 'application/octet-stream')

html = (dist / 'index.html').read_text()
main_name = re.search(r'src="./assets/([^"]+\.js)"', html)[1]
css_file = dist / re.search(r'href="\./(assets/[^"]+\.css)"', html)[1]
css = re.sub(r'url\(\s*["\']?([^)"\']+)["\']?\s*\)', lambda m: 'url("' + asset(css_file.parent / m[1]) + '")', css_file.read_text())
images = {str(p.relative_to(dist)): asset(p) for p in (dist / 'flavors').rglob('*.webp')}
scripts = {}
modules = list((dist / 'assets').glob('*.js'))
for file in modules:
    source = file.read_text()
    for dependency in modules:
        source = source.replace('"' + './' + dependency.name + '"', '"fruitverse/' + dependency.name + '"')
        source = source.replace("'" + './' + dependency.name + "'", "'fruitverse/" + dependency.name + "'")
    if file.name == main_name:
        source, count = re.subn(r'`\./(flavors/[^\x60]+)`', r'__previewImages[`\1`]', source)
        assert count == 2, count
        source = 'const __previewImages=' + json.dumps(images, separators=(',', ':')) + ';\n' + source
        source = re.sub(r'__vite__mapDeps\(\[\d+(?:,\d+)*\]\)', '[]', source)
    scripts[f'fruitverse/{file.name}'] = uri(source.encode(), 'text/javascript')
tags = '<script type="importmap">' + json.dumps({'imports': scripts}, separators=(',', ':')) + '</script>\n'
tags += '<script type="module">import "fruitverse/' + main_name + '";</script>'
html = re.sub(r'<script type="module"[^>]+></script>', lambda _: tags, html)
html = re.sub(r'<link rel="stylesheet"[^>]+>', lambda _: '<style>' + css + '</style>', html)
html = re.sub(r'((?:src|href)=")\./(flavors/[^"]+|favicon\.png)"', lambda m: m[1] + (images[m[2]] if m[2] in images else asset(dist / m[2])) + '"', html)
assert not re.search(r'(src|href)="\./', html)
with ZipFile(out, "w", compression=ZIP_DEFLATED) as package:
    package.writestr("FRUITVERSE-5.1.html", html)
    package.write("review/LICENCAS.txt", "LICENCAS.txt")
    package.writestr("LEIA-ME.txt","Extraia o ZIP e abra FRUITVERSE-5.1.html no Chrome. GSAP: https://gsap.com/standard-license/")
print(f'{out} ({out.stat().st_size} bytes)')
