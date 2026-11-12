# R225 账房新布局 + R226 茶座 / 带人座位组 / 短楼梯口 → 打进 game/r213（在 r213_convert.py 之后跑）
# 用法：r225_patch.py <解包目录(含 R225_房间布局重做 / R226_…)> <r222p 目录> <game 目录>
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter
SRC, R222P, GAME = sys.argv[1:4]; OUT = GAME + '/r213'
A = SRC + '/R225_房间布局重做/01_长乐坊二楼账房'; B = SRC + '/R226_茶座_带人座位组_短楼梯间'
def wood_detail(src, box, h, w):
    p = Image.open(src).convert('L').crop(box); pl = np.asarray(p).astype(np.float32); bl = np.asarray(p.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
    det = pl / np.maximum(bl, 1); row = np.concatenate([det, det[:, ::-1]], 1); tex = np.concatenate([row, row[::-1]], 0); return np.tile(tex, (h // tex.shape[0] + 1, w // tex.shape[1] + 1))[:h, :w]
patch = {'rooms': {}, 'objs': {}, 'anim': {}}
# ---- 账房 ----
L = json.load(open(A + '/layout.json')); meta = json.load(open(A + '/objects/meta.json'))['objects']
g = np.asarray(Image.open(A + '/ground.png').convert('RGB')).astype(np.float32); h, w, _ = g.shape
fl = g[230:700]; cols, cnt = np.unique(fl.reshape(-1, 3).astype(np.uint8), axis=0, return_counts=True); base = cols[cnt.argmax()].astype(np.float32)
m = (np.abs(g - base).max(axis=2) < 14); m[:215] = False
a = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32)[..., None] / 255
tex = wood_detail(GAME + '/cx2/g_tj_room.webp', (110, 420, 1000, 700), h, w) ** 1.15
g = g * (1 - a) + np.clip(base[None, None] * tex[..., None], 0, 255) * a
Image.fromarray(g.astype(np.uint8)).save(OUT + '/g_qy_changle_2f.webp', quality=88, method=6)
objs = []; n = L['nav']
for i in L['instances']:
    mm = meta[i['id']]; ax, ay = i['anchor']; ww, hh = mm['size_px']; px, py = mm['anchor_px']
    Image.open(A + '/objects/' + i['id'] + '.png').convert('RGBA').save(f"{OUT}/o_{i['id']}.webp", quality=90, method=6); patch['objs'][i['id']] = {'w': ww, 'h': hh, 'ax': px, 'ay': py}
    objs.append({'id': i['id'], 'img': 'r213_' + i['id'], 'uid': i['uid'], 'x': round(ax - px, 1), 'y': round(ay - py, 1), 'w': ww, 'h': hh, 'sy': round(i.get('sort_y', ay), 1), 'flat': bool(mm.get('flat'))})
patch['rooms']['qy_changle_2f'] = {'w': w, 'h': h, 'cs': n['step_px'], 'cols': n['cols'], 'rows': n['rows'], 'blocked': ''.join(str(int(bool(x))) for x in n['blocked']), 'objs': objs,
    'exits': [{'id': e['id'], 'region': e['region'], 'to': {'qy_changle_1f': 'qy_changle'}.get(e['to'], e['to']), 'label': e['label'], 'land': e.get('local_landing_px')} for e in L['exits']],
    'slots': {s['id']: s['anchor'] for s in L.get('suggested_npc_positions', [])}, 'inter': {s['id']: s['interaction_point_px'] for s in L.get('interactables', [])}}
# ---- 茶座 / 带人座位组 ----
for k in ('tea_seat_low', 'tea_seat_round'):
    im = Image.open(f'{B}/objects/{k}.png').convert('RGBA'); im.save(f'{OUT}/o_{k}.webp', quality=90, method=6); j = json.load(open(f'{B}/objects/{k}.json')); patch['objs'][k] = {'w': im.width, 'h': im.height, 'ax': j['anchor_px'][0], 'ay': j['anchor_px'][1]}
for k in ('set_tea_two_scholars', 'set_tea_two_couple', 'set_dine_three_ochre', 'set_dine_three_teal'):
    im = Image.open(f'{B}/animations/{k}.png').convert('RGBA'); im.save(f'{OUT}/a_{k}.webp', quality=90, method=6); j = json.load(open(f'{B}/animations/{k}.json'))
    patch['anim'][k] = {'fw': j['frame_size_px'][0], 'fh': j['frame_size_px'][1], 'n': j['frame_count'], 'fps': j['fps'], 'ax': j['anchor_px'][0], 'ay': j['anchor_px'][1]}
# ---- 短楼梯口：改一楼底图（倚翠楼、长乐坊）----
nook = Image.open(f'{B}/objects/stair_nook_up_qy_left.png').convert('RGBA'); nj = json.load(open(f'{B}/objects/stair_nook_up_qy_left.json'))
for sid, p in (('qy_yicui', '一_倚翠楼/01_一楼琴堂'), ('qy_changle', '二_长乐坊/01_一楼赌坊')):
    im = Image.open(f'{R222P}/{p}/ground.png').convert('RGBA'); a = np.asarray(im).copy()
    x0, x1, y0, y1 = 24, 240, 212, 446                                   # 原来长楼梯伸进房间的部分：用右边同一排地板镜像补平
    a[y0:y1, x0:x1] = a[y0:y1, x1:x1 + (x1 - x0)][:, ::-1]
    im = Image.fromarray(a); im.alpha_composite(nook, (0, 205 - nj['anchor_px'][1])); im.convert('RGB').save(f'{OUT}/g_{sid}.webp', quality=88, method=6)
patch['nook'] = {'tp': nj.get('recommended_teleport_center_px'), 'depth': nj.get('room_projection_depth_px')}
open(OUT + '/patch.js', 'w', encoding='utf8').write('// 由 tools/r225_patch.py 生成：账房新布局（R225）、茶座 / 带人座位组 / 短楼梯口（R226）\nwindow.R225_PATCH = ' + json.dumps(patch, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', list(patch['rooms']), list(patch['objs']), patch['nook'])
