#!/usr/bin/env python3
"""Generate original pixel-art graphics for PocketCraft; Pillow only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random, math

ROOT=Path(__file__).resolve().parents[1]/'src'/'common'
BLOCKS=ROOT/'blocks'
BLOCKS.mkdir(parents=True,exist_ok=True)
PALETTE={
 'grass':(84,174,79),'dirt':(131,96,66),'stone':(124,136,148),
 'sand':(232,201,113),'snow':(223,235,246),'wood':(151,104,60),
 'leaves':(51,141,72),'coal':(73,83,94),'iron':(165,140,126),
 'water':(51,157,213),'plank':(203,149,76),'brick':(163,87,82),
 'torch':(251,182,76)
}
def shade(c,m):
 return tuple(max(0,min(255,int(v*m))) for v in c)
def diamond(x,y):
 return abs(x-31)/32+abs(y-15)/16 < 0.92
for typ,color in PALETTE.items():
 for height in range(1,9):
  H=105  # fixed-sized RGBA atlas cells; avoid dynamic image dimensions in Vela
  im=Image.new('RGBA',(64,H),(0,0,0,0))
  d=ImageDraw.Draw(im)
  bottom=30+height*9
  d.polygon([(0,16),(31,31),(31,bottom),(0,bottom-15)],fill=shade(color,.54))
  d.polygon([(31,31),(63,16),(63,bottom-15),(31,bottom)],fill=shade(color,.70))
  d.polygon([(0,16),(31,0),(63,16),(31,31)],fill=color)
  d.line([(0,16),(31,31),(63,16)], fill=shade(color,.43),width=2)
  rr=random.Random(typ+str(height))
  for _ in range(48):
   px=rr.randrange(3,61);py=rr.randrange(3,29)
   if diamond(px,py):
    ink=shade(color,rr.choice((.78,.85,1.08,1.17)))
    d.rectangle((px,py,px+rr.choice((1,2,3)),py+1),fill=ink)
  if typ in ('grass','snow'):
   for _ in range(7):
    px=rr.randrange(10,54);py=rr.randrange(9,23)
    if diamond(px,py):
     d.line((px,py,px+1,py-3),fill=shade(color,.65),width=1)
  if typ in ('coal','iron'):
   ore=(42,41,43) if typ=='coal' else (249,183,109)
   for _ in range(8):
    px=rr.randrange(11,55);py=rr.randrange(8,27)
    if diamond(px,py):d.rectangle((px,py,px+3,py+2),fill=ore)
  if typ=='wood':
   d.line((15,13,48,13),fill=(103,64,39),width=2)
   d.ellipse((20,7,42,23),outline=(94,60,33),width=2)
  if typ=='plank':
   for j in range(4,29,7):d.line((12,j,51,j),fill=shade(color,.70),width=1)
  if typ=='water':
   for j in range(4):
    px=rr.randrange(12,51);py=rr.randrange(9,25)
    d.line((px,py,px+5,py),fill=(147,219,248),width=2)
  if typ=='torch':
   d.rectangle((27,6,35,25),fill=(106,64,41))
   d.ellipse((23,2,38,18),fill=(255,228,85))
   d.ellipse((27,5,34,16),fill=(255,120,43))
  im.save(BLOCKS/f'{typ}_{height}.png', optimize=True)

def bg(night=False):
 im=Image.new('RGB',(336,287),(18,37,72) if night else (105,194,232))
 d=ImageDraw.Draw(im)
 for y in range(287):
  f=y/287
  if night:c=(int(15+19*f),int(29+31*f),int(65+32*f))
  else:c=(int(100+90*f),int(185+34*f),int(234-32*f))
  d.line((0,y,336,y),fill=c)
 if night:
  d.ellipse((253,26,290,63),fill=(241,240,202))
  d.ellipse((266,18,300,57),fill=(25,43,79))
  rr=random.Random(22)
  for _ in range(28):
   x=rr.randrange(336);y=rr.randrange(152)
   d.rectangle((x,y,x+1,y+1),fill=(189,215,245))
 else:
  d.ellipse((262,25,308,71),fill=(255,236,153))
  for x,y in [(23,49),(116,20),(223,91)]:
   for dx,dy,r in [(0,9,17),(20,0,22),(41,12,15)]:
    d.ellipse((x+dx,y+dy,x+dx+r*2,y+dy+r),fill=(229,245,249))
 # distant blocky mountain silhouettes
 ridge=[(0,248),(0,203),(32,211),(51,193),(78,201),(118,179),(155,204),(189,184),(216,204),(267,184),(298,204),(336,194),(336,287)]
 d.polygon(ridge,fill=(43,77,97) if night else (92,150,165))
 for x in range(0,336,19):
  h=185+(x*37)%53
  d.rectangle((x,h,x+9,286),fill=(37,89,97) if night else (59,138,126))
 im.save(ROOT/('night_bg.png' if night else 'day_bg.png'), optimize=True)
bg(False);bg(True)

def sprite(name, hostile=False):
 im=Image.new('RGBA',(44,60),(0,0,0,0));d=ImageDraw.Draw(im)
 skin=(113,191,97) if hostile else (239,184,127)
 shirt=(88,66,146) if hostile else (51,140,210)
 legs=(62,82,102)
 d.rectangle((12,13,32,35),fill=skin)
 d.rectangle((10,30,34,47),fill=shirt)
 d.rectangle((9,31,13,46),fill=skin)
 d.rectangle((32,31,36,46),fill=skin)
 d.rectangle((13,47,21,57),fill=legs)
 d.rectangle((24,47,32,57),fill=legs)
 d.rectangle((14,21,17,24),fill=(34,37,43))
 d.rectangle((27,21,30,24),fill=(34,37,43))
 if hostile:
  d.rectangle((12,12,32,15),fill=(40,117,68))
  d.rectangle((17,28,26,30),fill=(57,76,59))
 else:
  d.polygon([(9,16),(12,7),(28,5),(35,13),(34,18)],fill=(96,61,36))
 im.save(ROOT/name,optimize=True)
sprite('player.png');sprite('zombie.png',True)

im=Image.new('RGBA',(64,40),(0,0,0,0));d=ImageDraw.Draw(im)
d.line([(2,20),(31,2),(61,20),(31,37),(2,20)],fill=(255,247,127,255),width=3)
im.save(ROOT/'cursor.png',optimize=True)
im=Image.new('RGBA',(128,128),(17,33,54,255));d=ImageDraw.Draw(im)
d.rounded_rectangle((8,8,120,120),radius=22,fill=(31,66,82),outline=(127,215,177),width=4)
d.polygon([(17,69),(65,40),(112,65),(65,91)],fill=(92,180,77))
d.polygon([(17,69),(65,91),(65,116),(17,94)],fill=(76,104,64))
d.polygon([(65,91),(112,65),(112,89),(65,116)],fill=(50,128,77))
d.rectangle((53,25,78,50),fill=(70,157,86))
im.save(ROOT/'logo.png',optimize=True)
print('Generated',len(list(BLOCKS.glob('*.png'))),'voxel sprites and scene assets')
