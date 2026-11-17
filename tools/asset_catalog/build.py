import json,re,os,hashlib,shutil,csv
from PIL import Image, ImageDraw, ImageFont
R=json.load(open('/tmp/claude-0/qa/catalog.json')); T=json.load(open('/tmp/claude-0/cat/titles.json'))
RAW='/tmp/claude-0/cat/raw/'; OUT='/tmp/claude-0/cat/out/素材库_游戏在用/'
shutil.rmtree(OUT,ignore_errors=True)
CATS=[('11_人物动物',r'animal|dog|hen\b|chick|wolf|deer|crane|sparrow|roc\b|roc-|fire_lion|toad|eagle|python|rhino|lizard|yunting|linxue|luochen|jianchen|changxuan|tianheng|xingxuan|lincang|elder\b|black-robed|guard_|guardian|runner|swordsman|crow|frost_toad|moon_rabbit'),
 ('12_雕像碑刻',r'statue|stele|glyph|memorial|boundary_stone|roadstone|marker|waypost|路牌|路标|sign_|notice_board|plaque|couplet|menu_board'),
 ('13_地毯地垫',r'(?<!floor_)rug|carpet|straw_mat|\bmat\b|meditation_mat|gate_floor|floor_trim'),
 ('05_水景',r'pond|waterfall|pool|spring|crossing|nsc_bank|bank_|cave_pool|lotus-rockery|water_trough'),
 ('10_杂物',r'firewood|firewater|disciple_robes|floor_lamp'),
 ('02_树',r'tree|pine|maple|willow|bamboo(?!_chair|_fence|_lantern|_scroll)|birch|fir\b|_fir\b|cypress|camphor|ginkgo|sophora|osmanthus|wisteria(?!_pot)|peach|stump|\blog\b|_log|樟|松|柏|杉|槐|柳|木|树|tallow'),
 ('03_花草灌木',r'flower|grass_clump|fern|reed|shrub|bush|mushroom|plant|iris|foxtail|daisy|thatch|蕨|herb_patch|moon_herb|frostfruit|broadplant|potted|bonsai|vase|wisteria_pot'),
 ('04_石头山石',r'rock|boulder|cliff|crag|slate|pebble|岩|outcrop|crater|mt_[abc]|valley|cave_mouth|cave_columns|crystal'),
 ('08_灯火',r'lamp|lantern|light|brazier|campfire|fire_glow|spirit_glow|incense'),
 ('06_建筑',r'house|hall|shop|building|\binn\b|xt_inn|tea_house|teahouse|pharmacy|blacksmith(?!_forge)|gate(?!_left|_right|_floor)|tower|pavilion|paifang|temple|shrine|manor|auction|facade|cottage|library_ext|r337_|r343_|r348_|zuixian|yamen_building|tent|stage|arch|apothecary|residence|treasury|cym_|cyc_house|cyn_house|xt_spirit_hub|arms_hall|rotunda|pagoda|roof|stall|forecourt|husbandry|cloister'),
 ('07_墙栏杆门柱',r'wall|rail|fence|palisade|door|gate_left|gate_right|lowwall|pillar|column|steps|stair|window|entry_post|cutout|lintel'),
 ('09_家具',r'table|chair|bed|cabinet|shelf|desk|stool|bench|wardrobe|chest|counter|cupboard|vanity|washstand|bookcase|screen|armchair|throne|dais|display|rack|curio|cart(?!_)|loom|sewing|dressing|altar|stove|anvil|forge|grinder|bookshelf|tea_set|tea_group|tea\b|tea_|seat|cage|bookstack|book_stack|scroll|case'),
 ('10_杂物',r'.')]
def cat(o):
    s=(str(o.get('id') or '')+' '+o['k']).lower()
    for n,p in CATS:
        if re.search(p,s): return n
try: F=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',15); F2=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',30)
except: F=F2=ImageFont.load_default()
seen={}; groups={}
for o in R['out']:
    f=RAW+re.sub(r'[^\w\-]','_',o['k'])+'.png'
    if not os.path.exists(f): continue
    h=hashlib.md5(open(f,'rb').read()).hexdigest()
    if h in seen: seen[h]['keys'].append(o['k']); seen[h]['maps']|=set(o['maps']); continue
    e={'f':f,'keys':[o['k']],'id':str(o.get('id') or o['k']),'maps':set(o['maps']),'cat':cat(o)}; seen[h]=e; groups.setdefault(e['cat'],[]).append(e)
# 去掉拼地图时切出来的遮挡碎片；同一种东西的几十个变体（比如一段段栏杆）只留几件
import collections
for c in list(groups):
    L=[e for e in groups[c] if not e['id'].startswith('hs12_occ')]
    cnt=collections.Counter(); K=[]
    for e in L:
        base=re.sub(r'[_\-]?\d+$','',e['id']); cnt[base]+=1
        if cnt[base]<=6: K.append(e)
    groups[c]=K
rows=[]
for c,L in sorted(groups.items()):
    d=OUT+c+'/'; os.makedirs(d+'单张',exist_ok=True)
    L.sort(key=lambda e:e['id'])
    for i,e in enumerate(L):
        im=Image.open(e['f']); nm=re.sub(r'[^\w\-一-鿿]','_',e['id'])[:60]
        e['file']='%03d_%s.png'%(i+1,nm); im.save(d+'单张/'+e['file'])
        mt='、'.join(sorted({T.get(m,m) for m in e['maps']})[:4])
        rows.append([c,e['file'],e['id'],im.width,im.height,' '.join(e['keys']),mt])
    # 总览图：每页 8×6
    CW,CH,COLS,PER=230,250,8,48
    for pg in range(0,len(L),PER):
        part=L[pg:pg+PER]; rr=(len(part)+COLS-1)//COLS
        S=Image.new('RGB',(CW*COLS,CH*rr+56),(238,233,222)); D=ImageDraw.Draw(S)
        D.text((14,10),'%s  第 %d 页（共 %d 件）'%(c[3:],pg//PER+1,len(L)),font=F2,fill=(60,45,30))
        for j,e in enumerate(part):
            x=(j%COLS)*CW; y=56+(j//COLS)*CH
            D.rectangle([x+4,y+4,x+CW-4,y+CH-4],fill=(248,245,238),outline=(210,200,185))
            im=Image.open(e['f']).convert('RGBA'); im.thumbnail((CW-24,CH-70))
            bg=Image.new('RGBA',im.size,(0,0,0,0)); S.paste(im,(x+(CW-im.width)//2,y+10+(CH-70-im.height)//2),im)
            mt='、'.join(sorted({T.get(m,m) for m in e['maps']})[:2])
            D.text((x+10,y+CH-58),e['file'][:4]+e['id'][:22],font=F,fill=(40,30,20))
            D.text((x+10,y+CH-36),mt[:14],font=F,fill=(120,100,80))
        S.save(d+'总览_第%d页.jpg'%(pg//PER+1),quality=85)
with open(OUT+'目录.csv','w',newline='',encoding='utf-8-sig') as fp:
    w=csv.writer(fp); w.writerow(['类别','文件','物件名','宽','高','游戏里的图名','用在哪些地图']); w.writerows(rows)
print({c:len(L) for c,L in sorted(groups.items())}, len(rows))
