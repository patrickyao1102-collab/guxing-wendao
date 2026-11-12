# 云来客栈三张（Codex R215 画风 + R217 铺地）→ game/r217/：底图、遮挡物件、线索物件转 webp，布局转成 game/r217/inn.js
import json, sys, os, glob
from PIL import Image
# 用法：scene_convert.py <素材目录> <输出目录> <图片键前缀> <JS全局名> <输出js名> '{"地图id":"子目录"}' '{"Codex的id":"地图id"}'
R, OUT, PFX, GLOBAL, JSNAME = sys.argv[1:6]
SC = json.loads(sys.argv[6]); ALIAS = json.loads(sys.argv[7]) if len(sys.argv) > 7 else {}
rooms = {}
for sid, d in SC.items():
    L = json.load(open(f'{R}/{d}/layout.json')); Image.open(f'{R}/{d}/ground.png').convert('RGB').save(f'{OUT}/g_{sid}.webp', quality=86, method=6)
    b = L['nav']['blocked']; b = b if isinstance(b, str) else ''.join(str(int(bool(x))) for x in b)
    objs, sy_of = [], {}
    for o in L['occlusion_objects']:
        Image.open(f'{R}/{d}/' + o['image']).convert('RGBA').save(f"{OUT}/o_{sid}_{o['id']}.webp", quality=90, method=6); sy_of[o['id']] = o['sort_y']
        objs.append({'id': o['id'], 'img': f"{PFX}_{sid}_{o['id']}", 'uid': sid + '-' + o['id'], 'x': o['x'], 'y': o['y'], 'w': o['w'], 'h': o['h'], 'sy': o['sort_y'], 'flat': False})
    clues = {}
    for c in L['clues']:
        im = Image.open(f'{R}/{d}/' + c['sprite']).convert('RGBA'); im.save(f"{OUT}/c_{sid}_{c['id']}.webp", quality=92, method=6); x, y, w, h = c['sprite_bounds_px']; z = c.get('z', 'floor')
        att = z.split(':')[1] if z.startswith('attach:') else None
        objs.append({'id': 'clue_' + c['id'], 'img': f"{PFX}c_{sid}_{c['id']}", 'uid': sid + '-clue-' + c['id'], 'x': x, 'y': y, 'w': w, 'h': h, 'sy': (sy_of.get(att, y + h) + 1) if att else y + h, 'flat': not att})
        clues[c['id']] = c['interaction_point_px']
    rooms[sid] = {'w': L['w'], 'h': L['h'], 'cs': L['nav']['step_px'], 'cols': L['nav']['cols'], 'rows': L['nav']['rows'], 'blocked': b, 'objs': objs,
        'exits': [{'id': e['id'], 'region': e['region'], 'to': ALIAS.get(e['to'], e['to']), 'label': e['label'], 'land': e.get('suggested_spawn_px')} for e in L['exits']],
        'slots': {n['id']: [n['x'], n['y']] for n in L['npcs']}, 'clues': clues, 'spawn': L['spawn'], 'inter': {i['id']: i['interaction_point_px'] for i in L.get('interactables', [])}}
open(OUT + '/' + JSNAME, 'w', encoding='utf8').write('// 由 tools/scene_convert.py 生成，不要手改\nwindow.' + GLOBAL + ' = ' + json.dumps(rooms, ensure_ascii=False, separators=(',', ':')) + ';\n')
print({k: (v['exits'], v['slots'], v['clues'], len(v['objs']), len(v['blocked'])) for k, v in rooms.items()})
