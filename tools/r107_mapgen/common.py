import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from core import *
from export import save_map, preview, views

# 室内墙、房子（旧图里用过的）
for n, k, kind in [('wall_bed', 'bedroom_wall_hd_r28_5f7151', 'big'), ('wall_steward', 'steward_wall_r32_f978a0', 'big'), ('wall_guest', 'lin_guest_wall_r26_656957', 'big'),
                   ('wall_shop', 'shop_wall_r36_427cf6', 'big'), ('wall_archive', 'archive_wall_r38_81e851', 'big'), ('wall_gov', 'governor_wall_r34_08a6bd', 'big'),
                   ('main_house', 'main_house_0e5437', 'big'), ('cottage', 'steward_cottage_r32_8213c2', 'big'), ('lin_hall', 'lin_main_hall_a35c68', 'big'),
                   ('residence', 'manor_residence_r25_3c99fa', 'big'), ('tj_wall', 'tj_wall_h_4a594f', 'big'), ('xt_inn', 'xt_inn_ffb880', 'big'),
                   ('rail_h', 'tj_rail_h_16be8d', 'prop'), ('column', 'governor_column_r34_4ca0ad', 'prop'), ('jade_pillar', 'jade_pillar_654de4', 'prop'),
                   ('carving_bench', 'carving_bench_r32_cb0ed7', 'prop'), ('watch_rack', 'library_watch_rack_r17_71db20', 'prop'), ('stone_swordsman', 'stone_swordsman_r32_95fa93', 'prop'),
                   ('plain_bed', 'steward_plain_bed_r32_b54762', 'prop'), ('medicine', 'medicine_cabinet_16bc3a', 'prop'), ('wood_counter', 'wood_counter_183baf', 'prop'),
                   ('goods_shelf', 'goods_shelf_7628c3', 'prop'), ('vip_tea', 'vip-tea_6cce68', 'prop'), ('manor_rug', 'bedroom_jade_rug_r6_906ad5', 'flat'),
                   ('spirit_lamp', 'xt_spirit_lamp_r18_0fcf32', 'prop'), ('lotus_lamp', 'archive_lotus_lamp_r4_376a78', 'prop'), ('pot_bamboo_l', 'bedroom_potted_bamboo_r6_62662d', 'prop'),
                   ('painting3', 'painting_changqing_r6_75faca', 'prop'), ('tea_set_l', 'bedroom_tea_set_r6_2f1d84', 'prop'), ('plank_bridge', 'route_bank_low_a6a3bd', 'flat')]:
    reg(n, 'cx', k, None, kind)

def wood_tex(w, h):
    src = srcimg('lin_guest_east').crop((24, 4, 1000, 800))
    out = Image.new('RGB', (w, h))
    for y in range(0, h, src.height):
        for x in range(0, w, src.width): out.paste(src if (x // src.width) % 2 == 0 else src.transpose(Image.FLIP_LEFT_RIGHT), (x, y))
    return out

def stone_tex(w, h, scale=.5, tint=(1, 1, 1), path=R61 + 'temple_floor.png'):
    return grade(tile_tex(path, w, h, scale), 1, .9, tint)

def meadow(M, bright=1.0, sat=1.0, mul=(1, 1, 1), seed=0):
    return grade(bomb(M.w, M.h, patches('grass'), seed=M.seed + seed), bright, sat, mul)

def dirt(M, bright=.95):
    return grade(bomb(M.w, M.h, patches('dirt'), seed=M.seed + 1), bright, .9, (1, .97, .92))

# ---- 水 ----
def paint_water(M, mask, deep=(38, 96, 108), shallow=(92, 158, 150), spirit=False):
    """mask: PIL L（255=水）。画水面 + 岸边湿土 + 浅滩亮边，水里不可走。"""
    w, h = M.w, M.h
    m = np.asarray(mask.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    inside = ndimage.distance_transform_edt(np.asarray(mask)[::4, ::4] > 127) * 4
    inside = np.asarray(Image.fromarray(inside.astype(np.float32)).resize((w, h), Image.BILINEAR))
    n = fbm(w, h, 120, 4, seed=M.seed + 31); n2 = fbm(w, h, 30, 2, seed=M.seed + 37)
    k = smooth(inside, 0, 140)[..., None]
    col = np.array(shallow, np.float32) * (1 - k) + np.array(deep, np.float32) * k
    col = col * (.9 + .2 * n[..., None]) + (n2[..., None] - .5) * 18
    if spirit: col = col + np.array([10, 20, 30]) * (n[..., None] > .6)
    # 波光
    n3 = fbm(w, h, 14, 2, seed=M.seed + 43)
    st = smooth(n3, .72, .82) * smooth(n, .45, .7) * .55 * smooth(inside, 10, 60)
    col = col + st[..., None] * np.array([110, 130, 120])
    # 浅滩亮边
    foam = smooth(inside, 0, 6) * (1 - smooth(inside, 6, 22))
    col = col * (1 - foam[..., None] * .5) + np.array([200, 225, 215]) * foam[..., None] * .5
    G = np.asarray(M.ground, np.float32)
    # 岸边湿土：水外一圈变暗
    out = ndimage.distance_transform_edt(np.asarray(mask)[::4, ::4] < 128) * 4
    out = np.asarray(Image.fromarray(out.astype(np.float32)).resize((w, h), Image.BILINEAR))
    wet = (1 - smooth(out, 0, 26)) * .32
    G = G * (1 - wet[..., None])
    G = G * (1 - m[..., None]) + col * m[..., None]
    M.ground = Image.fromarray(np.clip(G, 0, 255).astype(np.uint8))
    ImageDraw.Draw(M.nowalk)  # noqa
    M.nowalk.paste(255, mask=mask.point(lambda v: 255 if v > 100 else 0))
    M.noplant.paste(255, mask=mask.filter(ImageFilter.MaxFilter(31)).point(lambda v: 255 if v > 100 else 0))
    bb = mask.getbbox()
    if bb: M.water_rects = getattr(M, 'water_rects', []) + [list(bb[:2]) + [bb[2] - bb[0], bb[3] - bb[1]]]

def shore(M, mask, names=('rock1', 'rock2', 'rock3', 'reeds', 'fern'), n=40, d=(0, 30)):
    D = ndimage.distance_transform_edt(np.asarray(mask)[::4, ::4] < 128) * 4
    for _ in range(n * 30):
        if n <= 0: break
        x, y = M.rng.uniform(0, M.w), M.rng.uniform(0, M.h)
        v = D[min(D.shape[0] - 1, int(y / 4)), min(D.shape[1] - 1, int(x / 4))]
        if v > 0 and max(4, d[0]) <= v <= d[1]:
            nm = M.rng.choice(names); M.place(nm, x, y, M.rng.uniform(.8, 1.15), shadow=False, foot=False); n -= 1

# ---- 云海（山巅四周）----
def mist(M, mask_far, col=(226, 232, 238), strength=1.0):
    """mask_far: float HxW 0..1，1=完全是云。"""
    n = fbm(M.w, M.h, 160, 4, seed=M.seed + 41)
    a = np.clip(mask_far * (0.75 + .5 * n), 0, 1) * strength
    G = np.asarray(M.ground, np.float32)
    shade = np.array(col, np.float32) * (.93 + .1 * n[..., None])
    G = G * (1 - a[..., None]) + shade * a[..., None]
    M.ground = Image.fromarray(np.clip(G, 0, 255).astype(np.uint8))

def edge_dist(M):
    yy, xx = np.mgrid[0:M.h, 0:M.w]
    return np.minimum(np.minimum(xx, M.w - 1 - xx), np.minimum(yy, M.h - 1 - yy)).astype(np.float32)

def finish(M, far, views_at):
    M.bake(darken_far=far)
    M.collision()
    J = save_map(M)
    g = preview(M, 'full', hero=views_at[0], scale=.25)
    preview(M, 'grid', scale=.18, grid=True)
    views(M, g, views_at)

def room(M, wall, floor='wood', wall_h=None, door=(None, None)):
    """室内：地板 + 后墙（物件）+ 两侧暗边；返回可放家具的范围 (x0,y0,x1,y1)。"""
    w, h = M.w, M.h
    fl = wood_tex(w, h) if floor == 'wood' else grade(stone_tex(w, h, .24, (1.08, 1.0, .9)), 1.15, .75)
    im = asset(wall)[0]; sc = wall_h / im.height if wall_h else 1.0
    wh = im.height * sc; ww = im.width * sc
    M.ground = fl
    # 后墙按原尺寸并排铺满宽度
    n = math.ceil(w / ww); x0 = (w - n * ww) / 2
    for i in range(n):
        o = M.place(wall, x0 + ww * (i + .5), wh, sc, flip=(i % 2 == 1), foot=False, shadow=False); o['bake'] = True
    M.rect(0, 0, w, int(wh) + 10, nowalk=True)
    # 墙脚阴影 + 四周压暗
    G = np.asarray(M.ground, np.float32); yy, xx = np.mgrid[0:h, 0:w]
    sh = 1 - .35 * np.exp(-np.clip(yy - wh, 0, None) / 40) * (yy > wh)
    side = 1 - .45 * (1 - smooth(np.minimum(xx, w - 1 - xx).astype(np.float32), 0, 60)) - .3 * (1 - smooth((h - 1 - yy).astype(np.float32), 0, 50))
    G = G * (sh * side)[..., None]
    M.ground = Image.fromarray(np.clip(G, 0, 255).astype(np.uint8))
    M.rect(0, 0, 28, h, nowalk=True); M.rect(w - 28, 0, 28, h, nowalk=True); M.rect(0, h - 26, w, 26, nowalk=True)
    return (40, wh + 20, w - 40, h - 40)
