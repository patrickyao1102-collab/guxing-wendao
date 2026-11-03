# 苍月北郊 · 白岩沉坛（Codex 定稿）接入：
# - 整图、物件、碰撞照 Codex 原样（codexmap 转换）；
# - 南口驿道两旁、沉坛南阶两侧补上 Codex 新画的「笔直树」（R115b），驿道一眼看得出是条官道；
# - 血印巨石三态（隐阵 / 血印显形 / 破阵）做成同一位置换图，显形时血印纹和四块阵楔会一明一暗地呼吸（只调画好的图的亮度）；
# - 坛前、左阵眼两处交互点，破阵后才通地下一层。
import json, os
import numpy as np
from PIL import Image, ImageFilter
from core import S, OUT, REG, reg, asset
import codexmap

N = S + '/north/cy_north/objects/'
F = S + '/r115/F_笔直树/'
CX = S + '/cxm/'
os.makedirs(CX, exist_ok=True)

def _pad(im, w):
    o = Image.new('RGBA', (w, im.height)); o.paste(im, ((w - im.width) // 2, 0)); return o

def register():
    if 'cyn_fm_0' in REG: return
    codexmap.register(SPEC)
    a = Image.open(N + '坡面.png').convert('RGBA'); b = Image.open(N + '血印巨石.png').convert('RGBA'); c = Image.open(N + '密道口.png').convert('RGBA')
    W = max(a.width, b.width, c.width)
    for i, im in enumerate((a, b, c)):
        p = f'{CX}cyn_fm_{i}.png'; _pad(im, W).save(p); reg(f'cyn_fm_{i}', 'pk', p, None, 'prop'); REG[f'cyn_fm_{i}']['notrim'] = True
    # 发光层：血印巨石比坡面多出来的红光（画好的那层），外面再晕一圈
    A = np.asarray(a, np.float32); B = np.asarray(b, np.float32)
    d = np.clip((np.abs(A[..., :3] - B[..., :3]).sum(2) - 40) / 120, 0, 1) * (B[..., 0] > B[..., 1] + 40)
    m = Image.fromarray((d * 255).astype(np.uint8))
    halo = m.filter(ImageFilter.GaussianBlur(9)); core = Image.fromarray(B[..., :3].astype(np.uint8))
    g = Image.new('RGBA', b.size, (0, 0, 0, 0))
    g.paste(Image.new('RGBA', b.size, (255, 40, 30, 255)), (0, 0), halo.point(lambda v: min(255, int(v * 1.6))))
    g.alpha_composite(Image.merge('RGBA', (*core.split(), m)))
    p = f'{CX}cyn_fm_glow.png'; _pad(g, W).save(p); reg('cyn_fm_glow', 'pk', p, None, 'prop'); REG['cyn_fm_glow']['notrim'] = True
    for i in range(4):
        for k, src in (('w', '阵楔'), ('wl', '亮楔')):
            reg(f'cyn_{k}{i}', 'pk', f'{N}{src}{i}.png', None, 'prop'); REG[f'cyn_{k}{i}']['notrim'] = True
    for k, f in (('fx_huai', '03_槐_280px.png'), ('fx_ginkgo', '05_银杏_288px.png'), ('fx_bai', '02_柏_304px.png'), ('fx_pine', '01_松_296px.png'),
                 ('fx_maple', '08_红枫_268px.png'), ('fx_gui', '06_桂花_252px.png')):
        reg(k, 'pk', F + f, None, 'tree')

SPEC = dict(id='cy_north', pfx='cyn_', json=S + '/north/cy_north/map_day.json', root=S + '/north/', title='苍月北郊 · 白岩沉坛',
    exits=[dict(to='cy_gate', label='南口 · 回苍月城', rect=[1780, 2760, 120, 56], spawn=[1840, 2660], face='up', arrow=None),
           dict(to='xx_b1', label='石阶 · 下到地下密道', rect=[2600, 776, 80, 40], spawn=[2640, 880], face='down', arrow=None)],
    spots={'altar': [2640, 820], 'eye': [2550, 831], 'bell': [342, 1152], 'fork': [1780, 1910], 'gate': [1840, 2660]},
    meta=dict(grade='rgba(255,245,225,.02)'))

# 驿道两旁的笔直树：(树, x, y)
AVENUE = [('fx_ginkgo', 1610, 2480), ('fx_ginkgo', 2060, 2480), ('fx_ginkgo', 1610, 2795), ('fx_ginkgo', 2060, 2795),
          ('fx_maple', 2470, 1235), ('fx_maple', 2800, 1235)]

# ---- 白天要亮：深色树换成亮色树、挤在一起的删掉 ----
TREES = {'birch_sunlit', 'tallow', 'scholar_tree', 'tree_mulberry', 'tree_albizia', 'tree_jujube', 'tree_camphor_ancient', 'tree_pear', 'willow', 'pine_lush',
         'tree_maple', 'tree_persimmon', 'pine_tree', 'tree_ginkgo', 'tree_osmanthus', 'tree_cypress_ancient', 'bamboo', 'dead_tree'}
DARK = {'tree_camphor_ancient': 1.0, 'tree_cypress_ancient': .7, 'dead_tree': 1.0, 'tree_osmanthus': .5, 'scholar_tree': .5, 'tree_mulberry': .5, 'pine_lush': .5, 'pine_tree': .5}
BRIGHT = ['tree_ginkgo', 'tree_albizia', 'tree_pear', 'birch_sunlit', 'tree_maple', 'tree_persimmon', 'willow', 'tree_ginkgo', 'tree_albizia', 'tree_pear']
LUM = {'tree_ginkgo': 153, 'willow': 131, 'tree_albizia': 130, 'tree_pear': 129, 'tree_persimmon': 121, 'birch_sunlit': 120, 'tree_jujube': 120, 'pine_lush': 116, 'scholar_tree': 116,
       'tree_mulberry': 115, 'bamboo': 113, 'pine_tree': 111, 'tree_osmanthus': 103, 'tree_maple': 140, 'tree_camphor_ancient': 100, 'tree_cypress_ancient': 95, 'tallow': 110, 'dead_tree': 80}
REMOVED = []
def daylight():
    import random
    J = json.load(open(S + '/north/cy_north/map.json')); A = J['assets']; rng = random.Random(11)
    ins = J['instances']; trees = [i for i in ins if i['id'] in TREES]
    # 1) 太挤的：两棵大树脚点离得太近，删掉暗的那棵
    drop = set()
    trees.sort(key=lambda i: (i['anchor'][1], i['anchor'][0]))
    for a in range(len(trees)):
        p = trees[a]
        if p['uid'] in drop: continue
        for b in range(a + 1, len(trees)):
            q = trees[b]
            if q['uid'] in drop: continue
            if q['anchor'][1] - p['anchor'][1] > 70: break
            if abs(q['anchor'][0] - p['anchor'][0]) < 125:
                drop.add((p if LUM.get(p['id'], 110) < LUM.get(q['id'], 110) else q)['uid'])
                if p['uid'] in drop: break
    # 2) 深色树：按比例换成亮色树（脚点不动，高度和原来差不多）
    k = 0
    for i in ins:
        if i['uid'] in drop: REMOVED.append(i['anchor']); continue
        if i['id'] in DARK and rng.random() < DARK[i['id']]:
            old_h = A[i['id']]['size_px'][1] * i.get('scale', 1); nid = BRIGHT[k % len(BRIGHT)]; k += 1
            i['id'] = nid; i['scale'] = round(old_h / A[nid]['size_px'][1], 3)
    J['instances'] = [i for i in ins if i['uid'] not in drop]
    json.dump(J, open(S + '/north/cy_north/map_day.json', 'w'), ensure_ascii=False)
    print('白天：删树', len(drop), '换亮色', k)

def build():
    daylight()
    register()
    J = codexmap.build(SPEC)
    B = np.array([c == '1' for c in J['blocked']], bool).reshape(J['rows'], J['cols'])
    for x, y in REMOVED: B[int((y - 30) // 16):int((y + 4) // 16) + 1, int((x - 36) // 16):int((x + 36) // 16) + 1] = False
    for o in J['objs']:
        if o['flat'] or o['h'] < 40: continue
        x, y, w = o['x'] + o['w'] / 2, o['sy'], o['w']
        if o['id'][4:] in TREES: B[int((y - 20) // 16):int((y + 2) // 16) + 1, int((x - 18) // 16):int((x + 18) // 16) + 1] = True
        elif any(t in o['id'] for t in ('rock', 'stump', 'cliff', 'ridge', 'tent')): B[int((y - 24) // 16):int(y // 16) + 1, int((x - w * .38) // 16):int((x + w * .38) // 16) + 1] = True
    objs = []
    wedge = 0
    for o in J['objs']:
        k = o['id'][4:]
        if k == '坡面':                     # 巨石：换成三态共用的整幅图（脚点不变）
            im = asset('cyn_fm_0')[0]; ax = 2640; objs.append(dict(id='cyn_fm_0', x=ax - im.width / 2, y=764 - im.height, w=im.width, h=im.height, sy=764, flat=False, flip=False)); continue
        if k.startswith('阵楔'):
            i = int(k[-1]); im = asset(f'cyn_w{i}')[0]
            cx = o['x'] + o['w'] / 2; objs.append(dict(id=f'cyn_w{i}', x=cx - im.width / 2, y=o['sy'] - im.height, w=im.width, h=im.height, sy=o['sy'], flat=False, flip=False)); wedge += 1; continue
        objs.append(o)
    # 驿道补树：先把挡位的小花草挪掉
    for nm, x, y in AVENUE:
        objs = [o for o in objs if not (abs(o['x'] + o['w'] / 2 - x) < 60 and abs(o['sy'] - y) < 40 and o['h'] < 90)]
        im = asset(nm)[0]
        objs.append(dict(id=nm, x=round(x - im.width / 2, 1), y=round(y - im.height, 1), w=im.width, h=im.height, sy=y, flat=False, flip=False))
        B[int((y - 18) // 16):int((y + 2) // 16) + 1, int((x - 14) // 16):int((x + 14) // 16) + 1] = True
    # 笔直树扎根：树脚下压一片影子（往右下偏，左上来光），再围几丛草
    G = Image.open(f'{OUT}/cy_north/ground.webp').convert('RGB'); A = np.asarray(G, np.float32)
    yy, xx = np.mgrid[0:G.height, 0:G.width]
    for nm, x, y in AVENUE:
        x0, y0, x1, y1 = int(x - 120), int(y - 60), int(x + 140), int(y + 60)
        sy_, sx_ = slice(max(0, y0), min(G.height, y1)), slice(max(0, x0), min(G.width, x1))
        d = ((xx[sy_, sx_] - (x + 14)) / 74.0) ** 2 + ((yy[sy_, sx_] - (y + 4)) / 20.0) ** 2
        A[sy_, sx_] *= (1 - .42 * np.exp(-d * 1.6))[..., None]
        d2 = ((xx[sy_, sx_] - x) / 20.0) ** 2 + ((yy[sy_, sx_] - (y + 1)) / 7.0) ** 2   # 树根处一小团更深
        A[sy_, sx_] *= (1 - .35 * np.exp(-d2 * 2))[..., None]
        for dx, dy, gk, f in ((-34, 6, 'cyn_grass_clump_02', False), (30, 9, 'cyn_grass_clump_03', True), (-12, 14, 'cyn_grass_clump_03', False), (14, -2, 'cyn_grass_clump_02', True)):
            im = asset(gk)[0]; w, h = im.width * .8, im.height * .8
            objs.append(dict(id=gk, x=round(x + dx - w / 2, 1), y=round(y + dy - h, 1), w=round(w, 1), h=round(h, 1), sy=y + dy, flat=False, flip=f))
    Image.fromarray(np.clip(A, 0, 255).astype(np.uint8)).save(f'{OUT}/cy_north/ground.webp', quality=86, method=6)
    J['objs'] = objs
    J['blocked'] = ''.join('1' if v else '0' for v in B.flatten())
    J['extra'] = ['cyn_fm_1', 'cyn_fm_2', 'cyn_fm_glow'] + [f'cyn_wl{i}' for i in range(4)]
    J['fm'] = dict(flag='cyn_fm', st=['cyn_fm_0', 'cyn_fm_1', 'cyn_fm_2'], glow='cyn_fm_glow', w=[f'cyn_w{i}' for i in range(4)], wl=[f'cyn_wl{i}' for i in range(4)],
                   trig=[2640, 820], eye=[2550, 831], exit='xx_b1')
    json.dump(J, open(f'{OUT}/cy_north/map.json', 'w'), ensure_ascii=False)
    print('north ok', len(objs), 'wedges', wedge)

if __name__ == '__main__': build()
