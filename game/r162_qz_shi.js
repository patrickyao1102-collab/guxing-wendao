// ================= R162 · 青竹小院「五时辰」（Codex R144 素材）=================
// 作者 11-08：叶孤星床边可以选「歇到什么时辰」——卯时清晨 / 午时正午 / 酉时黄昏 / 戌时入夜 / 子时子夜。
//   每个时辰里青禾、小桃、阿福、松伯、小猫干的活不一样、在的地方不一样、说的话也不一样，还有十二件小事（彩蛋插画）。
//   入夜：大家都回屋了（青禾灯下绣花、小桃对镜梳头、阿福打算盘、松伯写信），每回随机有一个人出来（赏月 / 捉萤 / 偷包子 / 提灯巡夜）。
//   子夜：都睡下了（床上盖被呼吸，小桃会踢被子，阿福说梦话；松伯有时候灯还亮着在写家书），小猫蹲在墙头看月亮。
//   基调：院里的人都疼少爷，全是暖的。
// 作者 11-08：R144 的十二张彩蛋插画也是青竹小院专属的载入图 —— 进青竹一带时轮流放，每次载入放一张（见 loading.js 的 QZ_LOAD_ART）。
// 时辰只在青竹一带（小院、西院、各屋、居室、山阶）有效；走出青竹回到白天（不打乱外面的剧情时辰）。剧情自己定时辰的时候，床还是原来的「躺一会儿回满」。
(function () {
  if (!window.R136W_ON || typeof TMAPS === 'undefined' || !TMAPS.qingzhu_court || !TMAPS.tj_room) return;
  const COURT = 'qingzhu_court', OX = 1664, Y = (x, y) => [x - OX, y];
  const RM = { maid1: 'qingzhu_room_qinghe', maid2: 'qingzhu_room_xiaotao', servant: 'qingzhu_room_afu', steward: 'qingzhu_steward_room', kitchen: 'qingzhu_kitchen' };
  const F = () => (S.flags = S.flags || {});
  const now = () => performance.now() / 1000;
  const QZ = m => /^qingzhu_|^tj_room$/.test(m || '');
  const night = () => { try { return window.TOD ? TOD() === 'night' : false; } catch (e) { return false; } };
  const pick = l => l[Math.floor(Math.random() * l.length)];
  const URL = n => (window.R162_ASSETS && R162_ASSETS[n]) || ('r162/' + n);
  const IDX = {"maid1_sweep_6f":{"s":"act_maid1","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_chopveg_6f":{"s":"act_maid1","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_laundry_6f":{"s":"act_maid1","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_stitch_6f":{"s":"act_maid1","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"maid1_moon_6f":{"s":"act_maid1","r":4,"n":6,"fps":5,"loop":true,"dir":"downleft"},"maid1_setbasin_6f":{"s":"act_maid1","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid1_basin_down_6f":{"s":"act_maid1","r":6,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_basin_up_6f":{"s":"act_maid1","r":7,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_basin_left_6f":{"s":"act_maid1","r":8,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_basin_downleft_6f":{"s":"act_maid1","r":9,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid1_tray_down_6f":{"s":"act_maid1","r":10,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_tray_up_6f":{"s":"act_maid1","r":11,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_tray_left_6f":{"s":"act_maid1","r":12,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_tray_downleft_6f":{"s":"act_maid1","r":13,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid1_clothes_down_6f":{"s":"act_maid1","r":14,"n":6,"fps":7,"loop":true,"dir":"down"},"maid1_clothes_up_6f":{"s":"act_maid1","r":15,"n":6,"fps":7,"loop":true,"dir":"up"},"maid1_clothes_left_6f":{"s":"act_maid1","r":16,"n":6,"fps":7,"loop":true,"dir":"left"},"maid1_clothes_downleft_6f":{"s":"act_maid1","r":17,"n":6,"fps":7,"loop":true,"dir":"downleft"},"maid2_water_6f":{"s":"act_maid2","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_dew_6f":{"s":"act_maid2","r":1,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_fan_6f":{"s":"act_maid2","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_teaoffer_6f":{"s":"act_maid2","r":3,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_vase_6f":{"s":"act_maid2","r":4,"n":6,"fps":6,"loop":false,"dir":"downleft"},"maid2_comb_6f":{"s":"act_maid2","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_catch_6f":{"s":"act_maid2","r":6,"n":6,"fps":6,"loop":true,"dir":"downleft"},"maid2_pot_down_6f":{"s":"act_maid2","r":7,"n":6,"fps":7,"loop":true,"dir":"down"},"maid2_pot_up_6f":{"s":"act_maid2","r":8,"n":6,"fps":7,"loop":true,"dir":"up"},"maid2_pot_left_6f":{"s":"act_maid2","r":9,"n":6,"fps":7,"loop":true,"dir":"left"},"maid2_pot_downleft_6f":{"s":"act_maid2","r":10,"n":6,"fps":7,"loop":true,"dir":"downleft"},"servant_gatesweep_6f":{"s":"act_servant","r":0,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_yawn_6f":{"s":"act_servant","r":1,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_axe_6f":{"s":"act_servant","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_light_6f":{"s":"act_servant","r":3,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_abacus_6f":{"s":"act_servant","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"servant_bun_6f":{"s":"act_servant","r":5,"n":6,"fps":6,"loop":false,"dir":"downleft"},"servant_yoke_down_6f":{"s":"act_servant","r":6,"n":6,"fps":7,"loop":true,"dir":"down"},"servant_yoke_up_6f":{"s":"act_servant","r":7,"n":6,"fps":7,"loop":true,"dir":"up"},"servant_yoke_left_6f":{"s":"act_servant","r":8,"n":6,"fps":7,"loop":true,"dir":"left"},"servant_yoke_downleft_6f":{"s":"act_servant","r":9,"n":6,"fps":7,"loop":true,"dir":"downleft"},"servant_logs_down_6f":{"s":"act_servant","r":10,"n":6,"fps":7,"loop":true,"dir":"down"},"servant_logs_up_6f":{"s":"act_servant","r":11,"n":6,"fps":7,"loop":true,"dir":"up"},"servant_logs_left_6f":{"s":"act_servant","r":12,"n":6,"fps":7,"loop":true,"dir":"left"},"servant_logs_downleft_6f":{"s":"act_servant","r":13,"n":6,"fps":7,"loop":true,"dir":"downleft"},"steward_sky_6f":{"s":"act_steward","r":0,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_birds_6f":{"s":"act_steward","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_sip_6f":{"s":"act_steward","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_ledger_6f":{"s":"act_steward","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_patrol_6f":{"s":"act_steward","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_point_6f":{"s":"act_steward","r":5,"n":6,"fps":6,"loop":true,"dir":"downleft"},"steward_letter_6f":{"s":"act_steward","r":6,"n":6,"fps":5,"loop":true,"dir":"downleft"},"steward_lantern_down_6f":{"s":"act_steward","r":7,"n":6,"fps":7,"loop":true,"dir":"down"},"steward_lantern_up_6f":{"s":"act_steward","r":8,"n":6,"fps":7,"loop":true,"dir":"up"},"steward_lantern_left_6f":{"s":"act_steward","r":9,"n":6,"fps":7,"loop":true,"dir":"left"},"steward_lantern_downleft_6f":{"s":"act_steward","r":10,"n":6,"fps":7,"loop":true,"dir":"downleft"},"cat_leap_4f":{"s":"act_cat","r":0,"n":4,"fps":6,"loop":true,"dir":"downleft"},"cat_chase_6f":{"s":"act_cat","r":1,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_sunset_6f":{"s":"act_cat","r":2,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_warm_6f":{"s":"act_cat","r":3,"n":6,"fps":5,"loop":true,"dir":"downleft"},"cat_glow_6f":{"s":"act_cat","r":4,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_silhouette_4f":{"s":"act_cat","r":5,"n":4,"fps":5,"loop":true,"dir":"downleft"},"cat_lick_paw_6f":{"s":"act_cat","r":6,"n":6,"fps":6,"loop":true,"dir":"downleft"},"cat_sleep_4f":{"s":"act_cat","r":7,"n":4,"fps":6,"loop":true,"dir":"downleft"},"cat_walk_left_6f":{"s":"act_cat","r":8,"n":6,"fps":6,"loop":true,"dir":"left"},"maid1_sleep_night_4f":{"s":"bed","r":0,"n":4,"fps":3,"loop":true,"o":[12,244],"map":"qingzhu_room_qinghe"},"maid2_sleep_night_4f":{"s":"bed","r":1,"n":4,"fps":3,"loop":true,"o":[12,237],"map":"qingzhu_room_xiaotao"},"maid2_kick_night_4f":{"s":"bed","r":2,"n":4,"fps":3,"loop":false,"o":[12,237],"map":"qingzhu_room_xiaotao"},"servant_sleep_night_4f":{"s":"bed","r":3,"n":4,"fps":3,"loop":true,"o":[53,193],"map":"qingzhu_room_afu"},"servant_dream_night_4f":{"s":"bed","r":4,"n":4,"fps":3,"loop":false,"o":[53,193],"map":"qingzhu_room_afu"},"steward_sleep_night_4f":{"s":"bed","r":5,"n":4,"fps":3,"loop":true,"o":[70,206],"map":"qingzhu_steward_room"},"lighting_pole_day":{"s":"prop","x":0,"y":0,"w":108,"h":256,"n":1,"fps":6,"loop":true,"an":[54,249]},"lighting_pole_night":{"s":"prop","x":110,"y":0,"w":108,"h":256,"n":1,"fps":6,"loop":true,"an":[54,249]},"rack_full_day":{"s":"prop","x":220,"y":0,"w":300,"h":234,"n":6,"fps":3,"loop":true,"an":[150,227]},"rack_full_night":{"s":"prop","x":2022,"y":0,"w":300,"h":234,"n":6,"fps":3,"loop":true,"an":[150,227]},"rack_empty_day":{"s":"prop","x":0,"y":258,"w":300,"h":234,"n":1,"fps":6,"loop":true,"an":[150,227]},"rack_empty_night":{"s":"prop","x":302,"y":258,"w":300,"h":234,"n":1,"fps":6,"loop":true,"an":[150,227]},"dusk_hearth_smoke":{"s":"prop","x":604,"y":258,"w":144,"h":224,"n":8,"fps":5,"loop":true,"an":null},"moon_bamboo_8f":{"s":"prop","x":1758,"y":258,"w":240,"h":192,"n":8,"fps":4,"loop":true,"an":null},"eaves_halo_6f":{"s":"prop","x":0,"y":494,"w":192,"h":192,"n":6,"fps":3,"loop":true,"an":null},"warm_wash_day_8f":{"s":"prop","x":1154,"y":494,"w":160,"h":192,"n":8,"fps":5,"loop":true,"an":[80,185]},"warm_wash_night_8f":{"s":"prop","x":2436,"y":494,"w":160,"h":192,"n":8,"fps":5,"loop":true,"an":[80,185]},"dawn_fog_8f":{"s":"prop","x":0,"y":688,"w":480,"h":180,"n":8,"fps":4,"loop":true,"an":null},"fireflies_8f":{"s":"prop","x":0,"y":870,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"firefly_cluster_day":{"s":"prop","x":0,"y":1052,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"firefly_cluster_night":{"s":"prop","x":0,"y":1234,"w":320,"h":180,"n":8,"fps":5,"loop":true,"an":null},"dream_bubble":{"s":"prop","x":2562,"y":1234,"w":360,"h":172,"n":1,"fps":6,"loop":true,"an":null},"axe_wall_day":{"s":"prop","x":2924,"y":1234,"w":96,"h":160,"n":1,"fps":6,"loop":true,"an":[48,153]},"axe_wall_night":{"s":"prop","x":3022,"y":1234,"w":96,"h":160,"n":1,"fps":6,"loop":true,"an":[48,153]},"woodpile_day":{"s":"prop","x":3120,"y":1234,"w":220,"h":160,"n":1,"fps":6,"loop":true,"an":[110,159]},"woodpile_night":{"s":"prop","x":3342,"y":1234,"w":220,"h":160,"n":1,"fps":6,"loop":true,"an":[110,159]},"lantern_off_day":{"s":"prop","x":3564,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_off_night":{"s":"prop","x":3694,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_lit_day":{"s":"prop","x":3824,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"lantern_lit_night":{"s":"prop","x":3954,"y":1234,"w":128,"h":154,"n":1,"fps":6,"loop":true,"an":[64,147]},"hand_lantern_day":{"s":"prop","x":0,"y":1416,"w":112,"h":153,"n":1,"fps":6,"loop":true,"an":[56,146]},"hand_lantern_night":{"s":"prop","x":114,"y":1416,"w":112,"h":153,"n":1,"fps":6,"loop":true,"an":[56,146]},"hanky_fall_6f":{"s":"prop","x":228,"y":1416,"w":160,"h":150,"n":6,"fps":7,"loop":false,"an":null},"wash_stool_day":{"s":"prop","x":1190,"y":1416,"w":144,"h":144,"n":1,"fps":6,"loop":true,"an":[72,137]},"wash_stool_night":{"s":"prop","x":1336,"y":1416,"w":144,"h":144,"n":1,"fps":6,"loop":true,"an":[72,137]},"sword_glint_6f":{"s":"prop","x":1482,"y":1416,"w":288,"h":144,"n":6,"fps":16,"loop":false,"an":null},"door_lamp_day":{"s":"prop","x":3212,"y":1416,"w":110,"h":124,"n":1,"fps":6,"loop":true,"an":[55,117]},"door_lamp_night":{"s":"prop","x":3324,"y":1416,"w":110,"h":124,"n":1,"fps":6,"loop":true,"an":[55,117]},"fly_day":{"s":"prop","x":0,"y":1571,"w":150,"h":120,"n":6,"fps":7,"loop":true,"an":[75,113]},"fly_night":{"s":"prop","x":902,"y":1571,"w":150,"h":120,"n":6,"fps":7,"loop":true,"an":[75,113]},"oil_lamp_day":{"s":"prop","x":1804,"y":1571,"w":96,"h":114,"n":1,"fps":6,"loop":true,"an":[48,107]},"oil_lamp_night":{"s":"prop","x":1902,"y":1571,"w":96,"h":114,"n":1,"fps":6,"loop":true,"an":[48,107]},"noodles_day":{"s":"prop","x":2000,"y":1571,"w":126,"h":108,"n":1,"fps":6,"loop":true,"an":[63,101]},"noodles_night":{"s":"prop","x":2128,"y":1571,"w":126,"h":108,"n":1,"fps":6,"loop":true,"an":[63,101]},"tea_tray_day":{"s":"prop","x":2256,"y":1571,"w":154,"h":107,"n":1,"fps":6,"loop":true,"an":[77,100]},"tea_tray_night":{"s":"prop","x":2412,"y":1571,"w":154,"h":107,"n":1,"fps":6,"loop":true,"an":[77,100]},"bun_basket_day":{"s":"prop","x":2568,"y":1571,"w":136,"h":103,"n":1,"fps":6,"loop":true,"an":[68,96]},"bun_basket_night":{"s":"prop","x":2706,"y":1571,"w":136,"h":103,"n":1,"fps":6,"loop":true,"an":[68,96]},"wash_tub_day":{"s":"prop","x":2844,"y":1571,"w":154,"h":102,"n":1,"fps":6,"loop":true,"an":[77,95]},"wash_tub_night":{"s":"prop","x":3000,"y":1571,"w":154,"h":102,"n":1,"fps":6,"loop":true,"an":[77,95]},"ledger_day":{"s":"prop","x":3156,"y":1571,"w":126,"h":98,"n":1,"fps":6,"loop":true,"an":[63,91]},"ledger_night":{"s":"prop","x":3284,"y":1571,"w":126,"h":98,"n":1,"fps":6,"loop":true,"an":[63,91]},"peck_day":{"s":"prop","x":0,"y":1693,"w":132,"h":96,"n":6,"fps":6,"loop":true,"an":[66,89]},"peck_night":{"s":"prop","x":794,"y":1693,"w":132,"h":96,"n":6,"fps":6,"loop":true,"an":[66,89]},"folded_linen_day":{"s":"prop","x":1588,"y":1693,"w":128,"h":88,"n":1,"fps":6,"loop":true,"an":[64,81]},"folded_linen_night":{"s":"prop","x":1718,"y":1693,"w":128,"h":88,"n":1,"fps":6,"loop":true,"an":[64,81]},"hoop_day":{"s":"prop","x":1848,"y":1693,"w":100,"h":86,"n":1,"fps":6,"loop":true,"an":[50,79]},"hoop_night":{"s":"prop","x":1950,"y":1693,"w":100,"h":86,"n":1,"fps":6,"loop":true,"an":[50,79]},"abacus_day":{"s":"prop","x":2052,"y":1693,"w":130,"h":82,"n":1,"fps":6,"loop":true,"an":[65,75]},"abacus_night":{"s":"prop","x":2184,"y":1693,"w":130,"h":82,"n":1,"fps":6,"loop":true,"an":[65,75]},"handkerchief_day":{"s":"prop","x":2316,"y":1693,"w":102,"h":80,"n":1,"fps":6,"loop":true,"an":[51,73]},"handkerchief_night":{"s":"prop","x":2420,"y":1693,"w":102,"h":80,"n":1,"fps":6,"loop":true,"an":[51,73]},"butterfly_day":{"s":"prop","x":2524,"y":1693,"w":64,"h":64,"n":4,"fps":6,"loop":true,"an":[32,57]},"butterfly_night":{"s":"prop","x":2782,"y":1693,"w":64,"h":64,"n":4,"fps":6,"loop":true,"an":[32,57]},"firefly_day":{"s":"prop","x":3040,"y":1693,"w":48,"h":48,"n":8,"fps":5,"loop":true,"an":null},"firefly_night":{"s":"prop","x":3426,"y":1693,"w":48,"h":48,"n":8,"fps":5,"loop":true,"an":null},"rest_panel":{"s":"ui","x":0,"y":0,"w":880,"h":360},"icon_dawn":{"s":"ui","x":0,"y":362,"w":128,"h":128},"icon_noon":{"s":"ui","x":130,"y":362,"w":128,"h":128},"icon_dusk":{"s":"ui","x":260,"y":362,"w":128,"h":128},"icon_evening":{"s":"ui","x":390,"y":362,"w":128,"h":128},"icon_midnight":{"s":"ui","x":520,"y":362,"w":128,"h":128},"rest_option_normal":{"s":"ui","x":650,"y":362,"w":136,"h":144},"rest_option_selected":{"s":"ui","x":788,"y":362,"w":136,"h":144},"rest_fade_8f":{"s":"fade","w":640,"h":360,"n":8,"fps":8},"west_dawn":{"s":"l_west_dawn","w":1664,"h":1792},"west_noon":{"s":"l_west_noon","w":1664,"h":1792},"west_dusk":{"s":"l_west_dusk","w":1664,"h":1792},"west_long_shadows":{"s":"l_west_long_shadows","w":1664,"h":1792},"main_dawn":{"s":"l_main_dawn","w":2304,"h":1792},"main_noon":{"s":"l_main_noon","w":2304,"h":1792},"main_dusk":{"s":"l_main_dusk","w":2304,"h":1792},"main_long_shadows":{"s":"l_main_long_shadows","w":2304,"h":1792},"window_maid1_dawn":{"s":"l_window_maid1_dawn","w":832,"h":768},"window_maid1_dusk":{"s":"l_window_maid1_dusk","w":832,"h":768},"window_maid2_dawn":{"s":"l_window_maid2_dawn","w":832,"h":768},"window_maid2_dusk":{"s":"l_window_maid2_dusk","w":832,"h":768},"window_servant_dawn":{"s":"l_window_servant_dawn","w":832,"h":768},"window_servant_dusk":{"s":"l_window_servant_dusk","w":832,"h":768},"window_kitchen_dawn":{"s":"l_window_kitchen_dawn","w":832,"h":768},"window_kitchen_dusk":{"s":"l_window_kitchen_dusk","w":832,"h":768},"story_01":{"s":"story_01","name":"花圃指尖的一滴露","time":["卯"]},"story_02":{"s":"story_02","name":"门口的温水","time":["卯"]},"story_03":{"s":"story_03","name":"小时候偷吃供果","time":["午"]},"story_04":{"s":"story_04","name":"竹梢上的手帕","time":["酉"]},"story_05":{"s":"story_05","name":"最后一盏灯笼","time":["酉"]},"story_06":{"s":"story_06","name":"硬塞来的半个包子","time":["戌"]},"story_07":{"s":"story_07","name":"月下说起山下的娘","time":["戌"]},"story_08":{"s":"story_08","name":"把萤火虫放到少爷手心","time":["戌"]},"story_09":{"s":"story_09","name":"阿福的梦话","time":["子"]},"story_10":{"s":"story_10","name":"灯下给宗主的家书","time":["子"]},"story_11":{"s":"story_11","name":"一人一灵屋脊看星","time":["子"]},"story_12":{"s":"story_12","name":"墙头的小猫与大月亮","time":["子"]}};

  // ---------- 素材 ----------
  const IM = {};
  const img = s => { let o = IM[s]; if (!o) { o = IM[s] = { im: new Image(), ok: false }; o.im.onload = () => { o.ok = true; }; o.im.src = URL(s + '.webp'); } return o.ok ? o.im : null; };
  const WALKIM = {}; const walkIm = k => { let o = WALKIM[k]; if (!o) { o = WALKIM[k] = { im: new Image(), ok: false }; o.im.onload = () => { o.ok = true; }; o.im.src = 'r135e2/' + k + '_walk.webp'; } return o.ok ? o.im : null; };
  const SHEETS = ['act_maid1', 'act_maid2', 'act_servant', 'act_steward', 'act_cat', 'prop', 'bed', 'ui'];
  const LIGHTS = { '卯': ['main_dawn', 'west_dawn'], '午': ['main_noon', 'west_noon'], '酉': ['main_dusk', 'west_dusk', 'main_long_shadows', 'west_long_shadows'] };
  const preload = () => { for (const s of SHEETS) img(s); const L = LIGHTS[shi()]; if (L) for (const k of L) img('l_' + k); img('fade');
    for (const k of ['maid1', 'maid2', 'servant', 'steward']) walkIm(k); };

  // ---------- 时辰 ----------
  const SHI = ['卯', '午', '酉', '戌', '子'];
  const NAME = { '卯': '卯时', '午': '午时', '酉': '酉时', '戌': '戌时', '子': '子时' };
  const LAB = { '卯': '清晨', '午': '正午', '酉': '黄昏', '戌': '入夜', '子': '子夜' };
  const ICON = { '卯': 'icon_dawn', '午': 'icon_noon', '酉': 'icon_dusk', '戌': 'icon_evening', '子': 'icon_midnight' };
  const shi = () => F().qz_shi || '';
  const ON = () => !!F().qz_shi;
  window.QZ_SHI_ON = () => ON() && QZ(world.mapName);
  window.QZ_SHI = () => (ON() ? shi() : '');
  // 别的剧情自己改时辰 → 五时辰让位
  let inner = false;
  const setTod = v => { inner = true; try { SET_TOD(v); } finally { inner = false; } };
  { const s0 = window.SET_TOD; if (s0) window.SET_TOD = function (v) { if (!inner && F().qz_shi) F().qz_shi = ''; return s0.apply(this, arguments); }; }
  { const r0 = window.RES_TOD; if (r0) window.RES_TOD = function (v) { if (!inner && F().qz_shi) F().qz_shi = ''; return r0.apply(this, arguments); }; }

  // ---------- 画图小工具 ----------
  const SC = .47, CATSC = .5;
  const undoAZ = a => { try { const z = typeof AZ === 'function' ? 1 / AZ() : 1; if (z !== 1) { ctx.translate(a.x, a.y); ctx.scale(z, z); ctx.translate(-a.x, -a.y); } } catch (e) {} };
  function act(id, f, x, y, flip, sc = SC) {   // 人物 / 小猫动作：256 格，脚点 (128,240)，画的是朝左前方
    const d = IDX[id]; if (!d) return false; const im = img(d.s); if (!im) return false;
    f = Math.max(0, Math.min(d.n - 1, f | 0));
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.scale(sc, sc); ctx.drawImage(im, f * 256, d.r * 256, 256, 256, -128, -240, 256, 256); ctx.restore(); return true;
  }
  const pid = id => { const v = night() ? '_night' : '_day'; for (const k of [id + v, id + v + '_8f', id]) if (IDX[k]) return k; return id; };
  function prop(id, f, x, y, sc = .45, alpha = 1, flip = false) {   // 道具：按 anchor 落脚（昼 / 夜两版自动挑）
    const d = IDX[pid(id)]; if (!d) return false; const im = img('prop'); if (!im) return false;
    if (f == null) f = Math.floor(now() * (d.fps || 6));
    f = d.loop === false ? Math.max(0, Math.min(d.n - 1, f | 0)) : ((f | 0) % d.n + d.n) % d.n;
    const an = d.an || [d.w / 2, d.h / 2];
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.scale(sc, sc); ctx.drawImage(im, d.x + f * d.w, d.y, d.w, d.h, -an[0], -an[1], d.w, d.h); ctx.restore(); return true;
  }
  const fr = (d, t0, loop) => { const k = Math.floor((now() - t0) * (d.fps || 6)); return loop === false || d.loop === false ? Math.min(d.n - 1, k) : k % d.n; };
  const shadow = (x, y, rx = 21, ry = 7, a = .3) => { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); ctx.restore(); };
  function walkDraw(a, k, dx, dy, moving) {   // R135 八向行走图（老管家四向）
    const im = walkIm(k); if (!im) return false;
    let row = 0, flip = false;
    if (k === 'steward') { if (Math.abs(dx) > Math.abs(dy) * .8) { row = 2; flip = dx > 0; } else row = dy < 0 ? 1 : 0; }
    else { const s = ((Math.round(Math.atan2(dy, dx) * 180 / Math.PI / 45) % 8) + 8) % 8; [row, flip] = [[2, true], [1, true], [0, false], [1, false], [2, false], [3, false], [4, false], [3, true]][s]; }
    const col = moving ? 1 + Math.floor(now() * 8 + (a.x * .013 % 1) * 6) % 6 : 0;
    ctx.save(); ctx.translate(a.x, a.y); if (flip) ctx.scale(-1, 1); ctx.scale(SC, SC); ctx.drawImage(im, col * 160, row * 240, 160, 240, -80, -232, 160, 240); ctx.restore(); return true;
  }
  const carryId = (base, dx, dy) => { const ax = Math.abs(dx), ay = Math.abs(dy); let d;
    if (ay > ax * 1.6) d = dy < 0 ? 'up' : 'down'; else if (dy > 0 && ay > ax * .45) d = 'downleft'; else d = 'left';
    return [base + '_' + d + '_6f', dx > 0 && d !== 'up' && d !== 'down']; };

  // ---------- 五个时辰里，每个人在哪、干什么 ----------
  // 步骤：go 走过去（w：带东西走的动作 / patrol 巡院 / lantern 提灯）；act 原地动作（t 秒，once 只放一遍）；wait 歇着；hide 进屋一会儿；loop 跳回第几步
  const WELL = Y(330, 1470), KDOOR = Y(335, 1205), GATE = [736, 1600], TABLE = Y(1041, 1372);
  const LANT = { k1: Y(244, 1030), k2: Y(426, 1030), m1: [801, 418], m2: [1345, 412], m3: [1475, 422] };
  const PLAN = {
    '卯': {
      maid1: { map: COURT, at: [1160, 644], steps: [
        { go: [1046, 592], w: 'maid1_basin' }, { act: 'maid1_setbasin_6f', t: 2.4, once: 1, face: -1, fn: () => { DAY.basin = 1; } }, { wait: 1 },
        { go: [1640, 566] }, { act: 'maid1_sweep_6f', t: 9, face: 1 }, { go: [1790, 580] }, { act: 'maid1_sweep_6f', t: 8, face: -1 },
        { go: [1280, 604] }, { act: 'maid1_sweep_6f', t: 7, face: 1 }, { loop: 3 }] },
      maid2: { map: COURT, at: Y(640, 706), steps: [
        { act: 'maid2_water_6f', t: 7, face: 1 }, { act: 'maid2_dew_6f', t: 4, once: 1, face: 1 }, { go: Y(1222, 706) }, { act: 'maid2_water_6f', t: 7, face: -1 },
        { go: Y(1210, 935) }, { act: 'maid2_water_6f', t: 6, face: 1 }, { go: Y(207, 706) }, { act: 'maid2_water_6f', t: 6, face: -1 }, { act: 'maid2_dew_6f', t: 4, once: 1, face: -1 },
        { go: Y(640, 706) }, { loop: 0 }] },
      servant: { map: COURT, at: GATE, steps: [
        { act: 'servant_gatesweep_6f', t: 8, face: -1 }, { act: 'servant_yawn_6f', t: 2.4, once: 1, face: -1 }, { go: WELL }, { wait: 1.6 },
        { go: Y(300, 1214), w: 'servant_yoke', fill: 1 }, { wait: 1.2 }, { go: WELL }, { wait: 1.4 }, { go: Y(300, 1214), w: 'servant_yoke', fill: 1 }, { wait: 1 },
        { go: GATE }, { loop: 0 }] },
      steward: { map: COURT, at: [930, 642], steps: [
        { act: 'steward_sky_6f', t: 8, face: 1 }, { go: [862, 604] }, { act: 'steward_birds_6f', t: 14, face: -1, birds: 1 }, { go: [930, 642] }, { loop: 0 }] },
      cat: { map: COURT, at: Y(330, 1420), steps: [{ act: 'cat_lick_paw_6f', t: 6, face: -1 }, { go: Y(250, 1500), w: 'cat' }, { act: 'cat_leap_4f', t: 5, face: 1 }, { go: Y(330, 1420), w: 'cat' }, { loop: 0 }] },
    },
    '午': {
      maid1: { map: COURT, at: KDOOR, steps: [{ hide: 10 }, { go: Y(1062, 1452), w: 'maid1_tray' }, { wait: 2.5, face: -1, fn: () => { DAY.noodles = 1; } }, { go: KDOOR }, { hide: 16 }, { loop: 1 }] },
      maid1k: { who: 'maid1', map: RM.kitchen, at: [300, 604], steps: [{ act: 'maid1_chopveg_6f', t: 1e9, face: -1 }] },
      maid2: { map: COURT, at: KDOOR, steps: [{ hide: 6 }, { go: Y(1196, 1444) }, { act: 'maid2_teaoffer_6f', t: 2.6, once: 1, face: -1 }, { wait: 5, face: -1 }, { go: KDOOR }, { hide: 22 }, { loop: 1 }] },
      maid2k: { who: 'maid2', map: RM.kitchen, at: [590, 522], steps: [{ act: 'maid2_fan_6f', t: 1e9, face: -1 }] },
      servant: { map: COURT, at: Y(470, 1192), steps: [
        { act: 'servant_axe_6f', t: 10, face: 1 }, { go: KDOOR, w: 'servant_logs' }, { hide: 4 }, { go: Y(470, 1192) }, { loop: 0 }] },
      steward: { map: COURT, at: Y(1124, 1420), steps: [{ act: 'steward_sip_6f', t: 10, face: -1 }, { act: 'steward_ledger_6f', t: 8, face: -1 }, { loop: 0 }] },
      cat: { map: COURT, at: Y(780, 1252), steps: [{ act: 'cat_chase_6f', t: 8, face: -1, fly: 1 }, { go: Y(600, 1320), w: 'cat' }, { act: 'cat_sleep_4f', t: 16, face: 1 }, { go: Y(780, 1252), w: 'cat' }, { loop: 0 }] },
    },
    '酉': {
      maid1: { map: COURT, at: Y(520, 1462), steps: [{ act: 'maid1_laundry_6f', t: 9, face: -1 }, { go: Y(400, 518), w: 'maid1_clothes' }, { hide: 7 }, { go: Y(520, 1462) }, { loop: 0 }] },
      maid2: { map: COURT, at: Y(640, 706), steps: [
        { go: Y(900, 520), w: 'maid2_pot' }, { act: 'maid2_vase_6f', t: 3, once: 1, face: -1 }, { wait: 1.5 }, { go: Y(1222, 706) }, { go: Y(1060, 522), w: 'maid2_pot' }, { wait: 2 }, { go: Y(640, 706) }, { loop: 0 }] },
      servant: { map: COURT, at: Y(300, 1188), steps: [
        { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'k1' }, { go: Y(480, 1188) }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'k2' },
        { go: [860, 560] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm1' }, { go: [1404, 556] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm2' },
        { go: [1534, 566] }, { act: 'servant_light_6f', t: 3, once: 1, face: -1, lit: 'm3' }, { go: [1260, 640] }, { wait: 1e9, face: -1 }] },
      steward: { map: COURT, at: [736, 1350], steps: [{ go: [736, 760], w: 'patrol' }, { go: [1400, 600], w: 'patrol' }, { act: 'steward_point_6f', t: 4.5, face: -1 }, { go: [736, 1350], w: 'patrol' }, { wait: 3 }, { loop: 0 }] },
      cat: { map: COURT, at: TABLE, sy: 1414, steps: [{ act: 'cat_sunset_6f', t: 1e9, face: -1 }] },
    },
    '戌': {
      maid1: { map: RM.maid1, at: [374, 386], steps: [{ act: 'maid1_stitch_6f', t: 1e9, face: -1 }] },
      maid2: { map: RM.maid2, at: [722, 548], steps: [{ act: 'maid2_comb_6f', t: 1e9, face: -1 }] },
      servant: { map: RM.servant, at: [520, 422], steps: [{ act: 'servant_abacus_6f', t: 1e9, face: -1 }] },
      steward: { map: RM.steward, at: [432, 472], steps: [{ act: 'steward_letter_6f', t: 1e9, face: -1 }] },
      cat: { map: COURT, at: Y(430, 1200), steps: [{ act: 'cat_warm_6f', t: 1e9, face: -1 }] },
    },
    '子': {
      cat: { map: COURT, at: [1250, 1346], sy: 1405, steps: [{ act: 'cat_silhouette_4f', t: 1e9, face: -1 }] },
    },
  };
  // 入夜出来的那个人（每回歇到戌时随机挑一个，没看过小事的优先）
  const OUT = {
    maid1: { map: COURT, at: Y(1124, 1440), steps: [{ act: 'maid1_moon_6f', t: 1e9, face: -1 }], ev: 7 },
    maid2: { map: COURT, at: Y(360, 1444), steps: [{ act: 'maid2_catch_6f', t: 1e9, face: -1 }], ev: 8 },
    servant: { map: RM.kitchen, at: [330, 528], steps: [{ act: 'servant_bun_6f', t: 1e9, face: -1, once: 1 }], ev: 6 },
    steward: { map: COURT, at: [736, 1350], steps: [{ go: [736, 720], w: 'steward_lantern' }, { go: [1300, 640], w: 'steward_lantern' }, { wait: 2 }, { go: Y(800, 1320), w: 'steward_lantern' }, { wait: 2 }, { go: [736, 1350], w: 'steward_lantern' }, { wait: 3 }, { loop: 0 }] },
  };
  const DAY = { basin: 0, noodles: 0, lit: {} };
  const planOf = (k, s) => { if (s === '戌' && F().qz_out === k) return OUT[k]; if (s === '子' && k === 'steward' && F().qz_letter) return PLAN['戌'].steward; return (PLAN[s] || {})[k]; };

  // ---------- 对白：每人每个时辰一套 ----------
  const WHO = { maid1: '侍女青禾', maid2: '侍女小桃', servant: '小厮阿福', steward: '松伯' };
  const LINES = {
    maid1: {
      '卯': [['笑', '少爷醒了？门口的水是刚兑的，不烫手。'], ['', '竹叶一夜落一层，趁早扫了，少爷出门脚底下干净。'], ['担心', '今早露水重，少爷练剑记得添件衣裳。'], ['嗔', '青禾起得早，听见少爷屋里翻了好几回身——昨夜又熬到很晚吧？'], ['笑', '布巾是晒过的，有太阳的味道。'], ['认真', '早饭是小米粥配酱菜，少爷练完剑就过来吃。']],
      '午': [['笑', '今儿晌午是笋片炒肉，少爷爱吃的。'], ['嗔', '少爷别偷吃，还没下锅呢。'], ['认真', '刀快着呢，少爷站远一点。'], ['笑', '菜马上就好——少爷先去石桌那边坐着。'], ['', '小桃那丫头又把火烧旺了，青禾得赶紧切。'], ['笑', '面里卧了个蛋，少爷别告诉阿福，他碗里没有。']],
      '酉': [['笑', '衣裳晒了一天，摸着都是暖的。'], ['担心', '少爷那件练功服袖口又磨破了，青禾晚上给您补。'], ['', '太阳一落风就凉，得赶在露水下来前收完。'], ['嗔', '这件是阿福的，又挂了个口子……这孩子。'], ['羞', '少爷的衣裳青禾都用竹叶熏过，您闻闻？']],
      '戌': [['羞', '灯下做针线，眼睛有点花……少爷别笑话。'], ['担心', '这么晚了，少爷怎么还不睡？'], ['羞', '这是给……还没绣好，不许看。'], ['', '夜里风凉，少爷回屋把窗关上。'], ['笑', '明早青禾早些起，给少爷熬粥。']],
      out: [['笑', '少爷也睡不着？……今晚的月亮真圆。'], ['', '坐吧，这石凳我擦过了。']],
    },
    maid2: {
      '卯': [['惊喜', '少爷早！您看您看，花苞上挂着露珠呢！'], ['认真', '清早浇花最好，水凉，根也喝得进去。'], ['', '嘘——别出声，有只小雀儿在啄花籽。'], ['得意', '小桃今天要把西院的花都巡一遍！'], ['笑', '绣球昨夜又开了两朵，比昨天大了一圈。']],
      '午': [['委屈', '（扇火扇得满脸是灰）少爷别看！……小桃脸上是不是全黑了？'], ['认真', '火候要稳，扇急了菜就糊。'], ['', '松伯的茶得用刚滚的水，凉一点他都喝得出来。'], ['得意', '青禾姐切菜，小桃烧火，阿福劈柴——咱们院里一个都不闲着！'], ['担心', '晌午日头毒，少爷在屋檐底下站着，别晒着。']],
      '酉': [['认真', '花盆得搬到檐下去，夜里露重，娇的花受不住。'], ['得意', '少爷帮小桃扶一下——哎呀不用不用，小桃搬得动！'], ['笑', '摘几枝插瓶，晚上少爷屋里就香香的。'], ['笑', '黄昏的花最好看，颜色都暖了。'], ['羞', '（小声）少爷，小桃看见青禾姐偷偷在绣东西……是给谁的呀？']],
      '戌': [['惊喜', '少爷！……小桃头发还没梳好呢，您先别看。'], ['笑', '这把梳子是青禾姐送的，桃木的。'], ['得意', '晚上梳一百下头发，第二天就顺顺的。'], ['', '少爷要喝甜汤吗？灶上还温着一碗。'], ['委屈', '小桃今天搬了二十盆花，胳膊都酸了。']],
      out: [['惊喜', '少爷快来！萤火虫！'], ['', '嘘——别吓跑它们。']],
    },
    servant: {
      '卯': [['困', '少、少爷早！（哈欠）……没有没有，阿福一点都不困！'], ['得意', '头一担水已经挑进缸了，还差两担。'], ['笑', '院门我扫过了，连门槛都擦了。'], ['笑', '早上的井水最甜，少爷要不要尝一口？'], ['委屈', '松伯说一日之计在于晨……阿福的晨都给扁担了。']],
      '午': [['大笑', '嘿——哈！少爷您看，一斧子两半！'], ['认真', '柴劈够了能烧三天，入冬前得再多备些。'], ['得意', '劈柴也是力气活，阿福胳膊上都有肉了，少爷摸摸？'], ['', '这斧子是松伯年轻时用的，比阿福年纪还大。'], ['担心', '少爷离远点，木屑会蹦。']],
      '酉': [['', '这根杆子比阿福还高，点灯得踮着脚。'], ['得意', '一盏、两盏……阿福一盏都不会落下。'], ['认真', '天黑之前灯都要点上，少爷回来才看得见路。'], ['笑', '松伯说灯笼要对着门，福气才进得来。'], ['担心', '少爷您站远点，火星子会掉下来。']],
      '戌': [['认真', '一、二、三……少爷别吵，阿福在算今天的柴钱。'], ['得意', '账本上的字都是阿福自己写的，少爷看，是不是比上回好看了？'], ['笑', '算盘珠子拨得响，松伯说听着就知道我没偷懒。'], ['大笑', '今天的账对上了！一文钱都不差！'], ['困', '少爷早些歇吧，阿福算完这页也睡。']],
      out: [['委屈', '唔！……少爷！阿福、阿福就吃一个！']],
    },
    steward: {
      '卯': [['笑', '少爷起得早。今儿天色好，东边一片云都没有。'], ['', '这些雀儿每天这个时辰来，跟算好了似的。'], ['点头', '人老了觉少，天不亮就醒了。正好替少爷看着院子。'], ['念叨', '早饭青禾在灶上热着，少爷练完剑就去吃。'], ['笑', '少爷小时候也爱蹲在这儿看雀儿，一看就是半个时辰。']],
      '午': [['笑', '（吹了吹茶）少爷来坐。这茶是小桃沏的，火候刚好。'], ['点头', '账上的米面还够吃半个月，少爷不用操心。'], ['念叨', '晌午歇一歇，下午练剑才有力气。'], ['笑', '宗主前几日来信问少爷近况，我回他：吃得下，睡得着，长个子了。'], ['', '这石桌是我搬来的，那年少爷才到我腰这么高。']],
      '酉': [['', '天要黑了。少爷今天练得如何？'], ['念叨', '那盏灯笼挂歪了，回头让阿福扶正。'], ['笑', '黄昏这一阵最好，凉快，也不黑。少爷陪我走两步？'], ['认真', '院里转一圈，门窗、灶火、井盖，样样都要看过才安心。'], ['念叨', '少爷累了就早些歇，别学宗主年轻时那样熬夜。']],
      '戌': [['笑', '少爷还没睡？我写几个字就歇。'], ['叹气', '人老了，字写得慢。'], ['点头', '灯油还够，少爷别惦记。'], ['', '明天的事我都记下了，少爷安心睡。']],
      out: [['', '少爷还没歇？我再巡一圈门窗。'], ['念叨', '夜里凉，少爷披件衣裳。'], ['笑', '提着灯走一圈，院里每个角落都亮一亮，睡得踏实。']],
    },
  };
  const line = (k, key) => { const L = (LINES[k] || {})[key]; if (!L || !L.length) return null; const [e, t] = pick(L); return [WHO[k] + (e ? '·' + e : ''), t]; };
  // 子夜：床边轻声
  const SLEEP = {
    maid1: ['青禾睡得很安稳，被角掖得整整齐齐。枕边搁着没绣完的绣绷。', '青禾翻了个身，迷迷糊糊地嘟囔了一句：「……少爷的衣裳……补好了……」'],
    maid2: ['小桃睡得四仰八叉，被子一半滑到了床沿下。', '小桃抱着枕头，嘴角还带着笑。大概梦见花开了。'],
    servant: ['阿福抱着枕头，呼噜打得一起一伏。', '阿福睡得正香，一只脚还伸在被子外头。'],
    steward: ['松伯睡得很轻，少爷一走近，他翻了个身，又睡着了。', '松伯的鞋整整齐齐摆在床边，老花镜压在账本上。'],
  };

  // ---------- 十二件小事 ----------
  const seen = n => !!(F().qz_ev || {})[n];
  const markSeen = n => { const f = F(); f.qz_ev = f.qz_ev || {}; if (f.qz_ev[n]) return; f.qz_ev[n] = 1; const c = Object.keys(f.qz_ev).length;
    try { playSnd('ui_confirm', .5); } catch (e) {} toast(c >= 12 ? '青竹小院 · 十二件小事，都看过了' : '青竹小院 · 小事 ' + c + ' / 12', 2200); };
  // 作者 11-08：剧情里不放插画（只用立绘对话）—— R144 这十二张插画的用处是青竹一带的载入图（见文件末尾 QZ_LOAD_ART）
  async function story(n, fn) {
    world.locked = true; if (world.player) world.player.moving = false;
    try { await fn(async () => {}); markSeen(n); }
    finally { world.locked = false; }
  }
  const healAll = (mpOnly) => { try { const h = S.hero; if (!mpOnly) h.hp = h.maxhp; h.mp = h.maxmp; if (!mpOnly && typeof partyHealAll === 'function') partyHealAll(); } catch (e) {} };
  const cat = () => (window.R139_CATNAME ? R139_CATNAME() : '小猫');

  const EV = {
    1: () => story(1, async show => {
      await narrate('小桃蹲在花圃前，忽然朝少爷招手，神神秘秘地伸出一根指头。');
      await show();
      await say('侍女小桃·惊喜', '少爷您看——花瓣上滚下来的，一颗露珠！');
      await say('侍女小桃·笑', '它在指尖上能待好一会儿呢，太阳一照就没了。');
      await say('叶孤星', '……像一颗小小的灵珠。');
      await say('侍女小桃·得意', '那少爷许个愿吧！小桃听人说，清早的露水能把愿望捎上天。');
      const i = await choose('许个什么愿？', ['愿院里的人都平平安安', '愿小桃的花年年都开', '（不说出来，偷偷许）']);
      if (i === 0) await say('侍女小桃·感动', '……少爷许的愿，里头也有小桃呀。');
      else if (i === 1) await say('侍女小桃·大笑', '那它们一定开！小桃天天浇，开到少爷看腻为止！');
      else await say('侍女小桃·嗔', '少爷小气！……不过说出来就不灵了，那您可要好好许。');
      await narrate('露珠在她指尖上晃了晃，映着一点晨光，轻轻滚落进花心里。');
    }),
    2: () => story(2, async show => {
      await narrate('推开门，门口的小竹凳上放着一只铜盆，温水上还飘着一缕热气，旁边叠着一条晒过的布巾。');
      await show();
      await narrate('水温刚好。也不知道是谁，算准了少爷起床的时辰。');
      await say('星旋', '（我赌一壶酒，是那个叫青禾的丫头。）');
      healAll(true); await narrate('叶孤星洗了把脸，神清气爽。');
    }),
    3: () => story(3, async show => {
      await say('松伯·笑', '少爷坐。……说起来，您小时候也在这石桌边上偷过东西吃。');
      await say('叶孤星', '有吗？');
      await show();
      await say('松伯·大笑', '那年中秋，供桌上的果子少了一盘。宗主找了一圈，最后在少爷被窝里搜出来七个桃核。');
      await say('松伯·笑', '宗主板着脸问您，您说——是星星饿了，替它们吃的。');
      await say('叶孤星', '……');
      await say('星旋', '（噗。那会儿我还没在你身边呢，别赖我。）');
      await say('松伯·点头', '宗主当时没忍住，转过身去笑了好半天。后来每年中秋，供桌上都多摆一盘桃。');
    }),
    4: () => story(4, async show => {
      await narrate('一阵风忽然卷过西院，小桃别在襟上的手帕被吹了起来，一路飘上竹梢挂住了。');
      await say('侍女小桃·担心', '啊！我的手帕——那是娘绣的！');
      await fxHanky();
      await narrate('叶孤星并指一划，一道细细的剑气掠过竹梢——竹叶没落一片，手帕却轻飘飘地落了下来，正好落进他手心。');
      await show();
      await say('侍女小桃·感动', '少、少爷……！');
      await say('侍女小桃·羞', '谢谢少爷……小桃以后一定把它缝牢在衣襟上。');
      await say('星旋', '（剑气收得不错。——比你平时削竹子准多了。）');
    }),
    5: () => story(5, async show => {
      await narrate('阿福踮着脚，把最后一盏灯笼挑亮。暖黄的光一下子照亮了他的脸。');
      await show();
      await say('小厮阿福·大笑', '少爷！都点上了！您看，从院门一路亮到您屋门口。');
      await say('小厮阿福·得意', '松伯说，灯要一盏一盏点，这样少爷不管多晚回来，都能顺着灯找到家。');
      await say('叶孤星', '……嗯。辛苦了，阿福。');
      await say('小厮阿福·羞', '不辛苦！阿福最喜欢点灯了。');
    }),
    6: () => story(6, async show => {
      await narrate('厨房里没点灯，蒸笼边蹲着一个人影，腮帮子鼓得圆圆的。');
      await say('小厮阿福·惊喜', '唔！！（少爷！）');
      await show();
      await say('小厮阿福·委屈', '阿福、阿福就吃了一个……晚上劈柴饿得慌……');
      await narrate('阿福犹豫了一下，把手里那个掰成两半，大的那半硬塞进少爷手里。');
      await say('小厮阿福·笑', '少爷也吃！吃了就是同伙了，不许告诉松伯！');
      await say('星旋', '（……行吧，同伙。）');
      healAll(false); toast('半个肉包子，还热乎——气血、灵力回满了', 2000);
    }),
    7: () => story(7, async show => {
      await narrate('西院石桌边，青禾一个人坐着，绣绷搁在一旁，抬头看着月亮。');
      await say('侍女青禾·惊喜', '少爷也没睡呀。');
      await show();
      await say('侍女青禾', '我娘是山下的绣娘。小时候，她总在这样的月亮底下赶活，我就趴在她膝头数针脚。');
      await say('侍女青禾', '后来娘眼睛不好了，就把我送上山来。她说，天剑宗的少爷心善，跟着他不会受委屈。');
      await say('侍女青禾·感动', '……娘说得对。');
      await say('叶孤星', '下回下山，我陪你回去看看她。');
      await say('侍女青禾·感动', '少爷……');
      await say('侍女青禾·笑', '那青禾得赶紧绣个新香囊给娘捎去——就说，是少爷送的。');
    }),
    8: () => story(8, async show => {
      await narrate('井边的草丛里，萤火虫一闪一闪。小桃双手拢成一盏小灯笼，蹑手蹑脚地走过来。');
      await say('侍女小桃·惊喜', '少爷，伸手——');
      await show();
      await narrate('她把手轻轻打开，一点微光落进少爷掌心，停了一停，又慢悠悠地飞走了。');
      await say('侍女小桃·笑', '它在少爷手里亮了好久！小桃听说，萤火虫只肯停在心善的人手上。');
      await say('叶孤星', '这是你编的吧。');
      await say('侍女小桃·得意', '嘿嘿……被少爷发现了。可它就是停了嘛。');
    }),
    9: () => story(9, async show => {
      await narrate('阿福抱着枕头睡得正香，嘴唇动了动。');
      const b = dream('娘……我在天剑宗……过得可好了……');
      try { await new Promise(r => setTimeout(r, 1600)); } finally { b(); }
      await show();
      await say('小厮阿福', '（梦话）娘……我在天剑宗过得可好了……少爷对我可好了……');
      await narrate('叶孤星站了一会儿，替他把滑下来的被子拉上去，轻轻掩上了门。');
      await say('星旋', '（这小子……）');
    }),
    10: () => story(10, async show => {
      await narrate('管事房的灯还亮着。松伯戴着老花镜，伏在案上一笔一画地写信。');
      await say('松伯·惊喜', '少爷？这么晚了还没睡。');
      await show();
      await say('松伯', '给宗主的信。宗主在外头，心里惦记少爷，我每个月写一封。');
      await narrate('信纸上的字端端正正：「少爷近日饭量见长，夜里练剑至二更……前日替阿福挑水，替小桃摘花……」');
      await say('松伯·笑', '写的都是些鸡毛蒜皮。可宗主就爱看这些。');
      await say('叶孤星', '……松伯，替我也写一句吧。就说，我很好。');
      await say('松伯·感动', '好，好。这句我写在最前头。');
    }),
    11: () => story(11, async show => {
      await narrate('夜深了，院里只剩月光。叶孤星体内，星旋轻轻动了动。');
      await say('星旋', '（喂，睡不着就别装了。上去坐坐？）');
      await narrate('叶孤星足尖一点，落在居室的屋脊上。一道淡淡的星光从他身边浮出来，化作少年的模样，挨着他坐下。');
      await show();
      await say('星旋', '（你们这院子，晚上倒是安静。）');
      await say('叶孤星', '嗯。小时候睡不着，我就爬上来数星星。');
      await say('星旋', '（数到多少了？）');
      await say('叶孤星', '……从来没数完过。');
      await say('星旋', '（那以后我陪你数。反正我也不睡觉。）');
    }),
    12: () => story(12, async show => {
      await narrate('墙头上坐着一个小小的影子，尾巴绕在脚边，一动不动地望着月亮。');
      await show();
      await narrate('是' + cat() + '。月亮又大又圆，它就那样蹲着，像是在等什么人。');
      await narrate('少爷轻轻叫了一声，它回过头，「喵」了一声，又转回去看月亮了。');
      await say('星旋', '（……猫也会想家吗。）');
    }),
  };
  // 手帕飘落 + 剑气一闪（全屏小特效）
  async function fxHanky() {
    const t0 = performance.now();
    const ov = { draw() { const t = (performance.now() - t0) / 1000; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
      const ig = IDX.sword_glint_6f, ih = IDX.hanky_fall_6f, im = img('prop');
      if (im && ig && t < .6) { const f = Math.min(5, Math.floor(t * ig.fps)); ctx.globalCompositeOperation = 'screen'; ctx.drawImage(im, ig.x + f * ig.w, ig.y, ig.w, ig.h, 640 - 288, 180, 576, 288); ctx.globalCompositeOperation = 'source-over'; }
      if (im && ih && t > .25) { const f = Math.min(5, Math.floor((t - .25) * ih.fps)); ctx.drawImage(im, ih.x + f * ih.w, ih.y, ih.w, ih.h, 640 - 160, 200 + Math.min(1, (t - .25) / .9) * 160, 320, 300); }
      ctx.restore(); } };
    S.overlay.push(ov); try { playSnd('sfx_sword', .5); } catch (e) {}
    await new Promise(r => setTimeout(r, 1300)); const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1);
  }
  // 梦话气泡（屏幕上方）
  function dream(text) {
    const t0 = performance.now(); const ov = { draw() { const d = IDX.dream_bubble, im = img('prop'); const k = Math.min(1, (performance.now() - t0) / 300);
      ctx.save(); ctx.globalAlpha = k; const x = 640 - 270, y = 210; if (im && d) ctx.drawImage(im, d.x, d.y, d.w, d.h, x, y, 540, 258);
      ctx.fillStyle = '#5a4a3a'; ctx.font = `26px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 640, y + 96); ctx.restore(); } };
    S.overlay.push(ov); return () => { const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); };
  }

  // ---------- 原来的人：选了时辰就让位 ----------
  const ORIG = {};   // 原来白天 / 夜里的那几位（对话里的小任务还要从他们那儿走）
  const hideWhenOn = n => { const c0 = n.cond; n.cond = function () { if (ON()) return false; return !c0 || c0.apply(this, arguments); }; };
  setTimeout(() => {
    for (const id of Object.keys(TMAPS)) if (QZ(id)) for (const n of (TMAPS[id].npcs || [])) {
      if (n.q162) continue;
      const k = n.r135e || ''; if (!k) continue;
      if (n._r135day && id === COURT) { ORIG[k + '_day'] = n; hideWhenOn(n); }
      else if (n._r135night) { ORIG[k + '_night'] = n; hideWhenOn(n); }
      else if (k === 'steward') { ORIG['steward_' + (id === COURT ? 'day' : 'room')] = n; hideWhenOn(n); }
    }
  }, 0);
  const origTalk = (k, part, a) => { const n = ORIG[k + '_' + part]; return n && typeof n.talk === 'function' ? n.talk(a) : null; };

  // ---------- 新的人：每个时辰一套（同一个人每张图上都有一个定义，按时辰决定在不在）----------
  const P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const DEFS = [];
  function addDef(key, map, who) {
    const d = TMAPS[map]; if (!d) return; d.npcs = d.npcs || [];
    const n = { key: 'none', name: WHO[who] || '小猫', c: 0, r: 0, h: who === 'cat' ? 44 : 108, wander: false, q162: { key, who, map }, cond: () => !!curPlan(n) };
    if (who === 'servant') n.r139 = 'servant';   // 水缸边松伯念叨阿福那段要找得到他
    n.talk = a => talkTo(who, a, n);
    d.npcs.push(n); DEFS.push(n); return n;
  }
  function curPlan(n) { if (!ON()) return null; const q = n.q162, s = shi(); const pl = q.key !== q.who ? (PLAN[s] || {})[q.key] : planOf(q.who, s); return pl && pl.map === q.map ? pl : null; }
  const CAT_GLOW = { map: COURT, at: Y(300, 1462), steps: [{ act: 'cat_glow_6f', t: 1e9, face: -1 }] };
  const catPlan = () => (shi() === '戌' && F().qz_out === 'maid2' ? CAT_GLOW : (PLAN[shi()] || {}).cat);
  for (const who of ['maid1', 'maid2', 'servant', 'steward']) {
    const maps = new Set([COURT, RM[who], RM.kitchen]); for (const m of maps) addDef(who, m, who);
  }
  addDef('maid1k', RM.kitchen, 'maid1'); addDef('maid2k', RM.kitchen, 'maid2');
  for (const n of DEFS) if (n.q162.who === 'steward') n.mark = () => ON() && !F().steward_met;
  const catNpc = () => (TMAPS[COURT].npcs || []).find(n => n.r139cat);

  // ---------- 子夜：床上的人 + 床边轻声 ----------
  const BEDS = { maid1: ['maid1_sleep_night_4f', null, 538, [262, 452]], maid2: ['maid2_sleep_night_4f', 'maid2_kick_night_4f', 538, [262, 452]], servant: ['servant_sleep_night_4f', 'servant_dream_night_4f', 399.5, [282, 446]], steward: ['steward_sleep_night_4f', null, 407, [366, 436]] };
  const asleep = k => ON() && shi() === '子' && !(k === 'steward' && F().qz_letter);
  for (const k in BEDS) { const m = RM[k], d = TMAPS[m]; if (!d) continue; d.npcs = d.npcs || []; const [c, r] = P(...BEDS[k][3]);
    d.npcs.push({ key: 'none', name: WHO[k] + '（睡着了）', c, r, h: 90, hidden: true, wander: false, q162bed: k, cond: () => asleep(k), talk: () => bedTalk(k) }); }
  async function bedTalk(k) {
    if (k === 'servant' && !seen(9)) return EV[9]();
    await narrate(pick(SLEEP[k]));
    if (k === 'maid2') { const i = await choose('', ['替她把被子盖好', '轻轻退出去']); if (i === 0) { BEDK.maid2 = -99; await narrate('叶孤星把被子拉上来，掖了掖被角。小桃咂了咂嘴，翻身接着睡。'); } }
  }
  const BEDK = { maid2: 0, servant: 0 };

  // ---------- 说话 ----------
  async function talkTo(who, a, n) {
    const s = shi(), f = F(), q = n.q162, out = s === '戌' && f.qz_out === who && q.map === (OUT[who] || {}).map;
    const day = s === '卯' || s === '午' || s === '酉';
    // 1) 这个时辰的小事
    if (who === 'maid2' && s === '卯' && !seen(1)) return EV[1]();
    if (who === 'steward' && s === '午' && !seen(3)) return EV[3]();
    if (who === 'maid2' && s === '酉' && !seen(4)) return EV[4]();
    if (who === 'servant' && s === '酉' && !seen(5) && Object.keys(DAY.lit).length >= 3) return EV[5]();
    if (out && OUT[who].ev && !seen(OUT[who].ev)) return EV[OUT[who].ev]();
    if (who === 'steward' && s === '子' && f.qz_letter && !seen(10)) return EV[10]();
    // 2) 原来的小任务（挑水、种花、香囊、教写字……）还没做完，先走原来的
    if (day && q.map === COURT) {
      if ((who === 'servant' && !f.qz_afu_help) || (who === 'maid2' && !f.qz_bed) || (who === 'maid1' && !f.qz_qh1) || (who === 'steward' && f.steward_met && !f.qz_song)) { const r = origTalk(who, who === 'steward' ? 'day' : 'day', a); if (r) return r; }
    }
    if (s === '戌' && !out && q.map === RM[who]) {
      if ((who === 'maid1' && f.qz_afu_help && f.qz_bed && !f.qz_sachet) || (who === 'servant' && !f.qz_afu_write) || (who === 'maid2' && f.qz_bed && !f.qz_xt_vase)) { const r = origTalk(who, 'night', a); if (r) return r; }
    }
    // 3) 松伯：传送玉符照旧（头一回见面那段也照旧）
    if (who === 'steward' && !f.steward_met) { const r = origTalk('steward', q.map === COURT ? 'day' : 'room', a); if (r) return r; }
    if (who === 'steward') {
      const l = line('steward', out ? 'out' : s); if (l) await say(l[0], l[1]);
      const i = await choose('松伯', ['传送到去过的地方', '没事了']);
      if (i === 0) { const r = origTalk('steward', q.map === COURT ? 'day' : 'room', a) || origTalk('steward', 'day', a); if (r) return r; }
      return;
    }
    // 4) 这个时辰的家常话（偶尔走原来那套，原来的选项还能用）
    if (day && q.map === COURT && Math.random() < .25) { const r = origTalk(who, 'day', a); if (r) return r; }
    const l = line(who, out ? 'out' : s); if (l) await say(l[0], l[1]);
  }
  // 小猫：子夜墙头看月亮 → 小事；平时照旧（喂它、起名字）
  { const cn = catNpc(); if (cn) { const t0 = cn.talk; cn.talk = async a => {
    if (ON() && shi() === '子') { if (!seen(12)) return EV[12](); return narrate(cat() + '蹲在墙头，尾巴一甩一甩，回头看了少爷一眼，又转回去看月亮。'); }
    if (ON() && shi() === '酉' && !F().cat_met) return t0(a);
    return t0(a);
  }; } }

  // ---------- 走路 / 动作 ----------
  const cellPx = (T, c, r) => [(c + .5) * T.cs, (r + .5) * T.cs];
  function plan(a, T, to) {
    try { const cs = T.cs, p = findPath(T, Math.floor(a.x / cs), Math.floor(a.y / cs), Math.floor(to[0] / cs), Math.floor(to[1] / cs));
      if (!p || !p.length) return [to.slice()]; const out = []; for (let i = 2; i < p.length; i += 2) out.push(cellPx(T, p[i][0], p[i][1])); out.push(to.slice()); return out;
    } catch (e) { return [to.slice()]; }
  }
  function enter(a, T) {
    const q = a._q, st = q.pl.steps[q.i % q.pl.steps.length]; q.st = st; q.t = 0; q.t0 = now(); q.path = null; a.moving = false;
    if (st.loop != null) { q.i = st.loop; return enter(a, T); }
    if (st.go) q.path = plan(a, T, st.go);
    if (st.hide) { q.home = [a.x, a.y]; a.x = -99999; a.y = -99999; }
    if (st.face) q.face = st.face;
    if (st.lit) setTimeout(() => { DAY.lit[st.lit] = now(); }, 1400);
  }
  function stepDone(a, T) { const q = a._q, st = q.st; if (st.hide && q.home) { a.x = q.home[0]; a.y = q.home[1]; q.home = null; } if (st.fn) try { st.fn(); } catch (e) {}
    if (st.fill && window.R139_VAT) R139_VAT.add(1); q.i++; enter(a, T); }
  if (typeof tileUpdate === 'function') tileUpdate = (o => function (dt) {
    o.apply(this, arguments);
    try {
      if (!ON() || !world.actors || !world.map || !world.map.T) return;
      const T = world.map.T, p = world.player, busy = (typeof choice !== 'undefined' && choice);
      for (const a of world.actors) { const n = a.npc; if (!n) continue;
        const isCat = n.r139cat && world.mapName === COURT;
        if (!n.q162 && !isCat) continue;
        const pl = isCat ? catPlan() : curPlan(n); if (!pl) continue;
        if (!a._q || a._q.pl !== pl) { a._q = { pl, i: 0, face: -1, oy: pl.sy ? pl.at[1] - pl.sy : 0 }; const at = pl.at; a.x = at[0]; a.y = pl.sy || at[1]; if (isCat) a._cat = { st: 'q162', t0: 0 }; enter(a, T); }
        const q = a._q, st = q.st;
        if (a._a142) continue;
        const talking = a.talking || (typeof dialog !== 'undefined' && dialog && dialog.who && String(dialog.who).split('·')[0] === n.name) || busy;
        if (talking) { a.moving = false; continue; }
        if (st.go) {
          const tgt = q.path && q.path[0]; if (!tgt) { stepDone(a, T); continue; }
          if (p && Math.hypot(p.x - a.x, p.y - a.y) < 44) { a.moving = false; continue; }
          const dx = tgt[0] - a.x, dy = tgt[1] - a.y, d = Math.hypot(dx, dy), sp = (isCat ? 40 : st.w ? 50 : 56) * Math.min(dt, .05);
          if (d <= sp) { a.x = tgt[0]; a.y = tgt[1]; q.path.shift(); } else { a.x += dx / d * sp; a.y += dy / d * sp; }
          a.moving = true; q.dx = dx; q.dy = dy; if (Math.abs(dx) > .3) q.face = dx > 0 ? 1 : -1;
        } else { a.moving = false; q.t += dt; if (q.t >= (st.t || st.wait || st.hide || 1)) stepDone(a, T); }
      }
      // 子夜：小桃踢被、阿福翻身
      if (shi() === '子') { const t = now(); for (const k of ['maid2', 'servant']) if (world.mapName === RM[k] && t - BEDK[k] > 18 + Math.random() * 30) BEDK[k] = t; }
      // 卯时第一次从居室出来：门口的温水
      if (world.mapName === COURT && shi() === '卯' && !seen(2) && FROM_ROOM && DAY.basin && !world.locked && !dialog && !busy) { FROM_ROOM = false; EV[2](); }
      // 子夜第一次在院里：一人一灵上屋脊看星
      if (world.mapName === COURT && shi() === '子' && !seen(11) && !world.locked && !dialog && !busy) { NIGHT_T += dt; if (NIGHT_T > 2.5) { NIGHT_T = -1e9; EV[11](); } }
    } catch (e) { console.warn('r162 life', e); }
  })(tileUpdate);
  let FROM_ROOM = false, NIGHT_T = 0;

  // ---------- 画 ----------
  if (typeof drawActorT === 'function') drawActorT = (o => function (a, t) {
    try {
      if (a && a._q162prop) { ctx.save(); undoAZ(a); a._q162prop(a); ctx.restore(); return; }
      const n = a && a.npc;
      if (n && ON() && a._q && !a._a142 && (n.q162 || n.r139cat)) { const y0 = a.y; a.y += a._q.oy || 0; let ok = false; try { ok = drawQ(a, n); } finally { a.y = y0; } if (ok) return; }
    } catch (e) {}
    return o.apply(this, arguments);
  })(drawActorT);
  function drawQ(a, n) {
    const q = a._q, st = q.st || {}, p = world.player, isCat = !!n.r139cat;
    const talking = a.talking || (typeof dialog !== 'undefined' && dialog && dialog.who && String(dialog.who).split('·')[0] === n.name);
    let face = q.face || -1; if (talking && p) face = p.x > a.x ? 1 : -1;
    if (st.go) {
      const dx = q.dx || 0, dy = q.dy || 0;
      if (isCat) { shadow(a.x, a.y - 1, 15, 5, .22); return act('cat_walk_left_6f', a.moving ? Math.floor(now() * 8) % 6 : 0, a.x, a.y, dx > 0, CATSC); }
      if (st.w === 'patrol') { shadow(a.x, a.y); return act('steward_patrol_6f', Math.floor(now() * 6) % 6, a.x, a.y, dx > 0); }
      if (st.w) { const [id, fl] = carryId(st.w, dx, dy); shadow(a.x, a.y); return act(id, a.moving ? Math.floor(now() * 7) % 6 : 1, a.x, a.y, fl); }
      shadow(a.x, a.y); return walkDraw(a, n.q162.who, talking && p ? p.x - a.x : dx, talking && p ? p.y - a.y : dy, a.moving);
    }
    if (st.act) {
      const d = IDX[st.act]; if (!d) return false;
      const f = st.once || d.loop === false ? Math.min(d.n - 1, Math.floor((now() - q.t0) * d.fps)) : Math.floor((now() - q.t0) * d.fps + (a.x * .01 % 1) * d.n) % d.n;
      if (isCat) { if (st.act !== 'cat_silhouette_4f') shadow(a.x, a.y - 1, 15, 5, .22); return act(st.act, f, a.x, a.y, face > 0, CATSC); }
      shadow(a.x, a.y); return act(st.act, f, a.x, a.y, face > 0);
    }
    // 歇着：带东西的停着拿东西，其余站着
    if (isCat) return act('cat_lick_paw_6f', 0, a.x, a.y, face > 0, CATSC);
    shadow(a.x, a.y);
    const prev = q.pl.steps[(q.i - 1 + q.pl.steps.length) % q.pl.steps.length];
    if (prev && prev.w && prev.w !== 'patrol' && st.wait && !st.fn) { const [id] = carryId(prev.w, 0, 1); return act(id, 1, a.x, a.y, false); }
    if (prev && prev.w === 'steward_lantern') return act('steward_lantern_down_6f', 1, a.x, a.y, false);
    return walkDraw(a, n.q162.who, talking && p ? p.x - a.x : face, talking && p ? p.y - a.y : 1, false);
  }

  // ---------- 道具（按脚底 y 和人物、物件一起排序）----------
  // 每个道具是一个没有 npc 的「假人」：进图时塞进 world.actors，换图自然清掉
  const propA = (x, y, sy, draw) => ({ x, y: sy != null ? sy : y, _px: x, _py: y, _q162prop: draw, moving: false });
  function propsFor(m, s) {
    const L = [];
    const P1 = (id, x, y, sc, sy) => L.push(propA(x, y, sy, a => { prop(id, null, a._px, a._py, sc); }));
    if (m === COURT) {
      if (s === '卯') { L.push(propA(1012, 574, null, a => { if (!DAY.basin) return; prop(seen(2) ? 'wash_stool' : 'warm_wash', null, a._px, a._py, .42); }));
        L.push(propA(800, 612, null, a => birds(a))); }
      if (s === '午') { P1('tea_tray', ...TABLE, .5, 1414); L.push(propA(TABLE[0] - 34, TABLE[1] + 2, 1415, a => { if (DAY.noodles) prop('noodles', 0, a._px, a._py, .42); }));
        P1('woodpile', ...Y(566, 1200), .55); L.push(propA(...Y(760, 1196), null, a => butterfly(a))); }
      if (s === '戌' && F().qz_out === 'maid1') P1('hoop', TABLE[0] - 20, TABLE[1], .48, 1414);
      if (s === '戌' && F().qz_out === 'maid2') L.push(propA(...Y(300, 1420), 1500, a => { prop('firefly_cluster', Math.floor(now() * 5), a._px, a._py, .9, .9); }));
      if (s === '戌' || s === '子') P1('door_lamp', 1166, 570, .42);
    }
    if (m === RM.kitchen && s === '戌' && F().qz_out === 'servant') P1('bun_basket', 182, 520, .5, 600);
    // 床上睡着的人
    for (const k in BEDS) if (m === RM[k] && asleep(k)) { const [id, alt, sy] = BEDS[k], B = IDX[id];
      L.push(propA(B.o[0] + 128, B.o[1] + 128, sy, a => { const im = img('bed'); if (!im) return; let use = B, f = Math.floor(now() * B.fps) % B.n;
        if (alt && BEDK[k] > 0 && now() - BEDK[k] < IDX[alt].n / IDX[alt].fps) { use = IDX[alt]; f = Math.min(use.n - 1, Math.floor((now() - BEDK[k]) * use.fps)); }
        ctx.drawImage(im, f * 256, use.r * 256, 256, 256, use.o[0], use.o[1], 256, 256); })); }
    return L;
  }
  // 廊下的雀儿：少爷走近就扑棱棱飞走
  const BIRD = { flyT: -99 };
  function birds(a) {
    const sv = (world.actors || []).find(x => x.npc && x.npc.q162 && x.npc.q162.who === 'steward');
    const feeding = sv && sv._q && sv._q.st && sv._q.st.birds; const p = world.player, t = now();
    if (p && Math.hypot(p.x - a._px, p.y - a._py) < 90 && t - BIRD.flyT > 25) BIRD.flyT = t;
    const ft = t - BIRD.flyT;
    if (ft < 1.2) { prop('fly', Math.floor(ft * 7), a._px - ft * 60, a._py - ft * 90, .45); return; }
    if (ft < 25 || !feeding) return;
    prop('peck', Math.floor(t * 6), a._px, a._py, .42); prop('peck', Math.floor(t * 6) + 3, a._px + 34, a._py + 8, .38, 1, true);
  }
  function butterfly(a) { const t = now(); prop('butterfly', Math.floor(t * 6), a._px + Math.sin(t * .9) * 40, a._py - 40 + Math.sin(t * 1.7) * 14, .55); }

  // ---------- 入夜：院里点满小灯；子夜：只剩稀疏几盏 ----------
  // 作者 11-08：入夜天黑了，灯要亮一点 —— 青竹小院装饰得亮亮的，很多漂亮的小灯；到了子时才是稀疏的灯火。
  // GLOW：院里原有的石灯、灯杆、檐灯的光心；HANG：屋檐下新挂的小灯笼（R144 檐灯）。z 标记子夜还亮着的那几盏。
  const GLOW = [[202, 190], [508, 190], [204, 499], [508, 499], [1466, 589, 1], [851, 595, 1], [202, 822], [534, 824], [617, 1080], [1500, 1127],
    [816, 420], [1360, 417, 1], [1490, 427], [1890, 950], Y(160, 407), Y(1430, 407), Y(608, 1084, 1), Y(1210, 917), Y(1560, 1057), Y(244, 1005), Y(426, 1005, 1)];
  const HANG = [];
  { const row = (x0, x1, y, n, z) => { for (let i = 0; i < n; i++) HANG.push([x0 + (x1 - x0) * (n === 1 ? .5 : i / (n - 1)), y, z && z.includes(i) ? 1 : 0]); };
    row(800, 1380, 306, 6, [2]); row(1530, 1870, 368, 4); row(1550, 1890, 905, 4); row(170, 470, 1118, 3);
    row(...[230, 570].map(x => x - OX), 332, 4, [1]); row(...[810, 1150].map(x => x - OX), 332, 4); row(...[690, 1030].map(x => x - OX), 1012, 4); }
  function nightLights(s, t, A) {
    const mid = s === '子', fl = i => .9 + Math.sin(t * 5.3 + i * 1.7) * .05 + Math.sin(t * 11 + i) * .03;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, a, i) => { const g = ctx.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, `rgba(255,206,130,${a * fl(i)})`); g.addColorStop(.35, `rgba(255,170,90,${a * .45 * fl(i)})`); g.addColorStop(1, 'rgba(255,150,70,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    GLOW.forEach(([x, y, z], i) => { if (mid && !z) return; glow(x, y, mid ? 110 : 150, mid ? .4 : .62, i); glow(x, y + 70, mid ? 120 : 170, mid ? .12 : .2, i); });
    HANG.forEach(([x, y, z], i) => { if (mid && !z) return; glow(x, y - 14, mid ? 70 : 96, mid ? .4 : .6, i + 40); });
    ctx.restore();
    HANG.forEach(([x, y, z], i) => { if (mid && !z) return; prop('lantern_lit', 0, x, y + Math.sin(t * 1.3 + i) * 1.2, .32); });
    if (!mid) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; GLOW.forEach(([x, y], i) => { if (i % 2 === 0) A('eaves_halo_6f', x, y, .55, .7); }); ctx.restore(); }
  }

  // ---------- 光影：时辰叠层 + 小动画 ----------
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, now0) {
    o.apply(this, arguments);
    try {
      if (!ON()) return; const m = world.mapName, s = shi(), t = now();
      if (m === COURT) {
        const L = LIGHTS[s]; if (L) for (const k of L) { const im = img('l_' + k); if (!im) continue; const d = IDX[k]; ctx.drawImage(im, /^west/.test(k) ? -OX : 0, 0, d.w, d.h); }
        if (s === '戌' || s === '子') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = s === '子' ? 'rgb(140,148,190)' : 'rgb(196,200,228)'; ctx.fillRect(T.x0 || 0, 0, T.mw - (T.x0 || 0), T.mh); ctx.restore(); }
        const A = (id, x, y, sc, al) => { const d = IDX[id]; if (d) prop(id, Math.floor(t * d.fps), x, y, sc, al); };
        if (s === '卯') { A('dawn_fog_8f', ...Y(190, 1400), 1.1, .85); A('dawn_fog_8f', 1130, 1080, 1.3, .7); A('dawn_fog_8f', ...Y(800, 760), 1.4, .5); }
        if (s === '酉') A('dusk_hearth_smoke', ...Y(465, 769), 1, .9);
        if (s === '戌') { A('fireflies_8f', ...Y(200, 1330), 1, 1); A('fireflies_8f', ...Y(1400, 900), 1, .9); A('fireflies_8f', 1130, 1040, 1.1, .9); }
        if (s === '戌' || s === '子') nightLights(s, t, A);
        if (s === '戌' || (s === '酉' && Object.keys(DAY.lit).length)) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const k in LANT) { if (s === '酉' && !DAY.lit[k]) continue; const al = s === '酉' ? Math.min(1, (t - DAY.lit[k]) / .8) : 1; A('eaves_halo_6f', LANT[k][0], LANT[k][1], .62, .85 * al); } ctx.restore(); }
        if (s === '子') { A('moon_bamboo_8f', 120, 300, 1, .9); A('moon_bamboo_8f', 1960, 320, 1, .9); A('moon_bamboo_8f', ...Y(220, 120), 1, .85); A('moon_bamboo_8f', ...Y(1420, 160), 1, .85); }
      } else if (/^qingzhu_room_|^qingzhu_kitchen$/.test(m)) {
        const rk = { qingzhu_room_qinghe: 'maid1', qingzhu_room_xiaotao: 'maid2', qingzhu_room_afu: 'servant', qingzhu_kitchen: 'kitchen' }[m];
        if (s === '卯' || s === '酉') { const im = img('l_window_' + rk + (s === '卯' ? '_dawn' : '_dusk')); if (im) ctx.drawImage(im, 0, 0, 832, 768); }
        if (s === '子') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(168,172,205)'; ctx.fillRect(0, 0, T.mw, T.mh); ctx.restore(); }
      } else if (m === 'tj_room' || m === RM.steward) {
        ctx.save(); ctx.globalCompositeOperation = s === '子' ? 'multiply' : 'soft-light';
        const c = { '卯': 'rgba(170,205,230,.35)', '酉': 'rgba(255,150,70,.45)', '子': 'rgb(168,172,205)' }[s];
        if (c && !(s === '子' && m === RM.steward && F().qz_letter)) { ctx.fillStyle = c; ctx.fillRect(0, 0, T.mw, T.mh); } ctx.restore();
      }
    } catch (e) {}
  })(tileAmbientHigh);

  // ---------- 进图 / 出青竹 ----------
  tileSetMap = (orig => function (name) {
    const prev = world.mapName;
    if (F().qz_shi && !QZ(name)) { F().qz_shi = ''; setTod(''); }   // 走出青竹：回到白天
    const r = orig.apply(this, arguments);
    try {
      if (ON() && QZ(name)) { preload(); if (world.actors) world.actors.push(...propsFor(name, shi())); }
      FROM_ROOM = name === COURT && prev === 'tj_room'; NIGHT_T = 0;
    } catch (e) { console.warn('r162 enter', e); }
    return r;
  })(tileSetMap);

  // ---------- 床边：歇到什么时辰 ----------
  const lockedByStory = () => { const f = F(); return (f.res_tod && !f.qz_shi) || f.res_ch1 || ((f.zm || 0) >= 1 && (f.zm || 0) <= 5) || (f.ch2_night && !f.ch2_roam && !f.ch2_hall) || world.scripted; };
  let REST = null; const RTAPS = [];
  try { cv.addEventListener('pointerdown', e => { if (!REST) return; RTAPS.push(toLogical(e)); e.stopImmediatePropagation(); e.preventDefault(); }, true); } catch (e) {}
  const PX = 200, PY = 168, OPT = i => ({ x: PX + 55 + 17 + i * 151, y: PY + 104, w: 136, h: 144 });
  const uiDraw = (id, x, y, w, h) => { const d = IDX[id], im = img('ui'); if (!d || !im) return false; ctx.drawImage(im, d.x, d.y, d.w, d.h, x, y, w || d.w, h || d.h); return true; };
  const restLayer = { draw() { if (!REST) return; const k = Math.min(1, (performance.now() - REST.t0) / 220);
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(8,12,10,.5)'; ctx.fillRect(0, 0, W, H);
    if (!uiDraw('rest_panel', PX, PY)) { ctx.fillStyle = '#eef0ea'; roundRect(PX, PY, 880, 360, 18); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `40px ${typeof BRUSH !== 'undefined' ? BRUSH : 'serif'}`; ctx.fillStyle = '#3d5a48'; ctx.fillText('歇到什么时辰', 640, PY + 66);
    const cur = shi() || (night() ? '戌' : '');
    for (let i = 0; i < 5; i++) { const s = SHI[i], r = OPT(i), sel = REST.hover === i;
      uiDraw(sel ? 'rest_option_selected' : 'rest_option_normal', r.x, r.y);
      uiDraw(ICON[s], r.x + 22, r.y + 4, 92, 92);
      ctx.font = `600 22px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = '#2f4a3c'; ctx.fillText(NAME[s], r.x + 68, r.y + 108);
      ctx.font = `17px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = '#6b8576'; ctx.fillText(LAB[s] + (cur === s ? ' · 此刻' : ''), r.x + 68, r.y + 131); }
    ctx.font = `16px ${typeof FONT !== 'undefined' ? FONT : 'serif'}`; ctx.fillStyle = 'rgba(70,90,78,.75)'; ctx.fillText('躺下歇一歇，气血灵力都会回满　·　点空白处不歇了', 640, PY + 300);
    ctx.restore(); } };
  S.overlay.push(restLayer);
  async function restPanel() {
    img('ui'); REST = { t0: performance.now(), hover: -1 }; RTAPS.length = 0; const hud0 = S.hud; S.hud = false; world.locked = true;
    try { for (;;) { await nextFrame(); const tp = RTAPS.shift(); if (!tp) continue;
      for (let i = 0; i < 5; i++) if (inR(tp, OPT(i))) { REST.hover = i; try { playSnd('ui_confirm', .6); } catch (e) {} await new Promise(r => setTimeout(r, 160)); return i; }
      if (!inR(tp, { x: PX, y: PY, w: 880, h: 360 }) || tp.y > PY + 280) return -1; } }
    finally { REST = null; S.hud = hud0; world.locked = false; }
  }
  // 窗纸流光过场（8 帧，播完换时辰）
  async function restFade() {
    const t0 = performance.now(); const d = IDX.rest_fade_8f;
    const ov = { draw() { const t = (performance.now() - t0) / 1000, f = Math.min(7, Math.floor(t * 6)), im = img('fade');
      ctx.save(); const k = t < .25 ? t / .25 : t > 1.35 ? Math.max(0, 1 - (t - 1.35) / .35) : 1; ctx.globalAlpha = k; ctx.fillStyle = 'rgba(6,8,12,.55)'; ctx.fillRect(0, 0, W, H);
      if (im) ctx.drawImage(im, f * d.w, 0, d.w, d.h, 0, 0, W, H); ctx.restore(); } };
    S.overlay.push(ov);
    await new Promise(r => setTimeout(r, 700));
    return async () => { await new Promise(r => setTimeout(r, 1000)); const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); };
  }
  // 换时辰：和过图一样走一遍载入画面（青竹专属插画 + 进度条），这个时辰要用的人物动作、光影都下好了才露出画面
  async function restTo(s) {
    const f = F(), p = world.player; world.locked = true; S.hud = false;
    try {
      if (window.LOADING_KICK) { KICK = true; LOADING_KICK(); } else await restFade();
      f.qz_shi = s; setTod(s === '戌' || s === '子' ? 'night' : '');
      healAll(false);
      DAY.basin = 0; DAY.noodles = 0; DAY.lit = {};
      if (s === '戌') { const all = ['maid1', 'maid2', 'servant', 'steward'], fresh = all.filter(k => OUT[k].ev && !seen(OUT[k].ev)); f.qz_out = pick(fresh.length && Math.random() < .8 ? fresh : all); }
      if (s === '子') f.qz_letter = !seen(10) ? (Math.random() < .7 ? 1 : 0) : (Math.random() < .3 ? 1 : 0);
      if (s === '酉' && seen(5)) for (const k in LANT) DAY.lit[k] = 0;
      for (const n of DEFS) n._q = null;
      tileSetMap(world.mapName, p.x / 64 - .5, p.y / 64 - .8, p.face || 'down');
      await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < 600 && window.MAP_READY && !MAP_READY(); i++) await new Promise(r => setTimeout(r, 100));
    } finally { world.locked = false; S.hud = true; }
    toast(NAME[s] + ' · ' + LAB[s] + '　（气血、灵力回满了）', 2200);
    const hint = { '卯': '院里的人都起来干活了。', '午': '晌午了，厨房里正热闹。', '酉': '日头偏西，该收衣裳、点灯笼了。', '戌': '大家都回屋了……好像有谁还没睡？', '子': '院里静悄悄的，都睡下了。' }[s];
    if (hint) setTimeout(() => toast(hint, 2400), 2300);
  }
  { const bed = (TMAPS.tj_room.npcs || []).find(n => n.name === '床榻'); if (bed) { const t0 = bed.talk; bed.talk = async a => {
    if (lockedByStory()) return t0(a);
    const i = await restPanel(); if (i < 0) return;
    await restTo(SHI[i]);
  }; } }

  // ---------- 青竹小院专属载入图：十二张小事插画轮流放 ----------
  // loading.js 换图时问一句：是青竹一带就给一张（真正放出来了才轮到下一张）；从外面走进青竹，至少让这张图露个脸（0.9 秒）
  let KICK = false;
  const sid = i => 'story_' + String(i % 12 + 1).padStart(2, '0');
  window.QZ_LOAD_ART = (name, prev) => {
    if (!QZ(name)) return null;
    const f = F(), i = (f.qz_load_i || 0) % 12; img(sid(i)); img(sid(i + 1));
    const o = IM[sid(i)]; let used = false; const min = KICK ? 1500 : !QZ(prev) && prev ? 900 : 0; KICK = false;
    return { get im() { return o.im; }, get ok() { return o.ok; }, min, use() { if (used) return; used = true; f.qz_load_i = i + 1; } };
  };
  // 载入进度把五时辰的素材也算进去（loading.js 的 MAP_EXTRA_READY）
  window.MAP_EXTRA_READY = name => {
    if (!ON() || !QZ(name)) return 1;
    const need = [...SHEETS, ...(LIGHTS[shi()] || []).map(k => 'l_' + k)]; let ok = 0;
    for (const k of need) if (img(k)) ok++;
    let w = 0; for (const k of ['maid1', 'maid2', 'servant', 'steward']) if (walkIm(k)) w++;
    return (ok + w) / (need.length + 4);
  };
  // 开局就先下一张，第一次进青竹就有图
  setTimeout(() => { try { const i = (F().qz_load_i || 0) % 12; img(sid(i)); img(sid(i + 1)); } catch (e) {} }, 2500);

  window.R162 = { PLAN, OUT, EV, LINES, DAY, restTo, shi, propsFor, IM, restPanel };
})();
