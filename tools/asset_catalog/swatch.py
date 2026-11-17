import json,os,re,numpy as np
from PIL import Image, ImageDraw, ImageFont
GR=json.load(open('/tmp/claude-0/cat/groundmaps.json')); T=json.load(open('/tmp/claude-0/cat/titles.json'))
SRC='/tmp/claude-0/cat/groundfull/'; OUT='/tmp/claude-0/cat/out/素材库_游戏在用/'
CL={'草地':0,'土地':1,'石板砖地':2,'木地板':3}
def classify(a):
    a=a/255.; mx=a.max(-1); mn=a.min(-1); s=(mx-mn)/(mx+1e-6); r,g,b=a[...,0],a[...,1],a[...,2]
    d=mx-mn+1e-6; h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
    c=np.full(mx.shape,-1)
    c[(h>65)&(h<160)&(s>.25)&(mx>.2)]=0
    c[(h>18)&(h<50)&(s>.22)&(s<.65)&(mx>.45)&(mx<.92)]=1
    c[(s<.16)&(mx>.3)&(mx<.85)]=2
    c[(h>12)&(h<40)&(s>.35)&(mx>.35)&(mx<.75)&(c==1)]=1
    return c
res={k:[] for k in CL}; mix=[]
for k,maps in GR.items():
    f=SRC+re.sub(r'[^\w\-]','_',k)+'.jpg'
    if not os.path.exists(f): continue
    im=Image.open(f).convert('RGB'); A=np.array(im)
    title=T.get(maps[0],maps[0]); S=256
    best={}
    for y in range(0,A.shape[0]-S,S//2):
        for x in range(0,A.shape[1]-S,S//2):
            t=A[y:y+S,x:x+S]; c=classify(t)
            for name,ci in CL.items():
                if name=='木地板': continue
                p=(c==ci).mean()
                if p>.9:
                    v=t.reshape(-1,3).std(0).mean()   # 纹理不要太平也不要太乱
                    sc=p-abs(v-22)/200
                    if sc>best.get(name,(0,))[0]: best[name]=(sc,x,y)
            pg,pd=(c==0).mean(),(c==1).mean()
            if pg>.3 and pd>.3 and pg+pd>.9: mix.append((abs(pg-pd),k,title,x,y))
    for name,(sc,x,y) in best.items():
        sw=im.crop((x,y,x+S,y+S)); L=np.array(sw.convert('L')).astype(float)
        # 木地板：一条条横缝很直（整行一起暗），土没有这种规整的线
        rowm=L.mean(1); line=(np.abs(np.diff(rowm))>6).sum()
        if name=='土地' and line>=3: name='木地板'
        res.setdefault(name,[]).append((title,k,sw,maps))
# 交界：土里带草（每张图最多一块，取最均衡的）
seenm=set(); mixsel=[]
for d,k,title,x,y in sorted(mix):
    if k in seenm: continue
    seenm.add(k); mixsel.append((title,k,Image.open(SRC+re.sub(r'[^\w\-]','_',k)+'.jpg').convert('RGB').crop((x,y,x+256,y+256)),GR[k]))
res['土草交界']=mixsel
F=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',15); F2=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',30)
idx={'草地':'01a_草地块','土地':'01b_土地块','石板砖地':'01c_石板砖地块','土草交界':'01d_土草交界块','木地板':'01e_木地板块'}
for name,L in res.items():
    if not L: continue
    d=OUT+idx[name]+'/单张/'; os.makedirs(d,exist_ok=True)
    for i,(title,k,sw,maps) in enumerate(L): sw.save(d+'%03d_%s.png'%(i+1,re.sub(r'[^\w一-鿿]','_',title)[:24]))
    COLS=8; CW,CH=230,262; rr=(len(L)+COLS-1)//COLS
    Sh=Image.new('RGB',(CW*COLS,CH*rr+56),(238,233,222)); D=ImageDraw.Draw(Sh); D.text((14,10),'%s（从游戏各地图地面上截的 256×256 样块，共 %d 块）'%(idx[name][4:],len(L)),font=F2,fill=(60,45,30))
    for j,(title,k,sw,maps) in enumerate(L):
        x=(j%COLS)*CW; y=56+(j//COLS)*CH; Sh.paste(sw.resize((214,214)),(x+8,y+6)); D.text((x+10,y+226),'%03d %s'%(j+1,title[:12]),font=F,fill=(40,30,20))
    Sh.save(OUT+idx[name]+'/总览.jpg',quality=85)
    print(name,len(L))
# 整张地面底图
d=OUT+'00_各地图整张地面/'; os.makedirs(d,exist_ok=True)
for k,maps in GR.items():
    f='/tmp/claude-0/cat/ground/'+re.sub(r'[^\w\-]','_',k)+'.jpg'
    src=f if os.path.exists(f) else SRC+re.sub(r'[^\w\-]','_',k)+'.jpg'
    if not os.path.exists(src): continue
    im=Image.open(src); im.thumbnail((1100,1100)); im.convert('RGB').save(d+re.sub(r'[^\w一-鿿]','_',T.get(maps[0],maps[0]))[:30]+'__'+k[:30]+'.jpg',quality=82)
print('grounds',len(os.listdir(d)))
