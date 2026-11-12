# 把 Codex 画得很细、但颜色太暗的那一版地面（R217 / R218：朱漆、黑漆、深青金砖、深胡桃 + 牡丹毯、云纹毯、云鹤毯）
# 改色成作者认可的浅色色板：材质、木纹、砖缝、地毯花纹全部保留，只把颜色和明度映射过去。
# 用法：floor_recolor.py <R218目录> <R217云来客栈目录> <已有的 r222p 目录（会被就地更新）>
import sys, os, shutil
import numpy as np
from PIL import Image, ImageFilter
R218, R217, OUT = sys.argv[1:4]
def hx(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], np.float32)
def hsv(a):
    r, g, b = a[..., 0] / 255, a[..., 1] / 255, a[..., 2] / 255; mx = np.max(a, axis=2) / 255; mn = np.min(a, axis=2) / 255; d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60; return h, d / (mx + 1e-6), mx
def lum(a): return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114
def soft(m, r=1.0): return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)[..., None] / 255
def grow(m, n=3): return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(n))) > 127
def box(h, w, x0, y0, x1, y1): m = np.zeros((h, w), bool); m[max(0, y0):y1, max(0, x0):x1] = True; return m
def remap(out, src, m, target, gamma=.55, lo=.70, hi=1.22, keep=0.0):
    """m 里的像素：颜色换成 target，明暗细节（木纹 / 砖缝 / 花纹）按原图相对明度保留。keep>0 时保留一部分原色相（给地毯用）。"""
    if not m.any(): return out
    L = lum(src); ref = np.median(L[m]); rel = np.clip((np.maximum(L, 1) / max(ref, 1)) ** gamma, lo, hi)
    new = hx(target)[None, None] * rel[..., None]
    if keep: new = new * (1 - keep) + np.clip(src * (lum(hx(target)[None, None])[0, 0] / max(ref, 1)) ** .9, 0, 255) * keep
    a = soft(m); return out * (1 - a) + np.clip(new, 0, 255) * a
def run(src_png, dst_png, fn):
    g = np.asarray(Image.open(src_png).convert('RGB')).astype(np.float32); h, w, _ = g.shape; H, S, V = hsv(g); out = fn(g, g.copy(), h, w, H, S, V)
    os.makedirs(os.path.dirname(dst_png), exist_ok=True); Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst_png); print('改色', dst_png.split('/')[-2])
red = lambda H, S, V: ((H < 16) | (H > 344)) & (S > .45)

def yicui1(g, o, h, w, H, S, V):
    fl = box(h, w, 0, 205, w, h)
    stage = box(h, w, 440, 250, 905, 485) & (H > 14) & (H < 40) & (S > .3) & (V < .62)
    rug = box(h, w, 486, 478, 862, 706); run_ = box(h, w, 574, 690, 774, h)
    floor = fl & red(H, S, V) & ~rug & ~stage
    band = fl & (V < .2) & (S < .5) & ~rug & ~run_
    o = remap(o, g, floor, '#C4B2A6'); o = remap(o, g, band, '#9C8A80', gamma=.2)
    # 作者 11-12：地台那块颜色和周围分层、像硬抠进去的 → 不要地台，用左右同一排的地板镜像补平（琴台物件自己带台座）
    x0, x1, y0, y1 = 436, 910, 246, 490; mid = (x0 + x1) // 2
    o[y0:y1, mid:x1] = o[y0:y1, x1:x1 + (x1 - mid)][:, ::-1]; o[y0:y1, x0:mid] = o[y0:y1, x0 - (mid - x0):x0][:, ::-1]
    o = remap(o, g, rug & (S > .12) & (V < .62), '#B99590', gamma=.45, lo=.62, hi=1.45, keep=.12)      # 牡丹毯：紫红底提成藕荷，花纹保留
    o = remap(o, g, run_ & (H > 190) & (H < 250) & (S > .2), '#74909A', gamma=.5, lo=.7, hi=1.35)     # 云纹走道毯
    return o
def changle1(g, o, h, w, H, S, V):
    fl = box(h, w, 0, 205, w, h); felt = fl & red(H, S, V) & (V > .22)
    stone = fl & (H > 185) & (H < 230) & (S > .1) & (S < .45) & (V > .4)
    st = box(h, w, 0, 0, 250, 450); floor = fl & (V < .26) & ~felt & ~stone & (~st | ~((H > 8) & (H < 48) & (S > .32) & (V > .12)))      # 左上角楼梯的暗部不算地板
    o = remap(o, g, floor, '#B9A48C', gamma=.45, lo=.74, hi=1.2)
    o = remap(o, g, felt, '#934A40', gamma=.6, lo=.75, hi=1.25); o = remap(o, g, stone, '#B4B5AD', gamma=.7)
    return o
def lobby(g, o, h, w, H, S, V):
    rug = box(h, w, 700, 860, 1110, 1100)
    fl = box(h, w, 30, 400, w - 30, h - 30); teal = (H > 150) & (H < 232) & (S > .10) & (V < .66)
    teal = (grow(teal & fl, 5) & fl & (V < .5) & ~red(H, S, V) & ~((H > 8) & (H < 48) & (S > .3))) | (teal & box(h, w, 0, 300, w, h))
    teal &= ~box(h, w, 740, 1185, 1060, h)      # 门口的青石台阶不动
    o = remap(o, g, teal & ~rug, '#CBC8BD', gamma=.5, lo=.78, hi=1.16)
    o = remap(o, g, teal & rug, '#7B8F9C', gamma=.5, lo=.75, hi=1.3)                                   # 云鹤毯：深青底改成浅黛蓝，鹤和云保留
    o = remap(o, g, red(H, S, V) & (V < .62) & box(h, w, 0, 420, w, h), '#9A4F47', gamma=.6, lo=.7, hi=1.5, keep=.2)   # 红走道毯提亮一档，金色团花保留
    return o
def corridor(g, o, h, w, H, S, V):
    band = box(h, w, 0, 326, 1548, 736) | box(h, w, 1500, 326, w, 430); blue = (H > 195) & (H < 250) & (S > .18)
    wood = band & (H > 10) & (H < 42) & (S > .3) & (V < .6) & ~blue
    o = remap(o, g, wood, '#C5B8A6', gamma=.5, lo=.76, hi=1.18)
    o = remap(o, g, band & blue, '#6F8493', gamma=.5, lo=.72, hi=1.4)
    lb = box(h, w, 0, 940, w, h); low = grow(lb & (H > 150) & (H < 240) & (S > .08) & (V < .6), 5) & lb & (V < .5) & ~((H > 8) & (H < 48) & (S > .3)); o = remap(o, g, low, '#CBC8BD', gamma=.5)   # 栏杆外看得到的一楼石地
    return o

run(f'{R218}/一_倚翠楼/01_一楼琴堂/ground.png', f'{OUT}/一_倚翠楼/01_一楼琴堂/ground.png', yicui1)
run(f'{R218}/二_长乐坊/01_一楼赌坊/ground.png', f'{OUT}/二_长乐坊/01_一楼赌坊/ground.png', changle1)
for d, fn in (('04_云来客栈_一楼大堂', lobby), ('05_云来客栈_二楼走廊', corridor)):
    dst = f'{OUT}/云来客栈重铺/{d}'; run(f'{R217}/{d}/ground.png', f'{dst}/ground.png', fn)
