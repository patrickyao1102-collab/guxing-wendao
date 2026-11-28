#!/usr/bin/env python3
# R460 · 万妖塔首领战斗帧真画重做 → 游戏图集（朝左存，引擎画的时候再翻成朝右）。
# 用法：python3 tools/r460_build.py <Codex 交付/R460_.../bianhua> [OVER]
#   读 anim.json：forms.f1/f2 各有 idle / atk / charge / break。出：game/r415/<id>_<form>_r460[_pN].webp（+ _charge / _break），并改 r415_meta.js。
#   帧多（待机 24 + 出手 24），一张图放不下（手机贴图上限 4096），超了就分页：meta.per = 每页几帧，第 N 页文件名加 _pN（引擎 R463 认）。
import os, sys, json, math
from PIL import Image
SRC = sys.argv[1]; OVER = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
META_JS = os.path.join(ROOT, 'r415_meta.js')
A = json.load(open(os.path.join(SRC, 'anim.json'), encoding='utf8'))
bid = A['id']; AX, AY = A['anchor']
txt = open(META_JS, encoding='utf8').read(); head, body = txt.split('=', 1); META = json.loads(body.rsplit(';', 1)[0])
MAXS = 4096

def load(form, act, n):
    pat = A['forms'][form]['actions'][act]['pattern']
    return [Image.open(os.path.join(SRC, pat.replace('{N}', str(i)))).convert('RGBA') for i in range(1, n + 1)]

def bbox(ims, thr=10):
    b = None
    for im in ims:
        a = im.split()[3].point(lambda v: 255 if v > thr else 0).getbbox()
        if a: b = a if b is None else (min(b[0], a[0]), min(b[1], a[1]), max(b[2], a[2]), max(b[3], a[3]))
    return b

def save_pages(frames, fw, fh, base):
    per_row = max(1, MAXS // fw); rows_max = max(1, MAXS // fh); per = per_row * rows_max
    n = len(frames); pages = math.ceil(n / per); cols = min(per_row, n)
    size = 0
    for p in range(pages):
        fs = frames[p * per:(p + 1) * per]; rows = math.ceil(len(fs) / cols)
        S = Image.new('RGBA', (fw * cols, fh * rows), (0, 0, 0, 0))
        for i, im in enumerate(fs): S.paste(im, ((i % cols) * fw, (i // cols) * fh))
        path = os.path.join(ROOT, 'r415', base + ('_p%d' % p if p else '') + '.webp')
        S.save(path, 'WEBP', quality=82, method=4, alpha_quality=80); size += os.path.getsize(path)
    return cols, (per if pages > 1 else None), pages, size

for form, F in A['forms'].items():
    key = bid + '_' + form; M = META.get(key)
    if not M: print('没有', key); continue
    acts = F['actions']
    fr = {a: load(form, a, acts[a]['frames']) for a in ('idle', 'atk', 'charge', 'break') if a in acts}
    allf = sum(fr.values(), [])
    ub = bbox(allf); pad = 10
    ub = (max(0, ub[0] - pad), max(0, ub[1] - pad), min(allf[0].width, ub[2] + pad), min(allf[0].height, ub[3] + pad))
    body = bbox(fr['idle'][:1], 128); bodyPx = body[3] - body[1]
    s = M['bodyH'] * OVER / bodyPx                      # 图集里存的尺寸 = 显示尺寸 × OVER
    cw, ch = ub[2] - ub[0], ub[3] - ub[1]
    fw, fh = round(cw * s), round(ch * s)
    def prep(im): return im.crop(ub).resize((fw, fh), Image.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
    footX = fw - (AX - ub[0]) * s; footY = (AY - ub[1]) * s
    h = round(fh / OVER, 1)
    out = {'h': h, 'bodyH': M['bodyH'], 'atk': True, 'file': key + '_r460'}
    main = [prep(im) for im in fr['idle'] + fr['atk']]
    cols, per, pages, sz = save_pages(main, fw, fh, key + '_r460')
    nI = len(fr['idle'])
    out['main'] = {'idleEnd': nI - 1, 'impact': nI + (acts['atk']['hitFrame'] or 12) - 1, 'n': len(main), 'cols': cols, 'fw': fw, 'fh': fh, 'footX': round(footX, 1), 'footY': round(footY, 1),
                   'ifps': acts['idle']['fps'], 'afps': acts['atk']['fps'], 'loop': True}
    if per: out['main'].update(per=per, pages=pages)
    tot = sz
    for a, suf in (('charge', '_charge'), ('break', '_break')):
        if a not in fr: continue
        fs = [prep(im) for im in fr[a]]
        c2, per2, pg2, sz2 = save_pages(fs, fw, fh, key + '_r460' + suf); tot += sz2
        out[a] = {'idleEnd': len(fs) - 1, 'impact': len(fs) - 1, 'n': len(fs), 'cols': c2, 'fw': fw, 'fh': fh, 'footX': round(footX, 1), 'footY': round(footY, 1), 'ifps': acts[a]['fps'], 'loop': True}
        if per2: out[a].update(per=per2, pages=pg2)
    META[key] = out
    print(key, 'frame', fw, fh, 'main pages', pages, 'h', h, 'KB', tot // 1024)
open(META_JS, 'w', encoding='utf8').write(head + '=' + json.dumps(META, ensure_ascii=False) + ';\n')
