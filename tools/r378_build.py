#!/usr/bin/env python3
# R378 · 妖王本体：把 Codex 交的分状态帧（朝右、同一画布）拼成游戏里的序列帧图集（朝左存，和 rig/v_*.webp 一个规矩）。
# 用法：python3 tools/r378_build.py <Codex 交付目录/R378_妖王本体> [id ...]
#   每只：<id>/idle_1..4.png、charge_1..3.png、atk_1..5.png、break_1..2.png、key.png、poster.webp（缺哪样就少哪样，照样能出）
# 输出：game/r378/<id>.webp（平时 + 出手）、<id>_charge.webp、<id>_break.webp、<id>_pic.webp、yw_<id>.webp（榜上画像）、game/r378_meta.js
import os, sys, json, glob
from PIL import Image
SRC = sys.argv[1]; ONLY = sys.argv[2:]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game', 'r378'); os.makedirs(OUT, exist_ok=True)
META_JS = os.path.join(OUT, '..', 'r378_meta.js')
# 战斗里「平时那一帧」身体显示多高（逻辑像素，1280×720 画面）、站位
BODY = {'boar': 430, 'leopard': 400, 'rhino': 450, 'treant': 540, 'wolf': 520, 'spider': 500}
OVER = 1.25          # 图集比显示尺寸大多少（留一点清晰度）
IDLE_HOLD = 2        # 平时每帧连放几拍（8 拍 / 秒，来回播）
ATK_HOLD = [4, 3, 5, 3, 3]   # 出手五帧各放几拍（20 拍 / 秒）；第三帧是命中帧
def load(p):
    im = Image.open(p).convert('RGBA'); return im
def frames(d, name, n):
    out = []
    for i in range(1, n + 1):
        for ext in ('png', 'webp'):
            p = os.path.join(d, f'{name}_{i}.{ext}')
            if os.path.exists(p): out.append(load(p)); break
    return out
def bbox_union(ims):
    b = None
    for im in ims:
        a = im.split()[3].point(lambda v: 255 if v > 12 else 0).getbbox()
        if not a: continue
        b = a if b is None else (min(b[0], a[0]), min(b[1], a[1]), max(b[2], a[2]), max(b[3], a[3]))
    return b
def sheet(ims, cols, path, q=86):
    fw, fh = ims[0].size; rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGBA', (fw * cols, fh * rows), (0, 0, 0, 0))
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * fw, (i // cols) * fh))
    S.save(path, 'WEBP', quality=q, method=4); return os.path.getsize(path)
meta = {}
if os.path.exists(META_JS):
    try: meta = json.loads(open(META_JS, encoding='utf8').read().split('=', 1)[1].rsplit(';', 1)[0])
    except Exception: meta = {}
for d in sorted(glob.glob(os.path.join(SRC, '*'))):
    bid = os.path.basename(d)
    if not os.path.isdir(d) or bid not in BODY or (ONLY and bid not in ONLY): continue
    idle = frames(d, 'idle', 4)
    if not idle:
        kp = os.path.join(d, 'key.png')
        if os.path.exists(kp): idle = [load(kp)]
    if not idle: print(bid, '还没有可用的帧'); continue
    chg, atk, brk = frames(d, 'charge', 3), frames(d, 'atk', 5), frames(d, 'break', 2)
    W0, H0 = idle[0].size
    allf = [f for f in idle + chg + atk + brk if f.size == (W0, H0)]
    bad = [f for f in idle + chg + atk + brk if f.size != (W0, H0)]
    if bad: print(bid, '有', len(bad), '帧画布大小不一样，已跳过：', [f.size for f in bad])
    idle = [f for f in idle if f.size == (W0, H0)]; chg = [f for f in chg if f.size == (W0, H0)]; atk = [f for f in atk if f.size == (W0, H0)]; brk = [f for f in brk if f.size == (W0, H0)]
    ub = bbox_union(allf); ib = bbox_union(idle[:1])
    pad = 8; ub = (max(0, ub[0] - pad), max(0, ub[1] - pad), min(W0, ub[2] + pad), min(H0, ub[3] + pad))
    foot_y = ib[3]                                  # 脚底线：平时第一帧最低的不透明像素（比写死 1080 可靠）
    foot_x = (ib[0] + ib[2]) / 2                    # 重心：平时第一帧的左右中点
    bodyH = ib[3] - ib[1]; q = BODY[bid] * OVER / bodyH
    def prep(im):
        c = im.crop(ub); c = c.resize((max(1, round(c.width * q)), max(1, round(c.height * q))), Image.LANCZOS)
        return c.transpose(Image.FLIP_LEFT_RIGHT)   # 图集里朝左
    fw, fh = round((ub[2] - ub[0]) * q), round((ub[3] - ub[1]) * q)
    footX = fw - (foot_x - ub[0]) * q; footY = (foot_y - ub[1]) * q
    H = fh / OVER
    I = [prep(f) for f in idle]; seq = []
    for f in I: seq += [f] * IDLE_HOLD
    idleEnd = len(seq) - 1; impact = idleEnd + 1
    if atk:
        A = [prep(f) for f in atk]; hold = ATK_HOLD[:len(A)] + [3] * max(0, len(A) - len(ATK_HOLD))
        hit = min(2, len(A) - 1); impact = idleEnd + 1 + sum(hold[:hit])
        for f, n in zip(A, hold): seq += [f] * n
    m = {'idleEnd': idleEnd, 'impact': impact, 'n': len(seq), 'cols': 6, 'fw': fw, 'fh': fh, 'footX': round(footX, 1), 'footY': round(footY, 1), 'fps': 12}
    sz = sheet(seq, 6, os.path.join(OUT, bid + '.webp'))
    e = {'main': m, 'h': round(H, 1), 'bodyH': BODY[bid], 'atk': bool(atk)}
    for nm, fs in (('charge', chg), ('break', brk)):
        if not fs: continue
        P = [prep(f) for f in fs]; s2 = []
        for f in P: s2 += [f] * 2
        sheet(s2, 6, os.path.join(OUT, f'{bid}_{nm}.webp'))
        e[nm] = dict(m, idleEnd=len(s2) - 1, impact=len(s2), n=len(s2))
    # 图鉴 / 备用：平时第一帧，朝右，按身体 512 高
    pic = idle[0].crop(bbox_union(idle[:1])); k2 = 512 / pic.height; pic = pic.resize((round(pic.width * k2), 512), Image.LANCZOS); pic.save(os.path.join(OUT, bid + '_pic.webp'), 'WEBP', quality=88, method=6)
    for pn in ('poster.webp', 'poster.png'):
        pp = os.path.join(d, pn)
        if os.path.exists(pp):
            po = load(pp)
            if po.size != (300, 260): po.thumbnail((300, 260), Image.LANCZOS); c = Image.new('RGBA', (300, 260), (0, 0, 0, 0)); c.paste(po, ((300 - po.width) // 2, (260 - po.height) // 2), po); po = c
            po.save(os.path.join(OUT, 'yw_' + bid + '.webp'), 'WEBP', quality=90, method=6); e['poster'] = 1; break
    meta[bid] = e
    print(bid, 'idle', len(idle), 'charge', len(chg), 'atk', len(atk), 'break', len(brk), '| frame', fw, 'x', fh, 'H', round(H), 'foot', round(footX), round(footY), '| sheet', sz // 1024, 'KB')
open(META_JS, 'w', encoding='utf8').write('// R378 · 妖王本体图集的尺寸表（tools/r378_build.py 生成，别手改）\nwindow.R378_META = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
print('meta →', META_JS, list(meta))
