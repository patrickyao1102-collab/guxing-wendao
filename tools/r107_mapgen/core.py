# 地图拼装器：地面纹理轰炸 + 路径遮罩 + 物件放置（按脚底排序）+ 碰撞 + 出口
import json, math, random, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops
from scipy import ndimage

S = '/tmp/claude-0/-home-claude/baf236c7-415a-5521-8757-82f2e7fbf4fc/scratchpad'
GAME = '/home/claude/guxing-wendao/game'
R61 = S + '/r62/assets/cangyue_r61/'
OUT = S + '/mg/out'
os.makedirs(OUT, exist_ok=True)

# ---------------- 源素材 ----------------
_atlas = None; _pages = {}
def cx_img(k):
    global _atlas
    if _atlas is None:
        s = open(GAME + '/index.html', encoding='utf-8').read(); i = s.index('const CX2ATLAS = ') + len('const CX2ATLAS = ')
        _atlas, _ = json.JSONDecoder().raw_decode(s[i:])
    e = _atlas['map'][k]
    if e[0] not in _pages: _pages[e[0]] = Image.open(f'{GAME}/cx2/atlas_{e[0]}.webp').convert('RGBA')
    return _pages[e[0]].crop((e[1], e[2], e[1] + e[3], e[2] + e[4]))

# 名字 → (来源, 键, 目标高度或缩放, 类别)
# 类别：tree 树(脚底小圆碰撞) / big 建筑(底部矩形碰撞) / prop 物件 / flat 平贴(无碰撞，压在地上) / small 小物(烘进地面)
REG = {}
def reg(name, src, key, h=None, kind='prop', foot=None, tint=None):
    REG[name] = dict(src=src, key=key, h=h, kind=kind, foot=foot, tint=tint)
# 旧图里已经在用的（尺寸就是游戏里的尺寸）
for n, k, kind in [
    ('pine', 'pine_tree_3c1ea1', 'tree'), ('pine_big', 'pine_tree_e07b4a', 'tree'), ('pine_lush', 'pine_lush_36eb22', 'tree'), ('pine_lush_big', 'pine_lush_1cd0b4', 'tree'),
    ('maple', 'maple_sunlit_9469c4', 'tree'), ('birch', 'birch_sunlit_7e3765', 'tree'), ('scholar', 'scholar_tree_b1c619', 'tree'), ('scholar_big', 'scholar_tree_c773c7', 'tree'),
    ('willow', 'willow_34cd32', 'tree'), ('willow_big', 'willow_9c3320', 'tree'), ('peach', 'peach_tree_648fdc', 'tree'), ('peach_big', 'peach_tree_95f3bd', 'tree'),
    ('tj_pine', 'tj_pine_ancient_0bb8c9', 'tree'), ('cypress_s', 'tree_cypress_r2_b7f992', 'tree'), ('osmanthus_s', 'tree_osmanthus_r2_8962c1', 'tree'), ('scholar_r2', 'tree_scholar_r2_d28b38', 'tree'),
    ('dead_tree', 'dead_tree_5ec999', 'tree'),
    ('bamboo', 'bamboo_e544d4', 'tree'), ('bamboo_tall', 'route_bamboo_tall_f13a20', 'tree'), ('bamboo_sun', 'route_bamboo_sun_45a1f1', 'tree'), ('bamboo_soft', 'route_bamboo_soft_f87872', 'tree'),
    ('shrub', 'shrub_a8d5df', 'small'), ('shrub2', 'shrub_8a1978', 'small'), ('shrub_big', 'shrub_eb5085', 'small'), ('fern', 'forest_fern_555d90', 'small'), ('mush', 'forest_mushrooms_10430a', 'small'),
    ('flowers1', 'flowers_01_b1076b', 'small'), ('flowers2', 'flowers_02_72ba90', 'small'), ('flowers3', 'flowers_03_e71ebe', 'small'), ('flowers4', 'flowers_04_2ae2c4', 'small'),
    ('grass1', 'grass_clump_01_4ddf5a', 'small'), ('grass2', 'grass_clump_02_34cfd5', 'small'), ('grass3', 'grass_clump_03_c4daca', 'small'), ('grass4', 'grass_clump_04_e94253', 'small'),
    ('fern_flowers', 'route_fern_flowers_4b9711', 'small'), ('reeds', 'reed_cluster_04ca79', 'prop'), ('stump', 'forest_stump_11ca13', 'prop'),
    ('rock1', 'rock_01_29815b', 'prop'), ('rock2', 'rock_02_b031bf', 'prop'), ('rock3', 'rock_03_87d3a6', 'prop'), ('rock1b', 'rock_01_cca70e', 'prop'), ('rock2b', 'rock_02_393a8d', 'prop'), ('rock3b', 'rock_03_b00d34', 'prop'),
    ('cliff', 'cliff_outcrop_403ea9', 'big'), ('cliff_corner', 'cliff_corner_d5e050', 'big'), ('cliff_high', 'cliff_high_696d76', 'big'), ('crag', 'valley_crag_7c1398', 'big'),
    ('bank_high', 'route_bank_high_d356d6', 'big'), ('bank_low', 'route_bank_low_a6a3bd', 'flat'), ('bank_step', 'route_bank_step_76044f', 'big'),
    ('waterfall', 'waterfall_4173aa', 'big'), ('pond', 'natural_pond_7c88e2', 'flat'), ('pond_big', 'pond_80cbbe', 'flat'),
    ('lantern_stone', 'wild_stone_lantern_r3_1d1754', 'prop'), ('lantern_wood', 'wild_wood_lantern_r3_5a5f30', 'prop'), ('lantern_bamboo', 'wild_bamboo_lantern_r3_4d0005', 'prop'),
    ('waypost', 'forest_waypost_586dec', 'prop'), ('boundary', 'boundary_stone_1e2968', 'prop'), ('shrine', 'forest_shrine_7ad450', 'prop'), ('campfire', 'campfire_722a18', 'prop'),
    ('firewood', 'firewood_fbc84a', 'prop'), ('crystal', 'spirit_crystal_720b67', 'prop'), ('lamp_low', 'route_lamp_low_4464d8', 'prop'), ('lamp_tall', 'lamp_tall_6d38fc', 'prop'),
    ('bones', 'bones_weapons_55f289', 'prop'), ('crow', 'crow_ground_4927f0', 'small'), ('banner_broken', 'broken_banner_33f6f3', 'prop'), ('brazier', 'brazier_f5ff1a', 'prop'),
    ('house1', 'house_01_d1dada', 'big'), ('house2', 'house_02_6c8324', 'big'), ('house3', 'house_03_69fff5', 'big'), ('tea_house', 'tea_house_4879bc', 'big'), ('pharmacy', 'pharmacy_7c0f58', 'big'),
    ('general_store', 'general_store_4f4528', 'big'), ('blacksmith', 'blacksmith_9704a0', 'big'), ('inn', 'inn_688859', 'big'), ('restaurant', 'restaurant_682c57', 'big'), ('guest_house', 'guest_house_14bac2', 'big'),
    ('city_wall', 'city_wall_straight_925626', 'big'), ('city_gate', 'city_gate_29e6c6', 'big'), ('paifang', 'paifang_d353e0', 'big'), ('watchtower', 'watchtower_671845', 'big'),
    ('cwall_h', 'courtyard_wall_horizontal_6703ae', 'big'), ('cwall_v', 'courtyard_wall_vertical_8a06b3', 'big'),
    ('lantern_pole', 'lantern_pole_4eab69', 'prop'), ('wine_flag', 'wine_flag_315ba8', 'prop'), ('notice', 'notice_board_16990c', 'prop'), ('well', 'well_73cae8', 'prop'),
    ('crates', 'crate_stack_037d51', 'prop'), ('sacks', 'cargo_sacks_262b04', 'prop'), ('handcart', 'handcart_379f34', 'prop'), ('haystack', 'haystack_e0bf03', 'prop'), ('water_jar', 'water_jar_02c90d', 'prop'),
    ('wine_jars', 'wine_jars_57e630', 'prop'), ('drying_rack', 'drying_rack_da34fe', 'prop'), ('herb_trays', 'herb_trays_53f9a3', 'prop'), ('flowerbed', 'flowerbed_d0c716', 'prop'), ('flowerbed_s', 'flowerbed_d88be6', 'prop'),
    ('food_stall', 'food_stall_01_7f356d', 'prop'), ('food_stall2', 'food_stall_02_03a26c', 'prop'), ('weapon_stall', 'weapon_stall_2a0ab8', 'prop'), ('stone_lion', 'stone_lion_cd4cc8', 'prop'),
    ('stone_tea', 'stone_tea_table_6fa87d', 'prop'), ('bamboo_chair', 'bamboo_chair_8fd6b2', 'prop'), ('incense', 'incense_burner_4db9e4', 'prop'), ('red_pillar', 'red_pillar_98c060', 'prop'),
    ('bamboo_fence', 'bamboo_fence_4337b2', 'prop'), ('stone_rail', 'plain_stone_rail_1e489b', 'prop'), ('stone_steps', 'stone_steps_b38cfb', 'flat'), ('marker', 'marker_8ce492', 'prop'),
    ('prison_cage', 'prison_cage_03253b', 'prop'), ('weapon_rack', 'weapon_rack_cf185a', 'prop'), ('palisade', 'palisade_horizontal_f102cc', 'big'),
    ('tea_table', 'tea_table_273b8d', 'prop'), ('taishi', 'taishi_chair_0ea123', 'prop'), ('screen', 'folding_screen_a580b8', 'prop'), ('curio', 'curio_shelf_0e07f3', 'prop'),
    ('cabinet', 'plain_cabinet_29ac60', 'prop'), ('canopy_bed', 'canopy_bed_377535', 'prop'), ('bed_heir', 'bedroom_heir_bed_r6_d5a378', 'prop'), ('wardrobe', 'bedroom_wardrobe_r6_180940', 'prop'),
    ('desk', 'bedroom_study_desk_r6_6a0e9d', 'prop'), ('desk_chair', 'bedroom_study_chair_r6_0b5353', 'prop'), ('pot_bamboo', 'bedroom_potted_bamboo_r6_9c0241', 'prop'), ('stand_lamp', 'bedroom_standing_lamp_r6_9d453f', 'prop'),
    ('meditation_mat', 'bedroom_meditation_mat_r6_5557b6', 'flat'), ('silk_screen', 'bedroom_silk_screen_r6_085a0e', 'prop'), ('bookcase', 'bedroom_bookcase_r6_a2adba', 'prop'), ('tea_set', 'bedroom_tea_set_r6_0f7a31', 'prop'),
    ('jade_rug', 'bedroom_jade_rug_r6_8b986e', 'flat'), ('indoor_lamp', 'tianjian_indoor_lamp_r2_ac55d2', 'prop'), ('painting1', 'painting_nine_stars_r6_fdc358', 'prop'), ('painting2', 'painting_sea_rift_r6_3b14e6', 'prop'),
    ('scroll_shelf', 'shelf_scroll_r2_629dc5', 'prop'), ('shelf_wide', 'shelf_wide_r2_301032', 'prop'), ('elder_chair', 'elder_armchair_r43_3e9d26', 'prop'), ('governor_seat', 'governor_seat_r34_bff1ca', 'prop'),
    ('court_lamp', 'tianjian_court_lamp_r2_1ead4d', 'prop'), ('bronze_lantern', 'front_v7_bronze_lantern_3d7a3b', 'prop'), ('ding', 'front_v10_bronze_ding_painted_5a81e7', 'prop'),
    ('memorial_stele', 'tj_memorial_stele_7274df', 'prop'), ('jade_stele', 'xt_jade_stele_r18_0db95e', 'prop'), ('rock_single', 'front_v6_rock_single_417fbf', 'prop'), ('flower_rock', 'tj_flower_rock', 'prop'),
    ('sutras', 'hanging_sutras_r4_6a7800', 'prop'), ('stove', 'brick_stove_bf0c06', 'prop'), ('kitchen_door', 'kitchen_door_a943e3', 'prop'), ('stairs_in', 'interior_stairs_be7ec2', 'prop'),
    ('sleep_desk', 'sleeping_guard_desk_7060a5', 'prop'), ('bamboo_garden', 'bamboo_garden_r2_2b93e9', 'prop'), ('bamboo_young', 'bamboo_young_r2_dd4928', 'small'),
]:
    reg(n, 'cx', k, None, kind)
# 苍月 R61 新素材：按游戏比例缩到合适高度（人物 ~110px）
for n, h, kind in [
    ('tree_albizia', 300, 'tree'), ('tree_banyan_ancient', 330, 'tree'), ('tree_camphor_ancient', 360, 'tree'), ('tree_cherry', 290, 'tree'), ('tree_cypress_ancient', 350, 'tree'),
    ('tree_ginkgo', 320, 'tree'), ('tree_jujube', 280, 'tree'), ('tree_magnolia', 300, 'tree'), ('tree_maple', 290, 'tree'), ('tree_mulberry', 280, 'tree'), ('tree_osmanthus', 290, 'tree'),
    ('tree_pear', 290, 'tree'), ('tree_persimmon', 300, 'tree'), ('tree_plum', 280, 'tree'), ('tree_pomegranate', 280, 'tree'), ('tree_willow', 300, 'tree'),
    ('yy_tree', 340, 'tree'), ('yy_arch', 330, 'big'), ('yy_herbs', 100, 'small'),
    ('spirit_bellvine', 200, 'tree'), ('spirit_crystal_tree', 240, 'tree'), ('spirit_coral_shrub', 110, 'prop'), ('spirit_fan_shroom', 150, 'prop'), ('spirit_fern_arch', 170, 'prop'),
    ('spirit_lantern_bloom', 150, 'prop'), ('spirit_lotus_giant', 150, 'prop'), ('spirit_ribbon_orchid', 140, 'prop'), ('spirit_star_grass', 70, 'small'), ('spirit_blue_moss', 70, 'flat'),
    ('wonder_leaf_arch', 300, 'big'), ('wonder_lotus_crown', 260, 'tree'), ('wonder_root_bridge', 170, 'flat'), ('wonder_star_tree', 320, 'tree'),
    ('detail_fern_fan', 70, 'small'), ('detail_fern_redtip', 66, 'small'), ('detail_sacred_fern', 72, 'small'), ('detail_flowers_blue', 40, 'small'), ('detail_flowers_gold', 40, 'small'),
    ('detail_orchid_white', 70, 'small'), ('detail_mushroom_amber', 70, 'prop'), ('detail_mushroom_ivory', 50, 'small'), ('detail_ivy_mound', 50, 'small'), ('detail_root_hollow', 46, 'small'),
    ('detail_root_knotted', 40, 'small'), ('detail_fallen_log', 56, 'prop'), ('detail_forest_nest', 60, 'small'), ('detail_forest_stone_marker', 130, 'prop'), ('detail_camp_wardstone', 100, 'prop'),
    ('detail_camp_bedroll', 70, 'prop'), ('detail_camp_cookpot', 104, 'prop'), ('detail_spirit_amber_reeds', 110, 'prop'), ('detail_spirit_floating_bud', 110, 'prop'), ('detail_spirit_frost_fruit', 104, 'prop'),
    ('detail_spirit_seed_pod', 110, 'prop'), ('detail_spirit_shell_flower', 80, 'prop'), ('detail_spirit_violet_cluster', 64, 'small'),
    ('detail_old_stone_lamp', 120, 'prop'), ('detail_offering_bowl', 64, 'prop'), ('detail_ritual_basin', 80, 'prop'), ('detail_hanging_censer', 150, 'prop'), ('detail_old_rope_bell', 120, 'prop'),
    ('detail_lotus_relief', 70, 'prop'), ('detail_scroll_stone', 64, 'prop'), ('detail_ruined_pillar', 150, 'prop'), ('detail_fallen_column', 54, 'prop'), ('detail_ruined_rail', 64, 'prop'),
    ('detail_bamboo_broom', 90, 'prop'), ('detail_flower_planter', 96, 'prop'), ('detail_rain_barrel', 84, 'prop'), ('detail_pickle_crocks', 80, 'prop'), ('detail_rice_barrels', 80, 'prop'),
    ('detail_storage_vessels', 90, 'prop'), ('detail_vegetable_baskets', 84, 'prop'), ('detail_fish_basket', 92, 'prop'), ('detail_firewood_shed', 120, 'prop'), ('detail_laundry_line', 110, 'prop'),
    ('detail_noodle_rack', 90, 'prop'), ('detail_street_bench', 48, 'prop'), ('detail_bean_curd_stand', 130, 'prop'), ('detail_shoe_stall', 90, 'prop'), ('detail_cloth_stand', 110, 'prop'),
    ('detail_old_wheelbarrow', 76, 'prop'), ('detail_wooden_ladder', 96, 'prop'), ('detail_wall_sconce', 150, 'prop'), ('detail_well_grille', 90, 'prop'), ('detail_ritual_bookstand', 110, 'prop'),
    ('detail_sealed_coffer', 76, 'prop'), ('detail_stone_sarcophagus', 70, 'prop'), ('detail_chain_anchor', 70, 'prop'), ('detail_chain_pile', 50, 'small'), ('detail_rust_grate', 40, 'flat'),
    ('detail_rune_floor_shard', 60, 'flat'), ('detail_rune_obelisk', 170, 'prop'), ('detail_cell_partition', 90, 'prop'), ('detail_broken_weapon_rack', 100, 'prop'), ('detail_mortar_cracks', 40, 'flat'),
    ('detail_ruined_door', 150, 'prop'),
    ('nw_temple', 300, 'big'), ('nw_falls', 300, 'big'), ('nw_pool', 210, 'flat'), ('temple_bell', 170, 'big'), ('temple_bench', 56, 'prop'), ('temple_stele', 140, 'prop'), ('temple_wall', 104, 'big'),
    ('temple_roof_rubble', 70, 'prop'), ('statue_border', 66, 'prop'), ('broken_altar', 96, 'prop'),
    ('cy_gate', 240, 'big'), ('cy_house', 290, 'big'), ('cy_manor', 230, 'big'), ('cy_manor_gallery', 180, 'big'), ('cy_manor_gate', 250, 'big'), ('cy_manor_hall', 280, 'big'),
    ('cy_manor_lantern', 180, 'prop'), ('cy_manor_wall', 104, 'big'), ('cy_manor_wing', 240, 'big'),
    ('old_city_well', 120, 'prop'), ('old_guest_bed', 140, 'prop'), ('old_guest_desk', 110, 'prop'), ('old_market_booth', 140, 'prop'),
    ('xx_altar', 230, 'big'), ('xx_entry', 200, 'big'), ('xx_pillar', 200, 'prop'), ('xx_wall', 150, 'big'),
    ('dungeon_chain_rack', 150, 'prop'), ('dungeon_sigil', 260, 'flat'), ('dungeon_stair', 170, 'big'),
]:
    reg(n, 'r61', n, h, kind)
for i, n in enumerate(['bless', 'farewell', 'grief', 'guard', 'listen', 'mend', 'moon', 'mourn', 'return', 'seal', 'shelter', 'shrine', 'stars', 'teach', 'vow', 'wind']):
    reg('nw_' + n, 'r61', 'nw_' + n, 230, 'prop')
for n, f, h, kind in [('bamboo_dense', 'library/objects/bamboo_dense_r15', None, 'tree'), ('bamboo_ink', 'library/objects/bamboo_ink_r15', None, 'tree'), ('bamboo_bowed', 'library/objects/bamboo_bowed_r15', None, 'tree'),
                      ('bamboo_tall15', 'library/objects/bamboo_tall_r15', None, 'tree'), ('bamboo_young15', 'library/objects/bamboo_young_r15', None, 'prop'),
                      ('mossrock', 'library/objects/forest_mossrock_r15', 120, 'prop'), ('forest_reeds', 'library/objects/forest_reeds_r15', None, 'small'), ('forest_stairs', 'batch2/objects/forest_stairs', None, 'flat')]:
    reg(n, 'pk', S + '/r62/packs/' + f + '.png', h, kind)

_cache = {}
def asset(name):
    """返回游戏尺寸的 RGBA 图（裁掉透明边）+ 脚底锚点。"""
    if name in _cache: return _cache[name]
    r = REG[name]
    if r['src'] == 'cx': im = cx_img(r['key'])
    elif r['src'] == 'r61': im = Image.open(R61 + r['key'] + '.png').convert('RGBA')
    else: im = Image.open(r['key']).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if bb: im = im.crop(bb)
    if r['h']:
        s = r['h'] / im.height; im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    if r.get('tint'): im = tint_img(im, r['tint'])
    a = np.asarray(im.getchannel('A')) > 60
    rows = np.where(a.any(1))[0]; bot = rows[-1] if len(rows) else im.height - 1
    band = a[max(0, int(bot - im.height * .08)):bot + 1]
    xs = np.where(band.any(0))[0]
    ax = (xs[0] + xs[-1]) / 2 if len(xs) else im.width / 2
    _cache[name] = (im, ax, bot)
    return _cache[name]

# ---------------- 噪声 ----------------
def fbm(w, h, scale, oct=4, seed=0):
    rng = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(oct):
        gw, gh = max(2, int(w / scale) + 2), max(2, int(h / scale) + 2)
        g = rng.random((gh, gw)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((int(gw * scale), int(gh * scale)), Image.BICUBIC)
        out += np.asarray(im, np.float32)[:h, :w] / 255 * amp; tot += amp; amp *= .5; scale /= 2
        if scale < 2: break
    return out / tot

def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1); return t * t * (3 - 2 * t)

# ---------------- 地面纹理 ----------------
PATCH = json.load(open(S + '/mg/patches.json'))
_src = {}
def srcimg(k):
    if k not in _src: _src[k] = Image.open(f'{GAME}/cx2/g_{k}.webp').convert('RGB')
    return _src[k]
def patches(kind):
    if kind == 'grass': return [srcimg('qingzhu_bamboo').crop((x, y, x + 160, y + 160)) for x, y in PATCH['q_grass']]
    if kind == 'dirt': return [srcimg('lin_forest').crop((x, y, x + 128, y + 128)) for x, y in PATCH['l_dirt']]
    raise KeyError(kind)

_feather = {}
def feather(sz):
    if sz not in _feather:
        y, x = np.mgrid[0:sz, 0:sz]; d = np.hypot(x - sz / 2 + .5, y - sz / 2 + .5) / (sz / 2)
        _feather[sz] = Image.fromarray((smooth(1 - d, 0, .45) * 255).astype(np.uint8))
    return _feather[sz]

def bomb(w, h, pats, step=None, seed=1, tint=None):
    rng = random.Random(seed); sz = pats[0].width; step = step or int(sz * .42)
    base = Image.new('RGB', (w, h));
    # 先平铺一遍兜底，再随机盖满羽化补丁
    for y in range(0, h, sz):
        for x in range(0, w, sz): base.paste(rng.choice(pats), (x, y))
    m = feather(sz)
    for y in range(-sz // 2, h, step):
        for x in range(-sz // 2, w, step):
            p = rng.choice(pats)
            if rng.random() < .5: p = p.transpose(Image.FLIP_LEFT_RIGHT)
            if rng.random() < .5: p = p.transpose(Image.ROTATE_180)
            base.paste(p, (x + rng.randint(-step // 2, step // 2), y + rng.randint(-step // 2, step // 2)), m)
    return base

def tile_tex(path, w, h, scale=1.0):
    t = Image.open(path).convert('RGB')
    if scale != 1: t = t.resize((round(t.width * scale), round(t.height * scale)), Image.LANCZOS)
    out = Image.new('RGB', (w, h))
    for y in range(0, h, t.height):
        for x in range(0, w, t.width): out.paste(t, (x, y))
    return out

def grade(im, bright=1.0, sat=1.0, mul=(1, 1, 1), contrast=1.0):
    if sat != 1: im = ImageEnhance.Color(im).enhance(sat)
    if contrast != 1: im = ImageEnhance.Contrast(im).enhance(contrast)
    a = np.asarray(im, np.float32) * bright * np.array(mul, np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def blend(base, top, alpha):
    """alpha: float32 HxW 0..1"""
    A = np.asarray(base, np.float32); B = np.asarray(top, np.float32); a = alpha[..., None]
    return Image.fromarray(np.clip(A * (1 - a) + B * a, 0, 255).astype(np.uint8))

def mulmap(im, m):
    A = np.asarray(im, np.float32) * m[..., None]
    return Image.fromarray(np.clip(A, 0, 255).astype(np.uint8))

# ---------------- 地图 ----------------
CS = 16
class Map:
    def __init__(s, id, title, w, h, mode='closed', seed=7):
        s.id, s.title, s.w, s.h, s.mode = id, title, w, h, mode
        s.rng = random.Random(seed); s.seed = seed
        s.walk = Image.new('L', (w, h), 0)      # 可走区域（closed 模式）
        s.nowalk = Image.new('L', (w, h), 0)    # 强制不可走（open 模式）
        s.dirt = Image.new('L', (w, h), 0)      # 土路遮罩
        s.pave = Image.new('L', (w, h), 0)      # 石板遮罩
        s.objs = []; s.decals = []; s.shadows = []; s.exits = []; s.spots = {}; s.chests = []; s.zones = []; s.lights = []
        s.ground = None
        s.noplant = Image.new('L', (w, h), 0)   # 水面等：不种树不撒东西

    # ---- 形状 ----
    def _stroke(s, layers, pts, width, wobble=.22, step=8):
        n = fbm(4096, 1, 300, 3, seed=s.rng.randint(0, 9999))[0]
        dr = [ImageDraw.Draw(L) for L in layers]; k = 0
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L = math.hypot(x1 - x0, y1 - y0); m = max(1, int(L / step))
            for i in range(m + 1):
                t = i / m; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
                r = width / 2 * (1 + wobble * (n[k % 4096] * 2 - 1)); k += 3
                for d in dr: d.ellipse((x - r, y - r, x + r, y + r), fill=255)
    def path(s, pts, width, dirt=True, walk=True, pave=False, wobble=.22, walkextra=44, dk=.5):
        # width = 可走宽度；土路只占中间 dk 那么宽，两边是可走的草边
        pts = s.spline(pts)
        if dirt: s._stroke([s.dirt], pts, width * dk, wobble * 1.3)
        if pave: s._stroke([s.pave], pts, width * dk, wobble * .3)
        if walk: s._stroke([s.walk], pts, width + walkextra * 0, wobble * .5)
        return pts
    def spline(s, pts, n=12):
        if len(pts) < 3: return pts
        P = [pts[0]] + list(pts) + [pts[-1]]; out = []
        for i in range(1, len(P) - 2):
            p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
            for j in range(n):
                t = j / n; t2, t3 = t * t, t * t * t
                out.append(tuple(.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in range(2)))
        out.append(pts[-1]); return out
    def blob(s, cx, cy, rx, ry, dirt=.0, walk=True, pave=False, wob=.18):
        # 不规则椭圆空地
        pts = []; ph = s.rng.random() * 6
        for i in range(48):
            a = i / 48 * math.tau; k = 1 + wob * (math.sin(a * 3 + ph) * .6 + math.sin(a * 5 + ph * 2) * .4)
            pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
        if walk: ImageDraw.Draw(s.walk).polygon(pts, fill=255)
        if dirt: ImageDraw.Draw(s.dirt).polygon([(cx + (x - cx) * dirt, cy + (y - cy) * dirt) for x, y in pts], fill=255)
        if pave: ImageDraw.Draw(s.pave).polygon(pts, fill=255)
    def rect(s, x, y, w, h, walk=None, dirt=None, pave=None, nowalk=None):
        for L, v in ((s.walk, walk), (s.dirt, dirt), (s.pave, pave), (s.nowalk, nowalk)):
            if v is not None: ImageDraw.Draw(L).rectangle((x, y, x + w - 1, y + h - 1), fill=255 if v else 0)
    def poly(s, pts, walk=None, dirt=None, pave=None, nowalk=None):
        for L, v in ((s.walk, walk), (s.dirt, dirt), (s.pave, pave), (s.nowalk, nowalk)):
            if v is not None: ImageDraw.Draw(L).polygon(pts, fill=255 if v else 0)

    # ---- 物件 ----
    def place(s, name, x, y, sc=1.0, flip=None, foot=None, bake=None, dy=0, shadow=None, collide=True, sortdy=0):
        im, ax, bot = asset(name); r = REG[name]
        if flip is None: flip = s.rng.random() < .5 if r['kind'] in ('tree', 'small', 'prop') and name[:3] not in ('nw_',) else False
        w, h = im.width * sc, im.height * sc
        axx = (im.width - ax) if flip else ax
        o = dict(name=name, x=x - axx * sc, y=y - bot * sc + dy, w=w, h=h, sy=y + sortdy, flip=flip, sc=sc, fx=x, fy=y, kind=r['kind'], bake=bake)
        # 碰撞脚印 [x0,y0,x1,y1]
        k = r['kind']
        if foot is not None: o['foot'] = foot if foot is False else (x + foot[0], y + foot[1], x + foot[2], y + foot[3])
        elif not collide or k in ('small', 'flat'): o['foot'] = False
        elif k == 'tree': rw = max(16, min(46, w * .09)); o['foot'] = (x - rw, y - 16, x + rw, y + 6)
        elif k == 'big': o['foot'] = (o['x'] + w * .06, y - min(h * .45, 140), o['x'] + w * .94, y + 4)
        else: rw = max(12, w * .36); o['foot'] = (x - rw, y - max(10, min(36, h * .22)), x + rw, y + 4)
        if shadow is None: shadow = k in ('tree', 'big', 'prop')
        if shadow:
            sw = w * (.62 if k == 'tree' else .5 if k == 'prop' else .48)
            s.shadows.append((x, y - 4, sw, sw * (.28 if k == 'tree' else .22), .42 if k == 'tree' else .34))
        if k == 'flat': o['flat'] = True
        s.objs.append(o); return o
    def decal(s, name, x, y, sc=1.0, flip=None):
        return s.place(name, x, y, sc, flip, foot=False, bake=True, shadow=False)

    def walkmask(s):
        if s.mode == 'closed': w = np.asarray(s.walk) > 127
        else: w = np.ones((s.h, s.w), bool)
        return w & ~(np.asarray(s.nowalk) > 127)

    def dist_walk(s, step=8):
        wm = s.walkmask()[::step, ::step]
        return ndimage.distance_transform_edt(~wm) * step, step

    def forest(s, species, spacing=120, band=None, margin=26, jitter=.35, scale=(0.85, 1.12), under=True, region=None, edge_only=None, weights=None, mindist=None, maxcover=.14):
        """在不可走区域铺满树（泊松采样）。band=(d0,d1)：只在离可走区 d0~d1 像素之间种。"""
        D, st = s.dist_walk()
        H, W = D.shape; pts = []
        cell = spacing / math.sqrt(2); gw, gh = int(s.w / cell) + 2, int(s.h / cell) + 2; grid = {}
        cand = []
        for _ in range(int(s.w * s.h / spacing ** 2 * 6)):
            x, y = s.rng.uniform(-60, s.w + 60), s.rng.uniform(-40, s.h + 120)
            cand.append((x, y))
        for x, y in cand:
            yi, xi = int(min(H - 1, max(0, y / st))), int(min(W - 1, max(0, x / st)))
            d = D[yi, xi]
            if d < margin: continue
            if band and not (band[0] <= d <= band[1]): continue
            if region is not None and not region(x, y): continue
            if s.np_at(x, y): continue
            sp = spacing * (1 + (.25 if d > 300 else 0))
            gx, gy = int(x / cell), int(y / cell); ok = True
            for yy in range(gy - 2, gy + 3):
                for xx in range(gx - 2, gx + 3):
                    q = grid.get((xx, yy))
                    if q and math.hypot(q[0] - x, q[1] - y) < sp * (1 - jitter * .5): ok = False; break
                if not ok: break
            if not ok: continue
            grid[(gx, gy)] = (x, y); pts.append((x, y, d))
        cov = s.cover_fn()
        out = []
        for x, y, d in pts:
            for _ in range(4):
                nm = s.rng.choices(species, weights=weights)[0] if weights else s.rng.choice(species)
                sc = s.rng.uniform(*scale); im, ax, bot = asset(nm); w, h = im.width * sc, im.height * sc
                # 树冠别把路盖住：树冠范围里可走区占比太大就换小树/放弃
                if cov(x - w * .42, y - h * .95, x + w * .42, y - 20) <= maxcover: break
            else: continue
            s.place(nm, x, y, sc); out.append((x, y, d))
        return out

    def cover_fn(s):
        wm = (s.walkmask() | (np.asarray(s.noplant) > 0))[::8, ::8].astype(np.float32); I = np.pad(wm.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
        def f(x0, y0, x1, y1):
            a0, b0 = max(0, int(x0 / 8)), max(0, int(y0 / 8)); a1, b1 = min(wm.shape[1], int(x1 / 8) + 1), min(wm.shape[0], int(y1 / 8) + 1)
            if a1 <= a0 or b1 <= b0: return 0
            return (I[b1, a1] - I[b0, a1] - I[b1, a0] + I[b0, a0]) / ((a1 - a0) * (b1 - b0))
        return f

    def scatter(s, names, n, cond, sc=(0.8, 1.15), decal=True, weights=None, tries=40):
        k = 0
        for _ in range(n * tries):
            if k >= n: break
            x, y = s.rng.uniform(0, s.w), s.rng.uniform(0, s.h)
            if not cond(x, y) or s.np_at(x, y): continue
            nm = s.rng.choices(names, weights=weights)[0] if weights else s.rng.choice(names)
            if decal: s.decal(nm, x, y, s.rng.uniform(*sc))
            else: s.place(nm, x, y, s.rng.uniform(*sc))
            k += 1

    def np_at(s, x, y):
        if not hasattr(s, '_np') or s._np is None: s._np = np.asarray(s.noplant.filter(ImageFilter.MaxFilter(9)) if False else s.noplant) > 0
        xi, yi = int(min(s.w - 1, max(0, x))), int(min(s.h - 1, max(0, y))); return bool(s._np[yi, xi])
    def is_walk(s, x, y):
        if x < 0 or y < 0 or x >= s.w or y >= s.h: return False
        return bool(s.walkmask()[int(y), int(x)]) if not hasattr(s, '_wm') else bool(s._wm[int(y), int(x)])
    def freeze(s):
        s._np = None
        s._wm = s.walkmask(); D, st = s.dist_walk(); s._D, s._st = D, st
    def dw(s, x, y):
        H, W = s._D.shape; return s._D[int(min(H - 1, max(0, y / s._st))), int(min(W - 1, max(0, x / s._st)))]
    def near_walk_edge(s, x, y, d0, d1):
        return d0 <= s.dw(x, y) <= d1
    # 可走区内离边界的距离
    def inner(s):
        wm = s.walkmask()[::8, ::8]; return ndimage.distance_transform_edt(wm) * 8
    def din(s, x, y):
        if not hasattr(s, '_DI'): s._DI = s.inner()
        H, W = s._DI.shape; return s._DI[int(min(H - 1, max(0, y / 8))), int(min(W - 1, max(0, x / 8)))]

    def maze(s, x0, y0, x1, y1, nx, ny, width=150, extra=.35, keep=(), drop=.0):
        # 抖动网格上的节点 → 随机生成树 + 额外的边（成环）→ 每条边一段弯路
        rng = s.rng; N = {}
        for j in range(ny):
            for i in range(nx):
                N[(i, j)] = (x0 + (x1 - x0) * (i + .5 + rng.uniform(-.28, .28)) / nx, y0 + (y1 - y0) * (j + .5 + rng.uniform(-.28, .28)) / ny)
        for k, p in keep: N[k] = p
        E = []; seen = {(0, 0)}; frontier = [((0, 0), n) for n in [(1, 0), (0, 1)]]
        while frontier:
            a, b = frontier.pop(rng.randrange(len(frontier)))
            if b in seen or b not in N: continue
            seen.add(b); E.append((a, b))
            for d in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                c = (b[0] + d[0], b[1] + d[1])
                if c in N and c not in seen: frontier.append((b, c))
        for a in N:
            for d in [(1, 0), (0, 1)]:
                b = (a[0] + d[0], a[1] + d[1])
                if b in N and (a, b) not in E and (b, a) not in E and rng.random() < extra: E.append((a, b))
        for a, b in E:
            (ax, ay), (bx, by) = N[a], N[b]; mx, my = (ax + bx) / 2, (ay + by) / 2; L = math.hypot(bx - ax, by - ay)
            nxv, nyv = -(by - ay) / L, (bx - ax) / L; o = rng.uniform(-.22, .22) * L
            s.path([(ax, ay), (mx + nxv * o, my + nyv * o), (bx, by)], width * rng.uniform(.85, 1.1))
        deg = {k: 0 for k in N}
        for a, b in E: deg[a] += 1; deg[b] += 1
        s.mz_nodes, s.mz_edges, s.mz_deg = N, E, deg
        return N, E

    def exit(s, to, label, rect, spawn, face='down', arrow=None):
        s.exits.append(dict(to=to, label=label, rect=rect, spawn=spawn, face=face, arrow=arrow))
        x, y, w, h = rect; s.rect(x, y, w, h, walk=True)

    # ---- 烘焙 ----
    def paint_ground(s, base, dirt_tex=None, pave_tex=None, dirt_edge=.5, pave_edge=.1, dirt_rim=.22, extra=None):
        w, h = s.w, s.h
        g = base
        if dirt_tex is not None and np.asarray(s.dirt).any():
            m = np.asarray(s.dirt.resize((w // 4, h // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(5)).resize((w, h), Image.BILINEAR), np.float32) / 255
            n = fbm(w, h, 48, 4, seed=s.seed + 3)
            a = smooth(m + (n - .5) * dirt_edge * 2, .4, .6)
            dv = fbm(w, h, 70, 3, seed=s.seed + 13)
            dirt_tex = mulmap(dirt_tex, .86 + .26 * dv)
            g = blend(g, dirt_tex, a)
            rim = np.clip(a * (1 - a) * 4, 0, 1)
            g = mulmap(g, 1 - dirt_rim * rim)
        if pave_tex is not None and np.asarray(s.pave).any():
            m = np.asarray(s.pave.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
            n = fbm(w, h, 60, 3, seed=s.seed + 5)
            a = smooth(m + (n - .5) * pave_edge * 2, .35, .65)
            g = blend(g, pave_tex, a)
            rim = np.clip(a * (1 - a) * 4, 0, 1); g = mulmap(g, 1 - .25 * rim)
        if extra: g = extra(g)
        s.ground = g

    def bake(s, darken_far=None, vignette=0):
        """影子 + 平贴物件 + 远离可走区的物件烘进地面；返回剩下的动态物件。"""
        g = s.ground.convert('RGBA'); w, h = s.w, s.h
        # 影子
        sh = Image.new('L', (w, h), 0); d = ImageDraw.Draw(sh)
        for x, y, rw, rh, a in s.shadows: d.ellipse((x - rw / 2, y - rh / 2, x + rw / 2, y + rh / 2), fill=int(255 * a))
        sh = sh.filter(ImageFilter.GaussianBlur(14))
        dark = np.asarray(sh, np.float32) / 255
        mul = 1 - dark * .75
        if darken_far is not None: mul *= darken_far
        if vignette:
            yy, xx = np.mgrid[0:h, 0:w]; v = np.hypot((xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)); mul *= 1 - vignette * smooth(v, .7, 1.4)
        A = np.asarray(g, np.float32); A[..., :3] *= mul[..., None]; g = Image.fromarray(np.clip(A, 0, 255).astype(np.uint8))
        # 决定哪些物件可以烘进地面：图像范围（外扩人物身高）碰不到可走区，且没有被动态物件盖住的
        wm = s.walkmask(); ii = ndimage.binary_dilation(wm[::8, ::8], iterations=1)
        integ = np.pad(ii.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
        def touches(x0, y0, x1, y1):
            a0, b0 = max(0, int(x0 / 8)), max(0, int(y0 / 8)); a1, b1 = min(ii.shape[1], int(x1 / 8) + 1), min(ii.shape[0], int(y1 / 8) + 1)
            if a1 <= a0 or b1 <= b0: return False
            return (integ[b1, a1] - integ[b0, a1] - integ[b1, a0] + integ[b0, a0]) > 0
        for o in s.objs:
            if o['bake'] is None:
                if o['kind'] == 'flat' or o['kind'] == 'small': o['bake'] = True
                else: o['bake'] = not touches(o['x'] - 20, o['y'] - 20, o['x'] + o['w'] + 20, o['sy'] + 130)
        # 被动态物件压住的烘焙物件 → 也改成动态（否则会画在上面错层）
        changed = True
        while changed:
            changed = False; dyn = [o for o in s.objs if not o['bake'] and not o.get('flat')]
            for o in s.objs:
                if not o['bake'] or o['kind'] in ('small', 'flat') or o.get('flat'): continue
                for q in dyn:
                    if q['sy'] < o['sy'] and q['x'] < o['x'] + o['w'] and q['x'] + q['w'] > o['x'] and q['y'] < o['y'] + o['h'] and q['y'] + q['h'] > o['y']:
                        o['bake'] = False; changed = True; break
        order = sorted([o for o in s.objs if o['bake']], key=lambda o: (0 if o.get('flat') else 1, o['sy']))
        for o in order:
            im = asset(o['name'])[0]
            if o['flip']: im = im.transpose(Image.FLIP_LEFT_RIGHT)
            if o['sc'] != 1: im = im.resize((max(1, round(o['w'])), max(1, round(o['h']))), Image.LANCZOS)
            if o.get('tint'): im = tint_img(im, o['tint'])
            g.alpha_composite(im, (round(o['x']), round(o['y']))) if o['x'] >= 0 and o['y'] >= 0 else paste_any(g, im, round(o['x']), round(o['y']))
        s.ground = g.convert('RGB')
        s.dyn = sorted([o for o in s.objs if not o['bake']], key=lambda o: o['sy'])
        return s.dyn

    def collision(s):
        cols, rows = math.ceil(s.w / CS), math.ceil(s.h / CS)
        wm = s.walkmask()
        # 一格里大半可走才算可走
        pad = np.zeros((rows * CS, cols * CS), bool); pad[:s.h, :s.w] = wm
        blk = pad.reshape(rows, CS, cols, CS).mean((1, 3)) < .55
        for o in s.objs:
            f = o.get('foot')
            if not f: continue
            x0, y0, x1, y1 = f
            c0, r0, c1, r1 = max(0, int(x0 // CS)), max(0, int(y0 // CS)), min(cols - 1, int(x1 // CS)), min(rows - 1, int(y1 // CS))
            if c1 >= c0 and r1 >= r0: blk[r0:r1 + 1, c0:c1 + 1] = True
        # 地图边缘一圈挡住（出口除外）
        blk[0, :] = blk[-1, :] = True; blk[:, 0] = blk[:, -1] = True
        for e in s.exits:
            x, y, w, h = e['rect']; blk[max(0, int(y // CS)):int((y + h) // CS) + 1, max(0, int(x // CS)):int((x + w) // CS) + 1] = False
        s.blk = blk; s.cols, s.rows = cols, rows
        return blk

def paste_any(dst, im, x, y):
    # 负坐标贴图
    sx, sy = max(0, -x), max(0, -y)
    if sx >= im.width or sy >= im.height: return
    dst.alpha_composite(im.crop((sx, sy, im.width, im.height)), (x + sx, y + sy))

def tint_img(im, t):
    A = np.asarray(im, np.float32).copy(); A[..., :3] *= np.array(t, np.float32); return Image.fromarray(np.clip(A, 0, 255).astype(np.uint8))
