#!/usr/bin/env python3
# 组装浏览器测试版 /play/（带测试面板、带只进测试版的内容）。
#
# 作者 11-13：「测试版经常加载不出来更新过后的版本，这一点最为严重，务必修好。」
# 原来：只进测试版的文件不在站点里，浏览器要去 raw.githubusercontent.com 现取——那边对没登录的访问限流，取不到时游戏拿旧样子顶上。
# 现在：只进测试版的文件加扰后随站点一起发布（play/t/），并生成一份清单（每个文件在哪 + 内容指纹）；
#       浏览器按清单取文件、核对指纹、存在本地，文件没变就不再联网，变了一定取到新的（取文件的逻辑见 tools/play/sw.js）。
#
# 用法（在仓库根目录；先跑完 build_release.py 和 make_manifest.py，站点根目录里要有 version.json）：
#   python3 tools/build_play.py <站点目录> <提交号>
import os, sys, json, hashlib, shutil, time

if len(sys.argv) < 3:
    raise SystemExit('用法：python3 tools/build_play.py <站点目录> <提交号>')
SITE, SHA = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
_argv = sys.argv[:]; sys.argv = ['build_release', os.path.join(SITE, '_unused')]   # build_release 一导入就读命令行，这里只借它的名单和加扰函数
sys.path.insert(0, HERE)
import build_release as R
sys.argv = _argv

SRC, PLAY = 'game', os.path.join(SITE, 'play')
LIMIT_MB = 960   # GitHub Pages 单站点上限 1GB，留一点余量；超了发布会失败，这里提前报清楚

def sha16(data):
    return hashlib.sha256(data).hexdigest()[:16]

def main():
    ver_path = os.path.join(SITE, 'version.json')
    if not os.path.isfile(ver_path):
        raise SystemExit('站点根目录没有 version.json：先跑 build_release.py 和 make_manifest.py')
    os.makedirs(PLAY, exist_ok=True)
    files = {}
    # ① 站点根目录的加扰正式版：指纹直接用 version.json 里现成的
    ver = json.load(open(ver_path, encoding='utf8'))
    for rel, v in ver['files'].items():
        files[rel] = 'r' + v['sha'][:16]
    # ② 只进测试版的目录 / 脚本：加扰后放到 play/t/
    tdir = os.path.join(PLAY, 't'); shutil.rmtree(tdir, ignore_errors=True)
    tn = tb = 0
    def put(rel):
        nonlocal tn, tb
        data = R.xor_bytes(open(os.path.join(SRC, rel), 'rb').read())
        out = os.path.join(tdir, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'wb').write(data)
        files[rel.replace(os.sep, '/')] = 't' + sha16(data); tn += 1; tb += len(data)
    for name in sorted(os.listdir(SRC)):
        p = os.path.join(SRC, name)
        if name in R.TEST_ONLY_DIRS and os.path.isdir(p):
            for d, _, fs in os.walk(p):
                for f in sorted(fs):
                    if f.startswith('.'): continue
                    put(os.path.relpath(os.path.join(d, f), SRC))
        elif name in R.TEST_ONLY_JS and os.path.isfile(p):
            put(name)
    # ③ 游戏页（明文，带测试面板）：最前面塞进开场检查，写上这次发布的提交号和时间
    built = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    boot = open(os.path.join(HERE, 'play', 'boot.js'), encoding='utf8').read().replace('__GX_SHA__', SHA).replace('__GX_TIME__', built)
    assert '</script' not in boot.lower(), 'boot.js 里不能出现 </script'
    html = open(os.path.join(SRC, 'index.html'), encoding='utf8').read()
    i = html.find('<head>')
    if i < 0: raise SystemExit('game/index.html 里找不到 <head>')
    i += len('<head>')
    for tag in ('<meta charset=utf8>', '<meta charset="utf-8">'):   # 编码声明要留在最前面（浏览器只在开头一小段里找它）
        if html.startswith(tag, i): i += len(tag); break
    html = html[:i] + '<script>' + boot + '</script>' + html[i:]
    page = html.encode('utf8')
    open(os.path.join(PLAY, 'game.html'), 'wb').write(page)
    files['game.html'] = 'p' + sha16(page)
    # ④ 加载页、取文件的 Service Worker、清单、版本号
    for f in ('index.html', 'sw.js'):
        shutil.copy2(os.path.join(HERE, 'play', f), os.path.join(PLAY, f))
    json.dump({'b': SHA, 't': built, 'f': files}, open(os.path.join(PLAY, 'manifest.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({'b': SHA, 't': built, 'n': len(files)}, open(os.path.join(PLAY, 'build.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    # ⑤ 站点体积
    total = 0
    for d, _, fs in os.walk(SITE):
        for f in fs: total += os.path.getsize(os.path.join(d, f))
    mb = total / 1048576
    print('测试版组装完成：清单 %d 个文件（其中只进测试版 %d 个，%.0f MB），站点合计 %.0f MB（上限 %d MB）' % (len(files), tn, tb / 1048576, mb, LIMIT_MB))
    if mb > LIMIT_MB:
        raise SystemExit('站点超过 %d MB，GitHub Pages 会发布失败：需要清掉一些用不到的旧素材（见 tools/release_drop.txt）' % LIMIT_MB)

if __name__ == '__main__':
    main()
