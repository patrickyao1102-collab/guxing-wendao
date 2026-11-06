# 作者 11-06：给 Codex 新图组挑宝箱位置——不起眼的角落、能走到、不压大路和传送阵。
# 用法：python3 tools/r107_mapgen/place_chests.py  → 打印 r131_chests.js 用的坐标表（64px 地砖坐标）
import json, re, math, sys
from PIL import Image
L = open('game/r107_maps.js', encoding='utf8').read().split('\n')
D = json.loads([l for l in L if l.startswith('  const DATA = ')][0][len('  const DATA = '):].rstrip().rstrip(';'))
PLAN = {'nw_creek': 2, 'nw_glade': 2, 'nw_falls': 2, 'nw_passage': 1, 'nw_spring': 1, 'cy_north': 3, 'cy_gate': 2, 'cy_manor': 1, 'xx_b2': 3}
def h32(s):
    h = 2166136261
    for ch in s: h = ((h ^ ord(ch)) * 16777619) & 0xffffffff
    return h
out = {}
for mid, n in PLAN.items():
    m = D[mid]; cols, rows = m['cols'], m['rows']; k = 4
    s = ''; v = m['b0']
    for run in m['b']: s += v * run; v = '0' if v == '1' else '1'
    W = lambda c, r: 0 <= c < cols and 0 <= r < rows and s[r * cols + c] == '0'
    g = Image.open(f'game/r107/g_{mid}.webp').convert('RGB'); gs = g.resize((cols, rows), Image.BOX); px = gs.load()
    sc, sr = int(m['start'][0] * k), int(m['start'][1] * k)
    seen = bytearray(cols * rows); st = [(sc, sr)]; seen[sr * cols + sc] = 1
    while st:
        c, r = st.pop()
        for dc, dr in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nc, nr = c + dc, r + dr
            if W(nc, nr) and not seen[nr * cols + nc]: seen[nr * cols + nc] = 1; st.append((nc, nr))
    ex = [(e['x'] + e['w'] / 2, e['y'] + e['h'] / 2) for e in m['ex']]
    R = 12; M = 11; cand = []
    for r in range(M, rows - M, 2):
        for c in range(M, cols - M, 2):
            if not seen[r * cols + c]: continue
            if not all(W(c + dx, r - dy) for dy in range(0, 4) for dx in range(-2, 3)): continue
            op = sum(1 for dy in range(-R, R + 1) for dx in range(-R, R + 1) if W(c + dx, r + dy)) / ((2 * R + 1) ** 2)
            if op < .25: continue
            dEx = min(math.hypot((c - x) / k, (r - y) / k) for x, y in ex) if ex else 99
            dSt = math.hypot((c - sc) / k, (r - sr) / k)
            if dEx < 7 or dSt < 8: continue
            R_, G_, B_ = px[c, r]; grass = G_ > R_ + 8 and G_ > B_ + 20
            bonus = 0 if mid.startswith('xx') else (3 if grass else -5)   # 野外 / 城里：站草地上，别站路面
            cand.append((c, r, op, (1 - op) * 10 + min(dEx, 20) * .15 + bonus + (h32(mid + str(c) + ',' + str(r)) % 1000) / 1000 * 1.5))
    cand.sort(key=lambda x: -x[3]); picked = []
    for lim in (.6, .72, .85, 1.01):
        for c, r, op, sc_ in cand:
            if len(picked) >= n: break
            if op > lim: continue
            if all(math.hypot((p[0] - c) / k, (p[1] - r) / k) >= 14 for p in picked): picked.append((c, r))
    out[mid] = [[c // k, r // k] for c, r in picked]
    print(mid, len(cand), out[mid], file=sys.stderr)
print(json.dumps(out))
