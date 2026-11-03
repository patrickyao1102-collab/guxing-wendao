import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from common import *
from maps_yy import forest_dress
from common import patch9, walkdist, tex9

SPIRIT_TREES = ['tree_magnolia', 'tree_cherry', 'tree_ginkgo', 'tree_camphor_ancient', 'tree_osmanthus', 'spirit_bellvine', 'tree_cypress_ancient', 'tree_albizia', 'pine_lush',
                'tree_ginkgo_a', 'tree_maple_red_a', 'tree_maple_amber_a', 'tree_plum_white_a', 'tree_plum_red_a', 'tree_wisteria_a', 'tree_osmanthus_a', 'tree_pine_a']
SPIRIT_W = [4, 3, 2, 3, 2, 2, 3, 2, 3, 4, 3, 3, 3, 2, 2, 3, 4]
SPIRIT_FLORA = ['spirit_lantern_bloom', 'spirit_ribbon_orchid', 'spirit_fan_shroom', 'spirit_fern_arch', 'spirit_coral_shrub', 'detail_spirit_floating_bud', 'detail_spirit_seed_pod', 'detail_spirit_frost_fruit', 'detail_spirit_amber_reeds']
SPIRIT_SMALL = ['spirit_star_grass', 'detail_spirit_violet_cluster', 'detail_flowers_blue', 'detail_flowers_gold', 'detail_orchid_white', 'detail_sacred_fern', 'detail_fern_fan', 'flowers1', 'flowers3', 'grass3',
               'plant_daisy_white', 'plant_daisy_yellow', 'plant_iris', 'plant_verbena', 'plant_dandelion', 'decal_white_flowers', 'decal_yellow_flowers', 'decal_purple_flowers']

def spirit_dress(M, flora_n=26, small_div=7000, trees=SPIRIT_TREES, tw=SPIRIT_W, spacing=128):
    M.freeze()
    M.forest(trees, spacing=spacing, margin=30, weights=tw, scale=(.85, 1.1))
    M.forest(['tree_plum', 'pine_lush', 'scholar', 'pine', 'tree_plum_white_a', 'tree_maple_amber_a', 'tree_pine_a'], spacing=200, margin=26, scale=(.55, .7), maxcover=.22)
    M.forest(['shrub_big', 'detail_sacred_fern', 'detail_fern_fan', 'spirit_coral_shrub', 'mossrock', 'plant_shrub_red', 'plant_shrub_gold'], spacing=72, margin=14, scale=(.9, 1.25), maxcover=.6)
    # 路边灵植（大一点的有碰撞）
    M.scatter(SPIRIT_FLORA, flora_n, lambda x, y: 10 <= M.dw(x, y) <= 60, decal=False, sc=(.8, 1.05))
    M.scatter(SPIRIT_SMALL, int(M.w * M.h / small_div), lambda x, y: M.dw(x, y) <= 80 and M.din(x, y) < 120, sc=(.75, 1.1))
    M.scatter(['detail_fern_fan', 'shrub', 'spirit_star_grass', 'detail_ivy_mound'], int(M.w * M.h / 15000), lambda x, y: M.dw(x, y) > 60, sc=(.8, 1.2))

def lush_ground(M, bright=1.02):
    g = meadow(M, bright, 1.02, (.97, 1.02, 1.0))
    n = fbm(M.w, M.h, 260, 3, seed=M.seed + 2)
    M.ground = mulmap(g, .9 + .2 * n)
    M.paint_ground(M.ground, dirt_tex=dirt(M), pave_tex=grade(stone_tex(M.w, M.h, .22, (1.05, 1.0, .9)), 1.18, .8))
    M.freeze()
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    patch9(M, 'ginkgo', cover=.08, nscale=280, seed=4, bright=1.0, sat=.9, onpath=.3, strength=.6, soft=.14)
    return 1 - .3 * smooth(D, 60, 420)

# ======================= 秘境 · 遮天天瀑 =======================
def nw_falls():
    M = Map('nw_falls', '秘境 · 遮天天瀑', 3072, 2304, 'closed', seed=31)
    M.path([(1400, 2330), (1380, 2050), (1300, 1800)], 220, dk=.4)
    M.blob(1350, 1420, 820, 330, dirt=0, wob=.1)                    # 湖南岸的大片花甸
    M.path([(1300, 1800), (1250, 1500), (1500, 1300), (1900, 1250), (2250, 1150)], 190, dk=.4)
    M.path([(2250, 1150), (2520, 980), (2620, 700), (2500, 420), (2420, 180), (2400, -40)], 180, dk=.45)
    M.blob(2560, 760, 200, 140, dirt=.3)
    M.path([(700, 1500), (420, 1350), (360, 1050)], 150); M.blob(360, 1010, 160, 120, dirt=.35)
    M.path([(1380, 2050), (1900, 1980), (2350, 1900), (2650, 1760)], 150); M.blob(2680, 1730, 170, 120, dirt=.35)
    M.exit('yy_deep', '返回秘境裂隙', (1320, 2240, 170, 64), (1390, 2140), 'up')
    M.exit('nw_path', '穿过天瀑', (2320, 0, 170, 60), (2400, 120), 'down')
    far = lush_ground(M)
    # 湖：天瀑落进来，东边流出一条灵溪
    wm = Image.new('L', (M.w, M.h), 0); d = ImageDraw.Draw(wm)
    d.ellipse((880, 560, 2080, 1150), fill=255)
    for x, y in M.spline([(2000, 900), (2200, 1100), (2350, 1250), (2700, 1350), (3120, 1330)]): d.ellipse((x - 60, y - 45, x + 60, y + 45), fill=255)
    wm = wm.filter(ImageFilter.GaussianBlur(14)).point(lambda v: 255 if v > 128 else 0)
    ImageDraw.Draw(M.walk)  # noqa
    paint_water(M, wm, spirit=True)
    bx, by = 2290, 1190
    M.place('wonder_root_bridge', bx, by + 60, .95, flip=False, foot=False, shadow=False)
    ImageDraw.Draw(M.nowalk).rectangle((bx - 110, by - 80, bx + 110, by + 80), fill=0)
    M.place('nw_falls', 1480, 700, 1.6, flip=False, foot=(-330, -180, 330, 0))
    M.place('cliff_high', 1000, 600, 1.0, flip=False); M.place('cliff_high', 1960, 610, 1.0, flip=True)
    M.place('cliff', 760, 700, 1.0, flip=False); M.place('crag', 2200, 640, .8, flip=True)
    shore(M, wm, ('rock1', 'rock2', 'rock3', 'reeds', 'detail_spirit_amber_reeds', 'fern', 'plant_iris', 'plant_reed', 'plant_iris', 'rock_river_pebbles'), 52)
    for x, y in [(1150, 1000), (1750, 1050), (1300, 900), (1900, 950)]: M.place('spirit_lotus_giant', x, y, .55, foot=False, shadow=False)
    M.place('wonder_leaf_arch', 820, 1330, 1.05, flip=False, foot=(-200, -30, -120, 4))
    M.spots.update(leaf=(820, 1420), flowers=(1500, 1560), falls=(1480, 1230))
    for a in range(6): M.place('spirit_lantern_bloom' if a % 2 else 'spirit_ribbon_orchid', 1500 + math.cos(a) * 110, 1500 + math.sin(a) * 50, .8)
    M.lights += [dict(x=1500, y=1490, r=200, c='170,220,255'), dict(x=1480, y=800, r=340, c='140,210,255')]
    M.chests = [(360, 990), (2680, 1710)]
    spirit_dress(M, flora_n=14, small_div=11000, spacing=150)
    M.meta = dict(grade='rgba(40,70,90,.05)')
    finish(M, far, [(1500, 1560), (820, 1420), (2290, 1190), (2560, 800)])

# ======================= 秘境 · 回环神像古道 =======================
POSES = ['nw_bless', 'nw_farewell', 'nw_grief', 'nw_guard', 'nw_listen', 'nw_mend', 'nw_moon', 'nw_mourn', 'nw_return', 'nw_seal', 'nw_shelter', 'nw_shrine', 'nw_stars', 'nw_teach', 'nw_vow', 'nw_wind']
def nw_path():
    M = Map('nw_path', '秘境 · 回环神像古道', 3072, 2304, 'closed', seed=41)
    road = M.path([(560, 2330), (600, 2000), (900, 1800), (1500, 1820), (2050, 1700), (2400, 1450), (2350, 1150), (1900, 1000), (1300, 1040), (850, 900), (760, 620), (1050, 400), (1600, 330), (2200, 300), (2600, 200), (2700, -40)], 270, pave=True, dirt=False, dk=.62)
    M.exit('nw_falls', '返回天瀑', (480, 2240, 170, 64), (560, 2140), 'up')
    M.exit('nw_court', '步入群像遗庭', (2620, 0, 170, 60), (2690, 130), 'down')
    # 两处歇脚的小平台
    M.blob(1500, 1830, 200, 110, pave=True); M.blob(1300, 1040, 180, 100, pave=True)
    M.path([(2400, 1450), (2700, 1600), (2800, 1900)], 150); M.blob(2810, 1930, 150, 100, dirt=.5)
    far = lush_ground(M, .98)
    M.freeze()
    # 古道两旁每隔一段立一尊神像（姿态各不相同），像前有供碗 / 石灯
    import itertools
    L = 0; last = None; side = 1; pi = 0; placed = []
    for (x0, y0), (x1, y1) in zip(road, road[1:]):
        seg = math.hypot(x1 - x0, y1 - y0); L += seg
        if L < 420 or y1 < 150 or y1 > 2150: continue
        L = 0; nx, ny = -(y1 - y0) / seg, (x1 - x0) / seg; side = -side
        sx, sy = x1 + nx * 175 * side, y1 + ny * 175 * side
        if any(math.hypot(sx - a, sy - b) < 300 for a, b in placed): continue
        placed.append((sx, sy))
        nm = POSES[pi % len(POSES)]; pi += 1
        M.place(nm, sx, sy, 1.0, flip=(sx > x1))
        M.place(M.rng.choice(['detail_offering_bowl', 'detail_old_stone_lamp']), sx + (40 if sx < x1 else -40) * -1 + (x1 - sx) * .35, sy + 40, .9)
    M.spots.update(statue_a=placed[0] if placed else (1500, 1830), statue_b=placed[len(placed) // 2] if placed else (1300, 1040), statue_c=placed[-1] if placed else (1300, 1040))
    M.place('temple_stele', 1500, 1760, 1.0, flip=False); M.place('temple_bench', 1420, 1900, 1.0, flip=False)
    M.place('statue_border', 1300, 990, 1.0, flip=False)
    M.chests = [(2810, 1910)]
    Dw = walkdist(M)
    patch9(M, 'ginkgo', cover=.45, nscale=200, seed=9, where=1 - smooth(Dw, 120, 420), sat=.95, onpath=.25)
    spirit_dress(M, trees=['tree_ginkgo_a', 'tree_ginkgo_b', 'tree_cypress_ancient', 'tree_maple_amber_a', 'tree_pine_a', 'pine_lush', 'tree_osmanthus_a', 'tree_camphor_ancient'], tw=[8, 3, 4, 3, 4, 3, 2, 2], spacing=150, flora_n=12, small_div=12000)
    M.meta = dict(grade='rgba(30,50,70,.07)')
    finish(M, far, [(1500, 1900), (1300, 1100), (900, 1800), (2400, 1450)])

# ======================= 秘境 · 环丘群像遗庭 =======================
def nw_court():
    M = Map('nw_court', '秘境 · 环丘群像遗庭', 3072, 2560, 'closed', seed=51)
    cx, cy, R = 1536, 1380, 720
    M.blob(cx, cy, R + 90, (R + 90) * .6, wob=.06)
    M.blob(cx, cy, R * .78, R * .78 * .6, pave=True, wob=.02)
    M.path([(1536, 2600), (1530, 2300), (1500, 2000), (cx, cy + R * .55)], 220, pave=True, dirt=False)
    M.path([(cx, cy - R * .5), (1536, 700), (1560, 420), (1560, -40)], 200, pave=True, dirt=False)
    M.exit('nw_path', '返回古道', (1450, 2496, 170, 64), (1530, 2390), 'up')
    M.exit('nw_temple', '仰望山巅小庙', (1480, 0, 170, 60), (1560, 130), 'down')
    # 东西两条小路去看外围的独像
    M.path([(cx - R, cy + 40), (600, 1500), (420, 1720)], 150); M.blob(420, 1760, 170, 120, dirt=.5)
    M.path([(cx + R, cy - 20), (2500, 1200), (2700, 1000)], 150); M.blob(2720, 960, 170, 120, dirt=.5)
    far = lush_ground(M, 1.0)
    M.freeze()
    # 圆庭外沿一圈石栏 + 十二尊神像（面朝中心），中间是孤寂巨像
    for i in range(12):
        a = -math.pi / 2 + (i + .5) / 12 * math.tau
        x, y = cx + math.cos(a) * (R - 10), cy + math.sin(a) * (R * .6 - 10)
        if abs(math.cos(a)) < .2 and math.sin(a) > 0: continue   # 南口留空
        if abs(math.cos(a)) < .2 and math.sin(a) < 0: continue   # 北口留空
        M.place(POSES[i], x, y, .95, flip=(x > cx))
    M.place('statue_border', cx, cy + 80, 1.3, flip=False)
    M.place('nw_seal', cx, cy + 40, 1.45, flip=False, foot=(-70, -40, 70, 6))
    M.place('detail_offering_bowl', cx - 90, cy + 110, .9); M.place('detail_old_stone_lamp', cx + 110, cy + 110, .9)
    M.place('detail_lotus_relief', cx - 260, cy + 260, 1.0); M.place('temple_bench', cx + 260, cy + 250, 1.0, flip=False)
    M.place('nw_guard', 420, 1700, 1.0); M.place('nw_stars', 2720, 920, 1.0, flip=True)
    M.spots.update(giant=(cx, cy + 150), west=(420, 1780), east=(2720, 990))
    # 石阶上山
    M.place('stone_steps', 1560, 640, 1.0, flip=False)
    M.chests = [(380, 1780)]
    spirit_dress(M, trees=['tree_cypress_ancient', 'tree_pine_a', 'tree_pine_b', 'tree_camphor_ancient', 'pine_lush', 'tree_plum_white_a', 'tree_plum_red_a', 'tree_maple_red_a', 'tree_ginkgo_a'], tw=[5, 7, 2, 3, 3, 3, 2, 3, 2], spacing=150, flora_n=12, small_div=12000)
    M.meta = dict(grade='rgba(30,50,70,.06)')
    finish(M, far, [(cx, cy + 200), (cx - 300, cy - 100), (1536, 2300), (1560, 600)])

# ======================= 女娲庙 · 山巅小庙（古朴温馨）=======================
def nw_temple():
    M = Map('nw_temple', '女娲庙 · 山巅小庙', 2816, 2304, 'closed', seed=61)
    # 山顶平台：四周是云海
    M.blob(1400, 1150, 980, 760, dirt=0, wob=.12)
    M.blob(1400, 1020, 440, 250, pave=True, wob=.015)          # 庙前石坪
    M.path([(1400, 1380), (1380, 1700), (1360, 2000), (1340, 2340)], 200, pave=True, dirt=False)   # 下山石阶
    M.path([(1900, 900), (2150, 700), (2250, 420), (2280, 180)], 150)                                # 庙后小径 → 灵泉
    M.exit('nw_court', '下山 · 返回群像遗庭', (1260, 2240, 170, 64), (1350, 2130), 'up')
    M.exit('nw_inner', '推门进庙', (1350, 760, 110, 40), (1400, 900), 'down')
    M.exit('nw_spring', '庙后灵泉', (2200, 140, 160, 60), (2270, 260), 'down')
    g = meadow(M, .97, .8, (1.04, 1.0, .88))
    nd = fbm(M.w, M.h, 340, 4, seed=M.seed + 77)
    g = blend(g, grade(tex9('dry_grass', M.w, M.h), .92, .85), np.clip(.22 + .5 * smooth(nd, .4, .75), 0, 1))
    M.ground = g; M.paint_ground(g, dirt_tex=dirt(M), pave_tex=grade(stone_tex(M.w, M.h, .2, (1.06, 1.0, .9)), 1.2, .78))
    M.freeze()
    patch9(M, 'ginkgo', cover=.08, nscale=240, seed=7, sat=.9, onpath=.2, strength=.75)
    # 云海：平台以外渐渐变成云
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    mist(M, smooth(D, 80, 380))
    # 小庙（正北），两侧矮墙，门前香炉
    M.place('nw_temple', 1400, 780, 1.12, flip=False, foot=(-250, -150, 250, 0))
    M.rect(1340, 600, 120, 200, nowalk=False)
    M.place('temple_wall', 960, 800, .8, flip=False); M.place('temple_wall', 1840, 800, .8, flip=True)
    M.place('incense', 1400, 1010, 1.15, flip=False)
    M.place('detail_old_stone_lamp', 1180, 960, .95, flip=False); M.place('detail_old_stone_lamp', 1620, 960, .95, flip=True)
    # 钟亭、古碑、长凳、老桂树、梅树——住过人的温暖气息：扫帚、雨水缸、晾着的药草、菜畦边的花
    M.place('temple_bell', 900, 1180, 1.0, flip=False)
    M.place('temple_stele', 1930, 1150, 1.0, flip=False)
    M.place('temple_bench', 1140, 1300, 1.0, flip=False); M.place('temple_bench', 1680, 1300, 1.0, flip=False)
    M.place('tree_osmanthus_a', 760, 880, 1.05); M.place('tree_plum_red_a', 2050, 880, 1.0); M.place('tree_pine_a', 560, 1560, .95)
    M.place('tree_ginkgo_a', 2300, 1500, 1.0); M.place('tree_maple_red_a', 2420, 1060, .95); M.place('tree_plum_white_a', 520, 1180, .95)
    M.place('tree_wisteria_a', 2010, 1330, .95)
    for (tx, ty), lv in [((2420, 1060), 'plant_leaves_red'), ((2050, 880), 'plant_leaves_red'), ((2300, 1500), 'plant_leaves_gold')]:
        for k in range(3): M.decal(lv, tx + M.rng.uniform(-110, 110), ty + M.rng.uniform(10, 70), M.rng.uniform(.7, 1.0))
    M.place('detail_bamboo_broom', 1690, 860, 1.0, flip=True); M.place('detail_rain_barrel', 1090, 860, .9)
    M.place('herb_trays', 1880, 1300, 1.0); M.place('detail_flower_planter', 1250, 840, .85); M.place('detail_flower_planter', 1555, 840, .85)
    M.place('detail_firewood_shed', 2060, 1060, .9, flip=True)
    M.place('detail_old_rope_bell', 1960, 960, .9)
    # 石桌喝茶的地方、小荷池、竹丛、菜篮、晾衣绳——有人细心照料着这里
    M.place('stone_tea', 2000, 1420, 1.0, flip=False); M.place('bamboo_chair', 1920, 1440, 1.0, flip=False); M.place('bamboo_chair', 2085, 1440, 1.0, flip=True)
    M.place('nw_pool', 760, 1460, .9, flip=False, foot=(-150, -110, 150, 0))
    M.place('detail_vegetable_baskets', 2180, 1260, .9); M.place('detail_laundry_line', 2250, 1080, .9, flip=True)
    for x, y in [(2380, 1250), (2420, 1330), (2350, 1400)]: M.place('bamboo', x, y, M.rng.uniform(.8, 1.0))
    M.place('detail_hanging_censer', 1240, 1180, .8, flip=False)
    for x, y in [(1060, 1440), (1740, 1460), (1180, 1620), (1620, 1640), (900, 1650), (1900, 1640)]: M.decal(M.rng.choice(['detail_flowers_gold', 'detail_flowers_blue', 'flowers2', 'flowers3']), x, y, 1.2)
    for x, y in [(1080, 1180), (1720, 1180)]: M.place('detail_flower_planter', x, y, .9)
    M.place('lantern_stone', 1290, 1560, 1.0); M.place('lantern_stone', 1490, 1560, 1.0, flip=True)
    M.spots.update(door=(1400, 920), bell=(900, 1260), stele=(1930, 1220))
    M.lights += [dict(x=1400, y=980, r=180, c='255,190,110'), dict(x=1180, y=920, r=110, c='255,180,100'), dict(x=1620, y=920, r=110, c='255,180,100')]
    M.scatter(['flowers1', 'flowers2', 'flowers3', 'flowers4', 'grass1', 'grass3', 'grass2', 'detail_flowers_gold', 'detail_flowers_blue', 'detail_orchid_white', 'shrub', 'plant_daisy_white', 'plant_daisy_yellow', 'plant_verbena', 'plant_iris'], 300, lambda x, y: M.dw(x, y) == 0 and M.din(x, y) < 160 and not M.pave.getpixel((int(x), int(y))), sc=(.8, 1.1))
    M.scatter(['rock1', 'rock2', 'mossrock', 'shrub_big'], 26, lambda x, y: 10 <= M.dw(x, y) <= 90, decal=False)
    # 平台边缘一圈松树、古柏（崖边）
    M.forest(['tj_pine', 'tree_pine_a', 'tree_pine_b', 'tree_maple_red_a', 'tree_ginkgo_a', 'tree_cypress_ancient', 'tree_maple_amber_a'], spacing=190, margin=10, band=(10, 150), scale=(.8, 1.0), maxcover=.3)
    M.meta = dict(grade='rgba(255,235,200,.05)')
    finish(M, None, [(1400, 1100), (900, 1300), (1400, 1650), (2000, 900)])

# ======================= 女娲庙 · 庙内 =======================
def nw_inner():
    M = Map('nw_inner', '女娲庙 · 庙内', 1280, 960, 'open', seed=71)
    x0, y0, x1, y1 = room(M, 'wall_guest', 'stone')
    M.exit('nw_temple', '出庙', (580, 910, 120, 50), (640, 830), 'up')
    cx = 640
    M.place('statue_border', cx, 470, .95, flip=False)
    M.place('nw_shrine', cx, 450, 1.3, flip=False, foot=(-90, -40, 90, 8))
    M.place('detail_offering_bowl', cx - 105, 500, .85, flip=False); M.place('incense', cx + 110, 510, .85, flip=False)
    M.place('indoor_lamp', cx - 230, 470, 1.0); M.place('indoor_lamp', cx + 230, 470, 1.0, flip=True)
    M.place('jade_rug', cx, 700, .85, flip=False)
    M.place('meditation_mat', cx - 90, 610, .7, flip=False); M.place('meditation_mat', cx + 90, 610, .7, flip=False)
    M.place('sutras', 150, 420, .9, flip=False); M.place('scroll_shelf', 1130, 430, .95, flip=True)
    M.place('detail_flower_planter', 300, 460, .85); M.place('detail_flower_planter', 980, 460, .85, flip=True)
    M.place('tea_table', 230, 760, .9); M.place('detail_storage_vessels', 1090, 790, .85); M.place('detail_bamboo_broom', 1180, 600, .9, flip=True)
    M.spots.update(statue=(cx, 580), senior=(cx + 80, 560))
    M.lights += [dict(x=cx - 230, y=380, r=150, c='255,190,110'), dict(x=cx + 230, y=380, r=150, c='255,190,110')]
    M.meta = dict(indoor=True)
    finish(M, None, [(cx, 700), (cx, 860)])

# ======================= 女娲庙后 · 无尘灵泉 =======================
def nw_spring():
    M = Map('nw_spring', '女娲庙后 · 无尘灵泉', 2560, 1920, 'closed', seed=81)
    M.path([(380, 1960), (420, 1700), (640, 1500), (900, 1380)], 170)          # 兰径
    M.path([(900, 1380), (1250, 1330), (1600, 1380), (1950, 1300), (2180, 1050), (2150, 760)], 170)   # 沿岸 → 东岸
    M.blob(1250, 1330, 260, 120, dirt=.35)    # 望莲石
    M.blob(2140, 720, 220, 160, dirt=.35)     # 观星树
    M.path([(2140, 720), (2300, 500), (2380, 300)], 150); M.blob(2380, 270, 150, 110, dirt=.3)
    M.exit('nw_temple', '返回小庙', (300, 1856, 170, 64), (400, 1760), 'up')
    M.exit('yy_deep', '秘境送返幽影林', (2320, 210, 120, 60), (2380, 330), 'down')
    far = lush_ground(M, 1.0)
    wm = Image.new('L', (M.w, M.h), 0); d = ImageDraw.Draw(wm)
    d.ellipse((780, 520, 1900, 1220), fill=255); d.ellipse((1500, 450, 1950, 900), fill=255)
    wm = wm.filter(ImageFilter.GaussianBlur(30)).point(lambda v: 255 if v > 128 else 0)
    paint_water(M, wm, deep=(40, 104, 118), shallow=(110, 178, 170), spirit=True)
    M.freeze()
    M.place('waterfall', 1240, 560, 1.0, flip=False)
    M.place('cliff_high', 960, 520, .9, flip=False); M.place('cliff_high', 1540, 500, .9, flip=True)
    M.place('wonder_lotus_crown', 1500, 760, .8, flip=False, foot=False)      # 远岸托起的白莲（在水里）
    for x, y in [(1100, 1000), (1350, 1100), (1700, 950), (1000, 800)]: M.place('spirit_lotus_giant', x, y, .6, foot=False, shadow=False)
    M.place('rock_single', 1250, 1250, .8, flip=False)                         # 望莲石
    M.place('wonder_star_tree', 2140, 640, .95, flip=False, foot=(-40, -20, 40, 6))
    shore(M, wm, ('rock1', 'rock2', 'reeds', 'detail_spirit_amber_reeds', 'detail_orchid_white', 'fern', 'plant_iris', 'plant_iris', 'plant_reed', 'rock_river_pebbles'), 60)
    for i in range(14):                                                        # 兰径两旁的白兰
        t = i / 14; x = 420 + (900 - 420) * t + M.rng.uniform(-30, 30); y = 1700 - (1700 - 1380) * t
        M.place('detail_orchid_white', x + M.rng.choice([-110, 110]), y + M.rng.uniform(-20, 20), M.rng.uniform(.8, 1.0), foot=False)
    M.spots.update(orchid=(640, 1520), lotus=(1250, 1380), star=(2140, 780))
    M.lights += [dict(x=1500, y=700, r=260, c='200,235,255'), dict(x=2140, y=520, r=220, c='160,200,255'), dict(x=2380, y=260, r=160, c='150,190,255')]
    spirit_dress(M, trees=['bamboo_tall', 'bamboo_sun', 'bamboo_soft', 'bamboo_tall15', 'bamboo_dense', 'tree_magnolia', 'tree_cherry', 'pine_lush', 'tree_plum_white_a', 'tree_wisteria_a', 'tree_willow_a', 'tree_maple_amber_a'], tw=[6, 5, 4, 4, 4, 2, 2, 2, 3, 2, 2, 2], spacing=118)
    M.meta = dict(grade='rgba(40,70,90,.05)')
    finish(M, far, [(1250, 1380), (640, 1520), (2140, 800), (2380, 330)])
