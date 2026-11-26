#!/usr/bin/env python3
# R392 · 后山落星坡：把 Codex 交的成品（ground.png / occ/ + occ.json / walk.png / points.json / star_core/）做成游戏用的文件。
# 用法：python3 tools/r392_build.py <成品文件夹>     （Codex 交了 成品v2 之后，对着新文件夹再跑一遍即可；位置坐标不变的话游戏脚本不用动）
# 产出：game/r392/g.webp（底图，缩到和后山崖顶同一比例 0.74）、game/r392/occ.webp（遮挡件图集）、game/r392/core.webp（星核四帧横条）、game/r392_data.js（碰撞格 + 件坐标 + 各点）
import sys, os, json
from PIL import Image, ImageFilter
import numpy as np
SRC = sys.argv[1]; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'game', 'r392'); os.makedirs(OUT, exist_ok=True)
Z = .74; CS = 16
g = Image.open(os.path.join(SRC, 'ground.png')).convert('RGB'); SW, SH = g.size
W, H = round(SW * Z), round(SH * Z)
g.resize((W, H), Image.LANCZOS).save(os.path.join(OUT, 'g.webp'), quality=90, method=6)
# ---- 碰撞：walk.png 白 = 能走。崖边往里收一圈（人不贴着崖沿走）----
walk = np.asarray(Image.open(os.path.join(SRC, 'walk.png')).convert('L')) > 127
# 天空 = 从图片四边连进来的黑色
from collections import deque
sky = np.zeros_like(walk, dtype=bool); q = deque()
for x in range(SW):
    for y in (0, SH - 1):
        if not walk[y, x] and not sky[y, x]: sky[y, x] = True; q.append((y, x))
for y in range(SH):
    for x in (0, SW - 1):
        if not walk[y, x] and not sky[y, x]: sky[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < SH and 0 <= nx < SW and not walk[ny, nx] and not sky[ny, nx]: sky[ny, nx] = True; q.append((ny, nx))
EDGE = int(os.environ.get('R392_EDGE', '26'))   # 崖边留白（底图像素）
skyim = Image.fromarray((sky * 255).astype('uint8')).filter(ImageFilter.MaxFilter(EDGE * 2 + 1))
near_sky = np.asarray(skyim) > 127
ok = walk & ~near_sky
cols, rows = -(-W // CS), -(-H // CS)
blocked = []
for r in range(rows):
    for c in range(cols):
        x0, y0, x1, y1 = int(c * CS / Z), int(r * CS / Z), min(SW, int((c + 1) * CS / Z) + 1), min(SH, int((r + 1) * CS / Z) + 1)
        cell = ok[y0:y1, x0:x1]
        blocked.append('0' if cell.size and cell.mean() >= .55 else '1')
# ---- 遮挡件：缩到 0.74，打成一张图集 ----
occ = json.load(open(os.path.join(SRC, 'occ.json'))); pts = json.load(open(os.path.join(SRC, 'points.json')))
core = pts['star_core_animation']
def is_core(o): return abs(o['x'] + o['w'] / 2 - (core['x'] + core['w'] / 2)) < 40 and abs(o['foot'] - core['foot']) < 6
items = []
for o in occ:
    if is_core(o): continue   # 星核用四帧动画那一份
    im = Image.open(os.path.join(SRC, 'occ', o['file'])).convert('RGBA')
    w, h = max(1, round(o['w'] * Z)), max(1, round(o['h'] * Z))
    items.append((o, im.resize((w, h), Image.LANCZOS), w, h))
AW = 1024; x = y = rowh = 0; place = []
for o, im, w, h in sorted(items, key=lambda t: -t[3]):
    if x + w + 2 > AW: x = 0; y += rowh + 2; rowh = 0
    place.append((o, im, x, y, w, h)); x += w + 2; rowh = max(rowh, h)
AH = y + rowh
atlas = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))
OCC = []
for o, im, ax, ay, w, h in place:
    atlas.paste(im, (ax, ay))
    OCC.append([round(o['x'] * Z, 1), round(o['y'] * Z, 1), w, h, round(o['foot'] * Z, 1), ax, ay])
OCC.sort(key=lambda a: a[4])
atlas.save(os.path.join(OUT, 'occ.webp'), quality=92, method=6)
# ---- 星核四帧 ----
fr = sorted(f for f in os.listdir(os.path.join(SRC, 'star_core')) if f.endswith('.png'))
cw, ch = round(core['w'] * Z), round(core['h'] * Z)
strip = Image.new('RGBA', (cw * len(fr), ch), (0, 0, 0, 0))
for i, f in enumerate(fr): strip.paste(Image.open(os.path.join(SRC, 'star_core', f)).convert('RGBA').resize((cw, ch), Image.LANCZOS), (i * cw, 0))
strip.save(os.path.join(OUT, 'core.webp'), quality=94, method=6)
P = lambda p: [round(p['x'] * Z), round(p['y'] * Z)]
data = { 'w': W, 'h': H, 'cs': CS, 'cols': cols, 'rows': rows, 'blocked': ''.join(blocked), 'occ': OCC,
  'core': { 'x': round(core['x'] * Z, 1), 'y': round(core['y'] * Z, 1), 'w': cw, 'h': ch, 'foot': round(core['foot'] * Z, 1), 'n': len(fr), 'ms': core.get('frame_ms', 200) },
  'tp': P(pts['teleport']), 'boss': P(pts['boss']), 'chests': {k: P(v) for k, v in pts['chests'].items()}, 'spawns': [P(v) for v in pts['monster_spawns']], 'crystals': [P(v) for v in pts['spirit_crystals']] }
open(os.path.join(ROOT, 'game', 'r392_data.js'), 'w').write('// R392 · 后山落星坡的地图数据（tools/r392_build.py 生成，别手改）\nwindow.R392_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
for f in ('g.webp', 'occ.webp', 'core.webp'): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
print('world', W, H, 'grid', cols, rows, 'occ', len(OCC), 'atlas', AW, AH, 'walkable cells', blocked.count('0'))
