import {readFile,cp,mkdir,access,rm} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['--check','public/site.js'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','public/portal/portal.js'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','public/admin/admin.js'],{stdio:'inherit'});
for(const file of ['server.mjs','netlify/portal-session.mjs','netlify/portal-data.mjs','netlify/admin-session.mjs','netlify/news-store.mjs','netlify/media-store.mjs','netlify/functions/portal-auth.mjs','netlify/functions/portal-data.mjs','netlify/functions/portal-logout.mjs','netlify/functions/news.mjs','netlify/functions/news-media.mjs','netlify/functions/admin-auth.mjs','netlify/functions/admin-news.mjs','netlify/functions/admin-media.mjs','netlify/functions/admin-logout.mjs'])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
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
const portalHtml=await readFile('public/portal/index.html','utf8');
for(const match of portalHtml.matchAll(/(?:src|href)="(\/[^"#]+)"/g))await access('public'+match[1]);
if(/Aramco|live feed|Eng\. Tareq|14,892|99\.6%/.test(portalHtml+await readFile('public/portal/portal.js','utf8')+await readFile('netlify/portal-data.mjs','utf8')))throw new Error('Unverified draft portal claims must not be published');
const adminHtml=await readFile('public/admin/index.html','utf8');
for(const match of adminHtml.matchAll(/(?:src|href)="(\/[^"#]+)"/g))await access('public'+match[1]);
const articleHtml=await readFile('public/news/article/index.html','utf8');
for(const match of articleHtml.matchAll(/(?:src|href)="(\/[^"#]+)"/g))await access('public'+match[1]);
const envExample=await readFile('.env.example','utf8');if(!envExample.includes('MASCO_PORTAL_ACCESS_IDS=IT-ISSUED-ACCESS-ID-ONE,IT-ISSUED-ACCESS-ID-TWO')||!envExample.includes('MASCO_PORTAL_SESSION_SECRET=generate-a-long-random-secret'))throw new Error('The environment example must contain placeholders only');
if(process.argv[2]==='build'){const dist=path.resolve('dist');if(dist!==path.join(process.cwd(),'dist'))throw new Error('Invalid output path');await rm(dist,{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Production build ready in dist/');}else console.log('JavaScript, local assets, image sources and local font checked.');
