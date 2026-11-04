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

def build_guest():
    rid, W, H = 'cy_guest', 1280, 720
    L = layers('客房', drop=BED_PARTS, add=[('dacheng_guest_double_canopy_bed', [1040, 388], 16)])
    G = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    def tl(v): return v['anchor_world_px'][0] - v['anchor_px'][0], v['anchor_world_px'][1] - v['anchor_px'][1]
    # 地面层：地板、地毯、背墙（人走不到背墙前面，烘进底图）
    WALLS = {'wall'}
    furn = [v for v in L if v['category'] not in ('floor', 'rug') and 'ground_light' not in v['name'] and not (v['category'] in WALLS and v['anchor_world_px'][1] < 300)]
    for v in L:
        if v in furn: continue
        im = Image.open(f"{SRC}客房/拆件/{v['file']}").convert('RGBA'); G.alpha_composite(im, tuple(int(round(t)) for t in tl(v)))
    # 承托：桌上、架上的小件跟着它下面那件家具排前后，不然人站在桌后会被桌子挡住、却挡住桌上的茶壶
    sup = [v for v in furn if v['footprint'][0] > 0]
    objs = []; cs = 16; Cn, R = math.ceil(W / cs), math.ceil(H / cs); B = np.zeros((R, Cn), bool)
    def blk(x0, y0, x1, y1): B[max(0, int(y0 // cs)):int(y1 // cs) + 1, max(0, int(x0 // cs)):int(x1 // cs) + 1] = True
    for v in furn:
        x, y = tl(v); w, h = v['size_px']; ax, ay = v['anchor_world_px']; sy = ay
        if v['footprint'][0] == 0:
            for s in sup:
                sx, sy0 = tl(s); sw, sh = s['size_px']
                if sx <= ax <= sx + sw and sy0 <= ay <= s['anchor_world_px'][1] + 2 and s['z_index'] < v['z_index']: sy = max(sy, s['anchor_world_px'][1]); break
        else:
            fw, fd = v['footprint']; blk(ax - fw / 2, ay - fd, ax + fw / 2, ay - 2)
        objs.append(dict(id='dc_' + v['name'], x=round(x, 1), y=round(y, 1), w=w, h=h, sy=round(sy + v['z_index'] * .001, 3), flat=False, flip=False))
    for o in objs:
        if o['id'] in ('dc_dacheng_guest_canopy_header', 'dc_dacheng_guest_canopy_post_left', 'dc_dacheng_guest_canopy_post_right'): o['sy'] = 388.5     # 原床的描金顶檐压在双人床上面，盖住床后墙上补不全的那一条
    blk(0, 0, W, 300)                    # 背墙、床台以北
    blk(0, 0, 40, H); blk(W - 30, 0, W, H)
    blk(0, H - 40, 520, H); blk(752, H - 40, W, H)   # 前檐矮栏，留中间开着的格扇门
    exits = [dict(to='cy_manor', label='出门 · 回府院', rect=[560, H - 26, 160, 26], spawn=[636, 620], face='down', arrow=None)]
    for e in exits:
        x, y, w, h = e['rect']; B[y // cs:(y + h) // cs + 1, x // cs:(x + w) // cs + 1] = False
    from scipy import ndimage
    lab, n = ndimage.label(~B); sp = lab[620 // cs, 636 // cs]
    d_ = f'{OUT}/{rid}'; os.makedirs(d_, exist_ok=True)
    G.convert('RGB').save(f'{d_}/ground.webp', quality=90, method=6)
    J = dict(id=rid, title='城主府 · 东厢客舍', w=W, h=H, cs=cs, cols=Cn, rows=R, blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs, exits=exits,
             spots={'center': [636, 480], 'bed': [1040, 410]}, chests=[], zones=[],
             lights=[dict(x=764, y=110, r=150, c='255,210,140'), dict(x=350, y=150, r=160, c='255,225,170')], mobs=None, meta=dict(indoor=True), water=[])
    json.dump(J, open(f'{d_}/map.json', 'w'), ensure_ascii=False)
    # 预览
    P = G.copy()
    for o in sorted(objs, key=lambda o: o['sy']): P.alpha_composite(asset(o['id'])[0], (int(o['x']), int(o['y'])))
    P.convert('RGB').save(f'{d_}/full.jpg', quality=88)
    print(rid, 'objs', len(objs), 'reach', (lab == sp).sum(), '/', (~B).sum())

def register():
    if os.path.exists(f'{SRC}客房/拆件/清单.json'):
        layers('客房', drop=BED_PARTS, add=[('dacheng_guest_double_canopy_bed', [1040, 388], 16)])

if __name__ == '__main__': build_guest()
