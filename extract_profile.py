import sys, json
from pathlib import Path
sys.path.insert(0, str(Path('../masco-film/python-deps').resolve()))
import pymupdf
from PIL import Image, ImageDraw, ImageOps
doc=pymupdf.open('D:/Downloads/MASCO Pipelines Profile.pdf')
out=Path('public/profile');out.mkdir(exist_ok=True)
seen=set();thumbs=[];manifest=[]
for n,page in enumerate(doc):
    for item in page.get_images(full=True):
        xref,mask,w,h=item[:4]
        if xref in seen:continue
        seen.add(xref)
        pix=pymupdf.Pixmap(doc,xref)
        if mask:
            if pix.alpha:pix=pymupdf.Pixmap(pix,0)
            pix=pymupdf.Pixmap(pix,pymupdf.Pixmap(doc,mask))
        img=Image.frombytes('RGBA' if pix.alpha else 'RGB',(pix.width,pix.height),pix.samples)
        name=f'page-{n+1:02d}-{xref}.webp'
        img.thumbnail((2200,1500));img.save(out/name,quality=92)
        thumb=Image.new('RGB',(240,160),'#ecf2f7');small=ImageOps.contain(img,(230,125));thumb.paste(small,((240-small.width)//2,0),small if small.mode=='RGBA' else None)
        ImageDraw.Draw(thumb).text((5,135),f'P{n+1} xref {xref} ({w}x{h})',fill='#123')
        thumbs.append(thumb);manifest.append({'page':n+1,'xref':xref,'path':'/profile/'+name})
sheet=Image.new('RGB',(1200,((len(thumbs)+4)//5)*160),'white')
for i,t in enumerate(thumbs):sheet.paste(t,((i%5)*240,(i//5)*160))
sheet.save('tmp/pdf-assets.jpg')
pix=doc[5].get_pixmap(matrix=pymupdf.Matrix(4,4),clip=pymupdf.Rect(818,475,905,527),alpha=False)
logo=Image.frombytes('RGB',(pix.width,pix.height),pix.samples).convert('RGBA')
for y in range(logo.height):
    for x in range(logo.width):
        r,g,b,a=logo.getpixel((x,y))
        if not ((r<125 and b>100 and b>r+30) or (r>150 and g<190 and b<100)):
            logo.putpixel((x,y),(r,g,b,0))
logo.save(out/'page-06-sabic.webp',lossless=True)
manifest.append({'page':6,'path':'/profile/page-06-sabic.webp','clip':[818,475,905,527]})
Path('profile-assets.json').write_text(json.dumps(manifest,indent=2))
print(f'Extracted {len(thumbs)} original PDF images')
