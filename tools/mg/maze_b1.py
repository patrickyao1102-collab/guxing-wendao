# 地下一层 · 阴湿密道（大迷宫版）
# 走法和光线照 Claude 原来那张：洞底石板连成片，岩块围出甬道，离路越远越暗、沉进黑里；壁灯 / 火盆照一小团光。
# 素材换成 Codex 断岩双桥私牢小图里画的岩石、五种私牢、灯，加 R116 邪修密室物件和旧素材库的看守杂物。
import math, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from common import *
import maps_xx   # 原来那张地下一层的暗色碎岩 rock*_dk
from export import save_map, preview, views

B1 = S + '/b1src/xx_b1/objects/'
RI = S + '/r116i/'
ROCKS = [f'{k}{i}' for k in ('峰林', '斜晶岩', '横层岩', '滴泉崖', '石笋', '断台') for i in range(4)]
for n in ROCKS:
    reg('b1_' + n, 'pk', B1 + n + '.png', None, 'big')
    for j, f in enumerate((.62, .4, .22)): reg(f'b1_{n}_d{j}', 'pk', B1 + n + '.png', None, 'big', tint=(f * .92, f * .9, f))   # 离路越远越暗
for n in ['rock_01', 'rock_02']: reg('b1_' + n, 'pk', B1 + n + '.png', None, 'prop')
for n in ['forest_fern', 'forest_mushrooms', 'grass_clump_03', 'moon_herb', '赭骨堆', '墙边镣链', '断链', '解开的铁链']: reg('b1_' + n, 'pk', B1 + n + '.png', None, 'small')
for n in ['乌铁火盆', '氧化火盆', '铜灯', 'broken_banner', 'weapon_rack', 'wine_jars', 'water_jar', '符案', '丹炉', 'incense_burner', '锁刑柱', '玉髓晶簇']: reg('b1_' + n, 'pk', B1 + n + '.png', None, 'prop')
for n in ['赤封碑']: reg('b1_' + n, 'pk', B1 + n + '.png', None, 'prop')
for n in ['镇剑八方阵', '剑纹嵌石', '回纹铺石', '云纹走水石']: reg('b1_' + n, 'pk', B1 + n + '.png', None, 'flat')
reg('b1_符锁石门', 'pk', B1 + '符锁石门.png', None, 'big')
# R117 D：洞穴色调的岩石、石笋、壁灯，和按洞穴色重调的十种私牢
DD = S + '/codexlib/R117_地下一层_牢房补充与守卫小怪建模/D_洞穴岩壁/'
def _dl(sub): return sorted(f[:-4] for f in os.listdir(DD + sub) if f.endswith('.png'))
BIG, MID, LOWR, STAL, WLAMP = _dl('01_大岩堆'), _dl('02_中岩'), _dl('03_矮岩碎石'), _dl('04_钟乳石笋'), _dl('05_嵌壁灯具')
for sub, names, kind in [('01_大岩堆', BIG, 'big'), ('02_中岩', MID, 'prop'), ('03_矮岩碎石', LOWR, 'prop'), ('04_钟乳石笋', STAL, 'prop'), ('05_嵌壁灯具', WLAMP, 'prop')]:
    for n in names:
        reg('d_' + n, 'pk', DD + sub + '/' + n + '.png', None, kind)
        for j, f in enumerate((.6, .38, .2)): reg(f'd_{n}_d{j}', 'pk', DD + sub + '/' + n + '.png', None, kind, tint=(f, f, f))
CELLS = []
for sub in ('06_原私牢洞穴色', '07_A补充牢洞穴色'):
    for f in sorted(os.listdir(DD + sub)):
        if f.endswith('_关闭.png'):
            c = f[:-7]; CELLS.append(c)
            for st in ('关闭', '开启'): reg(f'b1_{c}_{st}', 'pk', DD + sub + f'/{c}_{st}.png', None, 'big')
CELLS = CELLS[0::2] + CELLS[1::2]      # 原版、补充版交替，七处不重样
for f in os.listdir(RI):
    if f.endswith('.png') and not f.startswith('总'):
        n = f[:-4]; reg('r116_' + n, 'pk', RI + f, None, 'flat' if n.startswith(('shackle', 'spike', 'bone')) else 'prop')

# R117 E：成套岩石围栏（北墙 / 南坎 / 东西纵墙），甬道两边一条线围起来，才像通道
EE = S + '/codexlib/E/E_岩石围栏/'
EJ = json.load(open(EE + '清单.json'))['assets']
FN = {}
for k, v in EJ.items():
    n = 'e_' + k.split('/')[1]; reg(n, 'pk', EE + v['file'], None, 'big'); REG[n]['notrim'] = True; FN[n] = v
NWALL = [n for n in FN if n.startswith('e_北墙')]; SLEDGE = [n for n in FN if n.startswith('e_南坎')]
WWALL = [n for n in FN if n.startswith('e_西壁')]; EWALL = [n for n in FN if n.startswith('e_东壁')]

W, H = 4608, 3360
CW = 230                     # 甬道宽
XS = [2304 + (i - 3) * 620 for i in range(7)]
YS = [760 + j * 700 for j in range(4)]

def ground(M):
    fl = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .22), 1.36, .5, (1.0, .98, 1.04))   # 路面亮一点、看得清（作者：这样的光线就够了）
    fl = Image.blend(fl.convert('RGB'), fl.convert('RGB').filter(ImageFilter.GaussianBlur(6)), .45) if hasattr(fl, 'filter') else fl   # 石板上的黑斑压淡
    rock = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .6), .45, .5, (1.0, .95, .95))
    M.freeze()
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    n = fbm(M.w, M.h, 40, 3, seed=M.seed + 7)
    a = smooth(D + (n - .5) * 30 * (D > 0), 0, 14)   # 路面里面不掺暗岩纹（原来会在路上留下一团团黑斑）
    g = blend(fl, rock, a)
    smoke = fbm(M.w, M.h, 160, 3, seed=M.seed + 11)            # 黑雾：边缘的暗不是一刀切，一团一团的
    g = mulmap(g, 1 - .88 * smooth(D + (smoke - .5) * 90, 10, 260))
    wet = smooth(fbm(M.w, M.h, 90, 3, seed=M.seed + 9), .66, .74) * (1 - a)
    g = mulmap(g, 1 - .1 * wet)
    M.ground = g

def poisson(M, n, sp, cond):
    pts = []
    for _ in range(n):
        x, y = M.rng.uniform(-80, M.w + 80), M.rng.uniform(-40, M.h + 200)
        if not cond(x, y): continue
        if any(abs(x - px) < sp and abs(y - py) < sp * .8 and math.hypot(x - px, (y - py) * 1.25) < sp for px, py in pts): continue
        pts.append((x, y))
    return pts

def covers(M, x, y, h):
    # 这块岩石竖起来会不会挡住北边的路
    return any(M.is_walk(x + dx, y - t) for t in range(30, int(h * .92), 28) for dx in (-40, 0, 40))

def rocks(M):
    # R117 D 洞穴岩：路北边立大岩堆 / 中岩，路南边只放矮岩碎石（不挡人）；往里一两层越远越暗，再远就是黑
    for x, y in poisson(M, 30000, 150, lambda x, y: 8 <= M.dw(x, y) <= 64 and not fenced(M, x, y) and not fenced(M, x, y - 120)):
        r = M.rng.random(); nm = M.rng.choice(BIG if r < .55 else MID if r < .85 else STAL); im = asset('d_' + nm)[0]; sc = M.rng.uniform(.8, 1.05)
        if covers(M, x, y, im.height * sc):
            nm = M.rng.choice(LOWR); im = asset('d_' + nm)[0]; sc = M.rng.uniform(.8, 1.1)
            if covers(M, x, y, im.height * sc): continue
        M.place('d_' + nm, x, y, sc, foot=(-im.width * sc * .3, -30, im.width * sc * .3, 4))
    for x, y in poisson(M, 24000, 240, lambda x, y: 64 < M.dw(x, y) <= 320 and not fenced(M, x, y) and not fenced(M, x, y - 160)):
        d = M.dw(x, y); nm = M.rng.choice(BIG + MID); sc = M.rng.uniform(.85, 1.1)
        if covers(M, x, y, asset('d_' + nm)[0].height * sc): continue
        M.place(f'd_{nm}_d{0 if d < 130 else 1 if d < 220 else 2}', x, y, sc, foot=False, shadow=False)
    for x, y in poisson(M, 6000, 260, lambda x, y: M.is_walk(x, y) and 8 <= M.din(x, y) <= 30):
        M.decal('d_' + M.rng.choice(LOWR), x, y, M.rng.uniform(.6, .8))
    M.scatter(['detail_chain_pile', 'detail_mortar_cracks', 'bones'], int(M.w * M.h / 900000), lambda x, y: M.dw(x, y) == 0 and M.din(x, y) > 40, sc=(.8, 1.0))

def lamp(M, x, y, nm='b1_乌铁火盆', r=190, c='255,150,70'):
    M.place(nm, x, y, 1.0, foot=(-22, -16, 22, 4)); M.lights.append(dict(x=x, y=y - 40, r=r, c=c))

def cell_room(M, i, cx, cy, kind):
    """私牢小洞厅：牢房靠里墙，前面火盆、看守的东西；记下囚犯 / 看守 / 交互点。"""
    px, py = cx, cy - 60
    o = M.place(f'b1_{kind}_关闭', px, py, 1.0, flip=False)
    lamp(M, px + (150 if i % 2 else -150), py + 30, M.rng.choice(['b1_乌铁火盆', 'b1_氧化火盆', 'r116_brazier_iron', 'r116_brazier_oxide']))
    sx = -1 if i % 2 else 1
    M.place(M.rng.choice(['detail_street_bench', 'b1_符案', 'r116_supply_crates_oak']), cx + sx * 170, cy + 70, 1.1)
    M.place(M.rng.choice(['b1_wine_jars', 'b1_water_jar', 'r116_supply_crates_aged', 'r116_supply_crates_dark']), cx + sx * 230, cy + 10, 1.0)
    M.decal(M.rng.choice(['b1_赭骨堆', 'r116_bone_heap_aged', 'r116_shackle_chain_iron', 'b1_墙边镣链']), cx - sx * 120, cy + 80)
    if M.rng.random() < .6: M.place(M.rng.choice(['b1_broken_banner', 'b1_weapon_rack', 'r116_restraint_rack_dark']), cx - sx * 210, cy - 20, 1.0)
    M.prisons.append(dict(id=f'p{i + 1}', kind=kind, at=[px, py], prisoner=[px, py - 22], use=[px, py + 26],
                          guards=[[cx + sx * 110, cy + 95], [cx - sx * 70, cy + 120]][: 1 + (i % 2)], cell=o['name']))

def grid_maze(M, extra=.28):
    rng = M.rng; N = {(i, j): (XS[i], YS[j]) for i in range(len(XS)) for j in range(len(YS))}
    E = []; seen = {(0, 0)}; fr = [((0, 0), (1, 0)), ((0, 0), (0, 1))]
    while fr:
        a, b = fr.pop(rng.randrange(len(fr)))
        if b in seen or b not in N: continue
        seen.add(b); E.append((a, b))
        for d in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            c = (b[0] + d[0], b[1] + d[1])
            if c in N and c not in seen: fr.append((b, c))
    for a in N:
        for d in [(1, 0), (0, 1)]:
            b = (a[0] + d[0], a[1] + d[1])
            if b in N and (a, b) not in E and (b, a) not in E and rng.random() < extra: E.append((a, b))
    h = CW // 2
    for k, (x, y) in N.items(): M.rect(x - h, y - h, CW, CW, walk=True)
    for a, b in E:
        (ax, ay), (bx, by) = N[a], N[b]
        M.rect(min(ax, bx) - h, min(ay, by) - h, abs(bx - ax) + CW, abs(by - ay) + CW, walk=True)
    deg = {k: 0 for k in N}
    for a, b in E: deg[a] += 1; deg[b] += 1
    M.mz_nodes, M.mz_edges, M.mz_deg = N, E, deg
    return N, E

def runs(line, minlen):
    # 一维布尔数组里连续 True 的区间
    out = []; i = 0; n = len(line)
    while i < n:
        if line[i]:
            j = i
            while j < n and line[j]: j += 1
            if j - i >= minlen: out.append((i, j))
            i = j
        else: i += 1
    return out

def fill(L, names, rng, lens):
    # 用 800 / 500 / 300 拼出长度 L，整体微缩放到正好
    best = None
    for c8 in range(0, int(L / 800) + 2):
        for c5 in range(0, 4):
            for c3 in range(0, 4):
                t = c8 * 800 + c5 * 500 + c3 * 300
                if not t: continue
                sc = L / t
                if .82 <= sc <= 1.22:
                    sco = abs(sc - 1) + .02 * (c8 + c5 + c3)
                    if best is None or sco < best[0]: best = (sco, sc, [800] * c8 + [500] * c5 + [300] * c3)
    if best is None: return None
    seq = best[2]; rng.shuffle(seq)
    return best[1], [rng.choice([n for n in names if f'_{w}_' in n]) for w in seq]

def put(M, n, L, T, sc, sy):
    im, ax, bot = asset(n)
    o = M.place(n, L + ax * sc, T + bot * sc, sc, flip=False, foot=False, shadow=False)
    o['sy'] = sy; return o

def fences(M):
    # 沿可走区的直边拼围栏：北边高岩墙、南边矮岩坎、东西两侧纵墙；碰到空厅 / 牢洞的弯边就断开，那里还是散岩
    wm = M._wm; Hh, Ww = wm.shape; boxes = []
    up = np.zeros_like(wm); up[1:] = wm[1:] & ~wm[:-1]          # 北边界（本格可走、上一格不可走）
    dn = np.zeros_like(wm); dn[:-1] = wm[:-1] & ~wm[1:]
    lf = np.zeros_like(wm); lf[:, 1:] = wm[:, 1:] & ~wm[:, :-1]
    rt = np.zeros_like(wm); rt[:, :-1] = wm[:, :-1] & ~wm[:, 1:]
    rows = [y for y in range(Hh) if up[y].sum() >= 150 or dn[y].sum() >= 150]
    cols = [x for x in range(Ww) if lf[:, x].sum() >= 150 or rt[:, x].sum() >= 150]
    for y in rows:
        for a, b in runs(up[y], 150):
            a -= 40; b += 40; r = fill(b - a, NWALL, M.rng, None)
            if not r: continue
            sc, seq = r; x = a
            for n in seq:
                v = FN[n]; jy = v['joint_left'][1]
                o = put(M, n, x, y + 8 - jy * sc, sc, y + 8); boxes.append((o['x'], o['y'], o['x'] + o['w'], o['y'] + o['h'])); x += v['size_px'][0] * sc
        for a, b in runs(dn[y], 150):
            a -= 30; b += 30; r = fill(b - a, SLEDGE, M.rng, None)
            if not r: continue
            sc, seq = r; x = a
            for n in seq:
                v = FN[n]; jy = v['joint_left'][1]
                o = put(M, n, x, y + 62 - jy * sc, sc, y + 62); boxes.append((o['x'], o['y'], o['x'] + o['w'], o['y'] + o['h'])); x += v['size_px'][0] * sc
    for x in cols:
        for side, line, names, off in (('w', lf[:, x], WWALL, -58), ('e', rt[:, x], EWALL, 58)):
            for a, b in runs(line, 150):
                ya, yb = a - 30, b + 14; Y = ya
                while Y < yb - 20:
                    rest = yb - Y
                    n = M.rng.choice([m for m in names if m.endswith('480')] if rest > 600 else [m for m in names if m.endswith('240')] if rest < 340 else names)
                    v = FN[n]; jt, jb = v['joint_top'][1], v['joint_bottom'][1]; span = jb - jt
                    sc = 1.0 if rest > span * 1.2 else max(.7, rest / span)
                    cx = x + off; w = v['size_px'][0] * sc
                    T = Y - jt * sc; o = put(M, n, cx - v['anchor_px'][0] * sc, T, sc, T + v['size_px'][1] * sc)
                    boxes.append((o['x'], o['y'], o['x'] + o['w'], o['y'] + o['h'])); Y += span * sc
    M.fence_boxes = boxes
    fm = Image.new('L', (M.w // 8 + 1, M.h // 8 + 1), 0); d = ImageDraw.Draw(fm)
    for x0, y0, x1, y1 in boxes: d.rectangle((x0 / 8 - 4, y0 / 8 - 4, x1 / 8 + 4, y1 / 8 + 4), fill=255)
    M._FM = np.asarray(fm) > 0

def fenced(M, x, y):
    if not hasattr(M, '_FM'): return False
    return bool(M._FM[int(min(M._FM.shape[0] - 1, max(0, y / 8))), int(min(M._FM.shape[1] - 1, max(0, x / 8)))])

def build():
    M = Map('xx_b1', '地下一层 · 阴湿密道', W, H, 'closed', seed=233)
    M.prisons = []
    # ---- 迷宫：正网格上的生成树 + 少量回环；甬道是笔直的，两边好拼成套岩墙 ----
    N, E = grid_maze(M)
    deg = M.mz_deg; conn = {frozenset(e) for e in E}
    ex = N[(3, 3)]
    # 南口落地处（开阔一点）
    M.rect(ex[0] - CW // 2, ex[1], CW, 3120 - ex[1], walk=True)
    M.blob(ex[0], 3150, 340, 150, dirt=0)
    M.exit('cy_north', '返回山坡入口', (ex[0] - 80, 3290, 160, 64), (ex[0], 3180), 'up')
    # 西北：守关剑阵洞厅（开阔），北墙符锁石门下到二层
    M.blob(600, 560, 460, 290, dirt=0)
    M.exit('xx_b2', '符锁石门 · 下行炼魂密室', (540, 262, 120, 50), (600, 410), 'down')
    # ---- 私牢：第一排节点往北凿短岔，尽头开小洞厅；不够的拿不向北通的死胡同就地扩成洞厅 ----
    sites = []
    top = [k for k in N if k[1] == 0 and k[0] >= 2]; M.rng.shuffle(top)
    for k in top[:5]:
        x, y = N[k]; sites.append((x, y - 380, 'n', k))
    leaves = [k for k in N if deg[k] == 1 and k not in ((0, 0), (1, 0), (3, 3)) and k[1] > 0]
    def nb_dir(k):
        for a, b in E:
            if k in (a, b): o = b if a == k else a; return (o[0] - k[0], o[1] - k[1])
    pl = [k for k in leaves if nb_dir(k) != (0, -1)]; M.rng.shuffle(pl)
    for k in pl[:2]:
        x, y = N[k]; sites.append((x, y - 70, 'l', k))
    M.cells_pending = []
    for i, (cx, cy, how, k) in enumerate(sites):
        x, y = N[k]
        if how == 'n': M.rect(cx - 240, cy - 150, 480, y - cy + 150 - CW // 2 + 10, walk=True)   # 方方正正的岩龛，四边也拼岩墙
        else: M.blob(cx, cy, 260, 175, dirt=0)
        M.cells_pending.append((i, cx, cy, CELLS[i % len(CELLS)]))
    used = {k for *_, k in sites}
    leaves = [k for k in N if deg[k] == 1 and k not in ((0, 0), (3, 3)) and k not in used]
    ground(M)
    M._DI = M.inner()
    fences(M)
    for i, cx, cy, kind in M.cells_pending: cell_room(M, i, cx, cy, kind)
    # 剑阵洞厅
    M.decal('b1_镇剑八方阵', 600, 640); M.decal('b1_剑纹嵌石', 430, 760); M.decal('b1_剑纹嵌石', 780, 760)
    M.place('b1_赤封碑', 340, 520); M.place('b1_赤封碑', 860, 520)
    lamp(M, 430, 440, 'b1_铜灯', 210, '255,190,120'); lamp(M, 770, 440, 'b1_铜灯', 210, '255,190,120')
    M.place('b1_丹炉', 960, 600); M.place('b1_符案', 260, 660); M.place('b1_incense_burner', 600, 470)
    M.lights.append(dict(x=600, y=600, r=380, c='200,70,60'))
    M.place('b1_符锁石门', 600, 312, 1.0, flip=False, foot=False)
    M.rect(360, 0, 480, 262, nowalk=True)
    # 南口：两盏铜灯
    lamp(M, ex[0] - 170, 3230, 'b1_铜灯', 200, '255,190,120'); lamp(M, ex[0] + 170, 3230, 'b1_铜灯', 200, '255,190,120')
    # 甬道里隔一段一盏嵌壁灯，嵌在北墙脚
    lit = [(l['x'], l['y']) for l in M.lights]
    for x, y in poisson(M, 30000, 560, lambda x, y: M.is_walk(x, y) and not M.is_walk(x, y - 12) and M.is_walk(x, y + 100) and fenced(M, x, y)):
        if any(math.hypot(x - a, y - b) < 520 for a, b in lit): continue
        M.place('d_' + M.rng.choice(WLAMP), x, y + 16, 1.0, foot=False, shadow=False); M.lights.append(dict(x=x, y=y - 40, r=200, c='255,150,70')); lit.append((x, y))
    for k in leaves:
        x, y = N[k]; M.chests.append((x, y)); M.decal(M.rng.choice(['b1_赭骨堆', 'r116_bone_heap_ivory']), x + 60, y + 20)
        rocks(M)
    M.spots.update(deep=(600, 600), entry=(ex[0], 3150), **{p['id']: tuple(p['use']) for p in M.prisons})
    M.zones = [dict(x=N[k][0], y=N[k][1], r=260) for k in N if k not in ((0, 0), (3, 3))][::2]
    M.mobs = dict(n=7, types=['xbat', 'xwraith', 'xspider', 'xiexiu', 'xbat', 'xspider'], bg='bg_cellar_b1', lv=3)
    M.meta = dict(grade='rgba(20,10,30,.16)', indoor=True, prisons=M.prisons)
    M.bake(); M.collision(); J = save_map(M)
    J['extra'] = sorted({p['cell'].replace('_关闭', '_开启') for p in M.prisons}); json.dump(J, open(f'{OUT}/xx_b1/map.json', 'w'), ensure_ascii=False)   # 开门后的牢房图也打进图集
    g = preview(M, 'full', hero=(ex[0], 3150), scale=.25)
    views(M, g, [(ex[0], 3100), (600, 640), N[(2, 1)], N[(5, 2)]] + [tuple(p['use']) for p in M.prisons[:4]])
    print('xx_b1 maze', len(M.objs), 'objs', len(M.dyn), 'dyn', 'prisons', len(M.prisons), 'leaves', len(leaves), 'lights', len(M.lights))
    return M


# ======================= v2：弯弯曲曲的真迷宫，两侧石头一块块堆砌成墙（作者 11-04） =======================
# 作者喜欢的是原来那种暗色圆厚碎岩（rock*_dk）堆在路边、黑暗只在路外的样子，嫌它"堆得太乱、路边不成线"。
# 这版：路边第一排是小圆石，一块挨一块排成线；往外一排比一排大、一排比一排暗，最后沉进黑里。不用 E 那套锋利岩墙。
for _n in ['rock1b', 'rock2b', 'rock3b', 'rock1', 'rock2', 'rock3', 'rock_moss_boulder']:
    _r = REG[_n]
    for _j, _f in enumerate((.46, .34, .24, .15)):
        reg(f'{_n}_s{_j}', _r['src'], _r['key'], _r['h'], 'prop', tint=(_f * .95, _f * .92, _f * 1.08))
FRONT = ['rock1', 'rock3', 'rock1b', 'rock3b']          # 路边：矮、圆
MIDR = ['rock1b', 'rock3b', 'rock2b', 'rock_moss_boulder']
BACK = ['rock2b', 'rock_moss_boulder', 'rock3b']

def stone_walls(M):
    A = lambda n: asset(n)[0]
    bands = [  # (离路远近 d0..d1, 石头, 色阶, 缩放, 间距)
        (4, 34, FRONT, 0, (1.0, 1.2), 44),
        (34, 90, MIDR, 1, (1.1, 1.35), 64),
        (90, 170, BACK, 2, (1.15, 1.35), 84),
    ]
    LOW = ['rock1', 'rock3', 'rock3b']
    for d0, d1, names, tone, (s0, s1), sp in bands:
        for x, y in poisson(M, int(M.w * M.h / sp / sp * 7), sp, lambda x, y: d0 <= M.dw(x, y) <= d1):
            for _ in range(3):
                nm = M.rng.choice(names); sc = M.rng.uniform(s0, s1)
                if nm == 'rock_moss_boulder': sc *= .75
                if not covers(M, x, y, A(nm).height * sc): break
            else:
                nm = M.rng.choice(LOW); sc = M.rng.uniform(.9, 1.15)        # 夹在两条甬道中间的窄墙：用矮石填满，不留黑洞
                if covers(M, x, y, A(nm).height * sc): continue
            w = A(nm).width * sc
            M.place(f'{nm}_s{tone}', x, y, sc, foot=False if tone else (-w * .3, -14, w * .3, 4), shadow=tone < 2)

def tight_maze(M, x0, y0, x1, y1, nx, ny, width, extra, keep, wob=.1, jit=.12):
    """墙要厚：节点只轻微抖动，每段路只弯一点点，相邻甬道之间留出整块的石墙。"""
    rng = M.rng; N = {}
    for j in range(ny):
        for i in range(nx):
            N[(i, j)] = (x0 + (x1 - x0) * (i + .5 + rng.uniform(-jit, jit)) / nx, y0 + (y1 - y0) * (j + .5 + rng.uniform(-jit, jit)) / ny)
    for k, p in keep: N[k] = p
    E = []; seen = {(0, 0)}; fr = [((0, 0), (1, 0)), ((0, 0), (0, 1))]
    while fr:
        a, b = fr.pop(rng.randrange(len(fr)))
        if b in seen or b not in N: continue
        seen.add(b); E.append((a, b))
        for d in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            c = (b[0] + d[0], b[1] + d[1])
            if c in N and c not in seen: fr.append((b, c))
    for a in N:
        for d in [(1, 0), (0, 1)]:
            b = (a[0] + d[0], a[1] + d[1])
            if b in N and (a, b) not in E and (b, a) not in E and rng.random() < extra: E.append((a, b))
    for a, b in E:
        (ax, ay), (bx, by) = N[a], N[b]; mx, my = (ax + bx) / 2, (ay + by) / 2; L = math.hypot(bx - ax, by - ay)
        nxv, nyv = -(by - ay) / L, (bx - ax) / L; o = rng.uniform(-wob, wob) * L
        M.path([(ax, ay), (mx + nxv * o, my + nyv * o), (bx, by)], width * rng.uniform(.92, 1.06))
    for k, (x, y) in N.items(): M.blob(x, y, width * .62, width * .55, dirt=0, wob=.1)
    deg = {k: 0 for k in N}
    for a, b in E: deg[a] += 1; deg[b] += 1
    M.mz_nodes, M.mz_edges, M.mz_deg = N, E, deg
    return N, E

def build2():
    M = Map('xx_b1', '地下一层 · 阴湿密道', W, H, 'closed', seed=245)
    M.prisons = []
    # ---- 迷宫：抖动网格上的生成树，回环很少，岔路和死胡同多；甬道窄、弯 ----
    N, E = tight_maze(M, 330, 540, 4290, 2880, 9, 6, 140, .06, keep=[((0, 0), (560, 660)), ((4, 5), (2304, 2760))])
    deg = M.mz_deg
    ex = (2304, 2760)
    M.path([ex, (2290, 2960), (2304, 3080)], 200); M.blob(2304, 3110, 330, 165, dirt=0)       # 南口：先是一片开阔的洞厅
    M.exit('cy_north', '返回山坡入口', (2224, 3290, 160, 64), (2304, 3180), 'up')
    M.blob(600, 560, 430, 270, dirt=0)                                                           # 西北：剑阵洞厅 + 符锁石门
    M.exit('xx_b2', '符锁石门 · 下行炼魂密室', (540, 262, 120, 50), (600, 410), 'down')
    # ---- 私牢：挑五个互相离得远的死胡同，就地扩成小洞厅（入口不能从北边进，牢门靠北墙朝南）----
    def nb_dir(k):
        for a, b in E:
            if k in (a, b): o = b if a == k else a; return (o[0] - k[0], o[1] - k[1])
    leaves = [k for k in N if deg[k] == 1 and k not in ((0, 0), (4, 5))]
    M.rng.shuffle(leaves); sites = []
    for k in sorted(leaves, key=lambda k: nb_dir(k) == (0, -1)):
        x, y = N[k]
        if nb_dir(k) == (0, -1) or y < 420: continue
        if any(math.hypot(x - a, y - b) < 820 for a, b, _ in sites): continue
        if math.hypot(x - 2304, y - 3000) < 700 or math.hypot(x - 600, y - 600) < 600: continue
        sites.append((x, y, k))
        if len(sites) >= 5: break
    M.cells_pending = []
    for i, (x, y, k) in enumerate(sites):
        M.blob(x, y - 30, 240, 150, dirt=0)
        M.cells_pending.append((i, x, y - 10, CELLS[i % len(CELLS)]))
    used = {k for *_, k in sites}
    rest = [k for k in leaves if k not in used]
    ground(M)
    M._DI = M.inner()
    for i, cx, cy, kind in M.cells_pending: cell_room(M, i, cx, cy, kind)
    # 剑阵洞厅
    M.decal('b1_镇剑八方阵', 600, 640); M.decal('b1_剑纹嵌石', 430, 760); M.decal('b1_剑纹嵌石', 780, 760)
    M.place('b1_赤封碑', 340, 520); M.place('b1_赤封碑', 860, 520)
    lamp(M, 430, 440, 'b1_铜灯', 210, '255,190,120'); lamp(M, 770, 440, 'b1_铜灯', 210, '255,190,120')
    M.place('b1_丹炉', 960, 600); M.place('b1_符案', 260, 660); M.place('b1_incense_burner', 600, 470)
    M.lights.append(dict(x=600, y=600, r=380, c='200,70,60'))
    M.place('b1_符锁石门', 600, 312, 1.0, flip=False, foot=False)
    M.rect(360, 0, 480, 262, nowalk=True)
    lamp(M, 2134, 3200, 'b1_铜灯', 200, '255,190,120'); lamp(M, 2474, 3200, 'b1_铜灯', 200, '255,190,120')
    # 甬道里灯少：隔很远才有一盏贴路边的火盆
    lit = [(l['x'], l['y']) for l in M.lights]
    for x, y in poisson(M, 20000, 760, lambda x, y: M.is_walk(x, y) and 10 <= M.din(x, y) <= 24 and not M.is_walk(x, y - 40)):
        if any(math.hypot(x - a, y - b) < 720 for a, b in lit): continue
        M.place('d_' + M.rng.choice(WLAMP), x, y, .9, foot=(-18, -10, 18, 4)); M.lights.append(dict(x=x, y=y - 50, r=170, c='255,150,70')); lit.append((x, y))
    for k in rest:
        x, y = N[k]; M.chests.append((x, y)); M.decal(M.rng.choice(['b1_赭骨堆', 'r116_bone_heap_ivory']), x + 50, y + 20)
    stone_walls(M)
    M.scatter(['detail_chain_pile', 'detail_mortar_cracks', 'bones'], int(M.w * M.h / 1200000), lambda x, y: M.dw(x, y) == 0 and M.din(x, y) > 40, sc=(.8, 1.0))
    M.spots.update(deep=(600, 600), entry=(2304, 3110), **{p['id']: tuple(p['use']) for p in M.prisons})
    M.zones = [dict(x=N[k][0], y=N[k][1], r=220) for k in N if k not in ((0, 0), (4, 5))][::3]
    M.mobs = dict(n=7, types=['xbat', 'xwraith', 'xspider', 'xiexiu', 'xbat', 'xspider'], bg='bg_cellar_b1', lv=3)
    M.meta = dict(grade='rgba(20,10,30,.18)', indoor=True, fog=True, prisons=M.prisons)   # fog：小地图只显示走过的地方（迷宫）
    M.bake(); M.collision(); J = save_map(M)
    J['extra'] = sorted({p['cell'].replace('_关闭', '_开启') for p in M.prisons}); json.dump(J, open(f'{OUT}/xx_b1/map.json', 'w'), ensure_ascii=False)
    g = preview(M, 'full', hero=(2304, 3110), scale=.25)
    views(M, g, [(2304, 3080), (600, 640), N[(3, 3)], N[(6, 2)]] + [tuple(p['use']) for p in M.prisons[:4]])
    print('xx_b1 v2', len(M.objs), 'objs', 'prisons', len(M.prisons), 'leaves', len(leaves), 'lights', len(M.lights))
    return M

if __name__ == '__main__':
    import sys
    (build if 'grid' in sys.argv else build2)()

