# 给 regrid_walk.js 用：按地面图颜色找出「水面 / 石台」格子（这些烘在地面里，不是物件），这些格子沿用 Codex 原来的通行值
import sys, json
from PIL import Image
for mid in sys.argv[1:]:
    im = Image.open(f'game/r107/g_{mid}.webp').convert('RGB')
    L = open('game/r107_maps.js', encoding='utf8').read().split('\n')
    dl = [l for l in L if l.startswith('  const DATA = ')][0]
    m = json.loads(dl[len('  const DATA = '):].rstrip().rstrip(';'))[mid]
    cols, rows = m['cols'], m['rows']; sm = im.resize((cols, rows), Image.BOX); px = sm.load()
    keep = []
    for r in range(rows):
        for c in range(cols):
            R, G, B = px[c, r]; mx, mn = max(R, G, B), min(R, G, B)
            water = B > R + 25 and B >= G - 5
            stone = B > 115 and (mx - mn) < 55 and R >= G >= B
            keep.append(1 if (water or stone) else 0)
    json.dump({'cols': cols, 'rows': rows, 'keep': ''.join(map(str, keep))}, open(f'/tmp/claude-0/keep_{mid}.json', 'w'))
    print(mid, 'keep cells', sum(keep), 'of', cols * rows)
