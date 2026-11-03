import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from common import *
from common import patch9, tex9, walkdist

def town_ground(M, bright=.96, sat=.86, mul=(1.03, 1.0, .9), stone=.18, sb=1.16, slabs=1.0, dry=.35):
    g = meadow(M, bright, sat, mul)
    # 城里的空地：草里掺枯黄草、砂土，不再是一片绿
    nd = fbm(M.w, M.h, 300, 4, seed=M.seed + 77)
    g = blend(g, grade(tex9('dry_grass', M.w, M.h), .95, .85), np.clip(dry + .45 * smooth(nd, .45, .8), 0, 1))
    M.ground = g
    pv = grade(tex9('slabs', M.w, M.h, bomb_it=False, scale=slabs), sb * .95, .8, (1.05, 1.01, .95))
    # 石板不要一个色：大块明暗 + 磨旧的黄褐色调 + 缝里的砂土
    n1 = fbm(M.w, M.h, 180, 4, seed=M.seed + 61); n2 = fbm(M.w, M.h, 420, 3, seed=M.seed + 62)
    pv = mulmap(pv, .86 + .26 * n1)
    pv = blend(pv, grade(tex9('sand_grit', M.w, M.h), .95, .8), .1 + .25 * smooth(n2, .45, .8))
    M.paint_ground(g, dirt_tex=dirt(M, .92), pave_tex=pv, pave_edge=.06)
    patch9(M, 'sand_grit', cover=.12, nscale=200, seed=21, onpath=.6, strength=.8)
    patch9(M, 'gravel', cover=.06, nscale=160, seed=22, onpath=.6, strength=.7)

def row(M, names, x0, x1, y, gap=30, sc=1.0):
    # 一排房子（门朝南），从 x0 往右排
    x = x0
    for nm in names:
        im = asset(nm)[0]; w = im.width * sc
        if x + w > x1: break
        M.place(nm, x + w / 2, y, sc, flip=False); x += w + gap

# ======================= 苍月城 · 斑驳南门 =======================
def cy_gate():
    M = Map('cy_gate', '苍月城 · 斑驳南门', 2560, 1920, 'open', seed=91)
    gx, wy = 1280, 470
    M.path([(1280, 1980), (1240, 1700), (1310, 1350), (1270, 1000), (gx, wy + 200)], 240, walk=False, dk=.62)
    M.blob(gx, wy + 110, 190, 120, walk=False, pave=True, wob=.08)   # 门前一段石板
    M.rect(0, 0, 2560, wy - 70, nowalk=True)
    M.exit('cy_street', '进入苍月城', (gx - 70, wy - 90, 140, 80), (gx, wy + 80), 'up')
    M.exit('yy_deep', '返回幽影林', (1170, 1866, 200, 54), (1250, 1780), 'up')
    town_ground(M, .88, .74, slabs=.72, dry=.45)
    # 城里：墙后探出的屋顶和树冠（墙会盖住它们的下半截）
    for i, x in enumerate(range(120, 2560, 330)):
        if abs(x - gx) < 330: continue
        o = M.place(['cy_house', 'house2', 'house1', 'house3'][i % 4], x, wy - 40, .95, flip=bool(i % 2), foot=False, shadow=False); o['bake'] = True
    for x in (gx - 420, gx + 430, 240, 2330):
        o = M.place('scholar_big', x, wy - 120, .8, foot=False, shadow=False); o['bake'] = True
    # 城墙：城门居中，两侧墙段
    M.place('cy_gate', gx, wy, 1.0, flip=False, foot=False)
    M.rect(0, wy - 80, gx - 70, 84, nowalk=True); M.rect(gx + 70, wy - 80, 2560 - gx - 70, 84, nowalk=True)
    wim = asset('city_wall')[0]; ww = wim.width - 6
    x = gx - 250 - ww / 2
    while x > -ww: M.place('city_wall', x, wy - 4, 1.0, flip=False, foot=False, shadow=False); x -= ww
    x = gx + 250 + ww / 2
    while x < 2560 + ww: M.place('city_wall', x, wy - 4, 1.0, flip=False, foot=False, shadow=False); x += ww
    # 墙根：杂草、苔藓、破旧的告示和守卫棚——苍月城远不如玄天城繁盛
    M.place('watchtower', gx - 480, wy + 140, 1.0, flip=False)
    M.place('notice', gx + 250, wy + 120, 1.0, flip=False)
    M.place('lantern_pole', gx - 160, wy + 50, 1.0, flip=False); M.place('lantern_pole', gx + 160, wy + 50, 1.0, flip=True)
    M.place('banner_broken', gx - 330, wy + 60, .9, flip=False)
    for x in range(60, 2560, 150):
        if abs(x - gx) > 260: M.decal(M.rng.choice(['grass2', 'grass3', 'fern', 'shrub', 'detail_ivy_mound']), x + M.rng.uniform(-30, 30), wy + 18 + M.rng.uniform(0, 20))
    # 路边茶摊、推车、草垛、老槐、柿子树
    M.place('food_stall2', 760, 1060, 1.0, flip=False); M.place('stone_tea', 640, 1150, 1.0, flip=False); M.place('bamboo_chair', 560, 1170, 1.0); M.place('bamboo_chair', 720, 1175, 1.0, flip=True)
    M.place('handcart', 1720, 960, 1.0); M.place('haystack', 1900, 1040, 1.0); M.place('sacks', 1600, 1020, 1.0); M.place('detail_old_wheelbarrow', 880, 800, 1.0)
    M.place('boundary', 1100, 1500, 1.0); M.place('waypost', 1470, 1420, 1.0)
    for x, y, nm in [(380, 820, 'scholar_big'), (2180, 820, 'willow'), (2380, 1300, 'scholar'), (300, 1450, 'tree_jujube'), (2050, 1500, 'tree_persimmon'), (1000, 1250, 'tree_tallow_a'), (1650, 1300, 'tree_maple_amber_a'), (2200, 1050, 'tree_ginkgo_a'), (520, 1000, 'tree_willow_a')]: M.place(nm, x, y, .95)
    M.place('prop_awning_ochre', 1560, 780, 1.0, flip=False); M.place('prop_fruit_basket', 1480, 840, 1.0); M.place('prop_celadon_jar', 1660, 830, 1.0)
    M.place('prop_wine_flag', 860, 1020, 1.0, flip=False)
    M.freeze()
    M.forest(['pine', 'tree_pine_a', 'yy_tree', 'tree_maple_amber_a', 'tree_tallow_a', 'tree_maple_red_a', 'birch'], spacing=140, margin=0, region=lambda x, y: y > 1640 and abs(x - 1260) > 250, scale=(.85, 1.05), maxcover=1)
    M.scatter(['grass1', 'grass2', 'grass3', 'flowers1', 'flowers3', 'shrub', 'fern', 'plant_foxtail', 'plant_thatch', 'plant_dandelion', 'plant_daisy_yellow', 'plant_shrub_gold'], 380, lambda x, y: y > wy + 40, sc=(.8, 1.1))
    M.spots.update(gate=(gx, wy + 140), notice=(gx + 250, wy + 200))
    M.lights += [dict(x=gx - 160, y=wy - 60, r=140, c='255,150,70'), dict(x=gx + 160, y=wy - 60, r=140, c='255,150,70')]
    M.meta = dict(grade='rgba(255,140,70,.08)')
    finish(M, None, [(gx, wy + 220), (700, 1150), (1250, 1700)])

# ======================= 苍月城 · 旧街 =======================
def cy_street():
    M = Map('cy_street', '苍月城 · 旧街', 2560, 2048, 'open', seed=101)
    mx = 1280
    M.rect(mx - 150, 0, 300, 2048, pave=True)              # 南北大街
    M.rect(0, 1130, 2560, 240, pave=True)                  # 东西横街（东头去城主府）
    M.rect(0, 470, 2560, 170, pave=True)                   # 北巷
    M.rect(0, 1780, 2560, 170, pave=True)                  # 南巷
    M.exit('cy_gate', '出南门', (mx - 90, 1994, 180, 54), (mx, 1910), 'up')
    M.exit('cy_manor', '城主府', (2510, 1170, 50, 170), (2420, 1260), 'left')
    M.exit('cy_north', '出北城 · 荒林', (mx - 90, 0, 180, 54), (mx, 110), 'down')
    town_ground(M, .9, .74, slabs=.72, dry=.5)
    def lane(y, left, right, sc=.92):
        row(M, left, 20, mx - 170, y, gap=6, sc=sc); row(M, right, mx + 170, 2550, y, gap=6, sc=sc)
    lane(1120, ['tea_house', 'cy_house', 'pharmacy', 'house1'], ['general_store', 'inn', 'cy_house'])
    lane(460, ['house1', 'cy_house', 'house3', 'house2'], ['house2', 'blacksmith', 'house1', 'cy_house'])
    lane(1770, ['house3', 'house2', 'cy_house', 'house1'], ['cy_house', 'house1', 'restaurant'])
    # 门前：酒旗、灯笼、缸、筐、晾衣、摊子
    for x, y, nm in [(mx - 300, 1180, 'wine_flag'), (mx + 360, 1180, 'lantern_pole'), (300, 1170, 'water_jar'), (360, 1180, 'detail_pickle_crocks'), (820, 1175, 'herb_trays'),
                     (1600, 1175, 'crates'), (1680, 1185, 'sacks'), (2150, 1180, 'wine_jars'), (2300, 1175, 'lantern_pole'), (560, 520, 'detail_laundry_line'), (1900, 520, 'drying_rack'),
                     (1050, 515, 'detail_rain_barrel'), (1560, 515, 'detail_firewood_shed'), (220, 520, 'haystack'), (2400, 515, 'detail_fish_basket'), (700, 1830, 'detail_vegetable_baskets'),
                     (1500, 1830, 'detail_storage_vessels'), (2000, 1825, 'handcart'), (380, 1830, 'detail_rice_barrels')]: M.place(nm, x, y, .95)
    # 彩色布棚、酒旗、灯笼串、晾晒的布、花盆、果筐、青瓷缸
    for x, y, nm, f in [(mx - 270, 1010, 'prop_awning_red', False), (mx + 280, 1010, 'prop_awning_blue', True), (mx - 260, 1960, 'prop_awning_ochre', False),
                        (520, 1200, 'prop_awning_ochre', False), (2000, 1200, 'prop_awning_red', True), (760, 540, 'prop_drying_cloth', False), (2150, 545, 'prop_drying_cloth', True)]:
        M.place(nm, x, y, 1.0, flip=f)
    for x in (300, 950, 1700, 2350):
        o = M.place('prop_lanterns', x, 1110, 1.0, flip=False, foot=False, shadow=False, collide=False)
    for x in (420, 1050, 1830, 2380):
        o = M.place('prop_lanterns', x, 1752, .9, flip=False, foot=False, shadow=False, collide=False)
    for x, y, nm in [(mx - 360, 1180, 'prop_wine_flag'), (mx + 420, 1760, 'prop_wine_flag'), (180, 1175, 'prop_flower_pot'), (1150, 1175, 'prop_flower_pot'), (1420, 1180, 'prop_celadon_jar'),
                     (2440, 1180, 'prop_flower_pot'), (900, 515, 'prop_flower_pot'), (1680, 515, 'prop_celadon_jar'), (mx - 200, 1030, 'prop_fruit_basket'), (mx + 220, 1040, 'prop_fruit_basket'),
                     (1050, 1830, 'prop_celadon_jar'), (1760, 1830, 'prop_flower_pot'), (260, 1830, 'prop_flower_pot')]:
        M.place(nm, x, y, 1.0)
    # 大街两边：摊子、井、告示
    M.place('notice', mx - 230, 1430, 1.0, flip=False)
    M.place('old_city_well', mx + 260, 1460, .95, flip=False)
    for x, y, nm in [(mx - 250, 820, 'food_stall'), (mx + 250, 820, 'weapon_stall'), (mx - 250, 1600, 'old_market_booth'), (mx + 280, 1640, 'detail_bean_curd_stand'), (mx - 250, 300, 'detail_shoe_stall'), (mx + 260, 300, 'detail_cloth_stand')]: M.place(nm, x, y, .9, flip=False)
    for y in (220, 960, 1500, 1990): M.place('lantern_pole', mx - 180, y, 1.0, flip=False); M.place('lantern_pole', mx + 180, y, 1.0, flip=True)
    # 后院的树从屋后探出来
    for x in range(140, 2560, 300):
        for y in (180, 860, 1500):
            if abs(x - mx) < 300: continue
            o = M.place(M.rng.choice(['scholar', 'tree_jujube', 'tree_persimmon', 'willow', 'tree_ginkgo_a', 'tree_maple_red_a', 'tree_osmanthus_a', 'tree_tallow_a', 'tree_plum_red_a', 'tree_maple_amber_a']), x + M.rng.uniform(-60, 60), y + M.rng.uniform(-20, 30), .85, foot=False)
    M.freeze()
    M.scatter(['grass1', 'grass2', 'grass3', 'flowers1', 'flowers2', 'shrub', 'plant_thatch', 'plant_dandelion', 'plant_daisy_white'], 160, lambda x, y: not M.pave.getpixel((int(x), int(y))), sc=(.8, 1.1))
    M.scatter(['detail_mortar_cracks', 'grass4', 'grass1'], 50, lambda x, y: M.pave.getpixel((int(x), int(y))) > 0, sc=(.7, 1.0))
    M.spots.update(notice=(mx - 230, 1500), well=(mx + 260, 1530), cross=(mx, 1260))
    M.meta = dict(grade='rgba(255,160,90,.06)')
    finish(M, None, [(mx, 1260), (mx - 450, 1250), (mx + 300, 600), (mx, 1880)])

# ======================= 苍月城主府 =======================
def cy_manor():
    M = Map('cy_manor', '苍月城主府', 2304, 1920, 'open', seed=111)
    cx = 1152
    M.rect(140, 200, 2024, 1600, pave=True)                # 府院大多铺了石板
    M.exit('cy_street', '出府 · 返回旧街', (cx - 80, 1866, 160, 54), (cx, 1780), 'up')
    M.exit('cy_council', '进入议事正堂', (cx - 60, 470, 120, 100), (cx, 620), 'down')
    town_ground(M, .98, .86, (1.0, 1.02, .94), stone=.16, sb=1.22, slabs=.72)
    # 花圃（不铺石板的几块地）——画在石板上面
    gb = Image.new('L', (M.w, M.h), 0); d = ImageDraw.Draw(gb)
    for r in [(260, 1300, 820, 1700), (1480, 1300, 2040, 1700), (260, 700, 640, 980)]: d.rounded_rectangle(r, 40, fill=255)
    gm = np.asarray(gb.filter(ImageFilter.GaussianBlur(4)), np.float32) / 255
    M.ground = blend(M.ground, meadow(M, 1.0, .95, seed=5), gm)
    # 四周院墙
    wim = asset('cy_manor_wall')[0]; ww = wim.width - 4
    x = ww / 2
    while x < M.w + ww / 2: o = M.place('cy_manor_wall', x, 190, 1.0, flip=False, foot=False, shadow=False); o['bake'] = True; x += ww
    M.rect(0, 0, M.w, 200, nowalk=True)
    vim = asset('cwall_v')[0]
    for y in range(200, M.h, vim.height - 8): M.place('cwall_v', 30, y + vim.height, 1.0, flip=False, foot=False, shadow=False); M.place('cwall_v', M.w - 30, y + vim.height, 1.0, flip=False, foot=False, shadow=False)
    M.rect(0, 0, 70, M.h, nowalk=True); M.rect(M.w - 70, 0, 70, M.h, nowalk=True)
    x = ww / 2
    while x < M.w + ww / 2:
        if abs(x - cx) > 250 + ww / 2: M.place('cy_manor_wall', x, M.h - 4, 1.0, flip=False, foot=False, shadow=False)
        x += ww
    M.rect(0, M.h - 100, cx - 140, 100, nowalk=True); M.rect(cx + 140, M.h - 100, M.w - cx - 140, 100, nowalk=True)
    M.place('cy_manor_gate', cx, M.h - 10, 1.0, flip=False, foot=False)
    # 正堂、两厢、客舍、回廊
    M.place('cy_manor_hall', cx, 540, 1.15, flip=False)
    M.place('cy_manor_wing', 470, 660, .9, flip=False); M.place('cy_manor_wing', 1834, 660, .9, flip=True)
    for (x, y), to, lb, f in [((420, 1230), 'cy_guest_ye', '叶孤星客舍', False), ((1884, 1230), 'cy_guest_yun', '云霆客舍', True), ((1884, 1040), 'cy_guest_lin', '林雪客舍', True)]:
        pass
    M.place('cottage', 430, 1220, .6, flip=False); M.place('cottage', 1874, 1220, .6, flip=True)
    M.place('cottage', 1874, 990, .6, flip=True)
    M.exit('cy_guest_ye', '叶孤星客舍', (380, 1180, 100, 62), (430, 1300), 'down')
    M.exit('cy_guest_yun', '云霆客舍', (1824, 1180, 100, 62), (1874, 1300), 'down')
    M.exit('cy_guest_lin', '林雪客舍', (1824, 950, 100, 62), (1874, 1070), 'down')
    # 花圃里的树、池、石；中轴两侧灯和石狮
    M.place('pond', 560, 1560, .75, flip=False, foot=(-200, -90, 200, 0))
    M.place('tree_plum_white_a', 360, 1420, .95); M.place('rock_limestone', 740, 1440, .55); M.place('tree_willow_a', 780, 1700, .9)
    M.place('tree_plum_red_a', 1600, 1450, .95); M.place('tree_osmanthus_a', 1900, 1660, .95); M.place('tree_wisteria_a', 1560, 1690, .9); M.place('stone_tea', 1760, 1560, 1.0); M.place('bamboo_chair', 1680, 1580, 1.0); M.place('bamboo_chair', 1840, 1580, 1.0, flip=True)
    M.place('tree_maple_red_a', 420, 900, .9); M.place('tree_ginkgo_a', 2000, 860, .9)
    # 府院石板上：中轴两侧对植银杏、桂花，树下落叶；花盆、青瓷缸成组
    for x, y, nm in [(cx - 520, 980, 'tree_ginkgo_a'), (cx + 520, 980, 'tree_ginkgo_a'), (cx - 560, 1250, 'tree_osmanthus_a'), (cx + 560, 1250, 'tree_osmanthus_a')]:
        M.place(nm, x, y, .9, flip=x > cx)
        lv = 'plant_leaves_gold' if 'ginkgo' in nm else 'plant_leaves_brown'
        for k in range(3): M.decal(lv, x + M.rng.uniform(-100, 100), y + M.rng.uniform(5, 60), M.rng.uniform(.7, 1.0))
    for x, y in [(cx - 120, 1000), (cx + 120, 1000), (cx - 440, 1420), (cx + 440, 1420), (cx - 420, 1090), (cx + 420, 1090)]:
        M.place(M.rng.choice(['prop_flower_pot', 'prop_celadon_jar', 'prop_flower_pot']), x, y, 1.0)
    for x, y, nm in [(cx - 420, 640, 'prop_flower_pot'), (cx + 420, 640, 'prop_flower_pot'), (cx - 330, 1700, 'prop_celadon_jar'), (cx + 330, 1700, 'prop_celadon_jar'),
                     (330, 1000, 'prop_flower_pot'), (1970, 1120, 'prop_celadon_jar'), (2060, 1300, 'prop_flower_pot')]: M.place(nm, x, y, 1.0)
    for x, y in [(330, 780), (560, 940)]: M.decal(M.rng.choice(['flowers1', 'flowers2', 'flowers3', 'detail_flowers_gold']), x, y, 1.3)
    for y in (760, 1150, 1560): M.place('cy_manor_lantern', cx - 230, y, .9, flip=False); M.place('cy_manor_lantern', cx + 230, y, .9, flip=True)
    M.place('stone_lion', cx - 220, 1780, 1.0, flip=False); M.place('stone_lion', cx + 220, 1780, 1.0, flip=True)
    M.place('detail_flower_planter', cx - 330, 640, .9); M.place('detail_flower_planter', cx + 330, 640, .9, flip=True)
    M.place('ding', cx, 900, .8, flip=False)
    M.place('weapon_rack', 300, 1100, .8); M.place('detail_rain_barrel', 2000, 1120, .85)
    M.freeze()
    M.scatter(['grass1', 'grass3', 'flowers1', 'flowers2', 'shrub', 'plant_iris', 'plant_daisy_white', 'plant_verbena', 'plant_daisy_yellow'], 90, lambda x, y: gm[int(y), int(x)] > .5, sc=(.8, 1.1))
    M.spots.update(court=(cx, 1200))
    M.meta = dict(grade='rgba(255,180,110,.04)')
    finish(M, None, [(cx, 1200), (cx, 700), (450, 1350), (1800, 1250)])

# ======================= 议事正堂 =======================
def cy_council():
    M = Map('cy_council', '苍月城主府 · 议事正堂', 1536, 1152, 'open', seed=121)
    room(M, 'wall_steward', 'wood')
    M.exit('cy_manor', '返回府院', (700, 1100, 136, 52), (768, 1010), 'up')
    cx = 768
    M.place('manor_rug', cx, 800, 1.1, flip=False)
    M.place('silk_screen', cx, 470, 1.0, flip=False)
    M.place('elder_chair', cx, 560, .85, flip=False)
    for i, y in enumerate((660, 800, 940)):
        M.place('taishi', cx - 330, y, 1.0, flip=False); M.place('tea_table', cx - 330, y + 60, .7, flip=False)
        M.place('taishi', cx + 330, y, 1.0, flip=True); M.place('tea_table', cx + 330, y + 60, .7, flip=True)
    for x in (cx - 520, cx + 520):
        for y in (520, 980): M.place('red_pillar', x, y, 1.0, flip=False)
    M.place('stand_lamp', cx - 200, 520, 1.0); M.place('stand_lamp', cx + 200, 520, 1.0, flip=True)
    M.place('pot_bamboo_l', 150, 520, .9); M.place('pot_bamboo_l', 1380, 520, .9, flip=True)
    M.place('scroll_shelf', 280, 470, .95); M.place('cabinet', 1260, 470, 1.0, flip=True)
    M.spots.update(lord=(cx, 640))
    M.lights += [dict(x=cx - 200, y=320, r=150, c='255,200,130'), dict(x=cx + 200, y=320, r=150, c='255,200,130')]
    M.meta = dict(indoor=True)
    finish(M, None, [(cx, 760), (cx, 1000)])

def guest(id, title, wall, seed, extra):
    M = Map(id, title, 1024, 832, 'open', seed=seed)
    room(M, wall, 'wood')
    M.exit('cy_manor', '返回客院', (446, 784, 132, 48), (512, 710), 'up')
    extra(M)
    M.meta = dict(indoor=True)
    finish(M, None, [(512, 600), (512, 740)])

def cy_guest_ye():
    def ex(M):
        M.place('old_guest_bed', 774, 493, 1.0, flip=True)
        M.place('old_guest_desk', 267, 493, .95, flip=False); M.place('desk_chair', 267, 546, 1.0)
        M.place('meditation_mat', 513, 563, .8, flip=False)
        M.place('weapon_rack', 934, 722, .8, flip=True); M.place('stand_lamp', 125, 440, 1.0); M.place('pot_bamboo', 943, 440, .9, flip=True)
        M.place('tea_table', 267, 722, .8); M.spots.update(rest=(512, 600))
    guest('cy_guest_ye', '城主府客舍 · 叶孤星', 'wall_bed', 131, ex)

def cy_guest_yun():
    def ex(M):
        M.place('canopy_bed', 267, 546, .9, flip=False)
        M.place('desk', 765, 493, 1.0, flip=True); M.place('desk_chair', 765, 546, 1.0, flip=True)
        M.place('screen', 513, 422, .85, flip=False); M.place('stand_lamp', 943, 440, 1.0, flip=True)
        M.place('wardrobe', 926, 704, .7, flip=True); M.place('water_jar', 134, 722, 1.0); M.spots.update(rest=(512, 610))
    guest('cy_guest_yun', '城主府客舍 · 云霆', 'wall_shop', 141, ex)

def cy_guest_lin():
    def ex(M):
        M.place('old_guest_bed', 267, 493, 1.0, flip=False)
        M.place('bookcase', 801, 458, .75, flip=True); M.place('desk', 694, 563, .9, flip=True); M.place('desk_chair', 694, 616, 1.0, flip=True)
        M.place('detail_flower_planter', 943, 722, .9, flip=True); M.place('detail_orchid_white', 125, 739, 1.0)
        M.place('tea_set', 374, 722, .8); M.place('stand_lamp', 498, 440, 1.0); M.spots.update(rest=(512, 610))
    guest('cy_guest_lin', '城主府客舍 · 林雪', 'wall_guest', 151, ex)

# ======================= 苍月北郊 · 荒林阵门 =======================
def cy_north():
    M = Map('cy_north', '苍月北郊 · 荒林阵门', 2816, 2304, 'closed', seed=161)
    M.path([(1400, 2350), (1380, 2000), (1250, 1700), (1300, 1350), (1420, 1050), (1420, 760)], 200)
    M.blob(1420, 800, 420, 220, dirt=.45)                       # 山坡下的空地（阵门）
    M.path([(1250, 1700), (900, 1600), (600, 1350), (520, 1050)], 150); M.blob(500, 1010, 170, 110, dirt=.5)
    M.path([(1300, 1350), (1700, 1300), (2100, 1450), (2350, 1700)], 150); M.blob(2380, 1740, 180, 120, dirt=.5)
    M.exit('cy_street', '返回苍月城', (1320, 2240, 170, 64), (1400, 2140), 'up')
    M.exit('xx_b1', '进入山坡下密道', (1360, 600, 120, 56), (1420, 740), 'down')
    g = grade(meadow(M), .82, .55, (1.08, 1.0, .82))
    nd = fbm(M.w, M.h, 320, 4, seed=M.seed + 77)
    g = blend(g, grade(tex9('dry_grass', M.w, M.h), .8, .75, (1.0, .97, .92)), np.clip(.45 + .5 * smooth(nd, .35, .7), 0, 1))
    M.ground = g; M.paint_ground(g, dirt_tex=dirt(M, .85))
    M.freeze()
    patch9(M, 'red_earth', cover=.10, nscale=260, seed=31, bright=.78, sat=.6, onpath=.7)
    patch9(M, 'gravel', cover=.10, nscale=200, seed=32, bright=.85, onpath=.6)
    D = np.asarray(Image.fromarray(M._D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    far = 1 - .35 * smooth(D, 40, 380)
    # 山坡：一排崖石，正中藏着洞口；四周符文石柱
    M.place('xx_entry', 1420, 620, 1.0, flip=False, foot=(-200, -120, 200, 0))
    for x, nm, f in [(900, 'cliff_high', False), (1960, 'cliff_high', True), (560, 'crag', False), (2300, 'crag', True), (1100, 'cliff', False), (1760, 'cliff', True)]:
        M.place(nm, x, 600 + (40 if nm == 'cliff' else 0), 1.0, flip=f)
    M.rect(0, 0, 2816, 560, nowalk=True)
    for a in (-2.6, -1.9, -1.2, -0.5):
        M.place('detail_rune_obelisk', 1420 + math.cos(a) * 380 + 0, 820 - math.sin(a) * 160 + 20, .8, flip=False)
    M.decal('detail_rune_floor_shard', 1280, 860, 1.3); M.decal('detail_rune_floor_shard', 1560, 900, 1.1)
    M.spots.update(weak=(1330, 840), entrance=(1420, 760))
    M.lights += [dict(x=1420, y=560, r=200, c='180,60,90')]
    M.chests = [(500, 990), (2380, 1720)]
    M.forest(['dead_tree', 'tree_deadwood_a', 'tree_deadwood_b', 'tree_pine_a', 'pine', 'tree_tallow_a', 'tree_maple_amber_a', 'dead_tree', 'tree_deadwood_a'], spacing=150, margin=30, scale=(.85, 1.1), maxcover=.14)
    M.forest(['shrub_big', 'rock2b', 'plant_shrub_gold', 'plant_shrub_red', 'rock_sandstone', 'rock_slate', 'dead_tree'], spacing=110, margin=14, scale=(.8, 1.1), maxcover=.6)
    M.scatter(['grass3', 'detail_root_knotted', 'rock1', 'crow', 'bones', 'plant_foxtail', 'plant_thatch', 'plant_reed', 'plant_spider_lily', 'rock_gravel_heap', 'plant_leaves_brown', 'decal_straw', 'decal_grit'], 170, lambda x, y: M.dw(x, y) < 90, sc=(.8, 1.1))
    M.zones = [dict(x=900, y=1600, r=220), dict(x=2000, y=1400, r=220), dict(x=1300, y=1300, r=180)]
    M.mobs = dict(n=5, types=['xiexiu', 'corpse', 'xiexiu'], bg='bg_cangyue', lv=3)
    M.meta = dict(grade='rgba(60,50,70,.12)')
    finish(M, far, [(1420, 880), (1300, 1500), (520, 1080)])
