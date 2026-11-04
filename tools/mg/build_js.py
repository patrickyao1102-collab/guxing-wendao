# 把 out/*/map.json 打包：共享物件图集 + 地面 → game/r107/ ，并生成 game/r107_maps.js
import json, os, glob, math, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from core import asset, GAME, OUT
import common, maps_xx, maze_b1  # 注册额外素材（maze_b1：地下一层大迷宫）
import codexmap; codexmap.register_all()   # Codex 整图：女娲神殿、月湖灵泉、苍月城
import veil   # 遮天灵瀑（照 Codex 概念图 01 拼）
import rooms_cy   # 城主府四厢（旧：拆正堂构件拼）
import rooms_dc; rooms_dc.register()   # 客舍：Codex 01_大城 客房样板房拆件 + 双人架子床
# import rooms_xc   # R116 小城家具是民房档次，城主府不用（作者否了）
import north; north.register()   # 苍月北郊 · 白岩沉坛

PFX = 'm_'          # 游戏里的地图 id 前缀（不和老地图撞名）
DST = GAME + '/r107'; os.makedirs(DST, exist_ok=True)
maps = []
order = ['yy_edge', 'yy_deep', 'nw_creek', 'nw_glade', 'nw_stones', 'nw_falls', 'nw_passage', 'nw_temple', 'nw_spring', 'cy_gate', 'cy_manor', 'cy_council', 'cy_study', 'cy_bedroom', 'cy_kitchen', 'cy_guest', 'cy_north', 'xx_b1', 'xx_b2']
for mid in order:
    f = f'{OUT}/{mid}/map.json'
    if os.path.exists(f): maps.append(json.load(open(f)))
ids = {m['id'] for m in maps}

# ---- 物件图集：每种物件存一张（按用到的最大尺寸）----
need = {}
for m in maps:
    for o in m['objs']:
        im = asset(o['id'])[0]; s = max(o['w'] / im.width, o['h'] / im.height)
        need[o['id']] = max(need.get(o['id'], 0), min(1.0, s))
    for k in m.get('extra', []): need[k] = 1.0      # 换态用的图（血印巨石显形 / 破阵、发光层）
items = []
for k, s in need.items():
    im = asset(k)[0]
    if s < .98: im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    items.append((k, im))
items.sort(key=lambda t: -t[1].height)
PW = 4096; pages = []; amap = {}
def newpage(): pages.append(Image.new('RGBA', (PW, PW), (0, 0, 0, 0))); return [0, 0, 0]
cur = newpage()
for k, im in items:
    x, y, rh = cur
    if x + im.width + 2 > PW: x, y, rh = 0, y + rh + 2, 0
    if y + im.height > PW: cur = newpage(); x, y, rh = 0, 0, 0
    pages[-1].paste(im, (x, y)); amap[k] = [len(pages) - 1, x, y, im.width, im.height]
    cur = [x + im.width + 2, y, max(rh, im.height)]
for i, p in enumerate(pages):
    bb = p.getbbox(); p = p.crop((0, 0, PW, bb[3] if bb else 4))
    p.save(f'{DST}/atlas_{i}.webp', quality=86, method=6)
print('atlas pages', len(pages), 'objs', len(items))

def rle(s):
    out = []; i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]: j += 1
        out.append(j - i); i = j
    return (s[0], out)

P = lambda x, y: [round(x / 64 - .5, 2), round(y / 64 - .8, 2)]
names = sorted(need)
D = {}; ANIM = {}
# Codex 按叶孤星 120px 画的整图：游戏里人物约 96px，整张图缩到 0.8 倍，人物和房子、台阶、树的比例才对（青阳镇不动）
Z120 = {'xx_b1', 'nw_creek', 'nw_glade', 'nw_stones', 'nw_falls', 'nw_passage', 'nw_temple', 'nw_spring', 'cy_gate', 'cy_manor', 'cy_council', 'cy_study', 'cy_bedroom', 'cy_kitchen', 'cy_guest', 'cy_north'}
for m in maps:
    os.system(f"cp {OUT}/{m['id']}/ground.webp {DST}/g_{m['id']}.webp")
    first, runs = rle(m['blocked'])
    objs = [[names.index(o['id']), round(o['x']), round(o['y']), round(o['w']), round(o['h']), round(o['sy']), (1 if o['flat'] else 0) | (2 if o['flip'] else 0) | (4 if 'anim' in o else 0)] + ([o['anim']] if 'anim' in o else []) for o in m['objs']]
    if m.get('anim'):
        ANIM.update(m['anim'])
        for k, v in m['anim'].items(): os.system(f"cp {OUT}/{v['src']}.webp {DST}/{v['src']}.webp")
    if m.get('lake'): os.system(f"cp {OUT}/{m['lake']['src']}.webp {DST}/{m['lake']['src']}.webp")
    exits = []
    for e in m['exits']:
        x, y, w, h = e['rect']; to = e['to']
        # 落点 = 目标图里通往这里的那个出口的 spawn
        at = None
        if to in ids:
            t = next(t for t in maps if t['id'] == to); back = next((q for q in t['exits'] if q['to'] == m['id']), None)
            if back: at = P(*back['spawn'])
        exits.append(dict(x=int(x // 16), y=int(y // 16), w=max(1, math.ceil(w / 16)), h=max(1, math.ceil(h / 16)), to=(PFX + to) if to in ids else to, at=at, face=e['face'], label=e['label']))
    D[m['id']] = dict(t=m['title'], w=m['w'], h=m['h'], cols=m['cols'], rows=m['rows'], b0=first, b=runs, o=objs, ex=exits,
                     start=P(*m['exits'][0]['spawn']) if m['exits'] else None, ch=[[round(x / 64 - .5), round((y - 20) / 64 - 1)] for x, y in m['chests']],
                     z=[[z['x'], z['y'], z['r']] for z in m['zones']], mobs=m['mobs'], spots={k: list(v) for k, v in m['spots'].items()}, meta=dict(m.get('meta') or {}, **({'zoom': .8} if m['id'] in Z120 else {})), lights=m['lights'], wa=m.get('water') or [], lake=m.get('lake'), cas=bool(m.get('cascade')), fm=m.get('fm'), nt=m.get('notes') or None)
js = open(os.path.dirname(__file__) + '/r107_tpl.js', encoding='utf-8').read()
js = js.replace('__NAMES__', json.dumps(names)).replace('__ATLAS__', json.dumps(amap)).replace('__PAGES__', str(len(pages))).replace('__DATA__', json.dumps(D, ensure_ascii=False, separators=(',', ':'))).replace('__PFX__', PFX).replace('__ANIM__', json.dumps(ANIM)).replace('__M117__', open(os.path.dirname(__file__) + '/mobs117.json').read())
open(GAME + '/r107_maps.js', 'w', encoding='utf-8').write(js)
print('js', len(js) // 1024, 'KB', 'maps', len(D))
