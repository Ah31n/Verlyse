// Phase 31B — board & implementation composition analyzer (no vision needed).
// Crops the right ~13% annotation rail, then reports per-image:
//   - size
//   - row profiles: ivory (paper), brass/gold, bright text, dim ghost
//   - large ivory blobs (plates/cards) with x/y extents
//   - band classification
// Outputs JSON for both boards and implementation captures for direct comparison.
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const CROP = 0.87 // rail is the right ~13%
const OUT = path.resolve('audit/phase31b')
fs.mkdirSync(OUT, { recursive: true })

const usage = `usage: node audit/phase31b-analyze.mjs <json|blobs|bands> <image> [image...]`

function loadRGB(p) {
  // decode via python (PIL) into raw rgb, so we only need node stdlib
  const tmp = '/tmp/_ph31b.png'
  execSync(`python3 -c "from PIL import Image; im=Image.open(${JSON.stringify(p)}).convert('RGB'); im.save(${JSON.stringify(tmp)})"`)
  const buf = fs.readFileSync(tmp)
  // PNG decode not available in node stdlib — use python for everything instead
  throw new Error('use python path')
}

const [,, mode, ...images] = process.argv
if (!mode || !images.length) { console.log(usage); process.exit(1) }

// Delegate heavy lifting to a python script with the same interface.
const py = `
import json, sys
from PIL import Image
import numpy as np

CROP = 0.87
mode, imgs = sys.argv[1], json.loads(sys.argv[2])
out = {}
for p in imgs:
    a = np.asarray(Image.open(p).convert('RGB')).astype(int)
    h, w, _ = a.shape
    a = a[:, :int(w*CROP), :]
    h, w = a.shape[0], a.shape[1]
    R, G, B = a[:,:,0], a[:,:,1], a[:,:,2]
    iv = ((R>200)&(G>190)&(B>160)).astype(float)
    gold = ((R>120)&(R<215)&(G>85)&(G<200)&(B<140)).astype(float)
    bright = ((R>150)&(R<=210)&(G>140)&(G<=200)&(B>100)&(B<175)).astype(float)
    lum = a.mean(axis=2)
    rec = {'file': p, 'w': int(w), 'h': int(h),
           'ivory%': round(float(iv.mean()*100),2),
           'gold%': round(float(gold.mean()*100),2),
           'bright%': round(float(bright.mean()*100),2)}
    # row profile every ~5% height
    rows = []
    for y0 in range(0, h, max(1, h//40)):
        y1 = min(h, y0 + max(1, h//40))
        rows.append({'y%': round(y0/h*100,1),
                     'ivory': round(float(iv[y0:y1].mean()*100),2),
                     'gold': round(float(gold[y0:y1].mean()*100),2),
                     'bright': round(float(bright[y0:y1].mean()*100),2)})
    rec['rows'] = rows
    if mode == 'blobs':
        # contiguous ivory regions >= 4000 px
        from collections import deque
        mask = (iv > 0).astype(bool)
        visited = np.zeros_like(mask)
        blobs = []
        for y in range(h):
            for x in range(w):
                if mask[y,x] and not visited[y,x]:
                    q = deque([(y,x)]); visited[y,x]=True; size=0
                    minx=maxx=x; miny=maxy=y
                    while q:
                        cy,cx = q.popleft(); size+=1
                        minx=min(minx,cx); maxx=max(maxx,cx); miny=min(miny,cy); maxy=max(maxy,cy)
                        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                            ny,nx=cy+dy,cx+dx
                            if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not visited[ny,nx]:
                                visited[ny,nx]=True; q.append((ny,nx))
                    if size >= 4000:
                        blobs.append({'px': size, 'x%': [round(minx/w*100,1), round(maxx/w*100,1)],
                                      'y%': [round(miny/h*100,1), round(maxy/h*100,1)],
                                      'w%': round((maxx-minx)/w*100,1), 'h%': round((maxy-miny)/h*100,1)})
        rec['blobs'] = sorted(blobs, key=lambda b:-b['px'])
    out[p] = rec
print(json.dumps(out))
`
execSync(`python3 -c ${JSON.stringify(py)}`, { stdio: 'inherit' }) // placeholder; run python directly below
