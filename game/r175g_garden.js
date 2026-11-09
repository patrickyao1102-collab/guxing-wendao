// ================= R175 · 青竹菜园（Codex R175 第 4 批：菜园地图拆件）=================
// 作者 11-09：青竹小院西边单独开一张新图「青竹菜园」，下人们有时不在小院就在菜园；北崖瀑布就是后庭那股水从云雾里落下来。
// 地图：3072×2560，建造格 64px、碰撞格 32px（Codex collision.json）。地面 = 底图 + 北崖、灵泉、蓄水潭、主溪、支流、瀑布、老树广场；
//   水动画（瀑布 24 帧、潭面、主溪、支流、灵泉、瀑顶雾、水车、竹笕滴水）各自循环；桥和石步汀盖在水上；老槐树、石桌、园屋、东月门、竹笕、水车、灯按脚点排序。
// 五区十五块地皮：开局开「篱门田头」两块（五畦菜 + 一座鸡舍）；没开的地皮铺满荒草、树桩、乱石和「待开荒」木牌，整块挡路。
// 西院最西头开一道竹篱月门（Codex 西院入口两件），和菜园东月门互通。四时辰光层：卯 dawn / 酉 dusk / 戌 evening / 子 midnight，午用原图。
(function () {
  const GID = 'qingzhu_garden', COURT = 'qingzhu_court', D = 'r175g/', WOX = 1664;
  if (typeof TMAPS === 'undefined' || !TMAPS[COURT] || typeof buildTileMap !== 'function') return;
  const DATA = {"meta":{"fixed":{"tree":[0,0,0,806,541],"aqueduct":[0,808,0,1239,436],"house":[0,0,543,480,338],"wheel_support":[0,482,543,273,280],"east_gate":[0,757,543,288,262],"henhouse":[0,1047,543,192,192],"table":[0,1241,543,207,142],"loam_dry":[0,1450,543,128,128],"black_dry":[0,1580,543,128,128],"wood_bridge":[0,1710,543,292,127],"stone_bridge":[0,0,883,319,127],"wild_bamboo":[0,321,883,84,98],"garden_lamp":[0,407,883,64,96],"weeds_tall":[0,473,883,112,89],"scrub":[0,587,883,111,84],"steps":[0,700,883,234,81],"rubble":[0,936,883,123,74],"cabbage_ripe":[0,1061,883,64,64],"radish_ripe":[0,1127,883,64,64],"scallion_ripe":[0,1193,883,64,64],"pea_ripe":[0,1259,883,64,64],"yam_ripe":[0,1325,883,64,64],"stump":[0,1391,883,92,61],"weeds_low":[0,1485,883,95,56],"claim_sign":[0,1582,883,64,52],"marker_3":[0,1648,883,19,26],"marker_0":[0,1669,883,19,24],"marker_1":[0,1690,883,37,14],"marker_2":[0,1729,883,37,11]},"foot":{"tree":[403,541],"table":[104,142],"house":[240,338],"east_gate":[144,262],"aqueduct":[620,436],"wheel_support":[137,280],"garden_lamp":[32,96],"wood_bridge":[146,127],"steps":[117,81],"stone_bridge":[160,127],"marker_0":[10,24],"marker_1":[19,14],"marker_2":[19,11],"marker_3":[10,26],"weeds_tall":[56,89],"scrub":[56,84],"rubble":[62,74],"stump":[46,61],"weeds_low":[48,56],"wild_bamboo":[42,98],"claim_sign":[32,52],"henhouse":[96,192],"loam_dry":[64,128],"black_dry":[64,128],"cabbage_ripe":[32,64],"radish_ripe":[32,64],"scallion_ripe":[32,64],"pea_ripe":[32,64],"yam_ripe":[32,64]},"westgate":{"west_gate":[0,0,0,288,262],"west_threshold":[0,290,0,170,166]},"water":{"fall_anim#0":[0,0,0,310,354],"fall_anim#1":[0,312,0,310,354],"fall_anim#2":[0,624,0,310,354],"fall_anim#3":[0,936,0,310,354],"fall_anim#4":[0,1248,0,310,354],"fall_anim#5":[0,1560,0,310,354],"fall_anim#6":[0,0,356,310,354],"fall_anim#7":[0,312,356,310,354],"fall_anim#8":[0,624,356,310,354],"fall_anim#9":[0,936,356,310,354],"fall_anim#10":[0,1248,356,310,354],"fall_anim#11":[0,1560,356,310,354],"fall_anim#12":[0,0,712,310,354],"fall_anim#13":[0,312,712,310,354],"fall_anim#14":[0,624,712,310,354],"fall_anim#15":[0,936,712,310,354],"fall_anim#16":[0,1248,712,310,354],"fall_anim#17":[0,1560,712,310,354],"fall_anim#18":[0,0,1068,310,354],"fall_anim#19":[0,312,1068,310,354],"fall_anim#20":[0,624,1068,310,354],"fall_anim#21":[0,936,1068,310,354],"fall_anim#22":[0,1248,1068,310,354],"fall_anim#23":[0,1560,1068,310,354],"wheel_turn#0":[0,0,1424,211,259],"wheel_turn#1":[0,213,1424,211,259],"wheel_turn#2":[0,426,1424,211,259],"wheel_turn#3":[0,639,1424,211,259],"wheel_turn#4":[0,852,1424,211,259],"wheel_turn#5":[0,1065,1424,211,259],"wheel_turn#6":[0,1278,1424,211,259],"wheel_turn#7":[0,1491,1424,211,259],"wheel_turn#8":[0,1704,1424,211,259],"wheel_turn#9":[0,0,1685,211,259],"wheel_turn#10":[0,213,1685,211,259],"wheel_turn#11":[0,426,1685,211,259],"pool_anim#0":[0,639,1685,703,238],"pool_anim#1":[0,1344,1685,703,238],"pool_anim#2":[1,0,0,703,238],"pool_anim#3":[1,705,0,703,238],"pool_anim#4":[1,0,240,703,238],"pool_anim#5":[1,705,240,703,238],"pool_anim#6":[1,0,480,703,238],"pool_anim#7":[1,705,480,703,238],"branch_anim#0":[1,0,720,658,234],"branch_anim#1":[1,660,720,658,234],"branch_anim#2":[1,1320,720,658,234],"branch_anim#3":[1,0,956,658,234],"branch_anim#4":[1,660,956,658,234],"branch_anim#5":[1,1320,956,658,234],"branch_anim#6":[1,0,1192,658,234],"branch_anim#7":[1,660,1192,658,234],"branch_anim#8":[1,1320,1192,658,234],"branch_anim#9":[1,0,1428,658,234],"branch_anim#10":[1,660,1428,658,234],"branch_anim#11":[1,1320,1428,658,234],"impact#0":[1,0,1664,298,97],"impact#1":[1,300,1664,298,97],"impact#2":[1,600,1664,298,97],"impact#3":[1,900,1664,298,97],"impact#4":[1,1200,1664,298,97],"impact#5":[1,1500,1664,298,97],"impact#6":[1,0,1763,298,97],"impact#7":[1,300,1763,298,97],"impact#8":[1,600,1763,298,97],"impact#9":[1,900,1763,298,97],"impact#10":[1,1200,1763,298,97],"impact#11":[1,1500,1763,298,97],"head_mist#0":[1,0,1862,331,50],"head_mist#1":[1,333,1862,331,50],"head_mist#2":[1,666,1862,331,50],"head_mist#3":[1,999,1862,331,50],"head_mist#4":[1,1332,1862,331,50],"head_mist#5":[1,1665,1862,331,50],"head_mist#6":[1,0,1914,331,50],"head_mist#7":[1,333,1914,331,50],"irrigation_drip#0":[1,666,1914,7,36],"irrigation_drip#1":[1,675,1914,7,36],"irrigation_drip#2":[1,684,1914,7,36],"irrigation_drip#3":[1,693,1914,7,36],"spirit_anim#0":[1,702,1914,96,35],"spirit_anim#1":[1,800,1914,96,35],"spirit_anim#2":[1,898,1914,96,35],"spirit_anim#3":[1,996,1914,96,35],"spirit_anim#4":[1,1094,1914,96,35],"spirit_anim#5":[1,1192,1914,96,35],"spirit_anim#6":[1,1290,1914,96,35],"spirit_anim#7":[1,1388,1914,96,35]},"anims":{"fall_anim":{"n":24,"fps":16,"sc":1.46688,"bb":[0,1,310,354],"fsz":[317,355]},"impact":{"n":12,"fps":12,"sc":1.46708,"bb":[0,0,298,97],"fsz":[319,97]},"pool_anim":{"n":8,"fps":8,"sc":1.46905,"bb":[19,0,703,238],"fsz":[727,254]},"branch_anim":{"n":12,"fps":10,"sc":1.46927,"bb":[57,8,658,234],"fsz":[716,251]},"spirit_anim":{"n":8,"fps":7,"sc":1.0,"bb":[24,22,96,35],"fsz":[146,79]},"head_mist":{"n":8,"fps":6,"sc":1.0,"bb":[0,17,331,50],"fsz":[331,112]},"irrigation_drip":{"n":4,"fps":7,"sc":1.0,"bb":[8,0,7,36],"fsz":[32,44]},"wheel_turn":{"n":12,"fps":10,"sc":1.0,"bb":[8,8,211,259],"fsz":[225,273]}},"place":{"north_cliff":{"xy":[0,0],"size":[3072,570],"depth":570},"spirit_spring":{"xy":[132,186],"size":[504,269],"depth":455},"reservoir":{"xy":[1726,409],"size":[1072,377],"depth":786},"creek":{"xy":[163,685],"size":[1886,1875],"depth":2560},"wet_branch":{"xy":[793,228],"size":[1056,373],"depth":601},"falls":{"xy":[2275,29],"size":[469,526],"depth":555},"plaza":{"xy":[1065,958],"size":[669,519],"depth":1477},"garden_ground":{"xy":[0,0],"size":[3072,2560],"depth":0},"tree":{"xy":[1025,710],"size":[806,541],"depth":1251},"table":{"xy":[1363,1267],"size":[207,142],"depth":1409},"house":{"xy":[2496,1582],"size":[480,338],"depth":1920},"wood_bridge":{"xy":[841,941],"size":[292,127],"depth":1068},"steps":{"xy":[1425,384],"size":[234,81],"depth":465},"stone_bridge":{"xy":[503,1713],"size":[319,127],"depth":1840},"aqueduct":{"xy":[918,907],"size":[1239,436],"depth":1275},"fall_anim":{"xy":[2277,31],"size":[465,522],"depth":553},"impact":{"xy":[2239,411],"size":[468,142],"depth":553},"pool_anim":{"xy":[1728,411],"size":[1068,373],"depth":784},"stream_anim":{"xy":[165,687],"size":[1882,1873],"depth":2560},"branch_anim":{"xy":[795,230],"size":[1052,369],"depth":599},"spirit_anim":{"xy":[311,321],"size":[146,79],"depth":400},"head_mist":{"xy":[2386,0],"size":[331,112],"depth":112},"wheel_support":{"xy":[787,1091],"size":[273,280],"depth":1371},"wheel_turn":{"xy":[799,1092],"size":[225,273],"depth":1372},"east_gate":{"xy":[2644,1155],"size":[288,262],"depth":1417}},"lamps":[[1336,1371],[2550,1893],[1816,1413],[2907,1413]],"drips":[[2090,961],[2090,1264]],"stream":{"n":12,"fps":12,"fsz":[1280,1274],"sc":1.47031,"tiles":[[1024,0],[1088,0],[1152,0],[1216,0],[704,64],[768,64],[832,64],[896,64],[960,64],[1024,64],[1088,64],[1152,64],[512,128],[576,128],[640,128],[704,128],[768,128],[832,128],[896,128],[448,192],[512,192],[576,192],[448,256],[512,256],[448,320],[512,320],[448,384],[512,384],[384,448],[448,448],[512,448],[320,512],[384,512],[448,512],[512,512],[320,576],[384,576],[256,640],[320,640],[384,640],[256,704],[320,704],[256,768],[320,768],[384,768],[256,832],[320,832],[256,896],[320,896],[384,896],[256,960],[320,960],[384,960],[192,1024],[256,1024],[320,1024],[384,1024],[192,1088],[256,1088],[320,1088],[64,1152],[128,1152],[192,1152],[256,1152],[0,1216],[64,1216],[128,1216],[192,1216],[256,1216]],"cols":32,"T":64}},"rle":["1",909,2,74,3,4,9,4,7,63,22,6,9,58,25,2,12,45,2,8,43,43,42,3,9,42,42,7,6,41,45,5,1,45,48,33,2,13,48,32,3,13,49,30,4,13,49,28,6,13,49,25,9,13,51,19,13,13,47,18,18,13,42,14,28,12,38,15,31,12,30,18,36,12,27,18,39,12,25,18,41,12,23,17,44,12,29,1,54,12,84,12,20,6,58,12,20,5,59,12,19,5,60,12,19,5,60,12,19,7,10,4,44,12,19,7,9,6,17,1,25,12,19,7,9,6,43,12,19,8,58,11,19,8,58,11,20,7,10,5,43,10,21,6,9,1,1,5,48,5,20,6,12,5,48,5,19,7,51,2,6,2,4,5,18,7,63,8,18,5,64,9,17,5,65,9,16,5,66,9,15,5,67,9,14,5,68,9,14,5,68,9,14,4,69,9,13,5,69,9,74,22,74,22,12,5,57,22,12,5,57,22,12,7,55,22,12,7,55,22,12,7,68,9,12,7,68,9,11,7,69,9,11,8,68,10,10,8,68,10,11,8,67,10,11,8,67,10,12,8,66,10,11,8,67,10,11,8,67,10,11,7,68,10,10,7,67,19,3,7,5,25,2,713],"plots":[{"id":"plot_01","z":"篱门田头","u":"开局","s":"clear","g":[33,14,8,3],"mk":[["0",2102,894],["1",2644,894],["2",2093,1100],["3",2635,1115],["2",2176,894],["2",2184,1100],["1",2304,894],["1",2312,1103],["2",2432,894],["2",2440,1100],["2",2560,894],["2",2568,1100],["1",2093,1002],["1",2644,1002]],"og":[["stump",1.108,2209,1037],["weeds_tall",0.717,2153,1060],["rubble",0.523,2265,1052],["weeds_tall",1.162,2449,1000],["weeds_low",0.591,2388,1015],["weeds_low",0.686,2505,1007],["scrub",1.061,2372,1051],["weeds_tall",0.809,2310,1074],["weeds_low",0.697,2428,1066],["stump",1.049,2281,969],["weeds_low",0.625,2219,992],["rubble",0.549,2337,985],["claim_sign",1,2584,1085]]},{"id":"plot_02","z":"篱门田头","u":"开局","s":"clear","g":[33,18,8,3],"mk":[["1",2093,1150],["2",2644,1150],["3",2102,1371],["0",2635,1369],["2",2176,1150],["2",2184,1356],["1",2304,1150],["1",2312,1359],["2",2432,1150],["2",2440,1356],["2",2560,1150],["2",2568,1356],["3",2102,1258],["3",2635,1258]],"og":[["weeds_tall",1.14,2546,1290],["weeds_tall",0.843,2484,1313],["rubble",0.66,2582,1305],["scrub",1.173,2283,1251],["weeds_low",0.824,2222,1261],["weeds_low",0.668,2339,1253],["stump",1.145,2345,1313],["weeds_tall",0.661,2283,1336],["weeds_low",0.656,2401,1329],["weeds_tall",1.031,2469,1245],["weeds_low",0.856,2407,1233],["rubble",0.556,2525,1225],["claim_sign",1,2584,1341]]},{"id":"plot_03","z":"篱门田头","u":"灵石","s":"locked","g":[32,24,7,4],"mk":[["2",2029,1534],["3",2507,1534],["0",2038,1817],["1",2516,1807],["2",2104,1534],["2",2112,1804],["1",2216,1534],["1",2224,1807],["2",2328,1534],["2",2336,1804],["2",2440,1534],["2",2448,1804],["1",2029,1606],["1",2516,1606],["3",2038,1734],["3",2507,1734]],"og":[["scrub",1.174,2148,1707],["weeds_tall",0.674,2094,1738],["rubble",0.624,2197,1728],["stump",1.105,2371,1658],["weeds_low",0.802,2317,1689],["weeds_low",0.635,2420,1679],["weeds_tall",1.15,2293,1754],["weeds_tall",0.761,2239,1785],["weeds_low",0.594,2342,1775],["scrub",1.056,2196,1626],["weeds_low",0.77,2142,1642],["rubble",0.591,2245,1631],["stump",1.041,2416,1741],["weeds_tall",0.61,2362,1772],["weeds_low",0.69,2462,1761],["claim_sign",1,2456,1789]]},{"id":"plot_04","z":"潭边湿地","u":"灵石","s":"locked","g":[16,6,4,2],"mk":[["3",1014,382],["0",1291,382],["1",1005,527],["2",1300,524],["2",1088,382],["2",1096,524],["1",1216,382],["1",1224,527],["3",1014,454],["3",1291,454]],"og":[["weeds_tall",1.045,1218,478],["weeds_tall",0.769,1188,490],["rubble",1.165,1110,471],["weeds_low",0.853,1079,462],["claim_sign",1,1240,509]]},{"id":"plot_05","z":"潭边湿地","u":"支线","s":"locked","g":[18,9,4,2],"mk":[["0",1142,574],["1",1428,574],["2",1133,716],["3",1419,731],["2",1216,574],["2",1224,716],["1",1344,574],["1",1352,719],["1",1133,646],["1",1428,646]],"og":[["rubble",1.07,1219,663],["weeds_tall",0.701,1192,678],["weeds_tall",1.076,1334,673],["weeds_low",0.833,1303,649],["claim_sign",1,1368,701]]},{"id":"plot_06","z":"潭边湿地","u":"灵石","s":"locked","g":[23,9,4,2],"mk":[["1",1453,574],["2",1748,574],["3",1462,731],["0",1739,729],["2",1536,574],["2",1544,716],["1",1664,574],["1",1672,719],["3",1462,646],["3",1739,646]],"og":[["weeds_tall",1.056,1668,671],["weeds_tall",0.613,1653,681],["weeds_tall",1.047,1554,670],["weeds_low",0.767,1523,652],["claim_sign",1,1688,701]]},{"id":"plot_07","z":"向阳坡","u":"灵石","s":"locked","g":[18,26,5,4],"mk":[["2",1133,1662],["3",1483,1662],["0",1142,1945],["1",1492,1935],["2",1232,1662],["2",1240,1932],["1",1392,1662],["1",1400,1935],["1",1133,1734],["1",1492,1734],["3",1142,1862],["3",1483,1862]],"og":[["weeds_low",1.121,1209,1836],["weeds_tall",0.653,1190,1867],["rubble",0.55,1244,1857],["stump",1.188,1369,1794],["weeds_low",0.721,1330,1825],["weeds_low",0.541,1404,1815],["rubble",1.034,1300,1871],["weeds_tall",0.792,1261,1901],["weeds_low",0.65,1335,1891],["weeds_low",1.081,1241,1750],["weeds_low",0.783,1203,1781],["rubble",0.682,1277,1770],["claim_sign",1,1432,1917]]},{"id":"plot_08","z":"向阳坡","u":"灵石","s":"locked","g":[25,23,5,7],"mk":[["3",1590,1470],["0",1931,1470],["1",1581,1935],["2",1940,1932],["2",1680,1470],["2",1688,1932],["1",1840,1470],["1",1848,1935],["3",1590,1554],["3",1931,1554],["1",1581,1703],["1",1940,1703],["3",1590,1853],["3",1931,1853]],"og":[["stump",1.065,1842,1777],["weeds_tall",0.839,1804,1831],["rubble",0.542,1877,1813],["rubble",1.069,1692,1698],["weeds_low",0.758,1654,1752],["weeds_low",0.705,1727,1734],["weeds_low",1.106,1741,1825],["weeds_tall",0.607,1703,1878],["weeds_low",0.676,1776,1860],["stump",1.067,1823,1627],["weeds_low",0.662,1784,1681],["rubble",0.654,1858,1663],["rubble",1.206,1675,1829],["weeds_tall",0.818,1647,1883],["weeds_low",0.561,1686,1865],["weeds_low",1.104,1764,1628],["weeds_low",0.669,1725,1682],["weeds_low",0.71,1799,1664],["claim_sign",1,1880,1917]]},{"id":"plot_09","z":"向阳坡","u":"支线","s":"locked","g":[20,31,6,4],"mk":[["0",1270,1982],["1",1684,1982],["2",1261,2252],["3",1675,2267],["2",1344,1982],["2",1352,2252],["1",1472,1982],["1",1480,2255],["2",1600,1982],["2",1608,2252],["1",1261,2054],["1",1684,2054],["3",1270,2182],["3",1675,2182]],"og":[["rubble",1.098,1363,2164],["weeds_tall",0.719,1321,2195],["rubble",0.645,1405,2184],["weeds_low",1.054,1552,2115],["weeds_low",0.688,1506,2145],["weeds_low",0.595,1594,2135],["stump",1.073,1476,2188],["weeds_tall",0.68,1430,2219],["weeds_low",0.589,1518,2209],["rubble",1.149,1413,2080],["weeds_low",0.8,1367,2111],["rubble",0.568,1455,2100],["claim_sign",1,1624,2237]]},{"id":"plot_10","z":"林边草甸","u":"支线·猎户找牛","s":"locked","g":[4,18,4,4],"mk":[["1",237,1150],["2",532,1150],["3",246,1435],["0",523,1433],["2",320,1150],["2",328,1420],["1",448,1150],["1",456,1423],["3",246,1222],["3",523,1222],["1",237,1350],["1",532,1350]],"og":[["scrub",1.136,448,1325],["weeds_tall",0.702,424,1355],["rubble",0.572,476,1345],["rubble",1.155,335,1266],["weeds_low",0.795,305,1296],["weeds_low",0.565,363,1286],["wild_bamboo",1.034,371,1354],["weeds_tall",0.636,340,1385],["weeds_low",0.646,399,1374],["claim_sign",1,472,1405]]},{"id":"plot_11","z":"林边草甸","u":"灵石","s":"locked","g":[9,18,3,4],"mk":[["2",557,1150],["3",779,1150],["0",566,1433],["1",788,1423],["2",672,1150],["2",680,1420],["1",557,1222],["1",788,1222],["3",566,1350],["3",779,1350]],"og":[["rubble",1.154,648,1327],["weeds_tall",0.825,623,1358],["wild_bamboo",1.067,712,1262],["weeds_low",0.77,688,1293],["claim_sign",1,728,1405]]},{"id":"plot_12","z":"林边草甸","u":"灵石","s":"locked","g":[4,23,5,3],"mk":[["3",246,1470],["0",587,1470],["1",237,1679],["2",596,1676],["2",336,1470],["2",344,1676],["1",496,1470],["1",504,1679],["3",246,1578],["3",587,1578]],"og":[["wild_bamboo",1.045,521,1606],["weeds_tall",0.667,483,1629],["rubble",0.53,542,1621],["scrub",1.118,353,1567],["weeds_low",0.78,314,1589],["weeds_low",0.657,388,1582],["rubble",1.079,419,1635],["weeds_tall",0.797,381,1658],["weeds_low",0.54,454,1650],["claim_sign",1,536,1661]]},{"id":"plot_13","z":"灵脉谷","u":"主线","s":"locked","g":[4,7,8,4],"mk":[["0",246,446],["1",788,446],["2",237,716],["3",779,731],["2",320,446],["2",328,716],["1",448,446],["1",456,719],["2",576,446],["2",584,716],["2",704,446],["2",712,716],["1",237,518],["1",788,518],["3",246,646],["3",779,646]],"og":[["wild_bamboo",1.182,365,639],["weeds_tall",0.809,304,670],["rubble",0.536,422,659],["stump",1.067,599,578],["weeds_low",0.764,537,608],["weeds_low",0.534,655,598],["rubble",1.061,516,651],["weeds_tall",0.767,454,682],["weeds_low",0.718,572,671],["wild_bamboo",1.144,424,561],["weeds_low",0.677,363,570],["rubble",0.627,481,560],["stump",1.169,666,656],["weeds_tall",0.629,604,687],["weeds_low",0.555,722,677],["rubble",1.066,547,529],["weeds_low",0.597,485,560],["weeds_low",0.521,603,549],["claim_sign",1,728,701]]},{"id":"plot_14","z":"灵脉谷","u":"主线","s":"locked","g":[10,12,5,2],"mk":[["1",621,766],["2",980,766],["3",630,923],["0",971,921],["2",720,766],["2",728,908],["1",880,766],["1",888,911],["3",630,838],["3",971,838]],"og":[["stump",1.131,882,854],["weeds_tall",0.602,843,869],["rubble",1.041,721,846],["weeds_low",0.727,682,848],["claim_sign",1,920,893]]},{"id":"plot_15","z":"灵脉谷","u":"亲密度","s":"locked","g":[4,12,5,4],"mk":[["2",237,766],["3",587,766],["0",246,1049],["1",596,1039],["2",336,766],["2",344,1036],["1",496,766],["1",504,1039],["1",237,838],["1",596,838],["3",246,966],["3",587,966]],"og":[["rubble",1.035,328,958],["weeds_tall",0.739,298,989],["rubble",0.643,363,978],["wild_bamboo",1.144,491,882],["weeds_low",0.81,453,913],["weeds_low",0.543,527,903],["stump",1.07,416,968],["weeds_tall",0.722,378,999],["weeds_low",0.676,452,988],["rubble",1.138,363,860],["weeds_low",0.609,325,890],["rubble",0.521,398,880],["claim_sign",1,536,1021]]}],"init":[{"id":"starter_coop","a":"henhouse","p":"plot_01","g":[38,14,3,3],"ch":[]},{"id":"starter_bed_1","a":"loam_dry","p":"plot_01","g":[33,15,2,2],"ch":[["cabbage_ripe",0,0],["cabbage_ripe",1,0],["cabbage_ripe",0,1],["cabbage_ripe",1,1]]},{"id":"starter_bed_2","a":"loam_dry","p":"plot_01","g":[35,15,2,2],"ch":[["radish_ripe",0,0],["radish_ripe",1,0],["radish_ripe",0,1],["radish_ripe",1,1]]},{"id":"starter_bed_3","a":"black_dry","p":"plot_02","g":[33,18,2,2],"ch":[["scallion_ripe",0,0],["scallion_ripe",1,0],["scallion_ripe",0,1],["scallion_ripe",1,1]]},{"id":"starter_bed_4","a":"loam_dry","p":"plot_02","g":[35,18,2,2],"ch":[["pea_ripe",0,0],["pea_ripe",1,0],["pea_ripe",0,1],["pea_ripe",1,1]]},{"id":"starter_bed_5","a":"black_dry","p":"plot_02","g":[37,18,2,2],"ch":[["yam_ripe",0,0],["yam_ripe",1,0],["yam_ripe",0,1],["yam_ripe",1,1]]}],"portal":{"garden":{"world_rect":[2991,1348,81,84],"arrival":[2796,1371],"to":"R136 青竹西院"},"west_yard":{"map_size":[1664,1792],"world_rect":[0,1570,125,120],"pass_override":[0,1590,175,81],"arrival":[136,1632],"to":"青竹菜园"}},"pass":[{"id":"wood_bridge","rect":[856,960,261,77]},{"id":"steps","rect":[1428,396,230,58]},{"id":"stone_bridge","rect":[507,1724,311,81]},{"id":"gate_passage","rect":[2615,1344,457,50]}]};
  const M = DATA.meta, P = (x, y) => [x / 64 - .5, y / 64 - .8];
  const F = () => (S.flags = S.flags || {});
  const now = () => performance.now() / 1000;
  window.R175G_ON = true;
  // ---------- 存档：已开地皮 + 摆着的模块 ----------
  const CROP = { cabbage_ripe: 'cabbage', radish_ripe: 'radish', scallion_ripe: 'scallion', pea_ripe: 'pea', yam_ripe: 'yam' };
  const GS = () => {
    const f = F(); let g = f.r175g; if (!g) g = f.r175g = { v: 1, plots: {}, mods: null, n: 0 };
    for (const p of DATA.plots) if (p.s === 'clear' && g.plots[p.id] == null) g.plots[p.id] = 1;
    if (!g.mods) g.mods = DATA.init.map(m => {
      const o = { u: m.id, k: m.a, c: m.g[0], r: m.g[1] };
      if (/_dry$/.test(m.a)) { o.k = 'bed'; o.soil = m.a.replace(/_dry$/, ''); o.wet = 0; o.crops = [null, null, null, null]; for (const [a, dx, dy] of m.ch) o.crops[dy * 2 + dx] = { k: CROP[a] || a.replace(/_ripe$/, ''), st: 3 }; }
      return o; });
    return g; };
  window.R175G_STATE = GS;
  const PLOT = {}; for (const p of DATA.plots) PLOT[p.id] = p;
  const opened = id => !!GS().plots[id];
  // ---------- 素材 ----------
  const IM = {}, FAIL = {};
  const SRC = k => (window.R162_ASSETS && R162_ASSETS[D + k + '.webp']) || (D + k + '.webp');
  const ld = (k, cb) => { if (k in IM) return; IM[k] = null; const i = new Image();
    i.onload = () => { IM[k] = i; try { cb && cb(i); } catch (e) {} };
    i.onerror = () => { FAIL[k] = (FAIL[k] || 0) + 1; delete IM[k]; if (FAIL[k] < 3) setTimeout(() => ld(k, cb), 1500 * FAIL[k]); };
    i.src = SRC(k); };
  const slice = (im, rects, page, pre) => { for (const k in rects) { const [pg, x, y, w, h] = rects[k]; if (pg !== page) continue; const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, x, y, w, h, 0, 0, w, h); IMG[pre + k] = c; } };
  const KEYS = ['ground', 'fixed_0', 'water_0', 'water_1', 'stream'];
  let loaded = false;
  const loadAll = () => { if (loaded) return; loaded = true;
    ld('ground', im => { IMG.r175g_ground = im; }); ld('fixed_0', im => slice(im, M.fixed, 0, 'r175g_'));
    ld('water_0'); ld('water_1'); ld('stream'); };
  const lightKey = () => { const s = window.QZ_SHI ? QZ_SHI() : ''; if (s) return { '卯': 'dawn', '酉': 'dusk', '戌': 'evening', '子': 'midnight' }[s] || null;
    const t = window.TOD ? TOD() : ''; return t === 'night' ? 'evening' : t === 'dawn' ? 'dawn' : t === 'dusk' ? 'dusk' : null; };
  const ready = () => { const k = lightKey(); let n = 0, ok = 0; for (const x of KEYS.concat(k ? ['l_' + k] : [])) { n++; if (IM[x] || FAIL[x] >= 3) ok++; } return ok / n; };
  window.R175G_READY = () => { loadAll(); const k = lightKey(); if (k) ld('l_' + k); return ready(); };
  { const o = window.MAP_EXTRA_READY; window.MAP_EXTRA_READY = n => { let a = 1; try { a = o ? o(n) : 1; } catch (e) {} if (a == null) a = 1; if (n !== GID) return a; return Math.min(a, R175G_READY()); }; }
  // 西院月门：进青竹小院就要
  let wgReq = false; const wgLoad = () => { if (wgReq) return; wgReq = true; ld('westgate', im => slice(im, M.westgate, 0, 'r175g_')); };
  setTimeout(wgLoad, 4000);
  tileSetMap = (o => function (name) { if (name === GID) loadAll(); if (name === COURT) wgLoad(); return o.apply(this, arguments); })(tileSetMap);
  setTimeout(() => { try { if (world.mapName === GID) loadAll(); } catch (e) {} }, 15000);   // 西院月门现在通新菜园，老图的大底图不再提前解码
  const QZ_NEAR = () => /^qingzhu_/.test(world.mapName || '');

  // ---------- 地图 ----------
  const unrle = a => { let s = '', c = a[0]; for (let i = 1; i < a.length; i++) { s += c.repeat(a[i]); c = c === '0' ? '1' : '0'; } return s; };
  const FIXED = unrle(DATA.rle);   // 96 × 80，'1' 挡
  const FIX = ['tree', 'table', 'house', 'east_gate', 'aqueduct', 'wheel_support'];
  const objOf = (k, x, y, w, h, sy, extra) => Object.assign({ bk: true, id: 'r175g_' + k, img: 'r175g_' + k, x, y, w, h, sy, flat: false, flip: false }, extra || {});
  const fixedObjs = () => {
    const out = [];
    for (const k of FIX) { const p = M.place[k]; out.push(objOf(k, p.xy[0], p.xy[1], p.size[0], p.size[1], p.depth)); }
    { const p = M.place.wheel_turn; out.push(objOf('wheel_support', p.xy[0], p.xy[1], p.size[0], p.size[1], p.depth, { id: 'r175g_wheel', r175w: 1 })); }   // 水车（多帧，在 drawBaked 里画）
    for (const [x, y] of M.lamps) out.push(objOf('garden_lamp', x - 32, y - 96, 64, 96, y));
    return out; };
  const P0 = DATA.portal.garden, P1 = DATA.portal.west_yard;
  const cell32 = v => Math.floor(v / 32);
  TMAPS[GID] = {
    title: '青竹菜园', name: GID, qz: true,
    baked: { ground: 'r175g_ground', w: 3072, h: 2560, cs: 32, cols: 96, rows: 80, blocked: FIXED, objs: fixedObjs() },
    chests: [], leaves: true, npcs: [], start: P(P0.arrival[0], P0.arrival[1]),
    exits: [{ x: cell32(P0.world_rect[0]), y: cell32(P0.world_rect[1]), w: 3, h: Math.ceil(P0.world_rect[3] / 32) + 1, to: COURT, at: P(P1.arrival[0] - WOX, P1.arrival[1]), face: 'right', label: '东 · 青竹西院' }],
  };
  if (typeof MAP_ZOOM === 'object' && !MAP_ZOOM[GID]) MAP_ZOOM[GID] = .8;   // 和青竹小院一个比例
  // ---------- 可调查点 ----------
  const N = TMAPS[GID].npcs;
  const spot = (name, x, y, talk, h = 130, extra) => { const [c, r] = P(x, y); N.push(Object.assign({ key: 'none', c, r, name, hidden: true, h, talk }, extra || {})); };
  spot('园屋', 2736, 1925, async () => { if (window.R175G_HOUSE) return R175G_HOUSE(); await say('', '园屋里收着锄头、竹篮和一只木头种子盒，墙上挂着一串晒干的玉米。'); }, 170);
  spot('老槐树', 1428, 1238, async () => { await say('', '老槐树不知道长了多少年，树枝上挂满了红绳和小铃铛，风一吹就叮叮地响。'); await say('', '树下的石桌石墩，是下人们干活累了歇脚的地方。'); }, 150);
  spot('水车', 905, 1365, async () => { await say('', '木水车吱呀吱呀地转，把溪水舀进竹笕，一路引到东边的田头。'); }, 160);
  spot('灵泉', 385, 430, async () => { await say('', '灵脉谷里一眼小泉，水底泛着淡淡的青光。挨着它的地，长出来的东西都带着灵气。'); }, 120);
  spot('蓄水潭', 2150, 760, async () => { await say('', '后庭那股水从云雾里落下来，在这里积成一潭。水面上飘着几片睡莲。'); }, 110);
  // 每块没开的地皮：点木牌（或整块荒地）开荒
  for (const p of DATA.plots) { const sg = p.og.find(o => o[0] === 'claim_sign'); const [x, y] = sg ? [sg[2], sg[3] + 6] : [(p.g[0] + p.g[2] / 2) * 64, (p.g[1] + p.g[3]) * 64 - 10];
    spot('待开荒 · ' + p.z, x, y, () => claim(p.id), 110, { cond: () => !opened(p.id), plot: p.id }); }

  // ---------- 碰撞：固定 + 没开的地皮整块挡 + 模块占地 ----------
  const BLOCKS = { henhouse: 1 };   // 田块可以走；鸡舍等挡路（以后的模块在建造模块里登记）
  window.R175G_BLOCKS = BLOCKS;
  const applyBlock = T => {
    if (!T || !T.block) return; const g = GS();
    for (let r = 0; r < 80; r++) { const row = T.block[r]; for (let c = 0; c < 96; c++) row[c] = FIXED.charCodeAt(r * 96 + c) === 49 ? 1 : 0; }
    for (const pp of DATA.pass) { const [x, y, w, h] = pp.rect; for (let r = cell32(y); r <= cell32(y + h - 1); r++) for (let c = cell32(x); c <= cell32(x + w - 1); c++) if (T.block[r]) T.block[r][c] = 0; }
    for (const p of DATA.plots) if (!g.plots[p.id]) { const [c0, r0, w, h] = p.g; for (let r = r0 * 2; r < (r0 + h) * 2; r++) for (let c = c0 * 2; c < (c0 + w) * 2; c++) if (T.block[r]) T.block[r][c] = 1; }
    for (const m of g.mods) { const fp = window.R175G_FP ? R175G_FP(m) : (m.k === 'henhouse' ? [3, 3] : null); if (!fp || !(window.R175G_BLOCKS[m.k] || (window.R175G_BLOCKOF && R175G_BLOCKOF(m)))) continue;
      for (let r = m.r * 2; r < (m.r + fp[1]) * 2; r++) for (let c = m.c * 2; c < (m.c + fp[0]) * 2; c++) if (T.block[r]) T.block[r][c] = 1; }
    T._stand = null; };
  window.R175G_APPLY = () => { const T = world.map && world.map.T; if (world.mapName === GID && T) { applyBlock(T); rebuildObjs(T); } };
  // 动态物件：荒地（没开的地皮）+ 挡路模块（鸡舍等）；田块和作物在地面层画
  const DYN = o => o.r175d;
  const rebuildObjs = T => {
    T.objs = T.objs.filter(o => !DYN(o)); const g = GS();
    for (const p of DATA.plots) if (!g.plots[p.id]) for (const [a, sc, x, y] of p.og) { const fs = M.foot[a], r = M.fixed[a]; if (!r) continue; const w = r[3] * sc, h = r[4] * sc;
      T.objs.push(objOf(a, x - fs[0] * sc, y - fs[1] * sc, w, h, y, { r175d: 1, id: 'r175g_og_' + p.id })); }
    for (const m of g.mods) { if (window.R175G_MODOBJ) { const o = R175G_MODOBJ(m); if (o) { o.r175d = 1; T.objs.push(o); } continue; }
      if (m.k === 'henhouse') { const fs = M.foot.henhouse, x = (m.c + 1.5) * 64, y = (m.r + 3) * 64; T.objs.push(objOf('henhouse', x - fs[0], y - fs[1], 192, 192, y, { r175d: 1, mod: m.u })); } }
  };
  buildTileMap = (o => function (def) {
    const T = o.apply(this, arguments);
    try {
      if (def === TMAPS[GID] && T && T.baked) { applyBlock(T); rebuildObjs(T); }
      else if (def === TMAPS[COURT] && T && T.baked && T.x0 === -WOX && !T.r175g) courtGate(T);
    } catch (e) { console.warn('r175g', e); }
    return T; })(buildTileMap);
  // ---------- 西院西头：竹篱月门 + 石板接片 + 出口 ----------
  function courtGate(T) {
    T.r175g = 1; const cs = T.cs, X = x => Math.floor((x - WOX - T.x0) / cs);   // 西院局部 x → 碰撞列（T.block 下标）
    const open = (x, y, w, h, v) => { for (let r = Math.floor(y / cs); r <= Math.floor((y + h - 1) / cs); r++) for (let c = X(x); c <= X(x + w - 1); c++) if (T.block[r] && c >= 0) T.block[r][c] = v; };
    const [ox, oy, ow, oh] = P1.pass_override; open(ox, oy, ow + 40, oh, 0);   // 石板路一直通到图边
    const G = { x: 0, y: 1374, w: 288, h: 262 };
    open(G.x + 4, G.y + 214, 56, 30, 1); open(G.x + 228, G.y + 214, 56, 30, 1);   // 两座石脚挡路，中间和前面走人
    T._stand = null;
    T.objs.push(objOf('west_gate', G.x - WOX, G.y, G.w, G.h, G.y + G.h, { r175wg: 1 }));
    const [rx, ry, rw, rh] = P1.world_rect;
    T.doors.push({ edge: true, x: Math.floor((rx - WOX) / cs), y: Math.floor(ry / cs), w: Math.ceil(rw / cs), h: Math.ceil(rh / cs), to: GID, at: P(P0.arrival[0], P0.arrival[1]), face: 'left', label: '西 · 青竹菜园', arrow: Math.PI });
  }

  // ---------- 画：水动画（地面之后、桥之前）----------
  const drawAnim = (k, t, xy) => { const a = M.anims[k], pl = M.place[k] || { xy }; const f = Math.floor(t * a.fps + (xy ? xy[0] * .013 : 0)) % a.n, r = M.water[k + '#' + f]; if (!r) return; const im = IM['water_' + r[0]]; if (!im) return;
    const s = a.sc, x0 = (xy || pl.xy)[0], y0 = (xy || pl.xy)[1]; ctx.drawImage(im, r[1], r[2], r[3], r[4], x0 + a.bb[0] * s, y0 + a.bb[1] * s, a.bb[2] * s, a.bb[3] * s); };
  const ST = { c: null, g: null, f: -1 };
  const streamFrame = f => { const s = M.stream, im = IM.stream; if (!im) return null;
    if (!ST.c) { ST.c = document.createElement('canvas'); ST.c.width = s.fsz[0]; ST.c.height = s.fsz[1]; ST.g = ST.c.getContext('2d'); }
    if (ST.f !== f) { ST.f = f; const g = ST.g, n = s.tiles.length, T = s.T; g.clearRect(0, 0, s.fsz[0], s.fsz[1]);
      for (let i = 0; i < n; i++) { const j = f * n + i, tl = s.tiles[i]; g.drawImage(im, (j % s.cols) * T, Math.floor(j / s.cols) * T, T, T, tl[0], tl[1], T, T); } }
    return ST.c; };
  const I = k => IMG['r175g_' + k];
  function groundPass() {
    const t = now();
    drawAnim('fall_anim', t); drawAnim('impact', t); drawAnim('pool_anim', t);
    { const s = M.stream, pl = M.place.stream_anim, c = streamFrame(Math.floor(t * s.fps) % s.n); if (c) ctx.drawImage(c, pl.xy[0], pl.xy[1], pl.size[0], pl.size[1]); }
    drawAnim('branch_anim', t); drawAnim('spirit_anim', t); drawAnim('head_mist', t);
    for (const k of ['wood_bridge', 'steps', 'stone_bridge']) { const im = I(k), p = M.place[k]; if (im) ctx.drawImage(im, p.xy[0], p.xy[1], p.size[0], p.size[1]); }
    // 界桩（常驻）
    for (const p of DATA.plots) for (const [n, x, y] of p.mk) { const k = 'marker_' + n, im = I(k), fs = M.foot[k]; if (im) ctx.drawImage(im, x - fs[0], y - fs[1]); }
    // 田块 + 作物（可走，在人物之前画）
    if (window.R175G_DRAWBEDS) R175G_DRAWBEDS(t); else for (const m of GS().mods) if (m.k === 'bed') drawBed(m);
  }
  function drawBed(m) { const x = m.c * 64, y = m.r * 64, im = I(m.soil + '_' + (m.wet ? 'wet' : 'dry')) || I(m.soil + '_dry'); if (im) ctx.drawImage(im, x, y, 128, 128);
    (m.crops || []).forEach((cp, i) => { if (!cp) return; const ci = I(cp.k + '_' + ['seed', 'young', 'grown', 'ripe'][cp.st || 0]); if (ci) ctx.drawImage(ci, x + (i % 2) * 64, y + Math.floor(i / 2) * 64, 64, 64); }); }
  window.R175G_DRAWBED_DEFAULT = drawBed;
  drawGroundVis = (o => function (g, cam) {
    o.apply(this, arguments);
    try {
      if (world.mapName === GID) groundPass();
      else if (world.mapName === COURT) { const im = I('west_threshold'), T = world.map && world.map.T; if (im && T && T.x0 === -WOX) ctx.drawImage(im, -WOX, 1548, 170, 166); }   // 西院月门前的石板接片
    } catch (e) {}
  })(drawGroundVis);
  // 水车：在固定轴架上转
  if (typeof drawBaked === 'function') drawBaked = (o => function (ob, t0) {
    if (ob && ob.r175w) { const k = 'wheel_turn', p = M.place[k]; drawAnim(k, now(), null); return; }
    return o.apply(this, arguments); })(drawBaked);
  // ---------- 竹笕滴水 + 时辰光层（物件之后）----------
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function (T, cam, n0) {
    o.apply(this, arguments);
    try { if (world.mapName !== GID) return; const t = now();
      for (const xy of M.drips) drawAnim('irrigation_drip', t, xy);
      const k = lightKey(); if (!k) return; ld('l_' + k); const im = IM['l_' + k]; if (im) ctx.drawImage(im, 0, 0, 3072, 2560);
    } catch (e) {} })(tileAmbientHigh);

  // ---------- 点地皮任何地方 = 点它的木牌 ----------
  if (typeof pickInteract === 'function') pickInteract = (o => function (wx, wy) {
    try { if (world.mapName === GID) { const c = Math.floor(wx / 64), r = Math.floor(wy / 64);
      for (const p of DATA.plots) { if (opened(p.id)) continue; const [c0, r0, w, h] = p.g; if (c >= c0 && c < c0 + w && r >= r0 && r < r0 + h) { const a = (world.actors || []).find(a => a.npc && a.npc.plot === p.id); if (a) return { type: 'npc', a }; } } } } catch (e) {}
    return o.apply(this, arguments); })(pickInteract);

  // ---------- 开荒 ----------
  const PRICE = { plot_03: 120, plot_04: 160, plot_06: 180, plot_07: 220, plot_08: 320, plot_11: 160, plot_12: 220 };
  const NTH = id => { const p = PLOT[id], z = DATA.plots.filter(q => q.z === p.z); return '第' + '一二三'[z.indexOf(p)] + '块'; };
  const NEED = {
    '支线': '这块地要先帮园里的人办件事才能开——支线还在写，过些日子就有了。',
    '支线·猎户找牛': '林边草甸那头住着个猎户，他家的牛走丢了。帮他找回来，他就把这块地让出来（支线还在写）。',
    '主线': '灵脉谷的地沾着灵脉，修为不够碰不得。等主线再往后走一走。',
    '亲密度': '这块地是松伯年轻时开过的老地。等和院里的人再熟络些，他会把它交给你。',
  };
  async function claim(id) {
    const p = PLOT[id]; if (!p || opened(id)) return;
    const cost = PRICE[id];
    if (!cost) { await say('', NEED[p.u] || '这块地暂时还开不了。'); return; }
    const ok = await claimPaper(p, cost); if (!ok) return;
    if ((S.hero.gold || 0) < cost) { toast('灵石不够——还差 ' + (cost - (S.hero.gold || 0)), 1800); return; }
    S.hero.gold -= cost; GS().plots[id] = 1; try { playSnd('ui_confirm'); } catch (e) {}
    clearFx(p); world.actors = world.actors.filter(a => !(a.npc && a.npc.plot === id)); window.R175G_APPLY && R175G_APPLY(); toast(p.z + ' · ' + NTH(id) + ' 开好了', 1800);
  }
  // 开荒扬尘：每丛荒草的位置爆一下（clear_dust 8 帧；素材在建造模块里，没载到就用程序画的尘土）
  const FX = [];
  function clearFx(p) { const t = now(); for (const [a, sc, x, y] of p.og) FX.push({ x, y, t0: t + Math.random() * .25, s: .7 + sc * .4 }); }
  window.R175G_FX = FX;
  const drawFx = () => { const t = now(); for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i], u = (t - f.t0) / .66; if (u < 0) continue; if (u >= 1) { FX.splice(i, 1); continue; }
      if (window.R175G_DUST && R175G_DUST(f, u)) continue;
      ctx.save(); ctx.globalAlpha = (1 - u) * .8; for (let k = 0; k < 7; k++) { const a = k * .9 + f.x * .01, r = (12 + u * 46) * f.s; ctx.fillStyle = k % 2 ? 'rgba(186,160,112,.9)' : 'rgba(132,150,72,.9)'; ctx.beginPath(); ctx.ellipse(f.x + Math.cos(a) * r, f.y - 18 * f.s - u * 20 + Math.sin(a) * r * .45, (9 - u * 5) * f.s, (6 - u * 3) * f.s, a, 0, 7); ctx.fill(); } ctx.restore(); } };
  if (typeof tileAmbientHigh === 'function') tileAmbientHigh = (o => function () { const r = o.apply(this, arguments); try { if (world.mapName === GID && FX.length) drawFx(); } catch (e) {} return r; })(tileAmbientHigh);
  // 开荒纸笺（Codex claim 纸 + 确认 / 取消；第 5 批素材没到时用代码画的纸）
  const busy = () => (typeof dialog !== 'undefined' && dialog) || (typeof choice !== 'undefined' && choice);
  function modal(draw, hits) {
    return new Promise(res => { let done = false; const ov = { draw() { try { draw(); } catch (e) {} } }; S.overlay.push(ov);
      const fin = v => { if (done) return; done = true; cv.removeEventListener('pointerdown', h, true); const i = S.overlay.indexOf(ov); if (i >= 0) S.overlay.splice(i, 1); res(v); };
      const h = e => { if (busy()) return; const q = toLogical(e); e.stopImmediatePropagation(); e.preventDefault(); for (const b of hits()) if (q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h) { try { playSnd('ui_click', .5); } catch (er) {} fin(b.k); return; } };
      cv.addEventListener('pointerdown', h, true); }); }
  window.R175G_MODAL = modal;
  function claimPaper(p, cost) {
    const t0 = now(), x = W / 2 - 220, y = H / 2 - 150, w = 440, h = 277, bc = { k: true, x: x + 70, y: y + 196, w: 132, h: 46 }, bx = { k: false, x: x + w - 202, y: y + 196, w: 132, h: 46 };
    const UI = window.R175G_UI || (() => null);
    return modal(() => { const u = Math.min(1, (now() - t0) / .2); ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = 'rgba(6,8,12,.42)'; ctx.fillRect(0, 0, W, H); ctx.translate(0, (1 - u) * 16);
      if (!UI('claim', x, y, w, h)) { ctx.fillStyle = '#ecdcb4'; ctx.strokeStyle = '#7b5a2e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 14) : ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke(); }
      ctx.textAlign = 'center'; ctx.fillStyle = '#4a2c10'; ctx.font = `600 30px ${BRUSH}`; ctx.fillText('开垦地皮', x + w / 2, y + 68);
      ctx.font = `600 20px ${FONT}`; ctx.fillStyle = '#5a3a18'; ctx.fillText(p.z + ' · ' + NTH(p.id), x + w / 2, y + 108);
      const enough = (S.hero.gold || 0) >= cost; if (!UI('stone', x + w / 2 - 74, y + 124, 34, 34)) { ctx.fillStyle = '#8fd0b0'; ctx.beginPath(); ctx.arc(x + w / 2 - 57, y + 141, 14, 0, 7); ctx.fill(); }
      ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = enough ? '#4a2c10' : '#a8321e'; ctx.fillText(cost + ' 灵石', x + w / 2 - 32, y + 149);
      ctx.font = `15px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#7a5a32'; ctx.fillText('（身上 ' + (S.hero.gold || 0) + '）', x + w / 2, y + 178);
      for (const b of [bc, bx]) { if (!UI(b.k ? 'confirm' : 'cancel', b.x, b.y, b.w, b.h)) { ctx.fillStyle = b.k ? '#4f6b2e' : '#ead9b0'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.font = `600 20px ${FONT}`; ctx.fillStyle = b.k ? '#fff4d6' : '#4a2c10'; ctx.fillText(b.k ? '开　垦' : '再想想', b.x + b.w / 2, b.y + 30); } }
      ctx.restore(); }, () => [bc, bx]);
  }
  window.R175G = { GID, DATA, M, GS, IM, ld, I, drawAnim, opened, PLOT, objOf, applyBlock, rebuildObjs, claim };
})();
