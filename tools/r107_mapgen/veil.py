# 遮天灵瀑 · 碧潭听瀑：照作者选定的 Codex 概念图 01（work/falls_concepts/build.cjs 同一套算法铺地），
# 拼成可走地图。改细节：土路换成更亮的暖土；树不再全是柳，同一位置换成不同树种；去掉画在图里的两个人；
# 瀑前平地放传送法阵（去神像古道），南口回秘境裂隙。
import json, math, os
import numpy as np
from PIL import Image, ImageOps
from core import S, OUT, REG, reg, asset
import common, codexmap
codexmap.register_all()
V = S + '/veil/'; SRC = V + 'src/outputs/'
W, H = 1440, 960
D = dict(water=[[570, 451, 595, 255], [466, 688, 387, 145]], route=[[720, 1000], [720, 546]], portal=([720, 546], [236, 126]),
         falls=[['great', 720, 464, 709]], ridge=[[150, 388, 392], [300, 349, 410], [1030, 322, 430], [1288, 344, 385]],
         trees=[['willow', 176, 612, 262], ['pear', 1062, 355, 177], ['magnolia', 1254, 635, 216], ['willow', 104, 984, 291], ['pear', 1293, 957, 215]])
# 概念图里的树种 → 换成更多样的（位置、大小不变）
TREE_SWAP = {('willow', 176): 'v_willow', ('pear', 1062): 'tree_plum_white_a', ('magnolia', 1254): 'v_magnolia', ('willow', 104): 'tree_ginkgo_a', ('pear', 1293): 'moon_albizia'}
EDGE = [[25, 168, 215, 'moon_camphor'], [197, 107, 183, 'tree_maple_red_a'], [355, 90, 206, 'moon_osmanthus'], [1217, 109, 180, 'tree_pine_a'], [1381, 194, 262, 'moon_camphor']]
for k, f in [('v_cascade', 'ritual_library_r1/overnight_review/assets/cangyue_r61/nw_falls.png'), ('v_ridge', 'batch4/objects/cliff_outcrop.png'), ('v_rock', 'batch4/objects/rock_02.png'),
             ('v_fern', 'ritual_library_r1/overnight_review/assets/cangyue_r61/detail_fern_fan.png'), ('v_white', 'ritual_library_r1/overnight_review/assets/cangyue_r61/detail_orchid_white.png'),
             ('v_willow', 'ritual_library_r1/overnight_review/assets/cangyue_r61/tree_willow.png'), ('v_magnolia', 'ritual_library_r1/overnight_review/assets/cangyue_r61/tree_magnolia.png'),
             ('v_pear', 'ritual_library_r1/overnight_review/assets/cangyue_r61/tree_pear.png')]:
    if k not in REG: reg(k, 'pk', SRC + f, None, 'tree' if k in ('v_willow', 'v_magnolia', 'v_pear') else 'prop')

def seg_dist(X, Y, line):
    d = np.full(X.shape, 1e6, np.float32)
    for (a, b), (c, e) in zip(line, line[1:]):
        dx, dy = c - a, e - b; u = np.clip(((X - a) * dx + (Y - b) * dy) / (dx * dx + dy * dy), 0, 1)
        d = np.minimum(d, np.hypot(X - a - u * dx, Y - b - u * dy))
    return d

def ground():
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = seg_dist(X, Y, D['route']); wob = 7 * np.sin(X / 54 + Y / 47) + 4 * np.sin(X / 24 - Y / 36)
    pond = np.max([(1 - np.hypot((X - a) / rx, (Y - b) / ry)) * ry for a, b, rx, ry in D['water']], 0)
    tree = np.min([(np.hypot((X - a) / (w * .72), (Y - b) / (w * .33)) - 1) * w * .33 for _, a, b, w in D['trees']], 0)
    (cx, cy), (pw, ph) = D['portal']
    clearing = (1 - np.hypot((X - cx) / (pw / 2 + 29), (Y - cy) / (ph / 2 + 20))) * (ph / 2 + 20)
    road = np.maximum(94 - dist, clearing + 16) + 2 * np.sin(Y / 38)
    bank = np.maximum(120 - dist, clearing + 33) + 3 * np.sin(Y / 51)
    wedge = np.minimum(np.minimum(pond + wob, -bank), tree + wob)
    wet = np.clip((wedge + 4) / 9, 0, 1)
    dirt = np.maximum(np.clip(road / 25, 0, 1), np.clip((19 - np.abs(wedge)) / 23, 0, 1) * .56)
    T = lambda n, s=256: np.asarray(Image.open(V + n + '.png').convert('RGB').resize((s, s), Image.LANCZOS), np.float32)
    gr, er, wa = T('grass_detail'), T('dirt_detail'), T('water_detail')
    er = er * np.array([1.12, 1.1, 1.04]) + 14      # 更亮的暖土（作者：土地太丑，要亮一点）
    tx = ((X + np.floor(10 * np.sin(Y / 73))).astype(int)) & 255; ty = Y.astype(int) & 255
    wy = (np.floor(Y + 10 * np.sin(X / 110)).astype(int)) & 255; wx = (np.floor(X + 18 * np.sin(Y / 64)).astype(int)) & 255
    G, E, Wt = gr[ty, tx], er[ty, tx], wa[wy, wx] * .77 + np.array([14, 44, 43])
    out = (G * (1 - dirt[..., None]) + E * dirt[..., None]) * (1 - wet[..., None]) + Wt * wet[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), wet, dist

def build():
    g, wet, dist = ground()
    objs = []
    def put(name, x, y, width, flip=False, block=None):
        im, ax, bot = asset(name); sc = width / im.width; w, h = im.width * sc, im.height * sc
        objs.append(dict(id=name, x=round(x - w / 2, 1), y=round(y - h, 1), w=round(w, 1), h=round(h, 1), sy=round(y, 1), flat=False, flip=bool(flip), _b=block, _cx=x, _cy=y, _w=w))
    for i, (x, y, s) in enumerate(D['ridge']): put('v_ridge', x, y, s, i % 2 == 1, 'base')
    for n, x, y, s in D['falls']: put('v_cascade', x, y, s, False, 'falls')
    for x, y, w, nm in EDGE: put(nm, x, y, w, False, 'trunk')
    a, b, rx, ry = D['water'][-1]
    for i in range(17):
        ang = .09 + i * .185; xx, yy = a + rx * math.cos(ang), b + ry * math.sin(ang)
        if xx < 8 or xx > W - 8 or seg_dist(np.array([xx]), np.array([yy]), D['route'])[0] < 103 or i % 4 == 0: continue
        put('v_fern' if i % 3 == 0 else 'v_rock', xx, yy, 28 + (i * 13) % 37, i % 2 == 1, None if i % 3 == 0 else 'rock')
        if i % 3 == 0: put('v_white', xx + 22, yy + 10, 27)
    for nm, x, y, sz in D['trees']: put(TREE_SWAP[(nm, x)], x, y, sz, False, 'trunk')
    for i, (_, x, y, sz) in enumerate(D['trees']):
        sign = -1 if i % 2 else 1
        for nm, dx, dy, ww in [('v_rock', .28, 6, 48), ('v_fern', .34, 12, 63), ('v_white', .48, 22, 55), ('v_white', .58, 11, 38)]:
            xx = x + dx * sz * sign
            if seg_dist(np.array([xx]), np.array([y + dy]), D['route'])[0] > 80: put(nm, xx, y + dy, ww, sign < 0, 'rock' if nm == 'v_rock' else None)
    for x, y, w in [(1062, 585, 50), (1233, 768, 52)]: put('v_fern', x, y, w)
    for x, y, w in [(1088, 592, 36), (1256, 773, 37)]: put('v_white', x, y, w)
    # 路边点几丛小花和草（不压路面）
    rng = np.random.default_rng(5)
    for _ in range(60):
        x, y = rng.uniform(40, W - 40), rng.uniform(560, H - 20)
        dd = seg_dist(np.array([x]), np.array([y]), D['route'])[0]
        if 110 < dd < 200 and wet[int(y), int(x)] < .05:
            nm = str(rng.choice(['plant_daisy_white', 'plant_daisy_yellow', 'plant_iris', 'detail_flowers_blue', 'grass3'])); put(nm, x, y, asset(nm)[0].width * rng.uniform(.8, 1.05))
    # ---- 碰撞（16px 格）----
    cs = 16; C, R = W // cs, H // cs
    B = np.zeros((R, C), bool)
    wm = np.asarray(Image.fromarray((wet > .45).astype(np.uint8) * 255).resize((C, R), Image.BOX)) > 100
    B |= wm
    for o in objs:
        t = o['_b']
        if not t: continue
        x, y, w = o['_cx'], o['_cy'], o['_w']
        if t == 'trunk': x0, x1, y0, y1 = x - 14, x + 14, y - 16, y + 4
        elif t == 'rock': x0, x1, y0, y1 = x - w * .35, x + w * .35, y - 14, y
        elif t == 'base': x0, x1, y0, y1 = x - w * .5, x + w * .5, y - 70, y
        else: x0, x1, y0, y1 = x - w * .44, x + w * .44, 0, y - 22      # 瀑布崖壁整块挡住
        B[max(0, int(y0 // cs)):max(0, int(y1 // cs)) + 1, max(0, int(x0 // cs)):max(0, int(x1 // cs)) + 1] = True
    B[:int(330 // cs)] = True                         # 北边崖顶以上不可走
    B[:, :2] = True; B[:, -2:] = True; B[-2:, :] = True
    exits = [dict(to='nw_stones', label='返回五色石山径', rect=[650, 928, 140, 32], spawn=[720, 880], face='down', arrow=None),
             dict(to='nw_passage', label='穿过水帘 · 瀑后归径', rect=[690, 530, 60, 30], spawn=[720, 640], face='down', arrow=None)]
    for e in exits:
        x, y, w, h = e['rect']; B[y // cs:(y + h) // cs + 1, x // cs:(x + w) // cs + 1] = False
    B[int(500 // cs):int(960 // cs), int(650 // cs):int(790 // cs)] &= np.asarray(Image.fromarray((wet > .45).astype(np.uint8) * 255).resize((C, R), Image.BOX))[int(500 // cs):int(960 // cs), int(650 // cs):int(790 // cs)] > 100
    d = f'{OUT}/nw_falls'; os.makedirs(d, exist_ok=True)
    g.save(f'{d}/ground.webp', quality=88, method=6)
    for o in objs:
        for k in ('_b', '_cx', '_cy', '_w'): o.pop(k)
    J = dict(id='nw_falls', title='遮天灵瀑 · 碧潭听瀑', w=W, h=H, cs=cs, cols=C, rows=R, blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs, exits=exits,
             spots={'falls': [720, 600], 'portal': [720, 546]}, chests=[], zones=[], lights=[dict(x=720, y=330, r=300, c='190,230,255')], mobs=None,
             meta=dict(grade='rgba(255,250,240,.02)'), cascade=True, water=[])   # 水面白色波纹特效作者觉得难看，取消
    json.dump(J, open(f'{d}/map.json', 'w'), ensure_ascii=False)
    print('veil ok', len(objs))

if __name__ == '__main__': build()
