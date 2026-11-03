"""Rebuild kit: Python 3 + fonttools, cairosvg, Pillow. Font: DejaVu Sans."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import cairosvg, json, shutil
from PIL import Image
from pypdf import PdfWriter
P=Path(__file__).resolve().parent
ROOT=P.parents[1]
MARK='M15 20Q35 20 50 33Q65 20 85 20V75Q65 75 50 88Q35 75 15 75Z M50 33V88'
def lettering(text,fontfile):
 f=TTFont(fontfile); gs=f.getGlyphSet(); cmap=f.getBestCmap(); x=0; paths=[]
 for char in text:
  name=cmap[ord(char)]; pen=SVGPathPen(gs); gs[name].draw(pen)
  paths.append(f'<path transform="translate({x} 0)" d="{pen.getCommands()}"/>'); x+=gs[name].width
 return ''.join(paths),x
word,ww=lettering('SISGES','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
desc,dw=lettering('Sistema de Gestão Escolar','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
def textpath(content,width,x,y,target): return f'<g transform="translate({x} {y}) scale({target/width} {-target/width})">{content}</g>'
mark=f'<path d="{MARK}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
layouts={
 'symbol':(100,100,mark),
 'horizontal':(520,120,f'<g transform="translate(0 0)">{mark}</g>'+textpath(word,ww,120,83,370)),
 'horizontal-descriptor':(520,140,f'<g transform="translate(0 10)">{mark}</g>'+textpath(word,ww,120,79,370)+textpath(desc,dw,122,111,366)),
 'vertical':(360,250,f'<g transform="translate(100 0) scale(1.6)">{mark}</g>'+textpath(word,ww,40,218,280)),
 'vertical-descriptor':(400,290,f'<g transform="translate(120 0) scale(1.6)">{mark}</g>'+textpath(word,ww,60,218,280)+textpath(desc,dw,45,258,310))}
colors={'navy':'#142D4E','black':'#000000','white':'#FFFFFF','gold':'#B79753'}
for sub in ['svg','png','pdf','icons']: (P/sub).mkdir(exist_ok=True)
for name,(w,h,body) in layouts.items():
 for color,value in colors.items():
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img"><title>SISGES — Open Book</title><g fill="{value}" color="{value}">{body}</g></svg>'
  stem=f'sisges-{name}-{color}'
  (P/'svg'/f'{stem}.svg').write_text(svg)
  for size in [1,2]:
   # Digital exports have 1200px long edge (2400px at 2x).
   cairosvg.svg2png(bytestring=svg.encode(),write_to=str(P/'png'/f'{stem}@{size}x.png'),output_width=round(w*1200/max(w,h)*size),output_height=round(h*1200/max(w,h)*size))
  if color=='navy': cairosvg.svg2pdf(bytestring=svg.encode(),write_to=str(P/'pdf'/f'{stem}.pdf'))
# Collect the five print layouts into one vector master PDF.
writer = PdfWriter()
for name in layouts:
 file = P/'pdf'/f'sisges-{name}-navy.pdf'
 writer.append(str(file))
writer.write(str(P/'pdf'/'sisges-logo-masters.pdf'))
writer.close()
for name in layouts:
 (P/'pdf'/f'sisges-{name}-navy.pdf').unlink()
# Consistent opaque square launcher icons; padding is intentional.
icon=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#142D4E"/><g fill="white" color="white" transform="translate(10 10) scale(.8)">{mark}</g></svg>'
(P/'icons'/'sisges-app.svg').write_text(icon)
for size in [16,32,48,64,128,180,192,256,512,1024]:
 cairosvg.svg2png(bytestring=icon.encode(),write_to=str(P/'icons'/f'sisges-app-{size}.png'),output_width=size,output_height=size)
Image.open(P/'icons'/'sisges-app-256.png').save(P/'icons'/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])
public=ROOT/'public'
(public/'brand').mkdir(exist_ok=True)
for src,dst in [('sisges-app.svg','sisges-icon.svg'),('sisges-app-180.png','apple-touch-icon.png'),('sisges-app-192.png','icon-192.png'),('sisges-app-512.png','icon-512.png'),('favicon.ico','favicon.ico')]: shutil.copy2(P/'icons'/src,public/dst)
# The UI consumes the same outlined lockups as the handoff kit.
for color in ['navy','white']:
 shutil.copy2(P/'svg'/f'sisges-horizontal-{color}.svg',public/'brand'/f'sisges-horizontal-{color}.svg')
 shutil.copy2(P/'svg'/f'sisges-symbol-{color}.svg',public/'brand'/f'sisges-symbol-{color}.svg')
rows=[]
for name in layouts:
 cards=''.join(f'<figure style="background:{"#142D4E" if color in ["white","gold"] else "#FFFFFF"}"><img src="svg/sisges-{name}-{color}.svg" alt="{name} {color}"><figcaption>{color} · <a href="svg/sisges-{name}-{color}.svg">SVG</a> · <a href="png/sisges-{name}-{color}@2x.png">PNG 2x</a></figcaption></figure>' for color in colors)
 rows.append(f'<h2>{name.replace("-"," ").title()}</h2><div class="grid">{cards}</div>')
(P/'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SISGES Brand Kit</title><style>body{font:16px/1.6 system-ui;background:#edf0ee;color:#173b32;margin:40px}main{max-width:1400px;margin:auto}h1{font-size:40px}h2{margin-top:48px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;padding:24px;border-radius:8px}img{width:100%;height:140px;object-fit:contain}figcaption{font-size:13px;color:#8b968e}a{color:inherit}@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.grid{grid-template-columns:1fr}}</style><main><h1>SISGES · Open Book</h1><p>Master logo assets · Horizontal, vertical, descriptor, symbol, positive and negative.</p><p>Vector lettering is outlined; no font installation required. White variants are transparent, shown here on navy.</p>'''+''.join(rows)+'<h2>Usage</h2><p>Keep clear space of at least two book-stroke widths around the visible logo. Use navy on light surfaces and white on dark surfaces. Gold is a secondary display option. Never stretch, rotate, add shadows, or change the symbol geometry. Use the symbol below 120px wide; use descriptor versions at 280px or wider.</p><p>See README.md for formats, color values and printing notes.</p></main></html>')
# Compact brand contact sheet with real assets, useful as a quick preview.
board='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="960" viewBox="0 0 1400 960"><rect width="1400" height="960" fill="#F1F3F1"/>'
for i,(label,key,color,bg) in enumerate([('Horizontal','horizontal','navy','#FFFFFF'),('Negative','horizontal','white','#142D4E'),('Vertical','vertical-descriptor','navy','#FFFFFF'),('Monochrome','horizontal','black','#FFFFFF'),('Symbol','symbol','navy','#FFFFFF'),('Gold on navy','horizontal','gold','#142D4E')]):
 x=40+(i%2)*680; y=40+(i//2)*300; w,h,b=layouts[key]; scale=min(560/w,200/h)
 board+=f'<rect x="{x}" y="{y}" width="640" height="270" rx="12" fill="{bg}"/><text x="{x+24}" y="{y+34}" font-family="DejaVu Sans" font-size="17" fill="{colors[color]}">{label}</text><g fill="{colors[color]}" color="{colors[color]}" transform="translate({x+(640-w*scale)/2} {y+60}) scale({scale})">{b}</g>'
board+='</svg>'
(P/'preview.svg').write_text(board)
cairosvg.svg2png(bytestring=board.encode(),write_to=str(P/'preview.png'))
print('Brand kit generated:',P)
