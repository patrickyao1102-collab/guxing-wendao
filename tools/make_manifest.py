#!/usr/bin/env python3
# 生成 game/version.json：每个文件的 sha256 和大小。APK 启动时拿它和本地清单比对，只下载有变化的文件。
import hashlib, json, os, sys, time
root = sys.argv[1] if len(sys.argv) > 1 else 'game'
version = sys.argv[2] if len(sys.argv) > 2 else time.strftime('%Y%m%d-%H%M')
files = {}
for d, _, fs in os.walk(root):
    for f in fs:
        p = os.path.join(d, f); rel = os.path.relpath(p, root).replace(os.sep, '/')
        if rel == 'version.json' or rel.startswith('.'): continue
        h = hashlib.sha256()
        with open(p, 'rb') as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b''): h.update(chunk)
        files[rel] = {'sha': h.hexdigest()[:20], 'size': os.path.getsize(p)}
out = {'version': version, 'built': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'count': len(files), 'files': files}
json.dump(out, open(os.path.join(root, 'version.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('manifest', version, len(files), 'files')
