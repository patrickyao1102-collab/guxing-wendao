import cv2, numpy as np, glob, sys
from PIL import Image
SRC='/mnt/user-data/uploads/孤星问道/Codex交付/R164_战斗胜利结算框选型/卷中群像/清晰立绘版/金白版/'
def proc(n, out):
    im=np.array(Image.open(glob.glob(SRC+n+'_*.png')[0]).convert('RGB'))
    H,W=im.shape[:2]
    # 1) 右边文字区：把字、头像、图标、按钮抹成绢面
    col=im[:,1165].astype(int); warm=(col[:,0]-col[:,2]>30)
    yb=[y for y in range(560,700) if warm[y]][0]
    x0,x1,y0,y1=676,1172,112,yb-5
    reg=im[y0:y1,x0:x1].astype(np.int16)
    med=cv2.medianBlur(im,61)[y0:y1,x0:x1].astype(np.int16)
    d=np.abs(reg-med).sum(2)
    m=(d>26).astype(np.uint8)
    m=cv2.dilate(m,np.ones((5,5),np.uint8),iterations=2)
    mask=np.zeros((H,W),np.uint8); mask[y0:y1,x0:x1]=m*255
    # 大块（头像 / 物品图标 / 按钮）整块补上，免得留下污渍
    n_,lab,st,_=cv2.connectedComponentsWithStats(mask)
    for i in range(1,n_):
        x,y,w,h,a=st[i]
        if w*h>900: cv2.rectangle(mask,(x-6,y-6),(x+w+6,y+h+6),255,-1)
    # 用周围干净绢面的颜色铺（归一化卷积），不从金边、按钮里借色
    w=(mask==0).astype(np.float32); w[yb-4:,:]=0; w[:y0-6,:]=0; w[:, :x0-4]=0; w[:, x1+2:]=0
    w[y0-6:yb-4, x0-4:x1+2]*=1
    src=im.astype(np.float32)
    ok=w>0; base=np.median(src[y0:yb-4, x0:x1][ok[y0:yb-4, x0:x1]],axis=0)
    fillc=np.zeros_like(src)+base; got=np.zeros(w.shape+(1,),np.float32)
    for sg in (18,45,110):
        num=cv2.GaussianBlur(src*w[...,None],(0,0),sg); den=cv2.GaussianBlur(w,(0,0),sg)[...,None]
        est=num/(den+1e-6); a_=np.clip(den/0.15,0,1)*(1-got)
        fillc=fillc*(1-a_)+est*a_; got=got+a_
    fillc=fillc*np.clip(got,0,1)+base*(1-np.clip(got,0,1))
    sel=(mask>0)[...,None]
    fixed=np.where(sel,fillc,src).astype(np.uint8)
    mk0=cv2.GaussianBlur((mask>0).astype(np.float32),(0,0),2)[...,None]
    fixed=(fillc*mk0+src*(1-mk0)).astype(np.uint8)
    rng=np.random.default_rng(1); T=cv2.GaussianBlur(rng.normal(0,3.2,(H,W,1)).astype(np.float32),(0,0),.7)[...,None] if False else cv2.GaussianBlur(rng.normal(0,3.0,(H,W)).astype(np.float32),(0,0),.8)[...,None]
    mk=(cv2.GaussianBlur(mask,(0,0),3)/255.0)[...,None]
    fixed=np.clip(fixed.astype(np.float32)+T*mk,0,255).astype(np.uint8)
    Image.fromarray(fixed).save(out+'_full.png')
    # 2) 抠出卷轴（去掉后面的战斗背景）
    f=fixed.astype(np.int16); L=f.mean(2); warm=(f[...,0]>f[...,2]+25)&(L>95)
    sm=((L>150)|warm).astype(np.uint8)
    sm=cv2.morphologyEx(sm,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    out_=sm.copy(); h_,w_=out_.shape; fm=np.zeros((h_+2,w_+2),np.uint8)
    for seed in [(0,0),(w_-1,0),(0,h_-1),(w_-1,h_-1),(640,0),(640,h_-1),(0,360),(w_-1,360)]:
        if out_[seed[1],seed[0]]==0: cv2.floodFill(out_,fm,seed,2)
    sm=(out_!=2).astype(np.uint8)
    sm=cv2.morphologyEx(sm,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    n_,lab,st,_=cv2.connectedComponentsWithStats(sm); k=1+np.argmax(st[1:,4]); sm=(lab==k).astype(np.uint8)
    a=cv2.GaussianBlur((sm*255).astype(np.uint8),(0,0),.8)
    rgba=np.dstack([fixed,a]); Image.fromarray(rgba,'RGBA').save(out+'.png')
    Image.fromarray(mask).save(out+'_mask.png')
for n in sys.argv[1:]: proc(n,'v'+n)
