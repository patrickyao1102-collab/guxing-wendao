# 女娲神殿 · 千丝织天殿：直接用 Codex 拼好的整张图（地面 + 物件 + 碰撞），转成我们这套新地图的格式
# 作者 11-03：「接进新地图吧」—— 取代原来拼的「山巅小庙」和「庙内」两张
import json, os
from PIL import Image
from core import REG, reg, OUT, _cache, S

LOOM = S + '/loom/loom/'

def _register(m):
    for k, a in m['assets'].items():
        name = 'loom_' + k
        reg(name, 'pk', LOOM + os.path.basename(a['file']), None, 'prop')
        REG[name]['notrim'] = True

def nw_temple():
    m = json.load(open(LOOM + 'map.json'))
    _register(m)
    W, H = m['world_size_px']; cs = m['nav']['step_px']; C, R = m['nav']['cols'], m['nav']['rows']
    blk = list(m['nav']['blocked'])
    def open_rect(x, y, w, h):
        for r in range(int(y // cs), min(R, int((y + h) // cs) + 1)):
            for c in range(int(x // cs), min(C, int((x + w) // cs) + 1)): blk[r * C + c] = 0
    # 出口：南边山门外下山 → 群像遗庭；东侧小径 → 庙后灵泉
    exits = [dict(to='nw_court', label='下山 · 返回群像遗庭', rect=[1040, 1712, 160, 80], spawn=[1120, 1640], face='up', arrow=None),
             dict(to='nw_spring', label='殿侧小径 · 无尘灵泉', rect=[2120, 1560, 120, 120], spawn=[2000, 1620], face='left', arrow=None)]
    open_rect(1040, 1680, 160, 112)
    open_rect(1960, 1560, 280, 120)
    objs = []
    for i in m['instances']:
        a = m['assets'][i['id']]; sc = i.get('scale', 1); w, h = a['size_px'][0] * sc, a['size_px'][1] * sc
        ax, ay = a['anchor_px'][0] * sc, a['anchor_px'][1] * sc
        x, y = i['anchor'][0] - ax, i['anchor'][1] - ay
        flip = bool(i.get('flip'))
        if flip: x = i['anchor'][0] - (w - ax)
        sy = i['anchor'][1]
        objs.append(dict(id='loom_' + i['id'], x=round(x, 1), y=round(y, 1), w=round(w, 1), h=round(h, 1), sy=round(sy, 1), flat=bool(i.get('terrain')), flip=flip))
    objs.sort(key=lambda o: (0 if o['flat'] else 1, o['sy']))
    d = f'{OUT}/nw_temple'; os.makedirs(d, exist_ok=True)
    Image.open(LOOM + 'ground.png').convert('RGB').save(f'{d}/ground.webp', quality=82, method=6)
    J = dict(id='nw_temple', title='女娲神殿 · 千丝织天殿', w=W, h=H, cs=cs, cols=C, rows=R, blocked=''.join('1' if v else '0' for v in blk), objs=objs,
             exits=exits, spots=dict(altar=(1120, 700), court=(1120, 1070), door=(1120, 1500)), chests=[], zones=[], lights=[dict(x=1120, y=560, r=260, c='255,225,160')],
             mobs=None, meta=dict(grade='rgba(255,235,200,.03)'), water=[])
    json.dump(J, open(f'{d}/map.json', 'w'), ensure_ascii=False)
    # 预览
    g = Image.open(LOOM + 'ground.png').convert('RGBA')
    for o in objs:
        im = Image.open(REG[o['id']]['key']).convert('RGBA').resize((max(1, round(o['w'])), max(1, round(o['h']))), Image.LANCZOS)
        if o['flip']: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        g.paste(im, (round(o['x']), round(o['y'])), im)
    g.convert('RGB').resize((W // 4, H // 4)).save(f'{d}/full.jpg', quality=82)
    print('nw_temple', len(objs))

if __name__ == '__main__':
    nw_temple()
