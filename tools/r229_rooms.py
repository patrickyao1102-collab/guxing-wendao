# R225 后续六间（听雨阁 / 琴堂 / 赌坊 / 云来大堂 / 天字三号房 / 万宝楼雅间）+ R226 第二批带人座位组 → 测试版
# 用法：r229_rooms.py <解包目录(含 R225_房间布局重做 / R226_…)> <game 目录>
# 做三件事：① Codex 的地面还是一片平色——在平色地板上铺木纹（纹理取自叶孤星居室），按每间屋子的气质定木色；
#          ② 青阳镇三间（v2 布局）转成 r213 的房间数据，写进 game/r213/patch2.js；
#          ③ 玄天城三间（scene 布局）用 scene_convert.py 的同一套转法，合并进 game/r217/inn.js、game/r219/vip.js；
#          另外按我自己的布置，把一部分空桌换成「带人的座位组」。
import sys, os, json, subprocess, tempfile, shutil
import numpy as np
from PIL import Image, ImageFilter
SRC, GAME = sys.argv[1:3]
A = SRC + '/R225_房间布局重做'; B = SRC + '/R226_茶座_带人座位组_短楼梯间'; HERE = os.path.dirname(os.path.abspath(__file__))

def wood_detail(h, w, scale=1.0):
    p = Image.open(GAME + '/cx2/g_tj_room.webp').convert('L').crop((110, 420, 1000, 700))
    if scale != 1.0: p = p.resize((int(p.width * scale), int(p.height * scale)), Image.LANCZOS)
    pl = np.asarray(p).astype(np.float32); bl = np.asarray(p.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
    det = pl / np.maximum(bl, 1); row = np.concatenate([det, det[:, ::-1]], 1); tex = np.concatenate([row, row[::-1]], 0)
    return np.tile(tex, (h // tex.shape[0] + 1, w // tex.shape[1] + 1))[:h, :w]

def floorfix(path, floor_top, target, scale=1.0, gamma=1.35, min_share=.035):
    """平色地板 → 木纹地板。占地够大的平色块（含 Codex 垫在台子 / 门口下面的色块）一律铺成同一种木地板；小块的毯子不动。"""
    g = np.asarray(Image.open(path).convert('RGB')).astype(np.float32); h, w, _ = g.shape
    fl = g[floor_top:]; q = (fl // 12).astype(np.int32); key = q[..., 0] * 10000 + q[..., 1] * 100 + q[..., 2]
    vals, cnt = np.unique(key, return_counts=True); m = np.zeros((h, w), bool); used = []
    for v, c in sorted(zip(vals, cnt), key=lambda t: -t[1]):
        if c < min_share * key.size: break
        base = fl[key == v].mean(0); sat = base.max() - base.min()
        if sat > 70: continue                                   # 颜色很艳的大块是毯子，不是地板
        mm = np.abs(g - base).max(axis=2) < 15; mm[:floor_top] = False; m |= mm; used.append(tuple(int(x) for x in base))
    mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))   # 闭运算：毯子去掉以后剩下的细边线、流苏一起铺平
    keep = np.asarray(mi) > 0; keep[:floor_top] = False; m = keep
    a = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)[..., None] / 255
    tex = wood_detail(h, w, scale) ** gamma; t = np.array(target, np.float32)
    # 整块地板再加一点很缓的明暗起伏，免得大面积一个亮度
    yy, xx = np.mgrid[0:h, 0:w]; wave = 1 + .035 * np.sin(xx / 310.0 + 1.3) * np.cos(yy / 260.0)
    out = g * (1 - a) + np.clip(t[None, None] * (tex * wave)[..., None], 0, 255) * a
    return Image.fromarray(out.astype(np.uint8)), used, float(m[floor_top:].mean())

def floor_top_of(blocked, cols, rows, cs):
    b = np.array([int(x) for x in blocked]).reshape(rows, cols)
    for r in range(rows):
        if (b[r] == 0).mean() > .3: return max(0, r * cs - 6)
    return 0

def setinfo(k):
    j = json.load(open(f'{B}/animations/{k}.json')); return {'fw': j['frame_size_px'][0], 'fh': j['frame_size_px'][1], 'n': j.get('frame_count', 6), 'fps': j.get('fps', 6), 'ax': j['anchor_px'][0], 'ay': j['anchor_px'][1]}
patch = {'rooms': {}, 'objs': {}, 'anim': {}}
def use_set(k):
    if k not in patch['anim']:
        Image.open(f'{B}/animations/{k}.png').convert('RGBA').save(f'{GAME}/r213/a_{k}.webp', quality=90, method=6); patch['anim'][k] = setinfo(k)
    return patch['anim'][k]
def set_obj(k, uid, ax, ay, z=1.0):
    a = use_set(k); return {'id': k, 'img': 'r213_' + k, 'uid': uid, 'x': round(ax - a['ax'] * z, 1), 'y': round(ay - a['ay'] * z, 1), 'w': round(a['fw'] * z), 'h': round(a['fh'] * z), 'sy': round(ay, 1), 'flat': False, 'noPre': True}

# ---------------- 青阳镇三间 ----------------
QY = {  # 目录, 地图 id, 图片前缀, 木色, 木板粗细
    'qy_yicui_2f': ('02_倚翠楼二楼听雨阁', 'n2', (196, 176, 142), 1.0),      # 听雨阁：浅一点的暖麦色，清雅
    'qy_yicui':    ('03_倚翠楼一楼琴堂',   'n1', (201, 170, 140), 1.0),      # 琴堂：蜜色偏粉，暖
    'qy_changle':  ('04_长乐坊一楼赌坊',   'c1', (184, 156, 124), 1.15),     # 赌坊：茶褐色，老一点、粗一点
}
ALIAS = {'qy_yicui_1f': 'qy_yicui', 'qy_changle_1f': 'qy_changle'}
for sid, (d, pfx, tint, sc) in QY.items():
    D = f'{A}/{d}'; L = json.load(open(D + '/layout.json')); n = L['nav']
    mp = D + '/objects/meta.json'; meta = json.load(open(mp if os.path.exists(mp) else D + '/meta.json'))['objects']
    blocked = ''.join(str(int(bool(x))) for x in n['blocked'])
    im, used, share = floorfix(D + '/ground.png', floor_top_of(blocked, n['cols'], n['rows'], n['step_px']), tint, sc)
    im.save(f'{GAME}/r213/g_{sid}.webp', quality=88, method=6); print(sid, 'floor', used, f'{share:.0%}')
    objs = []
    for i in L['instances']:
        mm = meta[i['id']]; ax, ay = i['anchor']; ww, hh = mm['size_px']; px, py = mm['anchor_px']; key = f"{pfx}_{i['id']}"
        if key not in patch['objs']:
            Image.open(f"{D}/objects/{i['id']}.png").convert('RGBA').save(f'{GAME}/r213/o_{key}.webp', quality=90, method=6); patch['objs'][key] = {'w': ww, 'h': hh, 'ax': px, 'ay': py}
        objs.append({'id': i['id'], 'img': 'r213_' + key, 'uid': i['uid'], 'x': round(ax - px, 1), 'y': round(ay - py, 1), 'w': ww, 'h': hh, 'sy': round(i.get('sort_y', ay), 1), 'flat': bool(mm.get('flat')), 'ax': ax, 'ay': ay})
    patch['rooms'][sid] = {'w': im.width, 'h': im.height, 'cs': n['step_px'], 'cols': n['cols'], 'rows': n['rows'], 'blocked': blocked, 'objs': objs,
        'exits': [{'id': e['id'], 'region': e['region'], 'to': ALIAS.get(e['to'], e['to']), 'label': e.get('label', ''), 'land': e.get('local_landing_px')} for e in L['exits']],
        'slots': {s['id']: s['anchor'] for s in L.get('suggested_npc_positions', [])}, 'inter': {s['id']: s['interaction_point_px'] for s in L.get('interactables', [])}}

def block(R, x0, y0, x1, y1, v='1'):
    b = list(R['blocked']); cs = R['cs']
    for r in range(int(y0 // cs), int(y1 // cs) + 1):
        for c in range(int(x0 // cs), int(x1 // cs) + 1):
            if 0 <= r < R['rows'] and 0 <= c < R['cols']: b[r * R['cols'] + c] = v
    R['blocked'] = ''.join(b)

# 琴堂：四组茶座里三组坐了人（两位书生、一对男女、一个独自听琴的），留一组空着——有人气，又不是座无虚席
R = patch['rooms']['qy_yicui']; teas = [o for o in R['objs'] if o['id'] == 'r226_tea_low']; plan = ['set_tea_two_scholars', None, 'set_tea_one', 'set_tea_two_couple']
for o, k in zip(teas, plan):
    if not k: continue
    extra = [e for e in R['objs'] if e['id'] == 'r226_stool_extra' and abs(e['ax'] - o['ax']) < 8 and abs(e['ay'] - o['ay']) < 60]
    R['objs'] = [x for x in R['objs'] if x is not o and x not in extra]; R['objs'].append(set_obj(k, o['uid'], o['ax'], o['ay']))
R['inter']['sword_tassel_socket'] = R['inter'].get('qin_stage')
R['at'] = {'maid': [1118, 724], 'tea_guest': [600, 552], 'drunk_scholar': [1180, 470]}
# 听雨阁
R = patch['rooms']['qy_yicui_2f']; R['inter']['sword_tassel_socket'] = R['inter']['guqin_desk']; R['at'] = {'window': R['inter'].get('riverside_window')}
# 赌坊：四张牌九桌里两张有人在赌（四人围坐那组），两张空着；楼梯口右手的墙根加一条长凳，坐两个看客
R = patch['rooms']['qy_changle']; tabs = [o for o in R['objs'] if o['id'] == 'paijiu_table']
for o in (tabs[0], tabs[3]):
    st = [e for e in R['objs'] if e['id'] == 'plain_stool' and abs(e['ax'] - o['ax']) < 130 and abs(e['ay'] - o['ay']) < 110]
    R['objs'] = [x for x in R['objs'] if x is not o and x not in st]; R['objs'].append(set_obj('set_gamble_four', o['uid'], o['ax'], o['ay'] + 62))
R['objs'].append(set_obj('set_gamble_watch', 'watch_bench_1', 372, 312)); block(R, 300, 286, 444, 312)
R['slots'].update({'guard_left': [520, 470], 'guard_right': [824, 470]})
R['at'] = {'old': [156, 560], 'red': [1250, 640], 'stair_guard': [94, 336], 'watcher': [806, 566]}

# ---------------- 玄天城三间 ----------------
def scene(outdir, pfx, glob, jsname, sc, alias):
    subprocess.run([sys.executable, HERE + '/scene_convert.py', A, outdir, pfx, glob, jsname, json.dumps(sc, ensure_ascii=False), json.dumps(alias)], check=True, capture_output=True)
    s = open(f'{outdir}/{jsname}', encoding='utf8').read(); return json.loads(s[s.index('= ') + 2:s.rindex(';')])
def merge(jspath, glob, new):
    s = open(jspath, encoding='utf8').read(); cur = json.loads(s[s.index('= ') + 2:s.rindex(';')]); cur.update(new)
    open(jspath, 'w', encoding='utf8').write('// 由 tools/scene_convert.py + tools/r229_rooms.py 生成，不要手改\nwindow.' + glob + ' = ' + json.dumps(cur, ensure_ascii=False, separators=(',', ':')) + ';\n'); return cur
XT_TINT = {'xt_inn_hall': ((194, 180, 156), 1.3), 'xt_inn_room3': ((200, 180, 150), 1.0), 'xt_wanbao_vip': ((181, 152, 124), 1.0)}   # 大堂：宽板暖灰褐；客房：浅橡木；雅间：浅胡桃
def finish(tmp, dst, rooms):
    for f in os.listdir(tmp):
        if f.endswith('.webp') and not f.startswith('g_'): shutil.copy(f'{tmp}/{f}', f'{dst}/{f}')
    for sid, R in rooms.items():
        for o in R['objs']: o['id'] = o['id'].replace('original_', '')
        tint, sc = XT_TINT[sid]; im, used, share = floorfix(f'{tmp}/g_{sid}.webp', floor_top_of(R['blocked'], R['cols'], R['rows'], R['cs']), tint, sc)
        im.save(f'{dst}/g_{sid}.webp', quality=88, method=6); print(sid, 'floor', used, f'{share:.0%}', [o['id'] for o in R['objs']])
t1 = tempfile.mkdtemp(); inn = scene(t1, 'r217', 'R217_INN', 'inn.js', {'xt_inn_hall': '05_云来客栈一楼大堂', 'xt_inn_room3': '06_云来客栈天字三号房'}, {'xt_yunlai_corridor': 'xt_inn_corr', 'xt_yunlai_lobby': 'xt_inn_hall'})
finish(t1, GAME + '/r217', inn)
# 大堂：十张一模一样的空桌太呆——三张坐上客人（三人一桌两组、独酌一位），其余空着
H = inn['xt_inn_hall']
for oid, k in (('dining_02', 'set_dine_three_ochre'), ('dining_07', 'set_dine_three_teal'), ('dining_04', 'set_dine_one')):
    o = next(x for x in H['objs'] if x['id'] == oid); H['objs'].remove(o); H['objs'].append(set_obj(k, o['uid'], o['x'] + o['w'] / 2, o['sy'] + 6, 1.38))   # 大堂的家具比别处画得大一号，座位组跟着放大
pj = f'{A}/05_云来客栈一楼大堂/接入补丁_云来走廊返回落点.json'; back = json.load(open(pj)) if os.path.exists(pj) else None
cur = merge(GAME + '/r217/inn.js', 'R217_INN', inn)
if back:
    print('corr patch', json.dumps(back, ensure_ascii=False)[:300])
t2 = tempfile.mkdtemp(); vip = scene(t2, 'r219', 'R219_VIP', 'vip.js', {'xt_wanbao_vip': '07_万宝楼二楼鉴宝雅间'}, {})
finish(t2, GAME + '/r219', vip); merge(GAME + '/r219/vip.js', 'R219_VIP', vip)
open(f'{GAME}/r213/patch2.js', 'w', encoding='utf8').write('// 由 tools/r229_rooms.py 生成：R225 后续的听雨阁 / 琴堂 / 赌坊新布局 + R226 带人座位组\nwindow.R229_PATCH = ' + json.dumps(patch, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', list(patch['rooms']), len(patch['objs']), list(patch['anim']))
