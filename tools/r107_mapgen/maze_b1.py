# 地下一层 · 阴湿密道（大迷宫版）
# 走法和光线照 Claude 原来那张：洞底石板连成片，岩块围出甬道，离路越远越暗、沉进黑里；壁灯 / 火盆照一小团光。
# 素材换成 Codex 断岩双桥私牢小图里画的岩石、五种私牢、灯，加 R116 邪修密室物件和旧素材库的看守杂物。
import math, os, json
import numpy as np
from PIL import Image
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
CELLS = ['岩窟铁栅', '东角木笼', '伏流水牢', '北岔刑柱', '封符石屋']
for c in CELLS:
    for st in ('关闭', '开启'): reg(f'b1_{c}_{st}', 'pk', B1 + f'{c}_{st}.png', None, 'big', tint=(.74, .72, .8))
for f in os.listdir(RI):
    if f.endswith('.png') and not f.startswith('总'):
        n = f[:-4]; reg('r116_' + n, 'pk', RI + f, None, 'flat' if n.startswith(('shackle', 'spike', 'bone')) else 'prop')

W, H = 4608, 3200

def ground(M):
    fl = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .22), .95 * 1.45, .55, (1.02, 1.0, 1.0))
    rock = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .6), .45, .5, (1.0, .95, .95))
    M.freeze()
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    n = fbm(M.w, M.h, 40, 3, seed=M.seed + 7)
    a = smooth(D + (n - .5) * 30, 0, 14)
    g = blend(fl, rock, a)
    smoke = fbm(M.w, M.h, 160, 3, seed=M.seed + 11)            # 黑雾：边缘的暗不是一刀切，一团一团的
    g = mulmap(g, 1 - .88 * smooth(D + (smoke - .5) * 90, 10, 260))
    wet = smooth(fbm(M.w, M.h, 90, 3, seed=M.seed + 9), .66, .74) * (1 - a)
    g = mulmap(g, 1 - .2 * wet)
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
    # 照原来那张：路边一圈暗紫灰碎岩（烘进地面），路上零星锁链、裂纹、铁箅、骨头
    DK = ['rock1_dk', 'rock2_dk', 'rock3_dk', 'rock3b_dk', 'rock2b_dk']
    M.scatter(DK, int(M.w * M.h / 22000), lambda x, y: 4 <= M.dw(x, y) <= 54, sc=(.7, 1.15))
    M.scatter(DK, int(M.w * M.h / 60000), lambda x, y: 54 < M.dw(x, y) <= 160, sc=(.8, 1.2))
    M.scatter(['detail_chain_pile', 'detail_mortar_cracks', 'detail_rust_grate', 'bones'], int(M.w * M.h / 900000), lambda x, y: M.dw(x, y) == 0 and M.din(x, y) > 40, sc=(.8, 1.0))

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

def build():
    M = Map('xx_b1', '地下一层 · 阴湿密道', W, H, 'closed', seed=233)
    M.prisons = []
    # ---- 迷宫：抖动网格上的生成树 + 少量回环；甬道两三人宽 ----
    N, E = M.maze(380, 520, 4240, 2720, 6, 4, width=200, extra=.28, keep=[((0, 0), (640, 700)), ((3, 3), (2420, 2560))])
    deg = M.mz_deg
    # 南口落地处（开阔一点），连到最近的底排节点
    M.blob(2304, 2960, 360, 190, dirt=0); M.path([(2304, 2960), (2360, 2760), N[(3, 3)]], 230)
    M.exit('cy_north', '返回山坡入口', (2224, 3120, 160, 64), (2304, 3010), 'up')
    # 西北：守关剑阵洞厅（开阔），北墙符锁石门下到二层
    M.blob(640, 560, 470, 290, dirt=0); M.path([(640, 560), N[(0, 0)]], 240)
    M.exit('xx_b2', '符锁石门 · 下行炼魂密室', (580, 262, 120, 50), (640, 410), 'down')
    # ---- 私牢：从没有向北支路的节点往北凿一条短岔，尽头开小洞厅 ----
    # 岔口方向只能是北 / 东 / 西（牢门朝南，玩家从前面或侧面走近）；北边要没有别的路，东西只在图的两侧边
    conn = {frozenset(e) for e in E}
    def free(k, d):
        nb = (k[0] + d[0], k[1] + d[1])
        if d == (0, -1): return nb not in N or frozenset((k, nb)) not in conn
        return nb not in N
    cand = [(k, d) for k in N for d in ((0, -1), (-1, 0), (1, 0)) if k not in ((0, 0), (1, 0), (3, 3)) and free(k, d)]
    M.rng.shuffle(cand); cand.sort(key=lambda t: t[1] != (0, -1))
    sites = []
    for k, d in cand:
        x, y = N[k]; cx, cy = (x + M.rng.uniform(-70, 70), y - 360) if d == (0, -1) else (x + d[0] * 330, y - 40)
        if cy < 330 or cx < 260 or cx > W - 260: continue
        if any(math.hypot(cx - a, cy - b) < 560 for a, b, _ in sites): continue
        sites.append((cx, cy, (x, y)))
        if len(sites) >= 7: break
    M.cells_pending = []
    for i, (cx, cy, (x, y)) in enumerate(sites):
        if abs(cx - x) < 200: M.path([(x, y), (cx, (y + cy) / 2), (cx, cy + 60)], 180)
        else: M.path([(x, y), ((x + cx) / 2, y - 20), (cx, cy + 40)], 180)
        M.cells_pending.append((i, cx, cy, CELLS[i % len(CELLS)]))
    for i, cx, cy, kind in M.cells_pending: M.blob(cx, cy, 250, 165, dirt=0)
    # 死胡同（叶子节点）尽头：宝箱 / 骨堆
    leaves = [k for k in N if deg[k] == 1 and k not in ((0, 0), (3, 3))]
    ground(M)
    M._DI = M.inner()
    for i, cx, cy, kind in M.cells_pending: cell_room(M, i, cx, cy, kind)
    # 剑阵洞厅
    M.decal('b1_镇剑八方阵', 640, 640); M.decal('b1_剑纹嵌石', 470, 760); M.decal('b1_剑纹嵌石', 820, 760)
    M.place('b1_赤封碑', 380, 520); M.place('b1_赤封碑', 900, 520)
    lamp(M, 470, 440, 'b1_铜灯', 210, '255,190,120'); lamp(M, 810, 440, 'b1_铜灯', 210, '255,190,120')
    M.place('b1_丹炉', 1000, 640); M.place('b1_符案', 300, 660); M.place('b1_incense_burner', 640, 470)
    M.lights.append(dict(x=640, y=600, r=380, c='200,70,60'))
    M.place('b1_符锁石门', 640, 312, 1.0, flip=False, foot=False)
    M.rect(400, 0, 480, 262, nowalk=True)
    # 南口：两盏铜灯
    lamp(M, 2140, 3060, 'b1_铜灯', 200, '255,190,120'); lamp(M, 2470, 3060, 'b1_铜灯', 200, '255,190,120')
    # 甬道里隔一段一盏火盆（贴路边）
    lit = [(l['x'], l['y']) for l in M.lights]
    for x, y in poisson(M, 20000, 520, lambda x, y: M.is_walk(x, y) and 10 <= M.din(x, y) <= 26):
        if any(math.hypot(x - a, y - b) < 480 for a, b in lit): continue
        maps_xx.sconce(M, x, y); lit.append((x, y))
    for k in leaves:
        x, y = N[k]; M.chests.append((x, y)); M.decal(M.rng.choice(['b1_赭骨堆', 'r116_bone_heap_ivory']), x + 60, y + 20)
    M.place('b1_玉髓晶簇', N[(4, 1)][0] + 120, N[(4, 1)][1] - 60); M.place('b1_玉髓晶簇', N[(1, 2)][0] - 120, N[(1, 2)][1] - 50)
    rocks(M)
    M.spots.update(deep=(640, 600), entry=(2304, 2960), **{p['id']: tuple(p['use']) for p in M.prisons})
    M.zones = [dict(x=N[k][0], y=N[k][1], r=260) for k in N if k not in ((0, 0), (3, 3))][::2]
    M.mobs = dict(n=6, types=['xiexiu', 'corpse'], bg='bg_cellar', lv=3)
    M.meta = dict(grade='rgba(20,10,30,.16)', indoor=True, prisons=M.prisons)
    M.bake(); M.collision(); J = save_map(M)
    g = preview(M, 'full', hero=(2304, 2960), scale=.25)
    views(M, g, [(2304, 2900), (640, 640)] + [tuple(p['use']) for p in M.prisons[:4]])
    print('xx_b1 maze', len(M.objs), 'objs', len(M.dyn), 'dyn', 'prisons', len(M.prisons), 'leaves', len(leaves), 'lights', len(M.lights))
    return M

if __name__ == '__main__': build()
