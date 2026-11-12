# 把 Codex R255 民居交付（layout.json + g.webp + o_*.png，2 倍贴图）转成游戏用的 r255/<plan>/*.webp 和 r255/<plan>.js
# 用法：python3 tools/r255_convert.py <交付目录> <plan 名，如 yi2>   （在仓库根目录运行）
import json, os, sys
from PIL import Image
src, plan = sys.argv[1], sys.argv[2]
dst = 'game/r255/' + plan; os.makedirs(dst, exist_ok=True)
d = json.load(open(src + '/layout.json', encoding='utf8'))
Image.open(src + '/g.webp').save(dst + '/g.webp', quality=92, method=4)
objs = []; seen = set()
for o in d['objects']:
    f = o['file']; name = os.path.basename(f)[2:-4]
    if name not in seen: Image.open(src + '/' + f).save('%s/o_%s.webp' % (dst, name), quality=92, method=4); seen.add(name)
    objs.append({'id': o['id'], 'f': name, 'x': o['x'], 'y': o['y'], 'w': o['width'], 'h': o['height'], 'sy': o['sort_y'], 'layer': o.get('render_layer', 'depth'), 'label': o.get('label', '')})
c = d['collision']
out = {'id': plan, 'w': d['width'], 'h': d['height'], 'cs': c['cell_size'], 'cols': c['cols'], 'rows': c['rows'], 'blocked': ''.join(str(v) for v in c['blocked']),
       'objs': objs, 'spawn': [d['entrance']['spawn']['x'], d['entrance']['spawn']['y']], 'exit': d['entrance']['exit_trigger_rect'],
       'spots': [[p['id'], p['x'], p['y'], p['activity']] for p in d['standing_points']],
       'inter': [[p['id'], p['label'], p['stand'][0], p['stand'][1]] for p in d['interactions']]}
open('game/r255/%s.js' % plan, 'w', encoding='utf8').write('// R255 民居 · %s（%s）：Codex 交付的 layout.json 转成的摆放数据\n(window.R255_HOMES = window.R255_HOMES || {}).%s = ' % (plan, d.get('name', ''), plan) + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(plan, d.get('name'), d['width'], d['height'], len(objs), 'objs')
print(' spots', [(s[0], s[3]) for s in out['spots']])
print(' inter', [(s[0], s[1]) for s in out['inter']])
print(' layers', sorted(set(o['layer'] for o in objs)))
