# 玄天城换地面（作者选定 Codex R113 方案A · 汉白玉）：
# 主街铺 Codex「主街大砖」，窄巷铺「支巷暖灰砖」，中轴铺「中轴御道」，广场中心放「广场纹章」，
# 石板路和草地 / 河道交界压一圈「路沿条石」（按边的走向用横条或竖条）。草地、河道、桥原样保留。
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
Image.MAX_IMAGE_PIXELS = None
S = '/tmp/claude-0/-home-claude/baf236c7-415a-5521-8757-82f2e7fbf4fc/scratchpad'
A_ = S + '/r113/R113_玄天城华贵地砖/方案A/'
G = Image.open('/home/claude/guxing-wendao/game/cx2/g_xt_city.webp').convert('RGB')
W, H = G.size
A = np.asarray(G, np.float32)
# ---- 哪里是石板路（同试稿：1/4 分辨率按绿度、蓝度分草地河道）----
q = np.asarray(G.resize((W // 4, H // 4), Image.BOX), np.float32)
gs = ndimage.gaussian_filter(q[..., 1] - (q[..., 0] + q[..., 2]) / 2, 3)
ws = ndimage.gaussian_filter(q[..., 2] - q[..., 0], 3)
small = ~((gs > 28) | (ws > 45))
lab, nl = ndimage.label(~small); sz = ndimage.sum(np.ones_like(lab), lab, range(1, nl + 1))
for i, z in enumerate(sz):
    if z < 400: small[lab == i + 1] = True          # 小块草当石板
lab, nl = ndimage.label(small); sz = ndimage.sum(np.ones_like(lab), lab, range(1, nl + 1))
for i, z in enumerate(sz):
    if z < 400: small[lab == i + 1] = False
m = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
pave = m > .5
for x0, y0, x1, y1 in [(3600, 1230, 3890, 1400), (3710, 2000, 3975, 2170)]: pave[y0:y1, x0:x1] = False   # 两座石拱桥

def tile(path, w, h, sc=1.0):
    t = Image.open(path).convert('RGB')
    if sc != 1: t = t.resize((round(t.width * sc), round(t.height * sc)), Image.LANCZOS)
    o = Image.new('RGB', (w, h))
    for y in range(0, h, t.height):
        for x in range(0, w, t.width): o.paste(t, (x, y))
    return np.asarray(o, np.float32)

MAIN = tile(A_ + '主街大砖.png', W, H)
LANE = tile(A_ + '支巷暖灰砖.png', W, H)
# 窄巷：离草地最远也不到 ~110px 的石板路
D = ndimage.distance_transform_edt(pave)
Dq = ndimage.distance_transform_edt(small); wide = np.asarray(Image.fromarray(((ndimage.maximum_filter(Dq, size=59) > 27.5) * 255).astype(np.uint8)).resize((W, H), Image.NEAREST)) > 0
wide_s = ndimage.gaussian_filter(wide.astype(np.float32), 18)
M = MAIN * wide_s[..., None] + LANE * (1 - wide_s[..., None])
# 大片铺面加一点点明暗起伏，不至于一整片一个色
rng = np.random.default_rng(3); n = rng.random((H // 256 + 2, W // 256 + 2)).astype(np.float32)
n = np.asarray(Image.fromarray(n).resize((W + 512, H + 512), Image.BICUBIC))[256:256 + H, 256:256 + W]
M = M * (.95 + .08 * n[..., None])

# ---- 中轴御道：x=2240，御道砖放大 1.25 倍（260 宽），从北面到南门，广场纹章那段让开 ----
cx = 2240; yd_t = Image.open(A_ + '中轴御道.png').convert('RGB'); s = 1.25
yd_t = yd_t.resize((round(yd_t.width * s), round(yd_t.height * s)), Image.LANCZOS); yw = yd_t.width
YD = np.zeros((H, yw, 3), np.float32)
for y in range(0, H, yd_t.height): YD[y:y + yd_t.height] = np.asarray(yd_t, np.float32)[:H - y]
ymask = np.zeros((H, W), np.float32); ymask[700:H, cx - yw // 2:cx - yw // 2 + yw] = 1
ymask[1560:1975, :] = 0                                    # 广场中心留给纹章
ymask = ndimage.gaussian_filter(ymask, 1.0) * pave
Yfull = np.zeros_like(M); Yfull[:, cx - yw // 2:cx - yw // 2 + yw] = YD
M = M * (1 - ymask[..., None]) + Yfull * ymask[..., None]

# ---- 路沿条石：石板路靠草地 / 河道 0–24px 的一圈；边是横的用横条，竖的用竖条 ----
CH = np.asarray(Image.open(A_ + '路沿条石_横.png').convert('RGB'), np.float32)   # 24 高
CV = np.asarray(Image.open(A_ + '路沿条石_竖.png').convert('RGB'), np.float32)   # 24 宽
band = pave & (D < 24)
Ds = ndimage.gaussian_filter(D, 3); gy, gx = np.gradient(Ds)
yy, xx = np.nonzero(band)
d = np.clip(D[yy, xx], 0, 23.9).astype(int)
horiz = np.abs(gy[yy, xx]) >= np.abs(gx[yy, xx])
# 横边：u 沿 x，v 取离边距离（上边 / 下边方向一致：0 在草地一侧）
vh = np.where(gy[yy, xx] > 0, d, 23 - d); uh = xx % CH.shape[1]
vv = np.where(gx[yy, xx] > 0, d, 23 - d); uv = yy % CV.shape[0]
cur = np.where(horiz[:, None], CH[vh, uh], CV[uv, vv])
M[yy, xx] = cur
M[(D >= 24) & (D < 27) & pave] *= .78                       # 路沿里侧一道暗缝

out = np.where(pave[..., None], M, A)
img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')
# ---- 广场纹章 ----
em = Image.open(A_ + '广场纹章.png').convert('RGBA'); es = 1.55
em = em.resize((round(em.width * es), round(em.height * es)), Image.LANCZOS)
img.alpha_composite(em, (cx - em.width // 2, 1764 - em.height // 2))
img.convert('RGB').save(f'{S}/xt/g_xt_city_CA.webp', quality=88, method=6)
print('ok', pave.mean(), wide.mean())
