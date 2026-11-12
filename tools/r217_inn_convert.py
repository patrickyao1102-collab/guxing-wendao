# 云来客栈三张（Codex R215 画风 + R217 铺地）→ game/r217/：底图、遮挡物件、线索物件转 webp，布局转成 game/r217/inn.js
import json, sys, os, glob
from PIL import Image
R, OUT = sys.argv[1], sys.argv[2]
SC = {'xt_inn_hall': '04_云来客栈_一楼大堂', 'xt_inn_corr': '05_云来客栈_二楼走廊', 'xt_inn_room3': '06_天字三号房'}
ALIAS = {'xt_yunlai_lobby': 'xt_inn_hall', 'xt_yunlai_corridor': 'xt_inn_corr', 'xt_yunlai_room3': 'xt_inn_room3'}
rooms = {}
for sid, d in SC.items():
    L = json.load(open(f'{R}/{d}/layout.json')); Image.open(f'{R}/{d}/ground.png').convert('RGB').save(f'{OUT}/g_{sid}.webp', quality=86, method=6)
    b = L['nav']['blocked']; b = b if isinstance(b, str) else ''.join(str(int(bool(x))) for x in b)
    objs, sy_of = [], {}
    for o in L['occlusion_objects']:
        Image.open(f'{R}/{d}/' + o['image']).convert('RGBA').save(f"{OUT}/o_{sid}_{o['id']}.webp", quality=90, method=6); sy_of[o['id']] = o['sort_y']
        objs.append({'id': o['id'], 'img': f"r217_{sid}_{o['id']}", 'uid': sid + '-' + o['id'], 'x': o['x'], 'y': o['y'], 'w': o['w'], 'h': o['h'], 'sy': o['sort_y'], 'flat': False})
    clues = {}
    for c in L['clues']:
        im = Image.open(f'{R}/{d}/' + c['sprite']).convert('RGBA'); im.save(f"{OUT}/c_{sid}_{c['id']}.webp", quality=92, method=6); x, y, w, h = c['sprite_bounds_px']; z = c.get('z', 'floor')
        att = z.split(':')[1] if z.startswith('attach:') else None
        objs.append({'id': 'clue_' + c['id'], 'img': f"r217c_{sid}_{c['id']}", 'uid': sid + '-clue-' + c['id'], 'x': x, 'y': y, 'w': w, 'h': h, 'sy': (sy_of.get(att, y + h) + 1) if att else y + h, 'flat': not att})
        clues[c['id']] = c['interaction_point_px']
    rooms[sid] = {'w': L['w'], 'h': L['h'], 'cs': L['nav']['step_px'], 'cols': L['nav']['cols'], 'rows': L['nav']['rows'], 'blocked': b, 'objs': objs,
        'exits': [{'id': e['id'], 'region': e['region'], 'to': ALIAS.get(e['to'], e['to']), 'label': e['label'], 'land': e.get('suggested_spawn_px')} for e in L['exits']],
        'slots': {n['id']: [n['x'], n['y']] for n in L['npcs']}, 'clues': clues, 'spawn': L['spawn']}
open(OUT + '/inn.js', 'w', encoding='utf8').write('// 由 tools/r217_inn_convert.py 生成，不要手改\nwindow.R217_INN = ' + json.dumps(rooms, ensure_ascii=False, separators=(',', ':')) + ';\n')
print({k: (v['exits'], v['slots'], v['clues'], len(v['objs']), len(v['blocked'])) for k, v in rooms.items()})
