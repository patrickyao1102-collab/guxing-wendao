import json, numpy as np
from PIL import Image
d=json.load(open('/tmp/claude-0/qa/wk.json')); cols,rows,cs=d['cols'],d['rows'],d['cs']
orig=np.array([c=='1' for c in d['s']]).reshape(rows,cols)
g=np.array(Image.open('/home/claude/guxing-wendao/game/r143/sf_g_tj_shanmen.webp').convert('RGB')).astype(float)
g=g[:rows*cs,:cols*cs].reshape(rows,cs,cols,cs,3).mean((1,3))
grass=(g[...,1]>g[...,0]+25)&(g[...,1]>g[...,2]+40)
keep=np.zeros_like(orig); foot=np.zeros_like(orig)
def R(m,x0,y0,x1,y1):
    c0,c1=max(0,int(x0//cs)),min(cols-1,int(x1//cs)); r0,r1=max(0,int(y0//cs)),min(rows-1,int(y1//cs))
    m[r0:r1+1,c0:c1+1]=True
KEEP=('听松崖','竹溪叠石','仙溪双瀑','送别庭左崖','送别庭右崖','m17_tree','m17_松间凉亭','m17_月白凤首箜篌')
open_=np.zeros_like(orig)
for l in open('/tmp/claude-0/qa/objs.txt'):
    p=l.split()
    if len(p)==6: n,_,x,y,w,h=p
    else: n,x,y,w,h=p
    x,y,w,h=map(float,(x,y,w,h)); b=y+h; cx=x+w/2
    if n.startswith(KEEP): R(keep,x,y,x+w,y+h); continue
    k=n.split('@')[0].replace('m17_','')
    if k in('天剑精雕翼墙','天剑东翼单间值守廊'): R(open_,x,y,x+w,y+h); R(foot,x,b-200,x+w,b); continue
    if k=='天剑山门金匾':
        R(open_,x,y,x+w,y+h)
        for a0,a1 in((1192,1287),(1469,1564),(1892,1987),(2169,2264)): R(foot,a0,1150,a1,1240)
        continue
    if k in('朱雀_凌风振翼','玄武_负山盘蛇'): R(open_,x,y,x+w,y+h); R(foot,x+.08*w,b-.24*h,x+.92*w,b); continue
    if k in('玉岩孤峰','玉岩叠嶂'): R(foot,x+.1*w,b-.45*h,x+.9*w,b)
    elif k=='翠竹': R(foot,cx-.25*w,b-.2*h,cx+.25*w,b)
    elif k in('古盘松','白梅','金叶银杏','苍针回松','暖枫'): R(foot,cx-.15*w,b-.18*h,cx+.15*w,b)
    elif k=='问剑碑': R(foot,x+.1*w,b-.25*h,x+.9*w,b)
    elif k in('白玉单灯','流云悬灯'): R(foot,cx-.2*w,b-.12*h,cx+.2*w,b)
    elif k in('白花石盆','玉石长凳','云纹朝天炉','崖松花池','镇门剑幡'): R(foot,x+.05*w,b-.5*h,x+.95*w,b)
new=orig.copy()
un=orig&(grass|open_)&~keep&~foot
new[un]=False
new|=foot   # 草地上的石头/树脚挡住
print('unblocked',un.sum())
s=''.join('1' if v else '0' for v in new.ravel())
# RLE
out=[];cur=s[0];n=0
for ch in s:
    if ch==cur: n+=1
    else: out.append(n);cur=ch;n=1
out.append(n)
json.dump({'b0':s[0],'b':out},open('/home/claude/guxing-wendao/game/r143/shanmen_walk.json','w'))
im=np.array(Image.open('/home/claude/guxing-wendao/game/r143/sf_g_tj_shanmen.webp').convert('RGB')).astype(float)
M=np.kron(new,np.ones((cs,cs))).astype(bool)
im[:M.shape[0],:M.shape[1]][M]=im[:M.shape[0],:M.shape[1]][M]*.45+np.array([255,0,0])*.55
Image.fromarray(im.astype('uint8')).resize((1152,853)).save('/tmp/claude-0/qa/wk_new.jpg')
for x,y in [(500,1300),(450,1330),(2650,1400)]:
    r,c=y//cs,x//cs; print(x,y,'orig',orig[r,c],'grass',grass[r,c],'keep',keep[r,c],'foot',foot[r,c],'new',new[r,c])
