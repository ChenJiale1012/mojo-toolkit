"""Author a binary SVG transparency mask from the original artwork's edge colours.
The source image is unchanged. Small cells follow real leaves/ground; no random
scattering, blur, diagonal polygon or repeating cutout pattern is used.
"""
from pathlib import Path
from PIL import Image
im=Image.open('public/courtyard.png').convert('RGB');w,h=im.size;step=5
rects=[]
for y in range(0,h,step):
 marks=[]
 for x in range(0,w,step):
  points=[im.getpixel((min(w-1,x+dx),min(h-1,y+dy))) for dx,dy in [(0,0),(2,2),(4,4),(0,4),(4,0)]]
  # Identify visible leaf, orange, soil or shadow pixels against the cream sky.
  ink=sum(1 for r,g,b in points if min(r,g,b)<165 or max(r,g,b)-min(r,g,b)>65)
  marks.append(ink>=2)
 # Fill scene interiors to preserve the table, sky holes and pale buildings.
 # Edge cells alone retain their source-shaped outline and clusters.
 strong=next((i for i in range(len(marks)-3) if sum(marks[i:i+4])>=3),len(marks))
 for i,marked in enumerate(marks):
  inside=i>strong+6 and y<h-90
  if i*step<140:
   r,g,b=im.getpixel((min(w-1,i*step+2),min(h-1,y+2)))
   edge_threshold=15+105*(1-i*step/140)
   marked=marked and max(r,g,b)-min(r,g,b)>edge_threshold
   inside=False
  if y>h-70:
   r,g,b=im.getpixel((min(w-1,i*step+2),min(h-1,y+2)))
   threshold=65+(y-(h-70))*1.4
   marked=marked and ((g>r*1.08 and g>b*1.1 and g>threshold) or (r>g*1.4 and g>threshold))
   inside=False
  if marked or inside:rects.append(f'<rect x="{i*step}" y="{y}" width="{step}" height="{step}" fill="white"/>')
Path('public/courtyard-mask.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">'+''.join(rects)+'</svg>')
print('Contour mask cells:',len(rects))
