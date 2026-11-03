# 城主府四厢：书房 / 内寝 / 庖屋 / 客舍。
# 房壳直接拆 Codex「旧印正堂」底图里的构件（窗格、粉墙、木柱、护墙板、前檐栏杆和隔扇门）重新拼，
# 和正堂一个画风；地面、窗墙排法、家具各房不同。
import json, os, math
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from core import S, OUT, REG, reg, asset, grade
import common, codexmap; codexmap.register_all()

HG = Image.open(S + '/manor/cy_council/ground.png').convert('RGB')   # 正堂底图 1920×1280
WALL_H = 348                      # 后墙到地面的分界
FRONT_Y0 = 955                    # 前檐条在正堂底图里的起点
FH = 1280 - FRONT_Y0              # 前檐条高 325
C = lambda box: HG.crop(box)

# ---- 后墙构件（都是 0..265 的窗墙 + 265..348 护墙板）----
W2 = C((1457, 0, 1658, 265)); W1 = C((370, 0, 462, 265))
PL = C((62, 0, 165, 265))                         # 粉墙板（带一道窗影）
COL = C((1403, 0, 1460, 265))                     # 柱 + 柱头
WAIN = C((66, 265, 190, WALL_H))                  # 护墙板
BASE = C((465, 1195, 520, 1280)).resize((57, 85), Image.LANCZOS)   # 柱础
SIDE_TOP = C((0, 0, 62, WALL_H)); SIDE_MID = C((0, 560, 62, 980))
SIDE_TOP_R = C((1858, 0, 1920, WALL_H)); SIDE_MID_R = C((1858, 560, 1920, 980))
MOD = {'W3': lambda: hcat([W2, W1]), 'W2': lambda: W2, 'P': lambda: PL, 'C': lambda: COL}

def hcat(ims):
    w = sum(i.width for i in ims); o = Image.new('RGB', (w, ims[0].height)); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width
    return o

def back_wall(seq):
    """seq 例：['P', 'W3', 'C', ('P', 'painting1'), ...]；两头自动加侧墙柱。返回墙图、各窗段 x 范围、柱位"""
    parts = []; wins = []; cols = []; x = 62
    for s in seq:
        k, pic = (s if isinstance(s, tuple) else (s, None))
        im = MOD[k]().copy()
        if k == 'P' and sum(1 for q in parts if q.width == PL.width) % 2 == 1: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if pic:
            p, _, _ = asset(pic); sc = 200 / p.height * .92; p = p.resize((round(p.width * sc), round(p.height * sc)), Image.LANCZOS)
            im.paste(p, ((im.width - p.width) // 2, 50), p)
        if k.startswith('W'): wins.append((x, x + im.width))
        if k == 'C': cols.append(x + im.width / 2)
        parts.append(im); x += im.width
    top = hcat(parts); W = top.width + 124
    wall = Image.new('RGB', (W, WALL_H))
    wall.paste(top, (62, 0))
    for xx in range(62, W - 62, WAIN.width): wall.paste(WAIN, (xx, 265))
    wall.paste(SIDE_TOP, (0, 0)); wall.paste(SIDE_TOP_R, (W - 62, 0))
    for c in cols:                                    # 柱子往下贯通护墙板
        sh = COL.crop((0, 150, 57, 233)); wall.paste(sh, (round(c - 28.5), 265))
    return wall, wins, cols

def front_strip(W):
    k = 40; r = (W - 694) // 2 - k; r2 = W - 694 - 2 * k - r
    pieces = [(0, 62), (465 - r, 465), (465, 520), (520, 520 + k), (730, 1190), (1400 - k, 1400), (1400, 1455), (1455, 1455 + r2), (1858, 1920)]
    im = hcat([C((a, FRONT_Y0, b, 1280)) for a, b in pieces])
    A = np.zeros((FH, W), np.float32)
    rgb = np.asarray(im, np.float32); mx = rgb.max(2); mn = rgb.min(2); sat = (mx - mn) / (mx + 1)
    x = 0; spans = []
    for (a, b) in pieces: spans.append((x, x + b - a, a)); x += b - a
    yy = np.arange(FH)[:, None]
    for x0, x1, a in spans:
        if a in (0, 1858, 465, 1400): A[:, x0:x1] = 1                      # 侧墙、柱子整条
        elif a == 465 - r or a == 1455: A[125:, x0:x1] = 1                 # 栏杆
        elif a == 730:                                                       # 门框 + 两扇开着的隔扇
            A[:, x0:x1] = (sat[:, x0:x1] > .3) * (yy >= 28)
            A[:, x0:x0 + 26] = np.maximum(A[:, x0:x0 + 26], (yy >= 190))
            A[:, x1 - 26:x1] = np.maximum(A[:, x1 - 26:x1], (yy >= 190))
    A[230:, :] = 1                                                           # 矮墙 + 门槛石
    A = ndimage.binary_opening(A > .5, iterations=1).astype(np.float32)
    A = np.asarray(Image.fromarray((A * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8)))
    # 高出矮墙的部分（柱、栏杆、门扇）另做一层前景，盖住屋里靠前的家具和人
    Ao = A.copy(); Ao[230:, :] = 0
    cx0 = [x0 for x0, x1, a in spans if a == 730][0]
    for c0, c1 in ((cx0 + 10, cx0 + 128), (cx0 + 332, cx0 + 450)): Ao[230:, c0:c1] = A[230:, c0:c1]
    ov = im.convert('RGBA'); ov.putalpha(Image.fromarray(Ao))
    im = im.convert('RGBA'); im.putalpha(Image.fromarray(A))
    return im, ov

def floor(kind, W, H):
    if kind == 'wood': return grade(common.wood_tex(W, H), 1.02, .95, (1.0, .97, .92))
    if kind == 'wood_light': return grade(common.wood_tex(W, H), 1.12, .85, (1.02, 1.0, .96))
    st = Image.open(S + '/loom/loom/stone-tile.png').convert('RGB')
    sc = .62 if kind == 'stone' else .46
    t = st.resize((round(st.width * sc), round(st.height * sc)), Image.LANCZOS); o = Image.new('RGB', (W, H))
    for y in range(0, H, t.height):
        for x in range(0, W, t.width): o.paste(t, (x, y))
    if kind == 'stone': return grade(o, 1.02, .55, (1.02, .97, .92))
    return grade(o, .82, .7, (1.08, .97, .84))            # 庖屋：烟熏过的暖灰方砖

def build(rid, title, seq, fkind, furn, back, H=1000, grade_css=None, lights=()):
    wall, wins, cols = back_wall(seq); W = wall.width
    G = floor(fkind, W, H)
    A = np.asarray(G, np.float32)
    # 窗影：每段窗往东南斜投一块暖光
    L = Image.new('L', (W, H), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(L)
    for x0, x1 in wins: d.polygon([(x0 + 14, WALL_H + 6), (x1 - 6, WALL_H + 6), (x1 + 110, WALL_H + 250), (x0 + 128, WALL_H + 250)], fill=70)
    L = np.asarray(L.filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
    A = A * (1 + .32 * L[..., None]) + np.array([30, 20, 4]) * L[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    sh = 1 - .38 * np.exp(-np.clip(yy - WALL_H, 0, None) / 46.0) * (yy > WALL_H)
    side = 1 - .3 * np.exp(-np.clip(np.minimum(xx - 62, W - 62 - xx), 0, None) / 60.0)
    A = A * (sh * side)[..., None]
    G = Image.fromarray(np.clip(A, 0, 255).astype(np.uint8)).convert('RGBA')
    G.paste(wall, (0, 0))
    for c in cols: G.alpha_composite(BASE.convert('RGBA'), (round(c - 28.5), WALL_H - 50))
    for y in range(WALL_H, H, SIDE_MID.height):
        G.paste(SIDE_MID, (0, y)); G.paste(SIDE_MID_R, (W - 62, y))
    fr, ov = front_strip(W); G.alpha_composite(fr, (0, H - FH))
    G = G.convert('RGB')
    bb = ov.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox(); ov = ov.crop(bb)
    fn = f'{S}/cxm/room_{rid}_front.png'; ov.save(fn)
    if f'{rid}_front' not in REG: reg(f'{rid}_front', 'pk', fn, None, 'prop')
    # ---- 家具 ----
    objs = []; cs = 16; Cn, R = math.ceil(W / cs), math.ceil(H / cs)
    B = np.zeros((R, Cn), bool)
    def blk(x0, y0, x1, y1): B[max(0, int(y0 // cs)):int(y1 // cs) + 1, max(0, int(x0 // cs)):int(x1 // cs) + 1] = True
    for it in furn:
        nm, x, y, sc = it[:4]; o = it[4] if len(it) > 4 else {}
        im, _, _ = asset(nm); w, h = im.width * sc, im.height * sc
        flat = o.get('flat', False)
        objs.append(dict(id=nm, x=round(x - w / 2, 1), y=round(y - h, 1), w=round(w, 1), h=round(h, 1), sy=0 if flat else round(y, 1), flat=flat, flip=bool(o.get('flip'))))
        if not flat and o.get('block', True):
            dep = o.get('dep', min(h * .32, 56)); bw = o.get('bw', .8) * w / 2
            blk(x - bw, y - dep, x + bw, y - 4)
    fi, _, _ = asset(f'{rid}_front')
    objs.append(dict(id=f'{rid}_front', x=bb[0], y=H - FH + bb[1], w=fi.width, h=fi.height, sy=H - 30, flat=False, flip=False))
    blk(0, 0, W, WALL_H + 22); blk(0, 0, 70, H); blk(W - 70, 0, W, H)
    cx = W // 2
    blk(0, H - 96, cx - 110, H); blk(cx + 110, H - 96, W, H)        # 前檐矮墙
    blk(0, H - 24, W, H)
    exits = [dict(to='cy_manor', label='出门 · 回府院', rect=[cx - 70, H - 64, 140, 44], spawn=[cx, H - 170], face='down', arrow=None)]
    for e in exits:
        x, y, w, h = e['rect']; B[y // cs:(y + h) // cs + 1, x // cs:(x + w) // cs + 1] = False
    # 连通检查：门口能走到屋里每个空地
    lab, n = ndimage.label(~B); sp = lab[(H - 170) // cs, cx // cs]
    free = (~B).sum(); reach = (lab == sp).sum()
    d_ = f'{OUT}/{rid}'; os.makedirs(d_, exist_ok=True)
    G.save(f'{d_}/ground.webp', quality=88, method=6)
    J = dict(id=rid, title=title, w=W, h=H, cs=cs, cols=Cn, rows=R, blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs, exits=exits,
             spots={'center': [cx, (WALL_H + H) // 2]}, chests=[], zones=[], lights=list(lights), mobs=None, meta=dict(indoor=True, **({'grade': grade_css} if grade_css else {})), water=[])
    json.dump(J, open(f'{d_}/map.json', 'w'), ensure_ascii=False)
    print(rid, W, H, 'objs', len(objs), 'reach', reach, '/', free)
    return W, H

def spawn_of(W, H): return [W // 2, H - 170]

ROOMS = {}
for _r in ('cy_study', 'cy_bedroom', 'cy_kitchen', 'cy_guest'):      # 前檐前景层（打包、渲染时要用）
    _f = f'{S}/cxm/room_{_r}_front.png'
    if os.path.exists(_f) and f'{_r}_front' not in REG: reg(f'{_r}_front', 'pk', _f, None, 'prop')
def all_rooms():
    # 书房：青灰石地，两堵三联窗，满墙书架，中间大书案
    ROOMS['cy_study'] = build('cy_study', '城主府 · 西厢书房',
        ['P', 'W3', 'C', ('P', 'painting1'), ('P', 'painting3'), 'C', 'W3', 'P'], 'stone', [
        ('manor_rug', 618, 690, .92, dict(flat=True)),
        ('bookcase', 190, 470, .82, dict(dep=60)), ('curio', 395, 430, .9, dict(dep=50)),
        ('scroll_shelf', 1010, 448, .92, dict(dep=50)), ('sutras', 1150, 452, .75, dict(dep=50)),
        ('desk_chair', 618, 528, .95, dict(dep=20)), ('desk', 618, 640, .98, dict(dep=60)),
        ('stand_lamp', 470, 560, .95, dict(bw=.6, dep=18)), ('stand_lamp', 770, 560, .95, dict(bw=.6, dep=18, flip=True)),
        ('cyc_tea_table', 270, 770, .95, dict(dep=40)), ('pot_bamboo_l', 1140, 780, .62, dict(dep=36)), ('ding', 1000, 770, .42, dict(dep=30)),
        ('detail_orchid_white', 1170, 560, .8, dict(block=False))], [516, 672],
        lights=[dict(x=470, y=420, r=130, c='255,210,140'), dict(x=770, y=420, r=130, c='255,210,140')])
    # 内寝：暖色木地板，挂帐大床、屏风、衣柜，一张绿毯
    ROOMS['cy_bedroom'] = build('cy_bedroom', '城主府 · 东厢内寝',
        ['P', 'W2', 'C', ('P', 'painting2'), 'P', 'C', 'W2', 'P'], 'wood', [
        ('jade_rug', 526, 690, .78, dict(flat=True)),
        ('bed_heir', 280, 600, .7, dict(dep=150, bw=.9)), ('silk_screen', 700, 520, .72, dict(dep=36)),
        ('wardrobe', 900, 496, .6, dict(dep=50)), ('indoor_lamp', 520, 480, 1.0, dict(bw=.5, dep=16)),
        ('tea_set', 800, 775, .55, dict(dep=40)), ('cabinet', 140, 780, .62, dict(dep=36)),
        ('detail_flower_planter', 960, 640, .85, dict(dep=26)), ('prop_flower_pot', 990, 780, .9, dict(block=False))], [2148, 664],
        lights=[dict(x=520, y=380, r=120, c='255,200,130')], grade_css='rgba(255,190,120,.04)')
    # 庖屋：烟熏方砖地，一面墙只开两扇窗，灶台、案板、坛坛罐罐
    ROOMS['cy_kitchen'] = build('cy_kitchen', '城主府 · 西厢庖屋',
        ['W2', 'C', 'P', 'P', 'P', 'C', 'W2'], 'brick', [
        ('stove', 300, 510, 1.3, dict(dep=70)), ('detail_storage_vessels', 470, 470, .95, dict(dep=26)), ('wood_counter', 640, 506, 1.0, dict(dep=44)), ('goods_shelf', 820, 456, .9, dict(dep=40)),
        ('water_jar', 130, 470, 1.0, dict(dep=26)), ('cyc_water_jar', 170, 520, .95, dict(dep=26)),
        ('firewood', 470, 580, 1.0, dict(dep=24)), ('herb_trays', 640, 452, .8, dict(block=False)), ('detail_vegetable_baskets', 640, 640, .9, dict(dep=30)),
        ('detail_pickle_crocks', 140, 775, 1.0, dict(dep=34)), ('detail_rice_barrels', 250, 780, .95, dict(dep=34)),
        ('cyc_wine_jars', 840, 775, .95, dict(dep=34)), ('detail_noodle_rack', 690, 775, .8, dict(dep=22)),
        ('detail_bamboo_broom', 860, 640, .9, dict(block=False)), ('sacks', 300, 650, .75, dict(dep=30))], [438, 1296],
        lights=[dict(x=290, y=430, r=170, c='255,150,70')], grade_css='rgba(255,170,90,.05)')
    # 客舍：浅色木地板，三联窗，简榻、书桌、蒲团、兵器架（来客习武之人住）
    ROOMS['cy_guest'] = build('cy_guest', '城主府 · 东厢客舍',
        ['W3', 'C', ('P', 'painting1'), 'P', 'C', 'W3'], 'wood_light', [
        ('meditation_mat', 515, 690, .8, dict(flat=True)),
        ('old_guest_bed', 800, 560, 1.12, dict(dep=80)), ('old_guest_desk', 240, 540, 1.05, dict(dep=40)), ('desk_chair', 240, 600, .95, dict(dep=24)),
        ('weapon_rack', 900, 780, .82, dict(dep=30)), ('tea_table', 210, 770, .95, dict(dep=34)), ('stand_lamp', 110, 520, .95, dict(bw=.6, dep=16)),
        ('pot_bamboo', 380, 470, .72, dict(dep=24)), ('prop_celadon_jar', 960, 520, .9, dict(dep=20)), ('detail_flower_planter', 930, 640, .85, dict(dep=24)), ('screen', 520, 470, .62, dict(dep=24))], [2117, 1296],
        lights=[dict(x=110, y=400, r=120, c='255,210,140')])

if __name__ == '__main__': all_rooms()
