import json, sys
from PIL import Image, ImageOps
import codexmap, common, veil, rooms_cy, north
north.register()
from core import asset, OUT
Image.MAX_IMAGE_PIXELS=None
codexmap.register_all()
def render(mid, scale=.33, out=None):
    J=json.load(open(f'{OUT}/{mid}/map.json')); g=Image.open(f'{OUT}/{mid}/ground.webp').convert('RGBA')
    objs=sorted(J['objs'], key=lambda o:(0 if o['flat'] else 1, o['sy']))
    for o in objs:
        im=asset(o['id'])[0]
        if 'anim' in o:
            A=J['anim'][o['id']]; sh=Image.open(f"{OUT}/{A['src']}.webp").convert('RGBA'); im=sh.crop((0,0,A['fw'],A['fh']))
        im=im.resize((max(1,round(o['w'])),max(1,round(o['h']))))
        if o['flip']: im=ImageOps.mirror(im)
        g.alpha_composite(im,(round(o['x']),round(o['y']))) if o['x']>=0 and o['y']>=0 else g.paste(im,(round(o['x']),round(o['y'])),im)
    g.convert('RGB').resize((round(g.width*scale),round(g.height*scale)),Image.LANCZOS).save(out or f'{OUT}/{mid}/full.jpg',quality=85)
if __name__=='__main__':
    for m in sys.argv[1:]: render(m)
