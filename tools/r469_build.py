# R469 · 万妖塔二～六层三苑：把 Codex R447 / R448 / R465 交付转成游戏用的 webp + 尺寸表（照 build_r443_ref.py 的做法）
# 用法：python3 -I tools/r469_build.py <Codex 交付解压目录（含 R447/R448/R465）> game [层号...]（中间的 meta.json 放 /tmp/claude-0/r469/build）
import os, sys, json, hashlib, shutil
from PIL import Image

SRC, GAME = sys.argv[1], sys.argv[2]
ONLY = [int(x) for x in sys.argv[3:]] or [2, 3, 4, 5, 6]
OUT = os.path.join(GAME, 'r469')
MP = '/tmp/claude-0/r469/build/meta.json'; os.makedirs(os.path.dirname(MP), exist_ok=True)
meta = json.load(open(MP)) if os.path.exists(MP) else {}
ZK = ['a', 'b', 'c']
FL = {2: ('R447_万妖塔二层北关雪城三苑', ['外关', '瓮城', '城楼']),
      3: ('R448_万妖塔三四层迷宫三苑/三层', ['外苑', '中苑', '内苑']),
      4: ('R448_万妖塔三四层迷宫三苑/四层', ['外苑', '中苑', '内苑']),
      5: ('R465_万妖塔五六层迷宫三苑/五层', ['外苑', '中苑', '内苑']),
      6: ('R465_万妖塔五六层迷宫三苑/六层', ['外苑', '中苑', '内苑'])}
KIND = {'单向': 'one', '成对': 'pair', '出口': 'exit', '假': 'decoy', '假阵': 'decoy', '回苑': 'back'}


def wp(im, path, q=84):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if im.mode == 'RGBA' and im.split()[3].getextrema()[0] == 255: im = im.convert('RGB')
    im.save(path, 'WEBP', quality=q, method=5, **({'alpha_quality': 86} if im.mode == 'RGBA' else {}))


def half(im): return im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS)


for n in ONLY:
    root, CN = FL[n]; FD = os.path.join(SRC, root); od0 = os.path.join(OUT, 'f%d' % n)
    shared = {}   # 同层三苑共用的物件图：按内容去重
    def put(path, scale=1, q=86, sub='o'):
        """转一张物件图到本层 o/ 目录，内容相同的只存一份；返回 [名字, 宽, 高]（显示尺寸）"""
        h = hashlib.md5(open(path, 'rb').read()).hexdigest()[:10] + '_%s' % scale
        if h in shared: return shared[h]
        name = os.path.splitext(os.path.basename(path))[0]
        name = {'铁闸_关': 'gate_closed', '铁闸_开': 'gate_open', '绞盘_待机': 'winch_idle', '绞盘_已转': 'winch_turned', '虎卫冰像': 'ice_guard'}.get(name, name)
        base, k = name, 1
        used = {v[0] for v in shared.values()}
        while name in used: k += 1; name = '%s_%d' % (base, k)
        im = Image.open(path).convert('RGBA')
        if scale != 1: im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        wp(im, os.path.join(od0, sub, name + '.webp'), q)
        shared[h] = [name, im.width, im.height]; return shared[h]

    L = json.load(open(os.path.join(FD, 'layout.json')))
    F = {'name': None, 'courts': {}, 'tp': {}, 'route': []}
    # ---------- 楼层布局：三种写法统一成 [苑, 列, 行]（1 起） ----------
    courts = L['courts']
    cname = [c['name'] for c in courts]
    zi = lambda v: ZK[v - 1] if isinstance(v, int) else ZK[cname.index(v)]
    for i, (c, cn) in enumerate(zip(courts, CN)):
        z = ZK[i]; d = os.path.join(FD, cn); od = os.path.join(od0, z)
        P = json.load(open(os.path.join(d, 'placement.json')))
        CL = json.load(open(os.path.join(d, 'layout.json'))) if os.path.exists(os.path.join(d, 'layout.json')) else {}
        grid = P['grid']
        # 入口
        if 'entrance' in c: entry = c['entrance']
        else: entry = [c['entry']['col'], c['entry']['row']]
        # 法阵（逻辑）
        pads = []
        tlist = c.get('portals') or c.get('teleporters') or []
        pobj = {o['cell']['col'] * 100 + o['cell']['row']: o for o in P['objects'] if o.get('cell') and ('tp_' in o['id'] or '传送' in o.get('type', ''))}
        for t in tlist:
            k = KIND[t['kind']]
            tgt = t.get('target') or t.get('destination')
            tz = zi(tgt['court']); tc = tgt['cell']
            if k == 'exit' and ZK.index(tz) < i: k = 'back'
            g = t.get('motif') or t.get('glyph')
            o = pobj.get(t['cell'][0] * 100 + t['cell'][1])
            e = {'c': t['cell'], 'k': k, 'g': g, 'to': [tz, tc]}
            if o:
                if n == 2:   # 二层：静态阵盘 256×384 画布（含阵盘），特效锚在 effect_anchor_px
                    e['img'] = put(os.path.join(d, o['static_file']))[0]
                    if o['states'].get('used'): e['used'] = put(os.path.join(d, o['states']['used']))[0]
                    e['r'] = [o['x'], o['y'], o['width'], o['height']]; e['fx'] = o['effect_anchor_px']
                elif n in (3, 4):
                    e['img'] = put(os.path.join(d, o['states']['idle']))[0]; e['used'] = put(os.path.join(d, o['states']['used']))[0]
                    e['r'] = [o['x'], o['y'], o['width'], o['height']]; e['fx'] = o['anchor_px']
                else:
                    gx, gy = o['ground_px']
                    e['img'] = put(os.path.join(FD, '传送法阵特效', '底座', g + '.png'), .5)[0]
                    e['r'] = [gx - 128 + 28, gy - 263 + 205, 200, 110]; e['fx'] = [gx, gy]
            else:
                cx, cy = (t['cell'][0] - .5) * 240, (t['cell'][1] - .5) * 240; e['fx'] = [cx, cy]
            pads.append(e)
        # 行前景：按 1260 宽切块、裁透明边
        ov = []
        for o in P['overlays']:
            im = Image.open(os.path.join(d, o['file'])).convert('RGBA'); r = int(o['row']) - 1; CW = 1260
            for kx in range(0, im.width, CW):
                cc = im.crop((kx, 0, min(im.width, kx + CW), im.height)); bb = cc.split()[3].point(lambda a: 255 if a > 6 else 0).getbbox()
                if not bb: continue
                cc = cc.crop(bb); name = 'ov_%d_%d' % (r, kx // CW); wp(cc, os.path.join(od, name + '.webp'), 84)
                ov.append([r, o['x'] + kx + bb[0], o['y'] + bb[1], cc.width, cc.height, o.get('sort_y', (r + 1) * 240), name])
        # 底图
        wp(Image.open(os.path.join(d, P.get('base', 'map_base.png'))).convert('RGB'), os.path.join(od, 'base.webp'), 82)
        # 物件（法阵以外）
        objs = []
        for o in P['objects']:
            if 'tp_' in o['id'] or '传送' in o.get('type', ''): continue
            st = {}
            for kk, f in (o.get('states') or {}).items():
                if f.endswith('.png'): st[kk] = put(os.path.join(d, f))[0]
            bc = o.get('bottom_center') or [o['x'] + o['width'] / 2, o['y'] + o['height']]
            e = {'id': o['id'], 'type': o.get('type', ''), 'x': o['x'], 'y': o['y'], 'w': o['width'], 'h': o['height'], 'bx': bc[0], 'by': bc[1], 'sy': o.get('sort_y', bc[1]), 'st': st, 'def': o.get('default_state')}
            if o.get('cell'): e['cell'] = [o['cell']['col'], o['cell']['row']] if isinstance(o['cell'], dict) else o['cell']
            if o.get('blocks_px'): e['blocks'] = o['blocks_px']
            for kk in ('requires', 'opens', 'requires_event', 'bit', 'group', 'event_id'):
                if o.get(kk) is not None: e[kk] = o[kk]
            objs.append(e)
        # 水（三层）
        water = None
        if P.get('water'):
            W = json.load(open(os.path.join(d, P['water']))); wd = os.path.join(d, 'water')
            water = {'tile': put(os.path.join(wd, W['tile']), q=82)[0], 'glints': [put(os.path.join(wd, g), q=80)[0] for g in W['glints']], 'gms': W.get('glint_frame_ms', 160), 'v': W.get('scroll_content_pixels_per_second', [0, 6]), 'blocks': []}
            for b in W['blocks']:
                water['blocks'].append({'x': b['origin'][0], 'y': b['origin'][1], 'w': b['size'][0], 'h': b['size'][1], 'mask': put(os.path.join(wd, b['mask']))[0], 'fg': put(os.path.join(wd, b['foreground']))[0] if b.get('foreground') else None})
        # 氛围粒子（三、四层）
        emit = None
        if P.get('particles'):
            E = json.load(open(os.path.join(d, P['particles'])))
            emit = {'tex': put(os.path.join(d, '氛围', E['texture']))[0], 'type': E.get('type'), 'cyc': E.get('cycle_seconds', 8), 'list': [[e2['origin'][0], e2['origin'][1], e2['size'][0], e2['size'][1], e2['count'], e2['seed'], e2.get('disable_when')] for e2 in E['emitters']]}
        # 动态权重
        dyn = None
        if n == 2:
            Wj = json.load(open(os.path.join(FD, '动态', '权重.json'))); m = next(x for x in Wj['courts'] if x['court'] == cn)
            shutil.copy(os.path.join(FD, '动态', m['file']), os.path.join(od, 'w.r8'))
            dyn = {'t': 'weather', 'atlas': m['atlas'], 'rects': m['rects'], 'worlds': m['worlds']}
        elif n in (3, 4):
            M = json.load(open(os.path.join(d, '动态权重', 'motion.json')))
            shutil.copy(os.path.join(d, '动态权重', 'flex.r8'), os.path.join(od, 'w.r8'))
            dyn = {'t': 'motion', 'size': M['weightTextureSize'], 'loop': M['loopSeconds'], 'blocks': [[b['x'], b['y'], b['w'], b['h'], b['cols'], b['rows'], b['offset'], b.get('kind', 0), b.get('disable_when')] for b in M['blocks']]}
        else:
            M = json.load(open(os.path.join(d, '动态', '动态.json')))
            shutil.copy(os.path.join(d, '动态', M['weight_file']), os.path.join(od, 'w.r8'))
            dyn = {'t': 'scene', 'mode': M['mode'], 'period': M['period_s'], 'amp': M['amplitude_px'], 'gain': M['gain'], 'bytes': M['bytes'],
                   'patches': [[p['byte_offset'], p['size'][0], p['size'][1], *p['texture_world'], *p['cover']] for p in M['patches']]}
        # 机关格、首领格、门格
        def find(ch): return [[cc + 1, rr + 1] for rr, row in enumerate(grid) for cc, x in enumerate(row) if x == ch]
        mech = c.get('mechanism')
        if isinstance(mech, dict): mech = [mech['cell']['col'], mech['cell']['row']]
        ev = P.get('events') or c.get('objects') or []
        C = {'name': c['name'], 'w': P['width'], 'h': P['height'], 'ts': P['tile_size'], 'grid': grid, 'entry': entry, 'pads': pads, 'ov': ov, 'objs': objs,
             'water': water, 'emit': emit, 'dyn': dyn, 'mech': mech, 'L': find('L'), 'P': find('P'), 'B': find('B'), 'G': find('G'), 'R': find('R'), 'ev': ev}
        F['courts'][z] = C
        print(n, z, cn, 'ov', len(ov), 'objs', len(objs), 'pads', len(pads), 'water', bool(water), 'emit', bool(emit), flush=True)
    # ---------- 走法 ----------
    R = L.get('correct_path') or L.get('route') or L.get('solution')
    for s in R:
        if 'land_court' in s:
            a = zi(s['court']); b = zi(s['land_court']); fr = s.get('start') or s.get('from_cell'); st = s['step']; ld = s['land']
        else:
            a = zi(s['court']); fr = s['at']; st = s['step']; b = zi(s['arrive'][0]); ld = s['arrive'][1]
        F['route'].append([a, fr[0], fr[1], st[0], st[1], b, ld[0], ld[1]])
    # ---------- 法阵特效（同层共用） ----------
    td = os.path.join(od0, 'tp'); os.makedirs(td, exist_ok=True)
    def sheet(path, name, scale, q=82):
        im = Image.open(path).convert('RGBA')
        if scale != 1: im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        wp(im, os.path.join(td, name + '.webp'), q); return im.size
    if n == 2:
        X = json.load(open(os.path.join(FD, '传送法阵特效', '特效.json'))); fw, fh = X['frame_size']; ax, ay = X['anchor_px']
        for k, A in X['actions'].items():
            sheet(os.path.join(FD, '传送法阵特效', A['sheet']), k, .5)
            F['tp'][k] = {'n': A['frames'], 'cols': A['frames'], 'fw': fw // 2, 'fh': fh // 2, 'ax': ax / 2, 'ay': ay / 2, 'ms': A['frame_ms'], 'loop': A['loop'], 'a': .48 if k == 'idle' else 1}
    elif n in (3, 4):
        X = json.load(open(os.path.join(FD, '传送法阵特效', '动画.json')))
        for k, A in X['clips'].items():
            sheet(os.path.join(FD, '传送法阵特效', A['file']), k, .5)
            F['tp'][k] = {'n': A['frame_count'], 'cols': A['columns'], 'fw': A['frame_size'][0] // 2, 'fh': A['frame_size'][1] // 2, 'ax': A['world_anchor_2x'][0] / 2, 'ay': A['world_anchor_2x'][1] / 2, 'ms': 1000 / A['fps'], 'loop': A['loop'], 'a': 1}
    else:
        X = json.load(open(os.path.join(FD, '传送法阵特效', 'anim.json'))); fw, fh = X['frame_size']; ax, ay = X['ground_anchor']
        for k, A in X['states'].items():
            sheet(os.path.join(FD, '传送法阵特效', A['file']), k, 1)
            F['tp'][k] = {'n': A['frame_count'], 'cols': X['atlas_columns'], 'fw': fw, 'fh': fh, 'ax': ax, 'ay': ay, 'ms': A['frame_ms'], 'loop': A['loop'], 'a': 1}
    meta[str(n)] = F
json.dump(meta, open(MP, 'w'), ensure_ascii=False)
with open(os.path.join(GAME, 'r469_meta.js'), 'w') as f:
    f.write('// R469 · 万妖塔二～六层三苑尺寸表（tools/r469_build.py 生成，别手改）：网格、法阵、行前景、物件、水、粒子、动态权重、走法\n')
    f.write('window.R469_META = ' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('done')
