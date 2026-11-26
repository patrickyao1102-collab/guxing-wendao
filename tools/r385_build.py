#!/usr/bin/env python3
# R385 · 玄天城衣饰三铺内景（重做版）：把 Codex 交的拆件（ground.png / 单件/1x/*.png / layout.json）做成游戏用的文件。
# 用法：python3 tools/r385_build.py <R385_三铺内景重做 文件夹>
# 产出：game/r385/<cy|cf|yz>/g.webp + o00.webp…（单件）、game/r385_data.js（碰撞格、单件坐标、出口、落脚点、掌柜脚点）
import sys, os, json
from PIL import Image
SRC = sys.argv[1]; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); CS = 16
SHOPS = {'cy': '成衣铺_锦云坊', 'cf': '裁缝铺_裁月记', 'yz': '胭脂铺_点绛铺'}
DATA = {}; total = 0
for k, d in SHOPS.items():
    L = json.load(open(os.path.join(SRC, d, 'layout.json'))); W, H = L['canvas']; out = os.path.join(ROOT, 'game', 'r385', k); os.makedirs(out, exist_ok=True)
    Image.open(os.path.join(SRC, d, L['background'])).convert('RGB').save(os.path.join(out, 'g.webp'), quality=90, method=6); total += os.path.getsize(os.path.join(out, 'g.webp'))
    cols, rows = -(-W // CS), -(-H // CS)
    xs = [p[0] for p in L['walkable']['polygon']]; ys = [p[1] for p in L['walkable']['polygon']]; x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    rects = [b['rect'] for b in L['blocking_rects']]
    def frac(c, r):   # 这一格有多少落在不能走的地方
        n = t = 0
        for fy in (.2, .5, .8):
            for fx in (.2, .5, .8):
                x, y = (c + fx) * CS, (r + fy) * CS; t += 1
                if x < x0 or x >= x1 or y < y0 or y > y1 or any(a <= x < a + w and b <= y < b + h for a, b, w, h in rects): n += 1
        return n / t
    blocked = ''.join('1' if frac(c, r) >= .45 else '0' for r in range(rows) for c in range(cols))
    objs = []
    for i, o in enumerate(sorted(L['objects'], key=lambda o: o['sy'])):
        f = 'o%02d' % i; im = Image.open(os.path.join(SRC, d, o['file'])).convert('RGBA'); assert im.size == (o['w'], o['h']), (o['file'], im.size)
        im.save(os.path.join(out, f + '.webp'), quality=92, method=6); total += os.path.getsize(os.path.join(out, f + '.webp'))
        objs.append({'f': f, 'id': o['id'], 'name': o.get('name', ''), 'x': o['x'], 'y': o['y'], 'w': o['w'], 'h': o['h'], 'sy': o['sy']})
    th = L['exit']['threshold']; ex = {'x': th[0] // CS, 'y': min(rows - 2, th[1] // CS), 'w': -(-th[2] // CS), 'h': 2}
    b = list(blocked)
    for r in range(ex['y'], min(rows, ex['y'] + ex['h'])):
        for c in range(ex['x'], ex['x'] + ex['w']): b[r * cols + c] = '0'
    DATA[k] = {'w': W, 'h': H, 'cs': CS, 'cols': cols, 'rows': rows, 'blocked': ''.join(b), 'objs': objs, 'exit': ex, 'spawn': L['player_spawn']['foot'], 'keeper': L['keeper']['foot'], 'door': L['exit']['center']}
    if 'featured_item' in L: DATA[k]['featured'] = L['featured_item']['hit_rect']
    print(k, d, W, H, 'objs', len(objs), 'walkable', blocked.count('0'))
open(os.path.join(ROOT, 'game', 'r385_data.js'), 'w').write('// R385 · 玄天城衣饰三铺内景（重做版）的数据（tools/r385_build.py 生成，别手改）\nwindow.R385_DATA = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('total %.0f KB' % (total / 1024))
