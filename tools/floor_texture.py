# 给 Codex R222「平涂」地面加上真实材质：木纹（取自游戏现有木地板的明度细节）、石砖（程序生成：斜铺、每块深浅、云状石纹、细缝倒角）、
# 席面（编织纹）、地毯（织物颗粒）。颜色严格沿用作者认可的色板，只加质感。
# 用法：floor_texture.py <R222目录> <输出目录> <游戏game目录>
import sys, os, shutil, json
import numpy as np
from PIL import Image, ImageFilter
R, OUT, GAME = sys.argv[1:4]
rng = np.random.default_rng(11)
def hx(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], np.float32)
def blur(a, r): return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
def noise(h, w, scale, seed=0):
    r = np.random.default_rng(seed); small = r.random((max(2, h // scale + 2), max(2, w // scale + 2))).astype(np.float32) * 255
    big = np.asarray(Image.fromarray(small.astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255; return big - big.mean()
def wood_detail(src, box, h, w):
    p = Image.open(src).convert('L').crop(box); pl = np.asarray(p).astype(np.float32); bl = np.asarray(p.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
    det = pl / np.maximum(bl, 1); row = np.concatenate([det, det[:, ::-1]], 1); tex = np.concatenate([row, row[::-1]], 0)
    ry, rx = h // tex.shape[0] + 1, w // tex.shape[1] + 1; return np.tile(tex, (ry, rx))[:h, :w]
WOOD_B = lambda h, w: wood_detail(GAME + '/cx2/g_qy_inn.webp', (0, 236, 1152, 680), h, w)       # 纹理明显的木地板
WOOD_A = lambda h, w: wood_detail(GAME + '/cx2/g_tj_room.webp', (110, 420, 1000, 700), h, w)     # 叶孤星居室那种安静的宽板
def stone(h, w, tile=64):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); u = (xx + yy) / (tile * 1.41421356); v = (xx - yy) / (tile * 1.41421356)
    iu, iv = np.floor(u).astype(np.int64), np.floor(v).astype(np.int64); fu, fv = u - iu, v - iv
    hsh = (np.sin(iu * 127.1 + iv * 311.7) * 43758.5453) % 1.0
    tone = 1 + (hsh - .5) * .07                                   # 每块砖深浅略不同
    cloud = noise(h, w, 90, 1) * .06 + noise(h, w, 24, 2) * .06 + noise(h, w, 7, 3) * .05     # 云状石纹
    speck = (rng.random((h, w)).astype(np.float32) - .5) * .035                               # 细砂粒
    vein = np.clip(1 - np.abs(noise(h, w, 46, 4) * 14), 0, 1) ** 6 * -.05                     # 几道很淡的石筋
    d = np.minimum(np.minimum(fu, 1 - fu), np.minimum(fv, 1 - fv)) * tile * 1.414
    joint = np.clip(1 - d / 1.6, 0, 1)                                                        # 缝
    bevel = np.clip(1 - np.abs(d - 3) / 2.2, 0, 1) * np.where((fu < .5) & (fv > .5), .05, -.02)   # 砖边一圈受光 / 背光
    return (tone + cloud + speck + vein + bevel) * (1 - joint * .30)
def mat(h, w):
    yy, xx = np.mgrid[0:h, 0:w]; weave = ((xx // 3 + yy // 3) % 2) * .05 - .025; rib = (np.sin(yy * 2 * np.pi / 9) * .03); strand = (np.sin(xx * 2 * np.pi / 3.0 + yy * .4) * .015)
    return 1 + weave + rib + strand + noise(h, w, 60, 5) * .08 + (rng.random((h, w)).astype(np.float32) - .5) * .04
def fabric(h, w):
    yy, xx = np.mgrid[0:h, 0:w]; return 1 + ((xx + yy) % 2) * .035 - .0175 + (np.sin(yy * 2 * np.pi / 4) * .012) + (rng.random((h, w)).astype(np.float32) - .5) * .05 + noise(h, w, 40, 6) * .05
def near(g, c, t): return np.abs(g - hx(c)).max(axis=2) < t
def lum(a): return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114
def floor_mask(g, base, strict, lo=.58, hi=1.10, cd=.03):
    b = hx(base); L = lum(g); bl = float(lum(b[None, None])[0, 0]); ratio = L / bl
    chroma = np.abs(g / np.maximum(L[..., None], 1) - (b / bl)[None, None]).max(axis=2)
    rows = np.where(strict.mean(axis=1) > .2)[0]; m = (chroma < cd) & (ratio > lo) & (ratio < hi)
    if len(rows): m[:rows.min()] = False; m[rows.max() + 1:] = False
    else: m[:] = False
    shade = np.clip(blur(np.where(m | strict, ratio, 1) * 200, 2.5) / 200, lo, hi)
    return m | strict, shade
def soft(m, r=1.0): return blur(m.astype(np.float32) * 255, r)[..., None] / 255
SC = {
 '一_倚翠楼/01_一楼琴堂': dict(wood=[('#C4B2A6', '#AD9A8D', 'B', .85), ('#B8A08C', None, 'B', .8)], rugs=['#74909A', '#B99590', '#E3D9C6', '#E6DACB']),
 '一_倚翠楼/02_二楼听雨阁': dict(mat=[('#BDBB9F', '#AAA88C')], wood=[('#C4B4A0', None, 'A', 1.0)], rugs=['#D9D0BE', '#66796B']),
 '二_长乐坊/01_一楼赌坊': dict(wood=[('#B9A48C', '#9C876F', 'B', 1.1)], stone=[('#B4B5AD', None, 56)], rugs=['#934A40', '#A08650'], wear=True),
 '二_长乐坊/02_二楼账房': dict(wood=[('#C2B4A0', '#A8998A', 'A', 1.1)], rugs=['#D9D0BE', '#5E7263']),
 '云来客栈重铺/04_云来客栈_一楼大堂': dict(stone_src=os.environ.get('LOBBY_STONE', ''), stone=[('#CBC8BD', '#A9A498', 72), ('#C2BEB2', None, 72)], rugs=['#914A42', '#A08650', '#D8D2C3', '#6A7F8E']),
 '云来客栈重铺/05_云来客栈_二楼走廊': dict(wood=[('#C5B8A6', '#AB9D8B', 'A', 1.15)], rugs=['#6A7F8E', '#D8D2C3']),
 '云来客栈重铺/06_天字三号房': dict(wood=[('#C5B8A6', '#AB9D8B', 'A', 1.15)], rugs=['#879BA6', '#D8D2C3', '#8FA08F']),
 '万宝楼重铺/02_万宝楼_二楼鉴宝雅间': dict(mat=[('#C6C2A6', '#B3AF93')], wood=[('#C4B4A0', None, 'A', 1.0)], rugs=['#D8D2C3', '#A08650']),
}
for sc, cfg in SC.items():
    src = f'{R}/{sc}/ground.png'
    if not os.path.exists(src): print('缺', sc); continue
    g = np.asarray(Image.open(src).convert('RGB')).astype(np.float32); h, w, _ = g.shape; out = g.copy(); body = np.zeros((h, w), bool)
    rugm = np.zeros((h, w), bool)
    for c in cfg.get('rugs', []): rugm |= near(g, c, 9)
    for base, seam, kind, k in cfg.get('wood', []):
        strict = near(g, base, 15 if seam else 7) | (near(g, seam, 11) if seam else False)
        m, shade = floor_mask(g, base, strict) if seam else (strict, np.ones((h, w), np.float32)); m &= ~body & ~rugm; body |= m
        tex = (WOOD_B if kind == 'B' else WOOD_A)(h, w) ** k; a = soft(m)
        out = out * (1 - a) + np.clip(hx(base)[None, None] * 1.015 * (tex * shade)[..., None], 0, 255) * a
    first = None
    for base, seam, tile in cfg.get('stone', []):
        strict = near(g, base, 9) | (near(g, seam, 9) if seam else False); first = first or base
        m, shade = floor_mask(g, first, strict, hi=1.22, cd=.022); m &= ~body & ~rugm; body |= m
        if cfg.get('stone_src') and os.path.exists(cfg['stone_src']):      # 有 Codex 画过的同布局石地：借它的砖缝和石纹（只取明度细节），颜色用定稿色
            sp = Image.open(cfg['stone_src']).convert('L'); sl = np.asarray(sp).astype(np.float32); sb = np.asarray(sp.filter(ImageFilter.GaussianBlur(26))).astype(np.float32)
            tex = np.clip(sl / np.maximum(sb, 1), .72, 1.22); tex = tex / max(.5, float(tex[m].mean()) if m.any() else 1) * 1.01; shade = np.ones((h, w), np.float32)
        else: tex = stone(h, w, tile)
        a = soft(m); out = out * (1 - a) + np.clip(hx(first)[None, None] * (tex * shade)[..., None], 0, 255) * a
    for base, line in cfg.get('mat', []):
        strict = near(g, base, 13) | near(g, line, 9); m, shade = floor_mask(g, base, strict, cd=.025); m &= ~body & ~rugm; body |= m; a = soft(m); out = out * (1 - a) + np.clip(hx(base)[None, None] * (mat(h, w) * shade)[..., None], 0, 255) * a
    rows = np.where(body.mean(axis=1) > .25)[0]; y0, y1 = (rows.min(), rows.max()) if len(rows) else (0, h)
    fb = fabric(h, w)
    for c in cfg.get('rugs', []):
        m = near(g, c, 12); m[:y0] = False; m[y1:] = False; a = soft(m, .8); out = out * (1 - a) + np.clip(out * fb[..., None], 0, 255) * a
    # 大面积的轻微深浅（痕迹感，不是脏）＋ 房间四角略暗，只作用在地面上
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); vig = 1 - (((xx / w - .5) * 2) ** 2 * .035 + (np.clip((yy - y0) / max(1, y1 - y0), 0, 1) - .45) ** 2 * .06)
    big = 1 + noise(h, w, 220, 9) * .09
    if cfg.get('wear'): big = big + np.exp(-(((xx - w / 2) / 150) ** 2)) * np.clip((yy - h * .45) / (h * .5), 0, 1) * .05      # 门口到赌桌一条被踩亮的走道
    a = soft(body, 2); out = out * (1 - a) + np.clip(out * (vig * big)[..., None], 0, 255) * a
    os.makedirs(f'{OUT}/{sc}', exist_ok=True); Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(f'{OUT}/{sc}/ground.png')
    for f in os.listdir(f'{R}/{sc}'):
        if f != 'ground.png' and not os.path.exists(f'{OUT}/{sc}/{f}'):
            s = f'{R}/{sc}/{f}'; (shutil.copytree if os.path.isdir(s) else shutil.copy)(s, f'{OUT}/{sc}/{f}')
    print(sc, 'floor %.0f%%' % (body.mean() * 100))
for f in ('objects', 'meta.json', '四_地图小物件'):
    s = f'{R}/{f}'
    if os.path.exists(s) and not os.path.exists(f'{OUT}/{f}'): (shutil.copytree if os.path.isdir(s) else shutil.copy)(s, f'{OUT}/{f}')
