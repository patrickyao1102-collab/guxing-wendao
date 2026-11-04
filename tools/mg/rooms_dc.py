# 城主府客舍：直接用 Codex R116「01_大城 · 客房」样板房拆件（按样板原位拼回），
# 原来的单人客榻换成 Codex 补画的双枕青纱架子床（苍月城主府只有两间客房，两人住一间）。
import json, os, math
import numpy as np
from PIL import Image
from core import S, OUT, REG, reg, asset

SRC = S + '/codexlib/chai/'
BED_PARTS = {f'dacheng_guest_{n}' for n in ('bed_platform', 'platform_strip', 'ivory_drape', 'bed_base',
             'daybed_mattress', 'daybed_mattress_contact', 'round_bolster', 'square_pillow', 'bed_runner', 'bed_book', 'silk_canopy', 'curtain_ring', 'tassel')}

def layers(room, drop=(), add=()):
    d = json.load(open(f'{SRC}{room}/拆件/清单.json'))['assets']
    L = []
    for k, v in d.items():
        if v['placement'] != '样板原位' or k in drop: continue
        L.append(dict(v, name=k))
    for k, at, z in add:
        L.append(dict(d[k], name=k, anchor_world_px=at, z_index=z))
    for v in L:
        n = 'dc_' + v['name']
        if n not in REG: reg(n, 'pk', f"{SRC}{room}/拆件/{v['file']}", None, 'prop'); REG[n]['notrim'] = True
    return sorted(L, key=lambda v: v['z_index'])

GUEST_FRONT = {'dc_dacheng_guest_canopy_header', 'dc_dacheng_guest_canopy_post_left', 'dc_dacheng_guest_canopy_post_right'}
ROOMS = {
    # 客舍：单人客榻换双枕青纱架子床；原床的描金顶檐、两根金箍柱压在新床前，盖住床后墙上补不全的那一条
    'cy_guest': dict(room='客房', title='城主府 · 东厢客舍', drop=BED_PARTS, add=[('dacheng_guest_double_canopy_bed', [1040, 388], 16)],
                     front=GUEST_FRONT, front_sy=388.5, door=(520, 752), wall_y=300, spots={'bed': [1040, 410]}),
    # 内寝：朱漆月冠架床、妆台、贵妃榻，照样板原样
    'cy_bedroom': dict(room='主人卧房', title='城主府 · 东厢内寝', drop=set(), add=[], door=(404, 846), wall_y=250, spots={'bed': [355, 330]}),
    # 书房：通顶书架、大书案、山川挂轴；门前那道月纹横栏拿掉，留出进门的路
    'cy_study': dict(room='书房', title='城主府 · 西厢书房', drop={'dacheng_study_rail_middle'}, add=[], door=(408, 864), wall_y=250, spots={'desk': [850, 450]}),
}

def build(rid):
    R_ = ROOMS[rid]; room = R_['room']; W, H = 1280, 720
    L = layers(room, drop=R_['drop'], add=R_['add'])
    G = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    def tl(v): return v['anchor_world_px'][0] - v['anchor_px'][0], v['anchor_world_px'][1] - v['anchor_px'][1]
    # 地面层：地板、地毯、原室窗光、背墙（人走不到背墙前面，烘进底图）
    # 按 z 从小往上，开头连着的那一串地板 / 窗光 / 房壳墙都烘进底图；地毯也烘；其余（家具、摆件、前檐栏杆）都是会和人排前后的物件
    bake = set(); 
    for v in L:
        if v['category'] in ('floor', 'wall') or 'ground_light' in v['name']: bake.add(v['name'])
        else: break
    bake |= {v['name'] for v in L if v['category'] == 'rug' or 'ground_light' in v['name']}
    furn = [v for v in L if v['name'] not in bake]
    for v in L:
        if v in furn: continue
        im = Image.open(f"{SRC}{room}/拆件/{v['file']}").convert('RGBA'); G.alpha_composite(im, tuple(int(round(t)) for t in tl(v)))
    # 承托：桌上、架上的小件跟着它下面那件家具排前后，不然人站在桌后会被桌子挡住、却挡住桌上的茶壶
    sup = [v for v in furn if v['footprint'][0] > 0]
    objs = []; cs = 16; Cn, R = math.ceil(W / cs), math.ceil(H / cs); B = np.zeros((R, Cn), bool)
    def blk(x0, y0, x1, y1): B[max(0, int(y0 // cs)):int(y1 // cs) + 1, max(0, int(x0 // cs)):int(x1 // cs) + 1] = True
    for v in furn:
        x, y = tl(v); w, h = v['size_px']; ax, ay = v['anchor_world_px']; sy = ay
        if v['footprint'][0] == 0:
            best = None                    # 压在它下面、离它最近（z 最大）的那件承托家具
            for s_ in sup:
                sx, sy0 = tl(s_); sw, sh = s_['size_px']
                if sx <= ax <= sx + sw and sy0 <= ay <= s_['anchor_world_px'][1] + 2 and s_['z_index'] < v['z_index'] and (best is None or s_['z_index'] > best['z_index']): best = s_
            if best: sy = max(sy, best['anchor_world_px'][1])
        else:
            fw, fd = v['footprint']; blk(ax - fw / 2, ay - fd, ax + fw / 2, ay - 2)
        objs.append(dict(id='dc_' + v['name'], x=round(x, 1), y=round(y, 1), w=w, h=h, sy=round(sy + v['z_index'] * .001, 3), flat=False, flip=False))
    for o in objs:
        if o['id'] in R_.get('front', ()): o['sy'] = R_['front_sy']
    blk(0, 0, W, R_['wall_y'])
    blk(0, 0, 40, H); blk(W - 30, 0, W, H)
    d0, d1 = R_['door']; cx = (d0 + d1) // 2
    blk(0, H - 40, d0, H); blk(d1, H - 40, W, H)      # 前檐矮栏，留中间进门的口
    exits = [dict(to='cy_manor', label='出门 · 回府院', rect=[cx - 80, H - 26, 160, 26], spawn=[cx, 620], face='down', arrow=None)]
    for e in exits:
        x, y, w, h = e['rect']; B[y // cs:(y + h) // cs + 1, x // cs:(x + w) // cs + 1] = False
    from scipy import ndimage
    lab, n = ndimage.label(~B); sp = lab[620 // cs, cx // cs]
    d_ = f'{OUT}/{rid}'; os.makedirs(d_, exist_ok=True)
    G.convert('RGB').save(f'{d_}/ground.webp', quality=90, method=6)
    J = dict(id=rid, title=R_['title'], w=W, h=H, cs=cs, cols=Cn, rows=R, blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs, exits=exits,
             spots=dict(center=[cx, 480], **R_.get('spots', {})), chests=[], zones=[], lights=[], mobs=None, meta=dict(indoor=True), water=[])
    json.dump(J, open(f'{d_}/map.json', 'w'), ensure_ascii=False)
    P = G.copy()
    for o in sorted(objs, key=lambda o: o['sy']): P.alpha_composite(asset(o['id'])[0], (int(o['x']), int(o['y'])))
    P.convert('RGB').save(f'{d_}/full.jpg', quality=88)
    print(rid, 'objs', len(objs), 'reach', (lab == sp).sum(), '/', (~B).sum())

def register():
    for rid, R_ in ROOMS.items():
        if os.path.exists(f"{SRC}{R_['room']}/拆件/清单.json"): layers(R_['room'], drop=R_['drop'], add=R_['add'])

if __name__ == '__main__':
    import sys
    for rid in (sys.argv[1:] or ROOMS): build(rid)
