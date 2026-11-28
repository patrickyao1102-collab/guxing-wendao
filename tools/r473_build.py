# R473 · 万妖塔一层内苑重画（Codex）→ game/r473/inner/*.webp + game/r473_inner_meta.js
# 用法：python3 tools/r473_build.py <Codex 交付目录> [--gray <灰石血纹交付目录>]
#   默认地面：map_base.png + over_r1~15.png + objects/*.png（placement.json 定位）
#   灰石血纹（--gray，作者 11-28 定为默认地面）：目录里有 map_base.png 和要换的那几张 over_rN.png 就行，没给的行沿用暗红版；输出到 game/r473/inner/gray/
#   别的地面版本（比如以后压暗一点的灰石）：--ground gray2 <目录>，输出到 game/r473/inner/gray2/
#        首领花树重画：--tree <首领花树_重画目录>
#        封花宫门重做（灰瓦灰石门楼 + 门前灰石铺地）：--gate <封花宫门_重做目录>
#   作者 11-28 定稿的完整命令（R473 交付目录记作 $R）：
#     python3 tools/r473_build.py $R --gray $R/地面对比_灰石血纹 --gate $R/封花宫门_重做 --tree $R/首领花树_重画 --extra $R/追加_物件
#        追加物件（入梦百姓 / 祭柱 / 散落小物 / 明雷梦傀 / 精英梦傀首）：再加 --extra <追加_物件目录>
#          摆设 → game/r473/inner/x/（逐帧，跟着 R443 的 frames 轮播）；明雷梦傀、精英梦傀首 → game/r473/menggui/ 图集 + meta.json
# 行前景整行 5040 宽，这里切成四块（各 1260 宽）再裁掉透明边，和 R443 的 ov 一样记 [行, x, y, w, h, sort_y, 名]。
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'game', 'r473', 'inner')
Q = 82


def save(im, name, sub=''):
    d = os.path.join(OUT, sub)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name + '.webp')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, 'WEBP', quality=Q, method=5)
    return p


def chunks(src, P, sub='', patch=None):
    ov = []
    for o in P['overlays']:
        f = os.path.join(src, o['file'])
        if patch and os.path.exists(os.path.join(patch, o['file'])):
            f = os.path.join(patch, o['file'])   # 门前修整过的那一行（over_r5）
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert('RGBA')
        row = o['row']
        for k in range(4):
            x0 = k * 1260
            piece = im.crop((x0, 0, min(im.width, x0 + 1260), im.height))
            bb = piece.split()[3].point(lambda v: 255 if v > 6 else 0).getbbox()
            if not bb:
                continue
            piece = piece.crop(bb)
            name = 'ov_%d_%d' % (row, k)
            save(piece, name, sub)
            ov.append([row - 1, o['x'] + x0 + bb[0], o['y'] + bb[1], piece.width, piece.height, o['sort_y'], (sub + name) if sub else name])
    return ov


DIRS8 = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']


def union_bbox(paths):
    bb = None
    for f in paths:
        b = Image.open(f).convert('RGBA').split()[3].point(lambda v: 255 if v > 6 else 0).getbbox()
        if b:
            bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    return bb


def sheet(rows, out, anchor):
    # rows: [[帧文件...], ...] → 一张图集（每格 = 所有帧的公共非透明框），返回 fw, fh, foot
    allf = [f for r in rows for f in r]
    bb = union_bbox(allf)
    fw, fh = bb[2] - bb[0], bb[3] - bb[1]
    W = fw * max(len(r) for r in rows)
    im = Image.new('RGBA', (W, fh * len(rows)), (0, 0, 0, 0))
    for i, r in enumerate(rows):
        for j, f in enumerate(r):
            im.paste(Image.open(f).convert('RGBA').crop(bb), (j * fw, i * fh))
    d = os.path.join(ROOT, 'game', 'r473', 'menggui')
    os.makedirs(d, exist_ok=True)
    im.save(os.path.join(d, out), 'WEBP', quality=Q, method=5)
    return fw, fh, [anchor[0] - bb[0], anchor[1] - bb[1]]


def extra(xd, objs):
    X = json.load(open(os.path.join(xd, '位置表.json'), encoding='utf-8'))
    A = X['assets']
    fr = lambda a, st: [os.path.join(xd, f) for f in A[a]['states'][st]['frames']] if 'frames' in A[a]['states'][st] else [os.path.join(xd, A[a]['states'][st]['png'])]
    ms = lambda a, st: A[a]['states'][st].get('frame_ms', 150)
    info = {'decor': 0}
    saved = {}
    for o in X['objects']:
        a = o['asset']
        if a.startswith('roamer') or a == 'elite':
            continue
        st = o['default_state']
        files = fr(a, st)
        bb = union_bbox(files)
        names = []
        for i, f in enumerate(files):
            n = 'x/%s_%s_%02d' % (a, st, i + 1)
            if n not in saved:
                saved[n] = 1
                save(Image.open(f).convert('RGBA').crop(bb), n[2:], 'x/')
            names.append(n)
        fx, fy = o['world_foot']
        d = {'id': 'x_' + o['id'], 'type': o['type'], 'kind': a.split('_')[0] if not a.startswith('lantern') else 'lantern', 'x': o['x'] + bb[0], 'y': o['y'] + bb[1], 'w': bb[2] - bb[0], 'h': bb[3] - bb[1],
             'bx': fx, 'by': fy, 'cell': [o['cell']['col'] - 1, o['cell']['row'] - 1]}
        if len(names) > 1:
            d['frames'] = names
            d['ms'] = ms(a, st)
        else:
            d['states'] = {'static': names[0]}
            d['def'] = 'static'
        objs.append(d)
        info['decor'] += 1
    # 明雷梦傀：男（梦仆书生）/ 女（宫侍梦傀）；行 0～7 = 八方向走（下、左下、左、左上、上、右上、右、右下），行 8 = 正面待机
    mg = {'sheet': {}, 'rows': {'move': 0, 'idle': 8}, 'n': {'move': 8, 'idle': 12}, 'ms': {'move': ms('roamer_male', 'move_S'), 'idle': ms('roamer_male', 'idle')}, 'scale': 1,
          'shadow': A['roamer_male'].get('shadow'), 'spawn': [o['world_foot'] for o in X['objects'] if o['asset'].startswith('roamer')]}
    for g, a in (('m', 'roamer_male'), ('f', 'roamer_female')):
        rows = [fr(a, 'move_' + k) for k in DIRS8] + [fr(a, 'idle')]
        fw, fh, foot = sheet(rows, 'mg_%s.webp' % g, A[a]['foot'])
        mg['sheet'][g] = 'mg_%s.webp' % g
        mg.setdefault('dim', {})[g] = {'fw': fw, 'fh': fh, 'foot': foot}   # 男女两张图集的格子大小不一样
    # 精英梦傀首：行 0～7 八方向走，8 待机，9 装睡，10 惊醒
    el = [o for o in X['objects'] if o['asset'] == 'elite'][0]
    rows = [fr('elite', 'move_' + k) for k in DIRS8] + [fr('elite', 'idle'), fr('elite', 'feign_sleep'), fr('elite', 'awaken')]
    fw, fh, foot = sheet(rows, 'elite.webp', A['elite']['foot'])
    mg['elite'] = {'sheet': 'elite.webp', 'fw': fw, 'fh': fh, 'foot': foot, 'rows': {'move': 0, 'idle': 8, 'sleep': 9, 'wake': 10}, 'n': {'move': 8, 'idle': 12, 'sleep': 8, 'wake': 12},
                   'ms': {'move': ms('elite', 'move_S'), 'idle': ms('elite', 'idle'), 'sleep': ms('elite', 'feign_sleep'), 'wake': ms('elite', 'awaken')}, 'at': el['world_foot'], 'cell': [el['cell']['col'] - 1, el['cell']['row'] - 1]}
    json.dump(mg, open(os.path.join(ROOT, 'game', 'r473', 'menggui', 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    info['menggui'] = 1
    return info


def tree(td):
    # 首领花树重画（单棵古树，树洞暗红光呼吸 8 帧；绛蘅入树另叠一层）→ game/r473/inner/tree/
    T = json.load(open(os.path.join(td, '花树摆放.json'), encoding='utf-8'))
    # 呼吸只动树洞那一块：整树只存第 1 帧，8 帧只裁树洞那一小块（省 3MB）
    from PIL import ImageChops
    fs = [Image.open(os.path.join(td, f)).convert('RGBA') for f in T['empty_frames']]
    bb = None
    for f in fs[1:]:
        d = ImageChops.difference(f, fs[0]).convert('L').point(lambda v: 255 if v > 3 else 0).getbbox()
        if d:
            bb = d if bb is None else (min(bb[0], d[0]), min(bb[1], d[1]), max(bb[2], d[2]), max(bb[3], d[3]))
    bb = (bb[0] - 2, bb[1] - 2, bb[2] + 2, bb[3] + 2)
    save(fs[0], 'tree_base', 'tree/')
    frames = []
    for i, f in enumerate(fs):
        save(f.crop(bb), 'glow_%02d' % (i + 1), 'tree/')
        frames.append('tree/glow_%02d' % (i + 1))
    oc = T['occupied_layer']
    save(Image.open(os.path.join(td, oc['file'])).convert('RGBA'), 'jh_hollow', 'tree/')
    (x, y), (w, h) = T['map_origin_px'], T['canvas_px']
    return {'x': x, 'y': y, 'w': w, 'h': h, 'foot': T['bottom_center_world'], 'sortY': T['group_sort_y'], 'frames': frames, 'base': 'tree/tree_base', 'glow': [x + bb[0], y + bb[1], bb[2] - bb[0], bb[3] - bb[1]], 'ms': T['frame_ms'],
            'occ': {'img': 'tree/jh_hollow', 'x': oc['world_xy'][0], 'y': oc['world_xy'][1], 'w': oc['size'][0], 'h': oc['size'][1]}}


def main():
    src = sys.argv[1]
    gray = sys.argv[sys.argv.index('--gray') + 1] if '--gray' in sys.argv else None
    P = json.load(open(os.path.join(src, 'placement.json'), encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    save(Image.open(os.path.join(src, P['base'])).convert('RGB'), 'base')
    ov = chunks(src, P)
    done = set()

    # 封花宫门重做（作者 11-28：旧门跟灰石地面不搭 → 灰瓦灰石门楼，画布 526×349、原点 (2257,880)、排序 1229）：--gate <封花宫门_重做目录>
    #   门的四态从这个目录取，存成 g2/gate_*（和旧门帧分开，免得浏览器缓存串）；目录里的 map_base.png / over_r5.png（门前灰石铺地、两翼矮墙）盖到灰石血纹地面上
    gate_dir = sys.argv[sys.argv.index('--gate') + 1] if '--gate' in sys.argv else None
    if gate_dir:
        GP = json.load(open(os.path.join(gate_dir, '宫门摆放.json'), encoding='utf-8'))['gate']
        for o in P['objects']:
            if o['id'] == 'gate':
                o.update({'x': GP['x'], 'y': GP['y'], 'width': GP['width'], 'height': GP['height'], 'bottom_center': GP['bottom_center'], 'sort_y': GP['sort_y'], '_dir': gate_dir})

    def obj(f, base=None, pre=''):
        n = pre + os.path.splitext(os.path.basename(f))[0]
        if n not in done:
            done.add(n)
            save(Image.open(os.path.join(base or src, f)).convert('RGBA'), n)
        return n

    objs = []
    for o in P['objects']:
        if o['id'].startswith('tp_'):
            continue   # 传送阵用 R443 原有的 tp 动画（r443/tp/），这里不另存
        bx, by = o['bottom_center']
        d = {'id': o['id'], 'type': o['type'], 'x': o['x'], 'y': o['y'], 'w': o['width'], 'h': o['height'], 'bx': int(round(bx)), 'by': int(round(by)),
             'cell': [o['cell']['col'] - 1, o['cell']['row'] - 1]}
        if 'frames' in o:
            d['frames'] = [obj(f) for f in o['frames']]
            d['ms'] = o.get('frame_ms', 150)
        if 'states' in o:
            gd, gp = (o.get('_dir'), 'g2/') if o['id'] == 'gate' and o.get('_dir') else (None, '')
            st = {k: obj(v, gd, gp) for k, v in o['states'].items() if o['id'] != 'gate' or k == 'closed'}
            d['def'] = o.get('default_state')
            if o['id'] == 'gate':
                # 门四态：sealed 10 帧循环 / unsealing 12 帧单次 / closed 静帧 / open 12 帧单次 + 末帧 hold
                anim = {}
                for k, n in (('sealed', 10), ('unsealing', 12), ('open', 12)):
                    anim[k] = [obj('objects/gate_%s_%02d.png' % (k, i), gd, gp) for i in range(1, n + 1)]
                hold = obj('objects/gate_open_hold.png', gd, gp)
                d['anim'] = anim
                d['ams'] = {'sealed': 150, 'unsealing': 100, 'open': 105}
                if o.get('sort_y'):
                    d['by'] = o['sort_y']   # 新门：排序纵坐标 1229（门槛前沿）
                # R443 的老画法只认 open / closed 两态：open 指向开门末帧
                d['states'] = {'closed': st['closed'], 'open': hold, 'sealed': anim['sealed'][0]}
                d['frames'] = anim['sealed'] + anim['unsealing'] + anim['open']   # 只为预载（有 states 时 R443 不按 frames 轮播）
                d['blocks_cell'] = o.get('blocks_cell')
            else:
                d['states'] = st
        if 'group' in o:
            d['group'] = o['group']
        objs.append(d)
    meta = {'w': P['width'], 'h': P['height'], 'ts': P['tile_size'], 'grid': P['grid'], 'ov': ov, 'objs': objs, 'water': [],
            'tp': [{'id': o['id'], 'cell': [o['cell']['col'] - 1, o['cell']['row'] - 1], 'bx': o['bottom_center'][0], 'by': o['bottom_center'][1]} for o in P['objects'] if o['id'].startswith('tp_')]}
    # 地面版本：--gray <目录>（灰石血纹，作者 11-28 定为默认）；以后再有别的版本用 --ground <名字> <目录>（可多次）
    grounds = []
    if gray:
        grounds.append(('gray', gray))
    for i, v in enumerate(sys.argv):
        if v == '--ground':
            grounds.append((sys.argv[i + 1], sys.argv[i + 2]))
    meta['grounds'] = {}
    for name, gd in grounds:
        gb = os.path.join(gd, 'map_base.png')
        patch = gate_dir if gate_dir and name == 'gray' else None   # 门前修整只画在灰石血纹上（暗红备选沿用原图）
        if patch and os.path.exists(os.path.join(patch, 'map_base.png')):
            gb = os.path.join(patch, 'map_base.png')
        if os.path.exists(gb):
            save(Image.open(gb).convert('RGB'), 'base', name + '/')
        gov = chunks(gd, P, name + '/', patch)
        rows = {r for r, *_ in gov}
        meta['grounds'][name] = {'base': os.path.exists(gb), 'ov': [o for o in ov if o[0] not in rows] + gov}
    if '--tree' in sys.argv:
        meta['tree'] = tree(sys.argv[sys.argv.index('--tree') + 1])
    if '--extra' in sys.argv:
        meta['extra'] = extra(sys.argv[sys.argv.index('--extra') + 1], objs)
    js = '// R473 · 万妖塔一层内苑重画（Codex）尺寸表：tools/r473_build.py 生成，别手改\nwindow.R473_INNER_META = ' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(ROOT, 'game', 'r473_inner_meta.js'), 'w', encoding='utf-8').write(js)
    print('ov', len(ov), 'objs', len(objs), 'files', len(os.listdir(OUT)))


if __name__ == '__main__':
    main()
