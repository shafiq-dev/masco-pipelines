import {readFile,cp,mkdir,access,rm} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['--check','public/site.js'],{stdio:'inherit'});
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))await access('public'+match[1]);
for(const match of html.matchAll(/<img[^>]+src="([^"]+)"/g)){if(!/^\/(media|brand)\//.test(match[1]))throw new Error('Unexpected image source: '+match[1]);}
const css=await readFile('public/site.css','utf8');for(const match of css.matchAll(/url\('([^']+)'\)/g)){await access('public'+match[1]);if(!/^\/fonts\//.test(match[1]))throw new Error('Unexpected visual source: '+match[1]);}
const manifest=JSON.parse(await readFile('original-media-manifest.json','utf8'));
for(const photo of manifest)await access(photo.asset);
const knownPhotos=new Set(manifest.map(p=>'/'+p.asset.replace('public/','')));
for(const match of html.matchAll(/src="(\/media\/[^\"]+)"/g))if(!knownPhotos.has(match[1]))throw new Error('Photograph missing source provenance: '+match[1]);
if(/\/imagery\//.test(html+css+await readFile('public/site.js','utf8')))throw new Error('Generated imagery must not appear in the rework');
const outsideFooter=html.replace(/<footer>.*?<\/footer>/s,'');if(/company profile/i.test(outsideFooter))throw new Error('Company Profile should be mentioned only in the footer');
if(process.argv[2]==='build'){const dist=path.resolve('dist');if(dist!==path.join(process.cwd(),'dist'))throw new Error('Invalid output path');await rm(dist,{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Production build ready in dist/');}else console.log('JavaScript, local assets, image sources and local font checked.');
