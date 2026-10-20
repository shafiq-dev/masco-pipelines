import {readFile,cp,mkdir,access,rm} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['--check','public/profile.js'],{stdio:'inherit'});
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))await access('public'+match[1]);
for(const match of html.matchAll(/<img[^>]+src="([^"]+)"/g)){if(!/^\/(profile|imagery)\//.test(match[1]))throw new Error('Unexpected image source: '+match[1]);}
for(const filename of ['profile.css','enhancements.css','portfolio-map.css','hero.css']){const css=await readFile('public/'+filename,'utf8');for(const match of css.matchAll(/url\('([^']+)'\)/g)){await access('public'+match[1]);if(!/^\/(profile|fonts|imagery)\//.test(match[1]))throw new Error('Unexpected visual source: '+match[1]);}}
const outsideFooter=html.replace(/<footer>.*?<\/footer>/s,'');if(/company profile/i.test(outsideFooter))throw new Error('Company Profile should be mentioned only in the footer');
if(process.argv[2]==='build'){const dist=path.resolve('dist');if(dist!==path.join(process.cwd(),'dist'))throw new Error('Invalid output path');await rm(dist,{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Production build ready in dist/');}else console.log('JavaScript, local assets, image sources and local font checked.');
