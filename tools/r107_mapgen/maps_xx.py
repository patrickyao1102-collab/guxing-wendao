import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from common import *
for n in ['rock1', 'rock2', 'rock3', 'rock3b', 'rock2b']:
    r = REG[n]; reg(n + '_dk', r['src'], r['key'], r['h'], r['kind'], tint=(.42, .4, .48))

def cave_ground(M, floor_b=.95):
    fl = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .22), floor_b * 1.45, .55, (1.02, 1.0, 1.0))
    rock = grade(tile_tex(R61 + 'dungeon_floor.png', M.w, M.h, .6), .45, .5, (1.0, .95, .95))
    M.freeze()
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    n = fbm(M.w, M.h, 40, 3, seed=M.seed + 7)
    a = smooth(D + (n - .5) * 30, 0, 14)
    g = blend(fl, rock, a)
    # 越往岩壁里越黑
    g = mulmap(g, 1 - .85 * smooth(D, 10, 260))
    # 水洼：地面上几块深色反光
    wet = smooth(fbm(M.w, M.h, 90, 3, seed=M.seed + 9), .66, .74) * (1 - a)
    g = mulmap(g, 1 - .35 * wet)
    M.ground = g
    # 边缘一圈碎石
    M.scatter(['rock1_dk', 'rock2_dk', 'rock3_dk', 'rock3b_dk', 'rock2b_dk'], int(M.w * M.h / 26000), lambda x, y: 4 <= M.dw(x, y) <= 50, sc=(.7, 1.1))
    M.scatter(['detail_chain_pile', 'detail_mortar_cracks', 'detail_rust_grate', 'bones'], int(M.w * M.h / 200000), lambda x, y: M.dw(x, y) == 0 and M.din(x, y) > 40, sc=(.8, 1.0))
    return None

def sconce(M, x, y, c='255,140,60'):
    M.place('detail_wall_sconce', x, y, .85, flip=False, foot=(-12, -10, 12, 4))
    M.lights.append(dict(x=x, y=y - 110, r=170, c=c))

# ======================= 地下一层 · 阴湿密道 =======================
def xx_b1():
    M = Map('xx_b1', '地下一层 · 阴湿密道', 2048, 1920, 'closed', seed=171)
    M.path([(1000, 1990), (1000, 1680), (760, 1460), (650, 1120), (980, 900), (1380, 800), (1460, 520), (1150, 330)], 210, dirt=False)
    M.blob(640, 1110, 270, 170, dirt=0)                       # 牢房
    M.path([(1000, 1680), (1350, 1550), (1560, 1300)], 170, dirt=False); M.blob(1580, 1260, 240, 160, dirt=0)   # 堆货的岔洞
    M.blob(1150, 330, 300, 160, dirt=0)                       # 下行石阶
    M.exit('cy_north', '返回山坡入口', (920, 1866, 160, 54), (1000, 1780), 'up')
    M.exit('xx_b2', '下行 · 炼魂密室', (1090, 160, 120, 60), (1150, 340), 'down')
    cave_ground(M)
    M.place('dungeon_stair', 1150, 250, .9, flip=False, foot=False)
    M.place('xx_wall', 1150, 190, .9, flip=False, foot=False, shadow=False)
    # 牢房：隔栏、锁链、草席
    M.place('detail_cell_partition', 560, 1020, 1.0, flip=False); M.place('detail_cell_partition', 760, 1020, 1.0, flip=True)
    M.place('dungeon_chain_rack', 640, 960, .9, flip=False); M.decal('detail_chain_pile', 600, 1150); M.place('prison_cage', 450, 1180, .9)
    # 岔洞：抢来的箱子
    M.place('crates', 1520, 1220, 1.0); M.place('sacks', 1620, 1230, 1.0); M.place('detail_sealed_coffer', 1660, 1310, .9)
    for x, y in [(900, 1600), (760, 1300), (880, 950), (1300, 820), (1440, 600), (1000, 360), (1300, 360)]: sconce(M, x, y)
    M.decal('detail_rune_floor_shard', 1150, 420, 1.0)
    M.spots.update(deep=(1150, 420), cell=(640, 1130))
    M.chests = [(1600, 1250)]
    M.zones = [dict(x=700, y=1300, r=200), dict(x=1200, y=850, r=220), dict(x=1450, y=650, r=180)]
    M.mobs = dict(n=4, types=['xiexiu', 'corpse'], bg='bg_cellar', lv=3)
    M.meta = dict(grade='rgba(20,10,30,.18)', indoor=True)
    finish(M, None, [(1000, 1700), (640, 1150), (1150, 420)])

# ======================= 地下二层 · 炼魂密室 =======================
def xx_b2():
    M = Map('xx_b2', '地下二层 · 炼魂密室', 2560, 2048, 'closed', seed=181)
    cx, cy = 1280, 1080
    M.blob(cx, cy, 980, 600, dirt=0, wob=.05)
    M.path([(cx, 2100), (cx, 1700)], 230, dirt=False)
    M.exit('xx_b1', '返回上层密道', (cx - 80, 1994, 160, 54), (cx, 1900), 'up')
    cave_ground(M, .85)
    # 后墙
    wim = asset('xx_wall')[0]
    for x in range(int(cx - 2.5 * wim.width), int(cx + 2.5 * wim.width) + 1, wim.width - 10):
        o = M.place('xx_wall', x + wim.width / 2, 560, 1.0, flip=False, foot=False, shadow=False); o['bake'] = True
    M.rect(0, 0, M.w, 520, nowalk=True)
    # 阵心：血阵 + 祭坛
    M.place('dungeon_sigil', cx, cy + 260, 2.1, flip=False, foot=False, shadow=False)
    M.place('xx_altar', cx, cy + 40, 1.05, flip=False, foot=(-160, -90, 160, 0))
    # 一圈锁链石柱
    for i in range(12):
        a = (i + .5) / 12 * math.tau
        x, y = cx + math.cos(a) * 690, cy + 60 + math.sin(a) * 400
        if math.sin(a) > .9: continue
        M.place('xx_pillar', x, y, .9, flip=(x > cx))
        M.decal('detail_chain_pile', x + (40 if x < cx else -40), y + 30, .8)
    for x, y in [(520, 760), (2040, 760), (420, 1300), (2140, 1300)]: M.place('prison_cage', x, y, .95, flip=x > cx)
    M.place('dungeon_chain_rack', 760, 640, .9); M.place('dungeon_chain_rack', 1800, 640, .9, flip=True)
    M.place('detail_ritual_basin', cx - 300, cy - 120, .9); M.place('detail_ritual_basin', cx + 300, cy - 120, .9, flip=True)
    M.place('detail_ritual_bookstand', cx + 160, cy - 260, .9, flip=True)
    for x in (600, 1000, 1560, 1960): sconce(M, x, 600, '255,90,70')
    M.lights += [dict(x=cx, y=cy + 120, r=420, c='200,30,50'), dict(x=cx, y=cy - 60, r=220, c='255,70,90')]
    M.spots.update(eye=(cx, cy + 180), entry=(cx, 1750))
    M.meta = dict(grade='rgba(60,0,20,.16)', indoor=True)
    finish(M, None, [(cx, cy + 300), (cx - 500, cy), (cx, 1750)])
