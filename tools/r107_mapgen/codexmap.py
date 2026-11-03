# Codex 做好的整图地图（千丝织天殿 / 月湖双息灵泉 / 苍月城南门府街）→ 新地图组格式。
# Codex 的格式：整张地面图 + assets（脚点）+ instances（世界脚点、缩放、翻转、terrain 平铺、windAtlas 逐帧）+ nav 碰撞格。
# 这里只做坐标换算和打包，画面全是 Codex 的原图。
import json, os
import numpy as np
from PIL import Image
from core import S, OUT, REG, reg, asset
Image.MAX_IMAGE_PIXELS = None

FLAT_IDS = {'seal', 'altar', 'verge', 'litter'}

def load(spec):
    m = json.load(open(spec['json']))
    return m

def path_of(spec, f):
    f = f[len(spec.get('strip', '')):] if spec.get('strip') and f.startswith(spec['strip']) else f
    return os.path.join(spec['root'], f)

def register(spec):
    m = load(spec); P = spec['pfx']
    for k, a in m['assets'].items():
        name = P + k
        if name in REG: continue
        im = Image.open(path_of(spec, a['file'])).convert('RGBA')
        sz = (round(a['size_px'][0]), round(a['size_px'][1]))
        if im.size != sz: im = im.resize(sz, Image.LANCZOS)
        p = f"{S}/cxm/{P}{k}.png"; os.makedirs(os.path.dirname(p), exist_ok=True); im.save(p)
        reg(name, 'pk', p, None, 'flat' if k in FLAT_IDS else 'prop')
    return m

def nav16(m):
    n = m['nav']; st = n.get('step_px', 16)
    B = np.array(n['blocked'], np.uint8).reshape(n['rows'], n['cols'])
    if st == 16: return B
    k = 16 // st; R, C = B.shape[0] // k, B.shape[1] // k
    s = B[:R * k, :C * k].reshape(R, k, C, k).sum((1, 3))
    return (s >= (k * k) // 2).astype(np.uint8)       # 一半以上挡住才算挡

def build(spec):
    m = register(spec); P = spec['pfx']; ID = spec['id']
    W, H = m['world_size_px']
    d = f'{OUT}/{ID}'; os.makedirs(d, exist_ok=True)
    Image.open(path_of(spec, m['ground'])).convert('RGB').resize((W, H)).save(f'{d}/ground.webp', quality=86, method=6)
    objs = []; anim = {}; moved = []
    for it in m['instances']:
        if it['id'] in spec.get('drop', ()) or it.get('uid') in spec.get('drop', ()): continue
        if it.get('uid') in spec.get('move', {}):
            it = dict(it); old = it['anchor']; it['anchor'] = spec['move'][it['uid']]; moved.append((it['id'], old, it['anchor']))
        a = m['assets'][it['id']]; sc = it.get('scale', 1); name = P + it['id']
        full = Image.open(REG[name]['key']); im, _, _ = asset(name)
        bb = full.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        ax, ay = a['anchor_px']; fx, fy = it['anchor']; flip = bool(it.get('flip'))
        flat = bool(it.get('terrain'))
        sy = it.get('sort_y', 0) if flat else it.get('sort_y', fy)
        if a.get('windAtlas'):   # 逐帧动的（丝帷、白鹿、仙鹤、灵雀）：整格不裁边
            w = a['windAtlas']; key = P + it['id']
            if key not in anim:
                src = 'w_' + key; Image.open(path_of(spec, w['file'])).convert('RGBA').save(f'{OUT}/{src}.webp', quality=88, method=6)
                anim[key] = dict(src=src, cols=w['columns'], count=w['count'], fps=w['fps'], fw=round(a['size_px'][0]), fh=round(a['size_px'][1]))
            x = fx - (full.width - ax) * sc if flip else fx - ax * sc
            objs.append(dict(id=name, x=round(x, 1), y=round(fy - ay * sc, 1), w=round(full.width * sc, 1), h=round(full.height * sc, 1), sy=round(sy, 1), flat=False, flip=flip, anim=int(it.get('windPhase', 0))))
            continue
        x = fx - (full.width - ax) * sc + (full.width - bb[2]) * sc if flip else fx - ax * sc + bb[0] * sc
        y = fy - ay * sc + bb[1] * sc
        objs.append(dict(id=name, x=round(x, 1), y=round(y, 1), w=round(im.width * sc, 1), h=round(im.height * sc, 1), sy=round(sy, 1), flat=flat, flip=flip))
    B = nav16(m)
    rows, cols = B.shape
    for k, (ox, oy), (nx, ny) in moved:      # 挪过的物件：旧脚下放开、新脚下挡住
        hw = m['assets'][k]['size_px'][0] * .5
        B[int((oy - 30) // 16):int(oy // 16) + 1, int((ox - hw) // 16):int((ox + hw) // 16) + 1] = 0
        B[int((ny - 30) // 16):int(ny // 16) + 1, int((nx - hw) // 16):int((nx + hw) // 16) + 1] = 1
    for e in spec['exits']:
        x, y, w, h = e['rect']; B[y // 16:(y + h) // 16 + 1, x // 16:(x + w) // 16 + 1] = 0
    for x, y, w, h in spec.get('open', []): B[y // 16:(y + h) // 16 + 1, x // 16:(x + w) // 16 + 1] = 0
    for x, y, w, h in spec.get('block', []): B[y // 16:(y + h) // 16 + 1, x // 16:(x + w) // 16 + 1] = 1
    if spec.get('decorate'): decorate(spec, objs, B)
    lake = None
    if m.get('lakeSurface'):
        L = m['lakeSurface']; src = 'lk_' + ID
        Image.open(path_of(spec, L['file'])).convert('RGBA').save(f'{OUT}/{src}.webp', quality=86, method=6)
        lake = dict(src=src, period=L['period'], size=L['size'], contacts=L.get('contacts', []), springs=L.get('springs', []))
    J = dict(id=ID, title=spec.get('title', m['name']), w=W, h=H, cs=16, cols=cols, rows=rows, blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs,
             exits=spec['exits'], spots=spec.get('spots', {}), chests=spec.get('chests', []), zones=spec.get('zones', []),
             lights=spec.get('lights', []), mobs=spec.get('mobs'), meta=spec.get('meta', {}), water=[], anim=anim, lake=lake,
             cascade=[o for o in objs if o['id'] == P + 'cascade'] and bool(m.get('springSites')))
    json.dump(J, open(f'{d}/map.json', 'w'), ensure_ascii=False)
    print('codex ->', ID, len(objs), 'objs', 'anim', list(anim), 'lake', bool(lake))
    return J

# ---- 苍月城街上加点人气：沿铺面墙根摆摊棚、筐、缸、酒旗、花盆（R109 + 旧图素材），不压主路 ----
STREET = [('prop_awning_red', 3), ('prop_awning_blue', 3), ('prop_awning_ochre', 3), ('prop_fruit_basket', 3), ('prop_celadon_jar', 3), ('prop_flower_pot', 4),
          ('prop_wine_flag', 2), ('crates', 3), ('sacks', 3), ('water_jar', 3), ('handcart', 2), ('wine_jars', 2), ('herb_trays', 2),
          ('detail_rice_barrels', 2), ('detail_vegetable_baskets', 2), ('detail_pickle_crocks', 2), ('detail_rain_barrel', 2), ('detail_street_bench', 2), ('prop_drying_cloth', 1)]
def decorate(spec, objs, B):
    import common  # 注册 R109 等素材
    import random
    from collections import deque
    from scipy import ndimage
    rng = random.Random(7)
    R, C = B.shape
    keep = [tuple(p) for p in spec.get('keep', [])] + [tuple(e['spawn']) for e in spec['exits']] + [((e['rect'][0] + e['rect'][2] / 2), (e['rect'][1] + e['rect'][3] / 2)) for e in spec['exits']]
    def connected():
        s = (int(spec['exits'][0]['spawn'][1] // 16), int(spec['exits'][0]['spawn'][0] // 16)); seen = np.zeros_like(B, bool); seen[s] = True; q = deque([s])
        while q:
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (r + dr, c + dc)
                if 0 <= n[0] < R and 0 <= n[1] < C and not seen[n] and not B[n]: seen[n] = True; q.append(n)
        return all(seen[int(y // 16), int(x // 16)] for x, y in keep)
    D = ndimage.distance_transform_edt(B == 0)
    cand = []
    for r in range(3, R - 3):
        for c in range(3, C - 3):
            if B[r, c] or not (1 <= D[r, c] <= 2.3): continue
            if not B[r - 3:r, c].any(): continue          # 背靠北边的铺面 / 院墙
            if D[r + 2:r + 6, c].min() < 1: continue       # 南边不能也是墙（窄巷不摆）
            x, y = c * 16 + 8, r * 16 + 14
            if any(abs(x - kx) < 150 and abs(y - ky) < 150 for kx, ky in keep): continue
            if any(x0 <= x <= x1 and y0 <= y <= y1 for x0, y0, x1, y1 in spec.get('nodeco', [])): continue
            cand.append((x, y))
    rng.shuffle(cand); placed = []; names = [n for n, w in STREET for _ in range(w)]
    for x, y in cand:
        if len(placed) >= spec['decorate']: break
        nm = rng.choice(names); im, ax, bot = asset(nm); wide = im.width > 150
        if any(abs(x - px) < (230 if (wide or pw) else 120) and abs(y - py) < 90 for px, py, pw in placed): continue
        fw = im.width * .62; c0, c1 = int((x - fw / 2) // 16), int((x + fw / 2) // 16); r0, r1 = int((y - 22) // 16), int(y // 16)
        if B[r0:r1 + 1, c0:c1 + 1].any(): continue
        old = B[r0:r1 + 1, c0:c1 + 1].copy(); B[r0:r1 + 1, c0:c1 + 1] = 1
        if not connected(): B[r0:r1 + 1, c0:c1 + 1] = old; continue
        flip = rng.random() < .5 and not nm.startswith('prop_wine')
        objs.append(dict(id=nm, x=round(float(x - (im.width - ax if flip else ax)), 1), y=round(float(y - bot), 1), w=int(im.width), h=int(im.height), sy=int(y), flat=False, flip=bool(flip)))
        placed.append((x, y, wide))
    print('  街面摆设', len(placed))

L = S + '/loom/loom/'
SPECS = {
    'nw_temple': dict(id='nw_temple', pfx='loom_', json=L + 'map.json', root=L, strip='loom/',
        exits=[dict(to='nw_passage', label='出宫门 · 瀑后归径', rect=[1040, 1730, 160, 62], spawn=[1120, 1650], face='up', arrow=None),
               dict(to='nw_spring', label='神殿东侧 · 去月湖灵泉', rect=[2084, 940, 60, 160], spawn=[2010, 1020], face='left', arrow=None)],
        spots={'altar': [1120, 647], 'gate': [1120, 1600], 'court': [1120, 1070]}, lights=[dict(x=1120, y=560, r=260, c='255,225,160')], meta=dict(grade='rgba(255,235,200,.03)')),
    'nw_spring': dict(id='nw_spring', pfx='moon_', json=S + '/moon/moon-spring/map.json', root=S + '/moon/', title='月湖 · 双息灵泉',
        exits=[dict(to='nw_temple', label='出月门 · 返回女娲神殿', rect=[1080, 1740, 144, 52], spawn=[1152, 1680], face='up', arrow=None)],
        spots={'listen': [1152, 1071], 'ye': [1068, 521], 'yun': [1238, 547], 'altar': [1152, 624]}, meta=dict(grade='rgba(255,250,235,.02)')),
    'cy_gate': dict(id='cy_gate', pfx='cyc_', json=S + '/cyc/map.json', root=S + '/cyc/', strip='cangyue_city/', title='苍月城 · 南门府街',
        exits=[dict(to='yy_deep', label='出南门 · 往幽影林', rect=[1768, 2950, 304, 58], spawn=[1920, 2832], face='up', arrow=None),
               dict(to='cy_north', label='出北门 · 荒林阵门', rect=[2628, 0, 104, 64], spawn=[2680, 360], face='down', arrow=None),
               dict(to='cy_manor', label='传送法阵 · 城主府', rect=[1880, 1964, 80, 40], spawn=[1920, 2080], face='down', arrow=None)],
        spots={'portal': [1920, 1984], 'west_court': [680, 1296], 'gate': [1920, 2832]}, decorate=80, nodeco=[[280, 820, 1040, 1560], [1280, 840, 2560, 1800]],
        keep=[[1920, 1984], [2680, 55], [1160, 744], [2680, 744], [1160, 2485], [2680, 2485], [650, 1965], [2900, 1622], [3418, 1266], [476, 2392], [1920, 2652], [700, 1620], [700, 1544], [680, 1300]],
        zones=[], meta=dict(grade='rgba(255,180,110,.03)')),
    # 女娲宫外 · 瀑后归径（Codex 定稿）：东头水帘回碧潭听瀑，西北石门前法阵进女娲宫
    'nw_passage': dict(id='nw_passage', pfx='fp_', json=S + '/fp/falls-passage/map.json', root=S + '/fp/', title='女娲宫外 · 瀑后归径',
        exits=[dict(to='nw_falls', label='穿过水帘 · 回碧潭听瀑', rect=[2150, 1100, 60, 50], spawn=[2040, 1133], face='left', arrow=None),
               dict(to='nw_temple', label='传送法阵 · 入女娲宫', rect=[340, 284, 80, 40], spawn=[380, 400], face='down', arrow=None)],
        spots={'bridge': [1094, 1133], 'gold': [417, 1088], 'gate': [380, 303]}, meta=dict(grade='rgba(255,245,225,.02)')),
    # 城主府 · 临水环院（Codex 定稿）：南府门回城，北面正堂，四厢进书房 / 内寝 / 庖屋 / 客舍（Claude 拼）
    'cy_manor': dict(id='cy_manor', pfx='cym_', json=S + '/manor/cy_manor/map.json', root=S + '/manor/', title='苍月城主府 · 临水环院',
        exits=[dict(to='cy_gate', label='出府门 · 回苍月城', rect=[1230, 1512, 100, 36], spawn=[1280, 1420], face='down', arrow=None),
               dict(to='cy_council', label='旧印正堂', rect=[1230, 548, 100, 32], spawn=[1280, 640], face='up', arrow=None),
               dict(to='cy_study', label='西厢 · 书房', rect=[484, 606, 64, 34], spawn=[516, 672], face='up', arrow=None),
               dict(to='cy_bedroom', label='东厢 · 内寝', rect=[2116, 598, 64, 34], spawn=[2148, 664], face='up', arrow=None),
               dict(to='cy_kitchen', label='西厢 · 庖屋', rect=[406, 1232, 64, 34], spawn=[438, 1296], face='up', arrow=None),
               dict(to='cy_guest', label='东厢 · 客舍', rect=[2085, 1232, 64, 34], spawn=[2117, 1296], face='up', arrow=None)],
        move={'flowerbed_70': [1785, 663]},
        spots={'pond': [1280, 1300], 'hall': [1280, 640], 'gate': [1280, 1420]}, meta=dict(grade='rgba(255,235,200,.02)')),
    'cy_council': dict(id='cy_council', pfx='cyh_', json=S + '/manor/cy_council/map.json', root=S + '/manor/', title='苍月城主府 · 旧印正堂',
        exits=[dict(to='cy_manor', label='出正堂 · 回府院', rect=[900, 1200, 120, 50], spawn=[960, 1080], face='down', arrow=None)],
        spots={'lord': [960, 546], 'center': [960, 760]}, lights=[dict(x=800, y=300, r=160, c='255,205,140'), dict(x=1430, y=600, r=140, c='255,205,140')], meta=dict(indoor=True)),
}

def build_all(ids=None):
    for k, sp in SPECS.items():
        if ids and k not in ids: continue
        build(sp)

def register_all():
    for sp in SPECS.values(): register(sp)

if __name__ == '__main__':
    import sys; build_all(sys.argv[1:] or None)
