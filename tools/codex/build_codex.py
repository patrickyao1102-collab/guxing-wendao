#!/usr/bin/env python3
# 组装 Codex 独立测试版 /codex/（作者 11-19：「给我个链接」——R360，GPT-6.2 Astra 在它自己那份副本里做的版本）。
# Codex 那份 = 仓库 4a4c11a 的 game/ + 它改过 / 新加的 212 个文件（放在 codex_r360/game/）。
# 没改的文件不重复上传：直接用站点根目录的加扰正式版（r）和 /play/t/（t）；Codex 的文件加扰后放 /codex/c/（c）；游戏页 game.html 明文（p）。
# 用法：先跑完 build_play.py，再 python3 tools/codex/build_codex.py <站点目录> <提交号>
import os, sys, json, time, hashlib, shutil
SITE, SHA = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); TOOLS = os.path.dirname(HERE); REPO = os.path.dirname(TOOLS)
_argv = sys.argv[:]; sys.argv = ['build_release', os.path.join(SITE, '_unused')]
sys.path.insert(0, TOOLS); import build_release as R
sys.argv = _argv
SRC = os.path.join(REPO, 'codex_r360', 'game'); OUT = os.path.join(SITE, 'codex')
sha16 = lambda b: hashlib.sha256(b).hexdigest()[:16]
play = json.load(open(os.path.join(SITE, 'play', 'manifest.json'), encoding='utf8'))['f']
files = {k: v for k, v in play.items() if k != 'game.html' and v[0] in 'rtaig'}
cdir = os.path.join(OUT, 'c'); shutil.rmtree(cdir, ignore_errors=True)
n = 0
for d, _, fs in os.walk(SRC):
    for f in fs:
        if f.startswith('.'): continue
        p = os.path.join(d, f); rel = os.path.relpath(p, SRC).replace(os.sep, '/')
        if rel == 'index.html': continue
        data = R.xor_bytes(open(p, 'rb').read())
        o = os.path.join(cdir, rel); os.makedirs(os.path.dirname(o), exist_ok=True); open(o, 'wb').write(data)
        files[rel] = 'c' + sha16(data); n += 1
built = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
boot = open(os.path.join(TOOLS, 'play', 'boot.js'), encoding='utf8').read().replace('__GX_SHA__', SHA).replace('__GX_TIME__', built).replace("'测试版 · '", "'Codex 版 · '").replace("split('/play/')", "split('/codex/')")
html = open(os.path.join(SRC, 'index.html'), encoding='utf8').read()
i = html.find('<head>') + len('<head>')
for tag in ('<meta charset=utf8>', '<meta charset="utf-8">'):
    if html.startswith(tag, i): i += len(tag); break
page = (html[:i] + '<script>' + boot + '</script>' + html[i:]).encode('utf8')
open(os.path.join(OUT, 'game.html'), 'wb').write(page); files['game.html'] = 'p' + sha16(page)
for f in ('index.html', 'sw.js'): shutil.copy2(os.path.join(HERE, f), os.path.join(OUT, f))
json.dump({'b': SHA, 't': built, 'f': files}, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'b': SHA, 't': built, 'n': len(files)}, open(os.path.join(OUT, 'build.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(SITE) for f in fs) / 1048576
print('Codex 版组装完成：清单 %d 个文件（Codex 改过/新加 %d 个），站点合计 %.0f MB' % (len(files), n, tot))
if tot > 1000: raise SystemExit('站点超过 1000 MB（GitHub 上限 1024；11-27 从 990 放宽，站点快满了，再加大件之前先清旧素材）')
