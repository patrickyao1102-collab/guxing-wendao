# 把 Codex R260 据点前院（拼接法）交付转成游戏用的 game/r260/court/*.webp 和 game/r260/court.js
# 用法：python3 tools/r260_convert.py <交付目录>   （在仓库根目录运行）
import json, os, sys
from PIL import Image
src = sys.argv[1]
dst = 'game/r260/court'; os.makedirs(dst, exist_ok=True)
d = json.load(open(src + '/layout.json', encoding='utf8'))
Image.open(src + '/g.webp').convert('RGB').save(dst + '/g.webp', quality=92, method=6)
aid = {a['file']: a['id'] for a in d['assets']}
saved = set(); objs = {'wall': [], 'floor': [], 'depth': []}
for o in d['objects']:
    k = aid[o['file']]
    if k not in saved:
        Image.open(src + '/' + o['file']).convert('RGBA').save('%s/o_%s.webp' % (dst, k), quality=92, method=6); saved.add(k)
    objs[o['render_layer']].append({'id': o['id'], 'f': k, 'x': o['x'], 'y': o['y'], 'w': o['width'], 'h': o['height'], 'sy': o['sort_y'], 'layer': o['render_layer']})
c = d['collision']
blocked = c['blocked'] if isinstance(c['blocked'], str) else ''.join(str(int(bool(v))) for v in c['blocked'])
E = d['entrance']
out = {'w': d['width'], 'h': d['height'], 'cs': c['cell_size'], 'cols': c['cols'], 'rows': c['rows'], 'blocked': blocked,
       'objs': objs['wall'] + objs['floor'] + objs['depth'],
       'spawn': [E['spawn']['x'], E['spawn']['y']], 'exit': E['exit_trigger_rect'],
       'doors': [{'id': x['id'], 'label': x['label'], 'rect': x['trigger_rect'], 'stand': x['stand'], 'to': x['to']} for x in d['doors']],
       'spots': {p['id']: [p['x'], p['y']] for p in d['standing_points']},
       'inter': [{'id': p['id'], 'label': p['label'], 'rect': p['rect'], 'stand': p['stand']} for p in d['interactions']]}
open('game/r260/court.js', 'w', encoding='utf8').write('// R260 · 天剑宗玄天据点前院（拼接法）：Codex 交付的 layout.json 转成的摆放数据\nwindow.R260_COURT = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(d['width'], d['height'], len(out['objs']), 'objs,', len(saved), 'images')
