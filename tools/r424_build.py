#!/usr/bin/env python3
# R424 · 万妖塔迷宫：把 Codex 交的拼图（map_base / map_over / placement.json / 素材）转成游戏用的图和尺寸表。
# 用法：python3 tools/r424_build.py <Codex 交付目录（里面有 第一层/ 第二层/）>
# 输出：game/r424/f<n>/base.webp、ov_<行>.webp（map_over 按 200 像素一行切开，人物前后靠它排）、各物件图、game/r424_meta.js
import os, sys, json
from PIL import Image
SRC = sys.argv[1]; ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game'); OUT = os.path.join(ROOT, 'r424')

def r420b(P):
    TS = P['tile_size']; g = P['grid']; out = {'map_size': [P['width'], P['height']], 'tile_size': [TS, TS], 'grid': g, 'grid_index_base': 1}
    out['over_rows'] = [{'row': o['row'], 'file': o['file'], 'x': o['x'], 'y': o['y']} for o in P['overlays']]
    objs = []; mech_of = {}
    for o in P['objects']:
        if len(o.get('states') or {}) > 1 and o['id'].split('_')[0] in ('lamp', 'winch'): mech_of[o.get('group') or o['id']] = o['id']
    for o in P['objects']:
        e = {'name': o['id'], 'x': o['bottom_center'][0], 'y': o['bottom_center'][1]}
        st = o.get('states') or {}
        if o.get('frames'): e['frames'] = o['frames']; e['frame_ms'] = o.get('frame_ms', 160)
        elif len(st) == 1: e['asset'] = list(st.values())[0]
        else:
            e['states'] = st; e['initial'] = o.get('default_state')
            if o['id'] == 'gate': e['opens_when'] = 'all'
            elif o['id'].startswith('chain'): e['follows'] = mech_of.get(o.get('group'))
            if o['id'].startswith('lamp'): e['initial'] = 'off'
        if o['id'] in ('flower_tree', 'gatehouse'): e['foreground'] = 1
        if o.get('blocks_px'): e['blocks'] = o['blocks_px']
        objs.append(e)
    out['objects'] = objs
    cen = lambda c, r: [int((c + .5) * TS), int((r + .5) * TS)]
    rel = [cen(c, r) for r, row in enumerate(g) for c, ch in enumerate(row) if ch == 'R']
    che = [cen(c, r) for r, row in enumerate(g) for c, ch in enumerate(row) if ch == 'C']
    ent = [cen(c, r) for r, row in enumerate(g) for c, ch in enumerate(row) if ch == 'E']
    out['relic_reserves'] = [{'center': x} for x in rel]; out['chests'] = che
    out['entrance'] = {'center': ent[0] if ent else [P['width'] // 2, P['height'] - TS // 2]}
    return out
LAYERS = {'第一层': 1, '第二层': 2}
meta = {}
mp = os.path.join(ROOT, 'r424_meta.js')
if os.path.exists(mp):
    try: meta = json.loads(open(mp, encoding='utf8').read().split('=', 1)[1].rsplit(';', 1)[0])
    except Exception: meta = {}
for lname, n in LAYERS.items():
    d = os.path.join(SRC, lname)
    if not os.path.isdir(d): continue
    od = os.path.join(OUT, 'f%d' % n); os.makedirs(od, exist_ok=True)
    P = json.load(open(os.path.join(d, 'placement.json'), encoding='utf8'))
    if 'overlays' in P:   # R420b 的格式：overlays（每行墙一张前景）+ objects（底边中点 + 各状态）+ grid 里 R 遗物 / C 宝匣 / E 入口
        P = r420b(P)
    W, H = P['map_size']; TS = P['tile_size'][1]
    Image.open(os.path.join(d, 'map_base.png')).convert('RGB').save(os.path.join(od, 'base.webp'), 'WEBP', quality=88, method=6)
    strips = []
    if P.get('over_rows'):   # R420 起：前景按墙的行分开交（树冠会伸进北边那一行，仍算它自己那一行）
        for e in P['over_rows']:
            r = int(e['row']) - (1 if P.get('grid_index_base', 1) == 1 else 0); im = Image.open(os.path.join(d, e['file'])).convert('RGBA')
            im.save(os.path.join(od, 'ov_%d.webp' % r), 'WEBP', quality=88, method=6, alpha_quality=90); strips.append([r, int(e['x']), int(e['y']), im.width, im.height])
    else:
        ov = Image.open(os.path.join(d, 'map_over.png')).convert('RGBA')
        for r in range(H // TS):
            c = ov.crop((0, r * TS, W, (r + 1) * TS)); bb = c.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
            if not bb: continue
            c.save(os.path.join(od, 'ov_%d.webp' % r), 'WEBP', quality=88, method=6, alpha_quality=90); strips.append([r, 0, r * TS, W, TS])
    assets = {}
    def put(rel):
        if rel in assets: return assets[rel]
        name = os.path.splitext(os.path.basename(rel))[0]; im = Image.open(os.path.join(d, rel)).convert('RGBA')
        im.save(os.path.join(od, name + '.webp'), 'WEBP', quality=90, method=6, alpha_quality=90); assets[rel] = [name, im.width, im.height]; return assets[rel]
    objs = []
    for o in P['objects']:
        e = {k: o[k] for k in ('name', 'x', 'y', 'layer', 'motion', 'max_offset_px', 'frame_ms', 'foreground', 'blocks') if k in o}
        if 'grid' in o: e['grid'] = o['grid']
        if 'asset' in o: e['img'] = put(o['asset'])
        if 'states' in o: e['states'] = {k: put(v) for k, v in o['states'].items()}; e['initial'] = o.get('initial')
        if 'frames' in o: e['frames'] = [put(v) for v in o['frames']]
        if 'opens_when' in o: e['opens_when'] = o['opens_when']
        if 'follows' in o: e['follows'] = o['follows']
        if o.get('flip_x'): e['flip'] = 1
        objs.append(e)
    meta['f%d' % n] = {'w': W, 'h': H, 'ts': TS, 'grid': P['grid'], 'strips': strips, 'objs': objs, 'entrance': P.get('entrance'), 'relics': P.get('relic_reserves', []), 'chests': P.get('chests', [])}
    print(lname, 'strips', strips, 'objs', len(objs), 'assets', len(assets))
open(mp, 'w', encoding='utf8').write('// R424 · 万妖塔迷宫的尺寸表（tools/r424_build.py 生成，别手改）\nwindow.R424_META = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
print('meta →', mp)
