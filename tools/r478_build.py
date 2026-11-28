# R478 · 地图来历：从 game/r478/lore.json 生成
#   1) game/r478/lore.woff  —— 只含来历正文用到的字的「霞鹜文楷」子集（游戏里现有的楷体都是子集，缺字会混进宋体，难看）
#   2) game/r478/title.woff —— 只含题名、小字用到的字的「马善政」子集：没有 R163 书法题名的图（万妖塔各苑、民宅……）用它补一个毛笔题名
#   3) 给作者看的「地图来历_全部.md」
# 用法：python3 tools/r478_build.py <字体目录> [md 输出路径]
#   字体目录里要有 LXGWWenKai-Regular.ttf、MaShanZheng-Regular.ttf（作者 Mac：孤星问道/Codex交付/R200_行囊白玉宣纸拆件/fonts/，都是 OFL 授权）
# 改了 lore.json 的字要重跑一遍，不然新字会掉回别的字体（不会报错，只是字形不统一）。
# r478/ 整个目录只进测试版（tools/build_release.py 的 TEST_ONLY_DIRS）。
import json, sys, os
from collections import OrderedDict
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = json.load(open(os.path.join(ROOT, 'game/r478/lore.json'), encoding='utf8'), object_pairs_hook=OrderedDict)
PUNCT = '0123456789·—…、，。：；！？「」『』（）《》〔〕 '
body = set(PUNCT); head = set(PUNCT)
for v in L.values(): body |= set(v['title'] + v['sub'] + v['text']); head |= set(v['title'] + v['sub'])

def sub(src, text, out):
    from fontTools import subset
    opt = subset.Options(); opt.flavor = 'woff'; opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    f = subset.load_font(src, opt); s = subset.Subsetter(opt); s.populate(text=''.join(sorted(text))); s.subset(f)
    subset.save_font(f, out, opt); print('font', out, os.path.getsize(out), 'bytes,', len(text), 'chars')

if len(sys.argv) > 1:
    d = sys.argv[1]
    sub(os.path.join(d, 'LXGWWenKai-Regular.ttf'), body, os.path.join(ROOT, 'game/r478/lore.woff'))
    sub(os.path.join(d, 'MaShanZheng-Regular.ttf'), head, os.path.join(ROOT, 'game/r478/title.woff'))
md = sys.argv[2] if len(sys.argv) > 2 else None
if md:
    G = OrderedDict()
    for m, v in L.items(): G.setdefault(v['k'], [v, []])[1].append(m)
    TN = {}
    try: TN = json.load(open('/tmp/claude-0/n4/mapnames.json', encoding='utf8'))
    except Exception: pass
    o = ['# 地图来历 · 全部', '',
         '换图时载入画面左上角、书法题名下面显示的那段话（像老版《剑网三》载入图上的地图来历）。同一地点的屋子、房间共用地点那段。',
         '没写的图：两张「十几年前 · 师父的院子」（回忆戏，载入时不该先交代）、三张人物大小试用图。', '',
         f'共 {len(G)} 段，覆盖 {len(L)} 张图。改字：改 game/r478/lore.json（同一段的每张图都要改），改完重跑 tools/r478_build.py 生成字体子集。', '']
    for k, (v, ms) in G.items():
        n = sum(1 for c in v['text'] if '一' <= c <= '鿿')
        o += [f"## {v['title']}" + (f"　〔{v['sub']}〕" if v['sub'] else ''), '', v['text'], '',
              f'<sub>{n} 字 · 用在：' + '、'.join(f"{TN.get(m, m)}（{m}）" for m in ms) + '</sub>', '']
    open(md, 'w', encoding='utf8').write('\n'.join(o)); print('md', md)
