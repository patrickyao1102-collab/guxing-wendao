import sys, math
import numpy as np
from PIL import Image
from core import *
from export import save_map, preview, views
import common
from common import patch9, LEAFPILES

FOREST_TREES = ['pine', 'pine_lush', 'maple', 'birch', 'scholar', 'yy_tree', 'tree_cypress_ancient', 'tree_camphor_ancient', 'tree_banyan_ancient', 'pine_big', 'pine_lush_big',
                'tree_pine_a', 'tree_pine_b', 'tree_maple_red_a', 'tree_maple_amber_a', 'tree_tallow_a', 'tree_deadwood_a', 'tree_ginkgo_a']
FOREST_W = [6, 6, 3, 3, 3, 5, 4, 3, 2, 2, 2, 7, 2, 4, 4, 3, 1, 2]

def forest_ground(M, dark=.80, litter=True):
    gr = grade(bomb(M.w, M.h, patches('grass'), seed=M.seed), dark, .82, (.9, 1, .93))
    dt = grade(bomb(M.w, M.h, patches('dirt'), seed=M.seed + 1), .9, .9, (1, .97, .92))
    # 林下：草地里掺一层枯叶土（越远离路越多），整体更暗
    M.freeze()
    D, st = M._D, M._st
    Df = np.asarray(Image.fromarray(D.astype(np.float32)).resize((M.w, M.h), Image.BILINEAR))
    n = fbm(M.w, M.h, 220, 4, seed=M.seed + 9)
    lit = smooth(Df / 260 + (n - .5) * .9, .35, .9) * .55 if litter else 0
    g = blend(gr, grade(dt, .8, .8), lit)
    M.ground = g
    M.paint_ground(g, dirt_tex=dt)
    W = smooth(Df, 10, 160)
    patch9(M, 'moss', cover=.30, nscale=240, seed=1, where=W, bright=.92)
    patch9(M, 'maple', cover=.15, nscale=300, seed=2, bright=.9, sat=.9, onpath=.5)
    patch9(M, 'ginkgo', cover=.10, nscale=260, seed=3, bright=.9, sat=.85, onpath=.5)
    far = 1 - .42 * smooth(Df, 40, 420) - .12 * (n - .5)
    return far

def forest_dress(M, species=FOREST_TREES, weights=FOREST_W, spacing=118, edge_props=True):
    M.freeze()
    # 林墙：靠路的一圈密一点、大小错落
    M.forest(species, spacing=spacing, margin=34, weights=weights, scale=(.86, 1.12))
    # 第二遍：小一号的树、灌木团补在大树之间（路南侧那圈只能种矮的）
    M.forest(['pine', 'pine_lush', 'maple', 'birch', 'yy_tree', 'scholar', 'tree_maple_red_a', 'tree_maple_amber_a', 'tree_pine_a', 'tree_tallow_a'], spacing=150, margin=30, scale=(.55, .72), maxcover=.22)
    M.forest(['shrub_big', 'bamboo_young', 'detail_fern_fan', 'detail_sacred_fern', 'mossrock', 'plant_shrub_red', 'plant_shrub_gold'], spacing=70, margin=16, scale=(.9, 1.3), maxcover=.6)
    if edge_props:
        # 路边灌木、蕨、石头、树桩：贴着可走区外沿
        M.scatter(['shrub', 'shrub2', 'shrub_big', 'fern', 'fern', 'detail_fern_fan', 'detail_fern_redtip', 'detail_sacred_fern', 'detail_ivy_mound'], int(M.w * M.h / 9000), lambda x, y: 4 <= M.dw(x, y) <= 70, sc=(.8, 1.2))
        M.scatter(['plant_shrub_red', 'plant_shrub_gold', 'plant_reed', 'plant_spider_lily', 'plant_iris'], int(M.w * M.h / 40000), lambda x, y: 6 <= M.dw(x, y) <= 60, sc=(.85, 1.1))
        M.scatter(['rock_moss_boulder'], int(M.w * M.h / 900000) + 1, lambda x, y: 30 <= M.dw(x, y) <= 90, decal=False, sc=(.42, .55))
        M.scatter(LEAFPILES + ['decal_leaf_litter', 'decal_lichen', 'decal_leaf_litter'], int(M.w * M.h / 30000), lambda x, y: M.dw(x, y) <= 40, sc=(.8, 1.15))
        M.scatter(['rock1', 'rock2', 'rock3', 'stump', 'mossrock', 'detail_fallen_log', 'detail_mushroom_amber', 'rock_slate'], int(M.w * M.h / 60000), lambda x, y: 18 <= M.dw(x, y) <= 60, decal=False, sc=(.8, 1.1))
        # 路面上零星的草丛、落叶、小花、蘑菇
        M.scatter(['grass1', 'grass2', 'grass3', 'grass4', 'mush', 'flowers1', 'flowers3', 'detail_mushroom_ivory', 'detail_root_knotted', 'detail_root_hollow'], int(M.w * M.h / 15000), lambda x, y: M.dw(x, y) == 0 and M.din(x, y) < 90, sc=(.75, 1.05))
        # 林子深处的地面也别空着
        M.scatter(['fern', 'shrub', 'detail_fern_fan', 'detail_ivy_mound', 'mush', 'grass3'], int(M.w * M.h / 14000), lambda x, y: M.dw(x, y) > 70, sc=(.8, 1.2))

def finish(M, far, views_at, mobs=None):
    M.bake(darken_far=far)
    M.collision(); M.mobs = mobs
    save_map(M)
    g = preview(M, 'full', hero=views_at[0], scale=.25, grid=False)
    preview(M, 'grid', scale=.18, grid=True)
    views(M, g, views_at)

# ======================= 幽影林 · 暮色宿营 =======================
def yy_edge():
    M = Map('yy_edge', '幽影林 · 林边宿营', 3072, 2304, 'closed', seed=11)
    # 主路：西南（玄天城方向）进 → 绕过林子 → 宿营空地 → 东北深入
    M.path([(420, 2330), (470, 2050), (640, 1800), (930, 1640), (1180, 1450), (1300, 1260)], 210)
    M.path([(1300, 1260), (1560, 1160), (1880, 1080), (2160, 900), (2420, 700), (2600, 420), (2700, 120), (2710, -40)], 200)
    # 宿营空地
    M.blob(1300, 1230, 320, 185, dirt=.7)
    # 岔路网：西边绕一圈回主路；北边一条死胡同（宝箱）；东边小环
    M.path([(930, 1640), (700, 1500), (520, 1250), (560, 980), (800, 860), (1050, 960), (1300, 1260)], 170)
    M.path([(560, 980), (380, 760), (300, 520)], 160)
    M.blob(300, 470, 150, 110, dirt=.75)
    M.path([(1880, 1080), (2050, 1300), (2300, 1450), (2560, 1420), (2700, 1200), (2600, 980), (2420, 700)], 170)
    M.path([(2300, 1450), (2350, 1750), (2600, 1950)], 160)
    M.blob(2640, 1990, 170, 120, dirt=.75)
    M.path([(1180, 1450), (1500, 1700), (1800, 1820), (2000, 2050)], 160)
    M.blob(2020, 2080, 140, 100, dirt=.7)
    M.exit('xt_city', '返回玄天城方向', (330, 2240, 180, 64), (430, 2150), 'up')
    M.exit('yy_deep', '深入幽影林', (2620, 0, 180, 60), (2700, 140), 'down')
    far = forest_ground(M)
    M.freeze()
    # 宿营：篝火、铺盖、吊锅、柴堆、四块镇阵石（简易防御阵）
    cx, cy = 1300, 1250
    M.place('campfire', cx, cy + 10, 1.0)
    M.place('detail_camp_bedroll', cx - 150, cy - 40, 1.0, flip=False)
    M.place('detail_camp_bedroll', cx + 140, cy - 60, 1.0, flip=True)
    M.place('detail_camp_cookpot', cx + 70, cy + 70, .95)
    M.place('firewood', cx - 120, cy + 90, 1.0)
    for a in (0.4, 2.0, 3.6, 5.2):
        M.place('detail_camp_wardstone', cx + math.cos(a) * 270, cy + math.sin(a) * 135 + 10, .85)
    M.place('lantern_wood', cx - 260, cy - 30, 1.0)
    M.spots['camp'] = (cx, cy + 40)
    # 路标、石灯
    M.place('waypost', 560, 1880, 1.0); M.place('lantern_stone', 2560, 520, 1.0); M.place('detail_forest_stone_marker', 2390, 760, .9)
    M.place('boundary', 400, 2000, 1.0)
    # 宝箱位置（死胡同尽头）
    M.chests = [(300, 430), (2660, 1960), (2030, 2060)]
    forest_dress(M)
    # 空地里几丛野花
    for x, y in [(1080, 1180), (1520, 1300), (1420, 1120)]: M.decal('flowers2', x, y)
    # 野怪游荡区：避开宿营空地
    M.zones = [dict(x=x, y=y, r=r) for x, y, r in [(700, 1500, 220), (560, 1000, 200), (2050, 1020, 260), (2500, 1450, 260), (1700, 1760, 220), (2500, 600, 200)]]
    M.mobs = dict(n=7, types=['ywolf', 'spider', 'ywolf', 'treant'], bg='bg_youying', lv=1)
    M.meta = dict(grade='rgba(30,40,60,.12)')
    finish(M, far, [(1300, 1330), (640, 1820), (2200, 900), (2550, 1450)], M.mobs)
    return M


# ======================= 幽影林 · 追虎迷径（纵横交错的密林）=======================
def yy_deep():
    M = Map('yy_deep', '幽影林 · 追虎迷径', 3072, 2432, 'closed', seed=23)
    N, E = M.maze(160, 140, 2900, 2250, 5, 4, width=165, extra=.3)
    # 南口（来自林边宿营）、东口（去苍月城）
    s0 = N[(0, 3)]; M.path([(430, 2470), (440, 2300), s0], 200)
    e0 = N[(4, 1)]; M.path([e0, (2900, e0[1] - 40), (3110, e0[1] - 60)], 190)
    M.exit('yy_edge', '返回林边宿营', (340, 2370, 180, 62), (430, 2280), 'up')
    M.exit('cy_gate', '穿林前往苍月城', (3010, int(e0[1]) - 150, 62, 180), (2900, e0[1] - 50), 'left')
    # 空地：魔虎撕斗处（中部）、秘境裂隙（西北）、死胡同里的宝箱
    t = N[(2, 2)]; M.blob(t[0], t[1], 260, 170, dirt=.55)
    r = N[(0, 0)]; M.blob(r[0], r[1], 230, 150, dirt=.4)
    M.exit('nw_falls', '误入秘境 · 灵花天瀑', (int(r[0]) - 60, int(r[1]) - 120, 120, 70), (r[0], r[1] + 40), 'down')
    dead = [k for k, d in M.mz_deg.items() if d == 1 and k not in ((0, 3), (4, 1), (0, 0), (2, 2))]
    for k in dead[:4]: M.blob(*N[k], 130, 95, dirt=.5)
    def ground(M):
        far = forest_ground(M, dark=.7)
        return far
    far = ground(M); M.freeze()
    # 魔虎撕斗：折断的树、倒木、骸骨
    M.place('dead_tree', t[0] - 170, t[1] - 60, 1.1); M.place('dead_tree', t[0] + 190, t[1] - 90, .95, flip=True)
    M.place('detail_fallen_log', t[0] - 40, t[1] + 80, 1.3); M.place('detail_fallen_log', t[0] + 120, t[1] + 40, 1.0, flip=True)
    M.decal('bones', t[0] + 60, t[1] - 30); M.decal('detail_root_knotted', t[0] - 90, t[1] + 20, 1.4); M.decal('crow', t[0] + 150, t[1] + 100)
    M.spots['tiger'] = (t[0], t[1] + 20)
    # 秘境裂隙：灵晶、发光灵植——空间在这里有点不对劲
    M.place('crystal', r[0] - 130, r[1] + 10, 1.0); M.place('crystal', r[0] + 140, r[1] - 20, .8, flip=True)
    M.place('spirit_crystal_tree', r[0] + 40, r[1] - 110, .9)
    for dx, dy, nm in [(-60, 70, 'spirit_star_grass'), (90, 60, 'detail_spirit_violet_cluster'), (-160, -60, 'detail_flowers_blue'), (170, 60, 'spirit_star_grass')]: M.decal(nm, r[0] + dx, r[1] + dy)
    M.spots['rift'] = (r[0], r[1] + 50)
    M.lights.append(dict(x=r[0], y=r[1] - 30, r=260, c='120,170,255'))
    M.chests = [N[k] for k in dead[:4]]
    forest_dress(M, species=['yy_tree', 'pine_big', 'pine_lush', 'tree_cypress_ancient', 'tree_camphor_ancient', 'tree_banyan_ancient', 'pine', 'maple', 'scholar_big', 'tree_pine_a', 'tree_pine_b', 'tree_maple_red_a', 'tree_maple_amber_a', 'tree_tallow_a', 'tree_deadwood_a'], weights=[7, 4, 4, 5, 4, 3, 4, 2, 2, 7, 2, 3, 3, 2, 1], spacing=112)
    M.zones = [dict(x=x, y=y, r=230) for (x, y) in [N[k] for k in N if k not in ((0, 3), (2, 2), (0, 0))]][:9]
    M.mobs = dict(n=9, types=['ywolf', 'spider', 'treant', 'ywolf', 'spider'], bg='bg_youying', lv=2)
    M.meta = dict(grade='rgba(10,30,45,.22)')
    finish(M, far, [(t[0], t[1] + 60), (r[0], r[1] + 60), (s0[0], s0[1]), (e0[0] + 200, e0[1])], M.mobs)
    return M
