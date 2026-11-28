#!/usr/bin/env python3
# R474 · 绛蘅（万妖塔一层首领）战斗帧真画重做（Codex R472）→ 游戏图集 game/r474/ + r415_meta.js 里的 bianhua_r474。
# 用法：python3 tools/r474_build.py <Codex 交付/R472_绛蘅战斗建模重画> [OVER]
#
# 和 R460（tools/r460_build.py）的不同：
#   ① 每一帧单独裁到自己的边（不再所有帧共用一个最大框），按动作顺序一排排塞进 ≤4096 的页里——同样清晰度，图集小得多（手机内存）。
#   ② 朝向：R472 的 anim.json 写明 facing = right（原画就面朝右边、也就是我方）。R460 那版要先翻成朝左存、引擎画的时候再镜像回来；
#      R474 的帧由 game/r474_jhbattle.js 自己画、不镜像，所以这里【不翻面】，原样存。
#   ③ 动作多套：f1 = idle / charge / hurt / tired / atk_huaren / atk_rumeng；f2 = idle / charge / hurt / tired / defeat / atk_huakai / atk_ximeng / atk_huazang。
#   ④ 五招特效（fx/花刃 入梦 花开 吸梦 花葬）也各打一套图集，坐标照 anim.json 的参考画面（1600×1200 画布、参考视口 0,150,1600,900）记下来，
#      引擎按命中帧 / 叠加方式 / 落点在战场上放。
# 清晰度：人物按 R460 同一个口径——idle 第一帧的身体高 → bodyH（380）× OVER（默认 1.6）存；两种形态用同一个比例（同一个人，换形态不忽大忽小）。
import os, sys, json, math
from PIL import Image

SRC = sys.argv[1]
OVER = float(sys.argv[2]) if len(sys.argv) > 2 else 1.6
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
OUT = os.path.join(ROOT, 'r474')
META_JS = os.path.join(ROOT, 'r415_meta.js')
os.makedirs(OUT, exist_ok=True)
A = json.load(open(os.path.join(SRC, 'anim.json'), encoding='utf8'))
AX, AY = A['anchor']
MAXS = 4096
PAD = 2              # 帧与帧之间留 2px 透明缝，缩放取样不串色
Q = dict(quality=82, method=6, alpha_quality=82)

BODY_H = 380         # 和 R460 的 bianhua_f1.bodyH 一样：屏幕上身体高 = BODY_H × K（K 由 r421 的登记比例给，0.8）
FX_SCALE = {'花刃': .72, '入梦': .62, '花开': .7, '吸梦': .62, '花葬': .5}   # 特效：存的像素 / 参考画布像素（参考画布 → 1280 宽屏幕大约 ×0.8）
FX_KEY = {'花刃': 'huaren', '入梦': 'rumeng', '花开': 'huakai', '吸梦': 'ximeng', '花葬': 'huazang'}
ORDER = {'f1': ['idle', 'hurt', 'tired', 'charge', 'atk_huaren', 'atk_rumeng'],
         'f2': ['idle', 'hurt', 'tired', 'charge', 'defeat', 'atk_huakai', 'atk_ximeng', 'atk_huazang']}


def load(pat, n):
    return [Image.open(os.path.join(SRC, pat.replace('{N}', str(i)))).convert('RGBA') for i in range(1, n + 1)]


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


txt = open(META_JS, encoding='utf8').read(); head, body = txt.split('=', 1); META = json.loads(body.rsplit(';', 1)[0])

# ---------- 人物 ----------
idle1 = Image.open(os.path.join(SRC, A['forms']['f1']['actions']['idle']['pattern'].replace('{N}', '1'))).convert('RGBA')
bb = idle1.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox(); bodyPx = AY - bb[1]   # 头顶到脚底锚点
S_CH = BODY_H * OVER / bodyPx
out = {'over': OVER, 'bodyH': BODY_H, 'bodyPx': bodyPx, 's': round(S_CH, 5), 'facing': 'right', 'flipped': False, 'forms': {}, 'fx': {}}
tot_size = 0; tot_px = 0; report = []
for form in ('f1', 'f2'):
    F = A['forms'][form]; pk = Packer('jh_' + form); acts = {}
    for a in ORDER[form]:
        c = F['actions'][a]; fr = []
        for im in load(c['pattern'], c['frames']): fr.append(put(pk, im, S_CH, AX, AY))
        acts[a] = {'n': c['frames'], 'fps': c['fps'], 'loop': bool(c['loop']), 'hit': c.get('hitFrame'), 'fr': fr}
    files, size, px = pk.save(); tot_size += size; tot_px += px
    out['forms'][form] = {'name': F['name'], 'pages': files, 'acts': acts}
    report.append('%s 页 %s  %.0fKB  解码 %.1fMB' % (form, [f[1:] for f in files], size / 1024, px * 4 / 2 ** 20))

# ---------- 特效 ----------
for name, c in A['fx'].items():
    s = FX_SCALE.get(name, .6); pk = Packer('jh_fx_' + FX_KEY[name]); fr = []
    for im in load(c['pattern'], c['frames']): fr.append(put(pk, im, s, 0, 0))
    files, size, px = pk.save(); tot_size += size; tot_px += px
    keep = {k: c[k] for k in ('fps', 'hitFrame', 'blendMode', 'anchor', 'referenceViewport', 'referenceActorAnchor', 'referenceTarget', 'placement', 'releaseFrame', 'flightFrames',
                              'impactFrame', 'fallFrames', 'projectileTipByFrame', 'impactAnchor', 'peakFrames', 'viewportFit', 'action', 'form', 'suggestedScale') if k in c}
    keep.update({'n': c['frames'], 's': s, 'pages': files, 'fr': fr})
    out['fx'][FX_KEY[name]] = keep
    report.append('fx %s 页 %s  %.0fKB  解码 %.1fMB' % (name, [f[1:] for f in files], size / 1024, px * 4 / 2 ** 20))

META['bianhua_r474'] = out
open(META_JS, 'w', encoding='utf8').write(head + '=' + json.dumps(META, ensure_ascii=False) + ';\n')
print('\n'.join(report))
print('合计 %.2fMB 文件，%.0fMB 解码（全部页都画过一次时）' % (tot_size / 2 ** 20, tot_px * 4 / 2 ** 20))
