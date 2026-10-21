from pathlib import Path
from PIL import Image,ImageOps
import shutil,json,hashlib
root=Path('public');(root/'media').mkdir(exist_ok=True);(root/'brand').mkdir(exist_ok=True)
inventory=json.loads(Path('tmp/review/asset-inventory.json').read_text())
selected={1:'welding',2:'onesti',3:'black-sea',4:'interconnection',5:'danube-crossing',14:'hdd-pullback',17:'metering-stations',18:'jv-group',19:'jv-handshake',20:'jv-signing'}
manifest=[]
for row in inventory:
 if row['id'] not in selected:continue
 name=selected[row['id']];im=ImageOps.exif_transpose(Image.open(row['path'])).convert('RGB');im.thumbnail((1920,1440));target=root/'media'/f'{name}.webp';im.save(target,quality=90,method=6)
 manifest.append({'asset':str(target).replace('\\','/'),'source_archive':'masco pipelines media.zip' if '/media/' in row['path'].replace('\\','/') else 'masco-pipelines-&-infrastructure.zip','source_file':Path(row['path']).name,'source_sha256':row['sha256'],'treatment':'EXIF orientation, proportional downsize and WebP compression only; no generative editing'})
for source in Path('tmp/review/draft-b/mascopipelines-site 01/img').glob('*.png'):
 if source.name.startswith('photo'):continue
 shutil.copyfile(source,root/'brand'/source.name)
shutil.copyfile('D:/Downloads/MASCOPipelineWhite.png',root/'brand/logo-white.png')
shutil.copyfile('tmp/review/draft-a/public/Logo - MASCO Pipelines.png',root/'brand/logo-color.png')
for key,xref in [('saudi',1545),('romania',1549),('moldova',1547),('egypt',1557)]:shutil.copyfile(root/'profile'/f'page-08-{xref}.webp',root/'brand'/f'flag-{key}.webp')
shutil.copyfile(root/'profile/page-08-1525.webp',root/'brand/world.webp')
for weight in ['Regular','Medium','SemiBold','Bold','ExtraBold']:
 shutil.copyfile(Path('D:/Downloads/Inter/static')/f'Inter_18pt-{weight}.ttf',root/'fonts'/f'Inter-{weight}.ttf')
Path('original-media-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Prepared {len(manifest)} original photographs, original brand assets and five local font weights.')
