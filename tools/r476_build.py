# R476 · 绛蘅现身（Codex：小云雀视频转帧 + 重画关键帧）→ game/r476/{fall,laugh}/NN.webp + game/r476_meta.js
# 用法：python3 tools/r476_build.py <R476 交付目录>
#   01_脱树飘落（45 帧，单次）：从花树树洞里（半身嵌在洞里）睁眼、探身出洞、双袖展开、披帛回旋、拢袖下落，落到御台前站定
#   02_掩袖而笑（32 帧）：站定 → 侧头睥睨 → 抬袖 → 掩唇笑 → 再笑 → 落袖 → 收回站姿
# 两段的画布都按 anim.json 的 world_origin_px + map_scale（1/3）摆到地图上；这里每段裁掉公共透明边、缩到原尺寸的一半存 webp
# （地图上画出来只有原画的 1/3 大，镜头推近到 1.4 倍也只用到原画一半的像素）。每帧时长照 anim.json。
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'game', 'r476')
K = 0.5   # 存图缩放（相对 Codex 原画）
SEQ = [('fall', '01_脱树飘落'), ('laugh', '02_掩袖而笑')]


def main():
    src = sys.argv[1]
    meta = {}
    for key, d in SEQ:
        A = json.load(open(os.path.join(src, d, 'anim.json'), encoding='utf-8'))
        fs = [Image.open(os.path.join(src, d, f['file'])).convert('RGBA') for f in A['frames']]
        bb = None
        for im in fs:
            b = im.split()[3].point(lambda v: 255 if v > 4 else 0).getbbox()
            if b:
                bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
        bb = (max(0, bb[0] - 2), max(0, bb[1] - 2), min(fs[0].width, bb[2] + 2), min(fs[0].height, bb[3] + 2))
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        os.makedirs(os.path.join(OUT, key), exist_ok=True)
        for i, im in enumerate(fs):
            im.crop(bb).resize((round(w * K), round(h * K)), Image.LANCZOS).save(os.path.join(OUT, key, '%02d.webp' % (i + 1)), 'WEBP', quality=86, method=5)
        sc = A['map_scale']; ox, oy = A['world_origin_px']
        meta[key] = {'n': len(fs), 'ms': [f['duration_ms'] for f in A['frames']], 'x': round(ox + bb[0] * sc, 1), 'y': round(oy + bb[1] * sc, 1), 'w': round(w * sc, 1), 'h': round(h * sc, 1),
                     'loop': A.get('loop', False), 'foot': A['standing_foot_world_px'],
                     'keys': {i: f['key_pose'] for i, f in enumerate(A['frames']) if f.get('key_pose')}}
        print(key, len(fs), bb, meta[key]['x'], meta[key]['y'], meta[key]['w'], meta[key]['h'])
    js = '// R476 · 绛蘅现身关键帧尺寸表：tools/r476_build.py 生成，别手改（世界坐标；帧图在 r476/<段>/NN.webp）\nwindow.R476_APPEAR = ' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(ROOT, 'game', 'r476_meta.js'), 'w', encoding='utf-8').write(js)


if __name__ == '__main__':
    main()
