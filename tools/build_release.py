#!/usr/bin/env python3
# 正式版构建：把开发版 game/ 变成给朋友玩的 release/
#   1) 去掉左下角「测试」面板（地图传送 / 剧情跳转 / 配乐库 / 声音测试等全没了，挂在面板里的开发开关也随之失效，默认行为不变）
#   2) 剔除零引用的废图目录（_tmp_walk、jyh3——已被 jyh4 取代）
#   3) 素材字节加扰（XOR）：解包 APK / 打开 Pages 目录只会看到一堆乱码文件，安卓壳 Client.java 读取时按同样的 KEY 还原。
#      这是「抬高随手扒素材的门槛」，不是绝对加密——铁了心逆向 APK 的人仍能找到 KEY，诚实如此。
#   boot.html（安卓壳自带、游戏前加载）和 version.json（更新器按明文 JSON 读）不在 game/ 里，保持明文。
#
# 用法：python3 tools/build_release.py [release目录=release] [--no-scramble] [--keep-test]
import os, sys, shutil

SRC = 'game'
OUT = next((a for a in sys.argv[1:] if not a.startswith('--')), 'release')
SCRAMBLE = '--no-scramble' not in sys.argv
KEEP_TEST = '--keep-test' in sys.argv   # 作者 11-14：要一个「完整安装包」看看最终效果 → 只进测试版的内容也打进去（测试面板照样去掉）
DROP_DIRS = {'_tmp_walk', 'jyh3'}
# 作者 11-12：青阳镇 / 玄天城支线和新室内只进测试版，让作者先测房间构图和玩法；正式版（纯净版）不带。作者说可以了，再把下面两行清空。
TEST_ONLY_DIRS = {'r456', 'r458', 'r457', 'r443', 'r434', 'r428m', 'r427', 'r424', 'r416', 'r419', 'r417', 'r415', 'r413', 'r406i', 'r409', 'r410', 'r411', 'r400i', 'r399', 'r385', 'r389i', 'r394', 'r392', 'r388', 'r386', 'r383','r381','r380','r379','r378','r377','r370i','r371','r372','r373','r365tl', 'r368', 'r366i', 'r366e', 'r367', 'r366', 'r365', 'r364', 'r359', 'r357', 'r352', 'r349', 'r348', 'r347', 'r345', 'r344', 'r343', 'r341', 'r338', 'r337', 'r336', 'r335', 'r334', 'r333', 'r332', 'r327', 'r326', 'r325', 'r324', 'r322', 'r320', 'r290i', 'r293', 'r295', 'r296', 'r297', 'r300', 'r301', 'r303', 'r311', 'r312', 'r314', 'r213', 'r217', 'r219', 'r221', 'r227', 'r228', 'r230', 'r233', 'r236', 'r238', 'r239', 'r246', 'r249', 'r253w', 'r255', 'r260', 'r262', 'r263', 'r272', 'r269', 'r274', 'r275', 'r254f2', 'r266', 'r276', 'r279', 'r282', 'r283'}
TEST_ONLY_JS = ['r461_towerfx.js', 'r458_teaser.js', 'r457_flowers.js', 'r443_f1zones.js', 'r443_meta.js', 'r430_towerextra.js', 'r429_tower34.js', 'r428_towermusic.js', 'r427_towerside.js', 'r427_meta.js', 'r424_meta.js', 'r426_search.js', 'r425_chests.js', 'r424_maze.js', 'r422_scroll.js', 'r423_westcourt.js', 'r421_tower.js', 'r415_meta.js', 'r419_wxbook.js', 'r406_items.js', 'r407_refine_fx.js', 'r411_trial.js', 'r405_level.js', 'r402_shop.js', 'r400_craft.js', 'r399_minis.js', 'r399_meta.js', 'r398_chests.js', 'r397_testbtn.js', 'r385_data.js', 'r389_gear.js', 'r389_panel.js', 'r394_forge.js', 'r396_hs12fix.js', 'r395_pingjing.js', 'r393_wxjing.js', 'r392_luoxing.js', 'r392_data.js', 'r391_boons.js', 'r388_wolf.js', 'r388_meta.js', 'r390_routes.js', 'r386_jade.js', 'r382_wuxing.js', 'r381_dialog.js', 'r380_book.js', 'r379_world.js', 'r378_kings.js', 'r378_meta.js', 'r377_bossglow.js', 'r375_feel.js', 'r374_lines.js','r373_skin.js','r371_shops.js','r370_ui.js','r370_core.js','r368_icons.js', 'r367_shops.js', 'r366_tavern.js', 'r365_dinner.js', 'r364_tidy.js', 'r359_audio.js', 'r357_memory.js', 'r354_scaletest.js', 'r352_chehome_ext.js', 'r349_chehome.js', 'r348_ayan_ext.js', 'r344_dxhome.js', 'r343_hanfu.js', 'r341_dx_memory.js', 'r340_bubble.js', 'r338_routes.js', 'r337_dahu_ext.js', 'r336_brothers.js', 'r335_xtroad.js', 'r334_dxpeach.js', 'r333_yamen.js', 'r332_tl.js', 'r331_links.js', 'r212_qingyang.js', 'r213_xuantian.js', 'r213_rooms.js', 'r214_case_inn.js', 'r215_case_wanbao.js', 'r216_case_thirty.js', 'r217_inn.js', 'r219_scenes.js', 'r221_cine.js', 'r225_apply.js', 'r227_music.js', 'r227_vo.js', 'r229_apply.js', 'r230_search.js', 'r228_ext.js', 'r231_sets.js', 'r232_case_lamp.js', 'r236_hub.js', 'r238_teahouse.js', 'r239_sect.js', 'r246_teahouse2.js', 'r250_room3.js', 'r252_sun.js', 'r243_front.js', 'r253_fixes.js', 'r249_market.js', 'r256_npc8.js', 'r257_homes.js', 'r258_court.js', 'r260_xt_walls.js', 'r260_court.js', 'r263_window.js', 'r262_front.js', 'r271_tidy.js', 'r272_stairs.js', 'r269_inn.js', 'r274_rest.js', 'r254_2f.js', 'r275_rooms.js', 'r266_guests.js', 'r276_room1.js', 'r277_portal_top.js', 'r278_chain.js', 'r279_seated.js', 'r280_stalls.js', 'r282_ext.js', 'r283_collide.js', 'r284_mapnav.js', 'r284_sidenav.js', 'r287_qbook.js', 'r291_inns.js', 'r292_minglu.js', 'r290_icons.js', 'r293_yunlai.js', 'r295_cast.js', 'r297_rooms.js', 'r298_reward.js', 'r300_tyl2f.js', 'r302_fix.js', 'r303_rooms.js', 'r311_music.js', 'r312_fix.js', 'r313_sqtest.js', 'r314_dahu.js', 'r315_wanbao.js', 'r316_libfire.js', 'r317_sqmark.js', 'r318_huagirl.js', 'r319_sqbranch.js', 'r320_portraits.js', 'r321_sqtwist.js', 'r322_cine.js', 'r323_spots.js', 'r324_props.js', 'r325_yunlai307.js', 'r326_recall.js', 'r327_court.js', 'r328_walkin.js', 'r329_dongxiang.js']
# 不进安装包的子目录 / 单个文件（字体预览原件、旧配乐、旧素材……见 tools/release_drop.txt）
DROP_SUB = {'fonts/_pv', 'r193f', 'r193j'}   # 11-28 作者「那个潭咱就不钓鱼了」：潭边垂钓整个停了，钓鱼的画（r193f / r193j / r193g 大半）不再上站点
DROP_FILES = set()
_df = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'release_drop.txt')
if os.path.exists(_df):
    DROP_FILES = {l.strip() for l in open(_df, encoding='utf8') if l.strip() and not l.startswith('#')}

# 加扰 KEY：和 Client.java 里的 SCRAMBLE_KEY 必须逐字节一致（59 字节，质数长度）
KEY = bytes([
    0x9A, 0x3C, 0x51, 0xE7, 0x22, 0xB8, 0x6D, 0x14, 0xF0, 0x7B, 0x29, 0xC5,
    0x88, 0x3E, 0xA1, 0x5F, 0xD2, 0x0C, 0x97, 0x46, 0xBB, 0x71, 0x1D, 0xE4,
    0x58, 0x33, 0xA6, 0xCF, 0x62, 0x09, 0x8D, 0x4B, 0xF7, 0x25, 0xB0, 0x6E,
    0x12, 0xA9, 0x5C, 0xD5, 0x37, 0xE0, 0x7A, 0x1E, 0x93, 0x48, 0xBD, 0x66,
    0x0A, 0x8F, 0x41, 0xF2, 0x28, 0xB4, 0x6B, 0x17, 0xCC, 0x54, 0xD9,
])

def strip_test_panel(html):
    mark = '// ================= 测试面板：左下角「测试」按钮'
    i = html.find(mark)
    if i < 0:
        print('  [!] 没找到测试面板标记，跳过去除（可能已是正式版）'); return html
    j = html.find('\n})();', i)
    if j < 0:
        raise SystemExit('找不到测试面板 IIFE 结尾 })()；请检查 index.html')
    block = html[i:j]
    assert 'dbgPanel' in block, '匹配到的块不含 dbgPanel，边界可能错了，中止以免误删'
    # 作者 11-12：给别人玩的纯净版 / 安卓包只到女娲秘境之前；测试版（/play/）不带这个标记，后面内容照常能测
    out = html[:i] + '/* 测试面板：正式版已移除 */ window.GX_TRIAL = true;' + html[j + len('\n})();'):]
    # 作者 11-16：正式版关掉种地 / 钓鱼（r330_lock.js 等看这个标记）；要在所有脚本之前设好
    assert out.count('<head>') >= 1, '找不到 <head>'
    return out.replace('<head>', '<head><script>window.GX_RELEASE = true;</script>', 1)

def xor_bytes(data):
    n = len(data)
    if n == 0:
        return data
    try:
        import numpy as np
        a = np.frombuffer(data, dtype=np.uint8)
        k = np.frombuffer((KEY * (n // len(KEY) + 1))[:n], dtype=np.uint8)
        return (a ^ k).tobytes()
    except Exception:
        # 没 numpy 时的快速兜底：按文件整体用大整数 XOR（C 层位运算，比逐字节循环快几个量级）
        key = (KEY * (n // len(KEY) + 1))[:n]
        return (int.from_bytes(data, 'big') ^ int.from_bytes(key, 'big')).to_bytes(n, 'big')

def main():
    if not os.path.isdir(SRC):
        raise SystemExit('在仓库根目录运行：找不到 game/')
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    # 拷贝（跳过废图目录）
    for name in sorted(os.listdir(SRC)):
        p = os.path.join(SRC, name)
        if name in DROP_DIRS:
            print('  剔除废图目录', name); continue
        if not KEEP_TEST and (name in TEST_ONLY_DIRS or name in TEST_ONLY_JS):
            print('  只进测试版，正式版不带：', name); continue
        if os.path.isdir(p):
            shutil.copytree(p, os.path.join(OUT, name))
        else:
            shutil.copy2(p, os.path.join(OUT, name))
    # 剔除用不到的子目录 / 文件
    dn = 0; db = 0
    for sub in DROP_SUB:
        q = os.path.join(OUT, sub)
        if os.path.isdir(q):
            for r, _, fs in os.walk(q):
                for f in fs: dn += 1; db += os.path.getsize(os.path.join(r, f))
            shutil.rmtree(q)
    for rel in DROP_FILES:
        q = os.path.join(OUT, rel)
        if os.path.isfile(q): dn += 1; db += os.path.getsize(q); os.remove(q)
    print('  剔除用不到的素材 %d 个，%.0f MB' % (dn, db / 1048576))
    # 去测试面板
    idx = open(os.path.join(SRC, 'index.html'), encoding='utf8').read()
    idx = strip_test_panel(idx)
    import re
    pat = '|'.join([re.escape(d) + r'/[^"?]+' for d in sorted(TEST_ONLY_DIRS)] + [re.escape(j) for j in TEST_ONLY_JS])
    k = 0
    if not KEEP_TEST: idx, k = re.subn(r'<script src="(?:' + pat + r')(?:\?v=\d+)?"></script>', '', idx)
    print('  去掉只进测试版的脚本标签', k, '个')
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf8').write(idx)
    print('  已去除测试面板，index.html', len(idx.encode('utf8')), '字节')
    # 加扰
    n = 0; tot = 0
    if SCRAMBLE:
        for r, _, fs in os.walk(OUT):
            for f in fs:
                fp = os.path.join(r, f)
                data = open(fp, 'rb').read()
                open(fp, 'wb').write(xor_bytes(data))
                n += 1; tot += len(data)
        print('  已加扰', n, '个文件，%.0f MB' % (tot / 1048576))
    else:
        print('  （--no-scramble：未加扰）')
    print('正式版构建完成 →', OUT)

if __name__ == '__main__':
    main()
