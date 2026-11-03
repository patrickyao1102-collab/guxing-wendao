import json, os, math
import numpy as np
from PIL import Image, ImageDraw
from core import asset, cx_img, OUT, Map

def hero_sprite():
    im = cx_img('linxue_9c79fd'); bb = im.getchannel('A').getbbox(); im = im.crop(bb)
    s = 108 / im.height; return im.resize((round(im.width * s), 108), Image.LANCZOS)

def dyn_img(o):
    im = asset(o['name'])[0]
    if o['flip']: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if abs(o['sc'] - 1) > 1e-3: im = im.resize((max(1, round(o['w'])), max(1, round(o['h']))), Image.LANCZOS)
    return im

def render(M, hero_at=None, grid=False):
    g = M.ground.convert('RGBA')
    items = [(o['sy'] if not o.get('flat') else -1e9 + o['sy'], o) for o in M.dyn]
    if hero_at: items.append((hero_at[1], 'hero'))
    items.sort(key=lambda t: t[0])
    H = hero_sprite()
    from core import paste_any
    for _, o in items:
        if o == 'hero': paste_any(g, H, round(hero_at[0] - H.width / 2), round(hero_at[1] - H.height)); continue
        paste_any(g, dyn_img(o), round(o['x']), round(o['y']))
    if grid:
        ov = Image.new('RGBA', g.size); d = ImageDraw.Draw(ov); cs = 16
        for r in range(M.rows):
            for c in range(M.cols):
                if M.blk[r, c]: d.rectangle((c * cs, r * cs, c * cs + cs - 1, r * cs + cs - 1), fill=(255, 0, 0, 70))
        for e in M.exits:
            x, y, w, h = e['rect']; d.rectangle((x, y, x + w, y + h), outline=(0, 255, 255, 255), width=4)
        g = Image.alpha_composite(g, ov)
    return g

def save_map(M):
    d = f'{OUT}/{M.id}'; os.makedirs(d, exist_ok=True)
    M.ground.save(f'{d}/ground.webp', quality=82, method=6)
    blocked = ''.join('1' if v else '0' for v in M.blk.flatten())
    objs = []
    for i, o in enumerate(M.dyn):
        objs.append(dict(id=o['name'], x=round(o['x'], 1), y=round(o['y'], 1), w=round(o['w'], 1), h=round(o['h'], 1), sy=round(o['sy'], 1), flat=bool(o.get('flat')), flip=bool(o['flip'])))
    J = dict(id=M.id, title=M.title, w=M.w, h=M.h, cs=16, cols=M.cols, rows=M.rows, blocked=blocked, objs=objs,
             exits=M.exits, spots=M.spots, chests=M.chests, zones=M.zones, lights=M.lights, mobs=getattr(M, 'mobs', None), meta=getattr(M, 'meta', {}), water=getattr(M, 'water_rects', []))
    json.dump(J, open(f'{d}/map.json', 'w'), ensure_ascii=False)
    return J

def preview(M, name='full', hero=None, scale=.25, grid=False):
    g = render(M, hero, grid)
    d = f'{OUT}/{M.id}'; os.makedirs(d, exist_ok=True)
    g.convert('RGB').resize((round(M.w * scale), round(M.h * scale)), Image.LANCZOS).save(f'{d}/{name}.jpg', quality=82)
    return g

def views(M, g, pts, name='view'):
    # 玩家视角截图（1280x720 世界像素）
    out = []
    for i, (x, y) in enumerate(pts):
        x0 = int(min(max(0, x - 640), M.w - 1280)); y0 = int(min(max(0, y - 400), M.h - 720))
        out.append(g.crop((x0, y0, x0 + 1280, y0 + 720)).convert('RGB'))
    sheet = Image.new('RGB', (1280 * min(2, len(out)), 720 * math.ceil(len(out) / 2)))
    for i, im in enumerate(out): sheet.paste(im, ((i % 2) * 1280, (i // 2) * 720))
    sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save(f'{OUT}/{M.id}/{name}.jpg', quality=82)
