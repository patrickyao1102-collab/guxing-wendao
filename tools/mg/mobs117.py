# R117 守卫弟子 + 小怪：切成游戏用的图（战斗立绘裁边、地图站姿 / 4 帧原地循环）
import json, os
from PIL import Image
S = '/tmp/claude-0/-home-claude/baf236c7-415a-5521-8757-82f2e7fbf4fc/scratchpad'
GAME = '/home/claude/guxing-wendao/game'
R = S + '/codexlib/R117_地下一层_牢房补充与守卫小怪建模/'
out = {}
def crop(im, th=24):
    bb = im.getchannel('A').point(lambda v: 255 if v > th else 0).getbbox(); return im.crop(bb)
for i, n in enumerate(['持刀看守', '持幡符修', '巡夜弟子'], 1):
    b = crop(Image.open(R + f'B_守卫弟子/{n}/战斗.png').convert('RGBA'))
    s = 640 / b.height; b = b.resize((round(b.width * s), 640), Image.LANCZOS); b.save(f'{GAME}/r107/e_xguard{i}.webp', quality=88, method=6)
    w = Image.open(R + f'B_守卫弟子/{n}/地图行走.png').convert('RGBA').crop((0, 0, 160, 240))
    w = crop(w); w.save(f'{GAME}/r107/n_xguard{i}.webp', quality=90, method=6)
    out[f'xguard{i}'] = dict(name=n, battle=b.size, stand=w.size)
for k, n in [('xbat', '血纹蝙蝠'), ('xwraith', '锁链怨灵'), ('xspider', '洞穴石蛛')]:
    b = crop(Image.open(R + f'C_小怪/{n}/战斗.png').convert('RGBA'))
    s = 560 / b.height; b = b.resize((round(b.width * s), 560), Image.LANCZOS); b.save(f'{GAME}/r107/e_{k}.webp', quality=88, method=6)
    sh = Image.open(R + f'C_小怪/{n}/地图循环.png').convert('RGBA'); fr = [sh.crop((i * 200, 0, i * 200 + 200, 200)) for i in range(4)]
    bbs = [f.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox() for f in fr]
    x0, y0 = min(b_[0] for b_ in bbs), min(b_[1] for b_ in bbs); x1, y1 = max(b_[2] for b_ in bbs), 192
    fw, fh = x1 - x0, y1 - y0; strip = Image.new('RGBA', (fw * 4, fh))
    for i, f in enumerate(fr): strip.paste(f.crop((x0, y0, x1, y1)), (i * fw, 0))
    strip.save(f'{GAME}/r107/mm_{k}.webp', quality=90, method=6)
    out[k] = dict(name=n, battle=b.size, fw=fw, fh=fh)
json.dump(out, open(S + '/mg/mobs117.json', 'w'), ensure_ascii=False); print(json.dumps(out, ensure_ascii=False))
