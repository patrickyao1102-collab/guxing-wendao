#!/usr/bin/env python3
# R474n · 万妖塔一层内苑的三只梦傀（Codex R474：梦仆 / 梦傀 / 精英梦傀）战斗帧 + 三招特效（牵丝 / 入梦香 / 千丝坠）→ game/r474n/ + game/r474n_meta.js。
# 用法：python3 tools/r474n_build.py <Codex 交付/R474_内苑梦傀战斗帧与特效> [OVER]
# 做法和 tools/r474_build.py（绛蘅）一样：每帧单独裁边、按动作顺序装页（每页 ≤4096），原画朝右 = 面朝我方，不翻面，由 game/r474_neiyuan.js 自己画。
# 身高：idle 第一帧「头顶」（宽过 30px 的第一行，头上那几根细梦丝不算）到脚底锚点 → 屏幕身高 BODY[形态] × OVER 存。
# 尺寸表写进 game/r474n_meta.js（window.R474N_META），不再塞 r415_meta.js（那个文件人人都加载，越来越大）。
# 特效的「硬边」：Codex 交的三招里有几处是被裁出来的直边（入梦香的云块是两个方块拼的、牵丝 / 千丝坠顶上在参考视口 y=150 处一刀切齐、右边贴着画布边），
#   放到战场上会露出一条直线。这里只找「一长条横平竖直、透明度一下跳很多」的边，沿着它往里渐隐 FEATHER 像素；梦丝、花瓣这类细碎的边不动。
import os, sys, json, math
from PIL import Image

SRC = sys.argv[1]
OVER = float(sys.argv[2]) if len(sys.argv) > 2 else 1.6
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
OUT = os.path.join(ROOT, 'r474n')
META_JS = os.path.join(ROOT, 'r474n_meta.js')
os.makedirs(OUT, exist_ok=True)
A = json.load(open(os.path.join(SRC, 'anim.json'), encoding='utf8'))
AX, AY = A['anchor']
MAXS = 4096
PAD = 2
Q = dict(quality=82, method=6, alpha_quality=82)
BODY = {'meng_pu': 235, 'meng_kui': 226, 'meng_kui_shou': 272}   # 屏幕上的身高（叶孤星战斗里约 236）
FX_SCALE = {'牵丝': .6, '入梦香': .6, '千丝坠': .6}
FX_KEY = {'牵丝': 'qiansi', '入梦香': 'rumengxiang', '千丝坠': 'qiansizhui'}
ORDER = ['idle', 'hurt', 'charge', 'atk', 'defeat']

def load(pat, n):
    return [Image.open(os.path.join(SRC, pat.replace('{N}', str(i)))).convert('RGBA') for i in range(1, n + 1)]


FEATHER = 110  # 原画像素


def round_cloud(im, sig=38):
    """入梦香专用：云块是几个方块拼起来的，光把直边渐隐还看得出方形——把整团云的外轮廓按模糊过的剪影磨圆（细的卷须会淡一些，雾气本来就该虚）。"""
    import numpy as np
    from scipy.ndimage import gaussian_filter
    a = np.asarray(im).astype(np.float32)
    B = gaussian_filter((a[..., 3] > 16).astype(np.float32), sig)
    f = np.clip((B - .3) / .5, 0, 1); f = f * f * (3 - 2 * f)
    a[..., 3] *= np.maximum(f, .0)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def soften(im):
    """把横平竖直的裁切硬边往里渐隐（见文件头）。"""
    import numpy as np
    from scipy.ndimage import uniform_filter1d, distance_transform_edt
    a = np.asarray(im).astype(np.float32); G = 1; al = np.pad(a[..., 3], G)   # 外面补一圈透明：贴画布边的也算边
    H0, W0 = al.shape; edge = np.zeros((H0, W0), bool)
    jv = np.abs(al[:, 1:] - al[:, :-1]) > 22                                   # 左右相邻透明度一跳（竖直的边）
    dv = uniform_filter1d(jv.astype(np.float32), 81, axis=0) > .9              # 而且这样的点竖着连成一长条
    edge[:, 1:] |= dv; edge[:, :-1] |= dv
    jh = np.abs(al[1:, :] - al[:-1, :]) > 22                                   # 水平的边，同上
    dh = uniform_filter1d(jh.astype(np.float32), 81, axis=1) > .9
    edge[1:, :] |= dh; edge[:-1, :] |= dh
    edge = edge[G:-G, G:-G]
    if not edge.any(): return im
    d = distance_transform_edt(~edge); f = np.clip(d / FEATHER, 0, 1); f = f * f * (3 - 2 * f)
    a[..., 3] *= f
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def trim(im, thr=3):
    b = im.split()[3].point(lambda v: 255 if v > thr else 0).getbbox()
    return b


class Packer:
    """按顺序一排一排放（同一个动作的帧挨在一起，常用的 idle / hurt / tired 落在第一页）。"""
    def __init__(self, base):
        self.base = base; self.pages = []; self.new_page()

    def new_page(self):
        self.pages.append({'items': [], 'w': 0, 'h': 0}); self.x = 0; self.y = 0; self.row = 0

    def add(self, im):
        w, h = im.size
        if self.x + w > MAXS: self.x = 0; self.y += self.row + PAD; self.row = 0
        if self.y + h > MAXS: self.new_page()
        P = self.pages[-1]; P['items'].append((im, self.x, self.y))
        rec = (len(self.pages) - 1, self.x, self.y)
        self.x += w + PAD; self.row = max(self.row, h); P['w'] = max(P['w'], self.x - PAD); P['h'] = max(P['h'], self.y + h)
        return rec

    def save(self):
        files = []; size = 0; px = 0
        for i, P in enumerate(self.pages):
            S = Image.new('RGBA', (P['w'], P['h']), (0, 0, 0, 0))
            for im, x, y in P['items']: S.paste(im, (x, y))
            name = self.base + ('_p%d' % i if i else '') + '.webp'
            path = os.path.join(OUT, name); S.save(path, 'WEBP', **Q)
            size += os.path.getsize(path); px += P['w'] * P['h']; files.append([name, P['w'], P['h']])
        return files, size, px


def put(pk, im, s, ox, oy):
    """im 裁边、缩放后放进图集；返回 [页, x, y, 宽, 高, dx, dy]，dx/dy = 这块左上角相对 (ox, oy) 的偏移（图集像素）。"""
    b = trim(im)
    if not b: return None
    x0, y0, x1, y1 = b
    # 缩放后的整像素框：先在原图上扩到能整除的边，避免抖动（每帧的落点都按原画坐标算，不按裁出来的大小算）
    X0, Y0 = math.floor(x0 * s) / s, math.floor(y0 * s) / s
    X1, Y1 = math.ceil(x1 * s) / s, math.ceil(y1 * s) / s
    w, h = round((X1 - X0) * s), round((Y1 - Y0) * s)
    c = im.resize((w, h), Image.LANCZOS, box=(X0, Y0, X1, Y1))
    pg, px, py = pk.add(c)
    return [pg, px, py, w, h, round((X0 - ox) * s, 2), round((Y0 - oy) * s, 2)]


import numpy as np
out = {'over': OVER, 'facing': 'right', 'flipped': False, 'forms': {}, 'fx': {}}
tot_size = 0; tot_px = 0; report = []
for fk, F in A['forms'].items():
    idle1 = Image.open(os.path.join(SRC, F['actions']['idle']['pattern'].replace('{N}', '1'))).convert('RGBA')
    a = np.asarray(idle1.split()[3]) > 128; top = int(np.argmax(a.sum(1) > 30)); bodyPx = AY - top
    s = BODY[fk] * OVER / bodyPx
    pk = Packer('ny_' + fk); acts = {}
    for act in ORDER:
        c = F['actions'][act]; fr = [put(pk, im, s, AX, AY) for im in load(c['pattern'], c['frames'])]
        acts[act] = {'n': c['frames'], 'fps': c['fps'], 'loop': bool(c['loop']), 'hit': c.get('hitFrame'), 'fr': fr}
    files, size, px = pk.save(); tot_size += size; tot_px += px
    out['forms'][fk] = {'name': F['name'], 'bodyH': BODY[fk], 'bodyPx': bodyPx, 's': round(s, 5), 'pages': files, 'acts': acts}
    report.append('%s 页 %s  %.0fKB  解码 %.1fMB' % (fk, [f[1:] for f in files], size / 1024, px * 4 / 2 ** 20))
for name, c in A['fx'].items():
    s = FX_SCALE.get(name, .6); pk = Packer('ny_fx_' + FX_KEY[name])
    fr = [put(pk, soften(round_cloud(im) if name == '入梦香' else im), s, 0, 0) for im in load(c['pattern'], c['frames'])]
    files, size, px = pk.save(); tot_size += size; tot_px += px
    keep = {k: c[k] for k in ('fps', 'hitFrame', 'blendMode', 'anchor', 'referenceViewport', 'form', 'action', 'suggestedScale') if k in c}
    keep.update({'n': c['frames'], 's': s, 'pages': files, 'fr': fr}); out['fx'][FX_KEY[name]] = keep
    report.append('fx %s 页 %s  %.0fKB  解码 %.1fMB' % (name, [f[1:] for f in files], size / 1024, px * 4 / 2 ** 20))
open(META_JS, 'w', encoding='utf8').write('// 由 tools/r474n_build.py 生成：内苑梦傀（梦仆 / 梦傀 / 精英梦傀首）战斗帧与三招特效的图集尺寸表，game/r474_neiyuan.js 用。别手改。\nwindow.R474N_META=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('\n'.join(report))
print('合计 %.2fMB 文件，%.0fMB 解码（全部页都画过一次时）' % (tot_size / 2 ** 20, tot_px * 4 / 2 ** 20))
