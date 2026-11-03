# 把 Codex 做好的「女娲神殿 · 千丝织天殿」（作者 11-03 认可）转成新地图组的格式，替换我拼的山巅小庙 + 庙内。
# Codex 的地图：整张地面图 + 各物件按脚点放置 + 16px 碰撞格，和我们的格式基本一一对应，只做换算，不改画。
import json, os, sys
import numpy as np
from PIL import Image
from core import S, OUT, REG, reg, asset

SRC = S + '/loom/loom/'
ID = 'nw_temple'          # 沿用原来的 id：群像遗庭、灵泉的出口不用改

def register():
    m = json.load(open(SRC + 'map.json'))
    for k, a in m['assets'].items():
        name = 'loom_' + k
        if name in REG: continue
        im = Image.open(SRC + os.path.basename(a['file'])).convert('RGBA')
        if list(im.size) != [round(v) for v in a['size_px']]:
            im = im.resize((round(a['size_px'][0]), round(a['size_px'][1])), Image.LANCZOS)
        p = f'{S}/loom/norm_{k}.png'; im.save(p)
        reg(name, 'pk', p, None, 'flat' if k in ('seal', 'altar', 'verge', 'litter') else 'prop')
    return m

def build():
    m = register()
    W, H = m['world_size_px']
    d = f'{OUT}/{ID}'; os.makedirs(d, exist_ok=True)
    Image.open(SRC + 'ground.png').convert('RGB').resize((W, H)).save(f'{d}/ground.webp', quality=86, method=6)
    objs = []
    for it in m['instances']:
        a = m['assets'][it['id']]; sc = it.get('scale', 1); name = 'loom_' + it['id']
        full = Image.open(REG[name]['key']); im, _, _ = asset(name)
        bb = full.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()   # asset() 裁掉的透明边
        ax, ay = a['anchor_px']; fx, fy = it['anchor']; flip = bool(it.get('flip'))
        bx0, by0 = bb[0], bb[1]; tw, th = im.width, im.height
        if flip: x = fx - (full.width - ax) * sc + (full.width - bb[2]) * sc
        else: x = fx - ax * sc + bx0 * sc
        y = fy - ay * sc + by0 * sc
        flat = bool(it.get('terrain'))
        sy = it.get('sort_y', fy) if not flat else fy
        if a.get('windAtlas'):   # 丝帷随风飘：整格不裁边，按 Codex 的风动图集逐帧播
            objs.append(dict(id=name, x=round(fx - ax * sc, 1), y=round(fy - ay * sc, 1), w=round(full.width * sc, 1), h=round(full.height * sc, 1), sy=round(fy, 1), flat=False, flip=flip, anim=int(it.get('windPhase', 0))))
            continue
        objs.append(dict(id=name, x=round(x, 1), y=round(y, 1), w=round(tw * sc, 1), h=round(th * sc, 1), sy=round(sy if sy != 1 else -1e6, 1), flat=flat, flip=flip))
    n = m['nav']; B = np.array(n['blocked'], np.uint8).reshape(n['rows'], n['cols'])
    exits = [dict(to='nw_court', label='下山 · 返回群像遗庭', rect=[1040, 1730, 160, 62], spawn=[1120, 1650], face='up', arrow=None),
             dict(to='nw_spring', label='神殿东侧 · 去庙后灵泉', rect=[2084, 940, 60, 160], spawn=[2010, 1020], face='left', arrow=None)]
    for e in exits:
        x, y, w, h = e['rect']; B[y // 16:(y + h) // 16 + 1, x // 16:(x + w) // 16 + 1] = 0
    anim = {}
    for k, a in m['assets'].items():
        w = a.get('windAtlas')
        if w:
            Image.open(SRC + os.path.basename(w['file'])).save(f'{S}/mg/out/w_loom_{k}.webp', quality=88, method=6)
            anim['loom_' + k] = dict(src='w_loom_' + k, cols=w['columns'], count=w['count'], fps=w['fps'], fw=round(a['size_px'][0]), fh=round(a['size_px'][1]))
    J = dict(id=ID, title=m['name'], w=W, h=H, cs=16, cols=n['cols'], rows=n['rows'], blocked=''.join('1' if v else '0' for v in B.flatten()), objs=objs,
             exits=exits, spots={'altar': m['interactables'][0]['interaction_point_px'], 'gate': [1120, 1600], 'court': [1120, 1070]}, chests=[], zones=[],
             lights=[dict(x=1120, y=560, r=260, c='255,225,160')], mobs=None, meta=dict(grade='rgba(255,235,200,.03)'), water=[], anim=anim)
    json.dump(J, open(f'{d}/map.json', 'w'), ensure_ascii=False)
    print('loom ->', ID, len(objs), 'objs')

if __name__ == '__main__': build()
