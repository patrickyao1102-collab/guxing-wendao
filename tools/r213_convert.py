# R213 青阳镇支线素材（Codex 交付）→ 游戏用：地面/物件转 webp，布局转成整图地图数据 game/r213/rooms.js
import json, sys, os
from PIL import Image
R, OBJ, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
meta = json.load(open(R + '/meta.json'))['objects']
small = json.load(open(R + '/四_地图小物件/meta.json'))
meta.update(small)
SC = {'qy_yicui': '一_倚翠楼/01_一楼琴堂', 'qy_yicui_2f': '一_倚翠楼/02_二楼听雨阁', 'qy_changle': '二_长乐坊/01_一楼赌坊', 'qy_changle_2f': '二_长乐坊/02_二楼账房'}
ALIAS = {'qy_yicui_1f': 'qy_yicui', 'qy_changle_1f': 'qy_changle'}
used, rooms = set(), {}
for sid, p in SC.items():
    L = json.load(open(R + '/' + p + '/layout.json'))
    Image.open(R + '/' + p + '/ground.png').convert('RGB').save(f'{OUT}/g_{sid}.webp', quality=88, method=6)
    n = L['nav']; objs = []
    for i in L['instances']:
        m = meta[i['id']]; ax, ay = i['anchor']; w, h = m['size_px']; px, py = m['anchor_px']; used.add(i['id'])
        objs.append({'id': i['id'], 'img': 'r213_' + i['id'], 'uid': i['uid'], 'x': round(ax - px, 1), 'y': round(ay - py, 1), 'w': w, 'h': h, 'sy': round(i.get('sort_y', ay), 1), 'flat': bool(m.get('flat'))})
    rooms[sid] = {'w': L['world_size_px'][0], 'h': L['world_size_px'][1], 'cs': n['step_px'], 'cols': n['cols'], 'rows': n['rows'], 'blocked': ''.join(str(int(bool(x))) for x in n['blocked']), 'objs': objs,
        'exits': [{'id': e['id'], 'region': e['region'], 'to': ALIAS.get(e['to'], e['to']), 'label': e['label'], 'land': e.get('local_landing_px') or e.get('suggested_spawn_px')} for e in L['exits']],
        'slots': {s['id']: s['anchor'] for s in L.get('suggested_npc_positions', [])}, 'inter': {s['id']: s['interaction_point_px'] for s in L.get('interactables', [])}, 'name': L.get('name')}
for k in ('sword_stele', 'crooked_willow', 'rabbit_lantern'): used.add(k)
sizes = {}
for k in sorted(used):
    im = Image.open(f'{OBJ}/{k}.png').convert('RGBA'); im.save(f'{OUT}/o_{k}.webp', quality=90, method=6); sizes[k] = {'w': im.width, 'h': im.height, 'ax': meta[k]['anchor_px'][0], 'ay': meta[k]['anchor_px'][1]}
for src, dst in (('五_新NPC/苏晚/苏晚_对话512x768.png', 'p_suwan'), ('五_新NPC/长乐坊庄家/长乐坊庄家_对话512x768.png', 'p_dealer')):
    Image.open(R + '/' + src).convert('RGBA').save(f'{OUT}/{dst}.webp', quality=90, method=6)
import shutil; shutil.copy(R + '/五_新NPC/npc_map_atlas_r213.webp', OUT + '/npc_atlas.webp')
at = json.load(open(R + '/五_新NPC/npc_map_atlas_r213.json'))['map']
open(OUT + '/rooms.js', 'w', encoding='utf8').write('// 由 tools/r213_convert.py 生成（Codex R213 交付），不要手改\nwindow.R213_ROOMS = ' + json.dumps({'rooms': rooms, 'objs': sizes, 'npc': at}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(sorted(used)); print({k: (v['exits'], v['slots'], v['inter']) for k, v in rooms.items()})
