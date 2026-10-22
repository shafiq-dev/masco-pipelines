import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {accessIdAllowed,clearSessionCookie,createPortalSession,readCookie,sessionCookie,verifyPortalSession} from './netlify/portal-session.mjs';
import {getPortalData} from './netlify/portal-data.mjs';
import {adminCookie,clearAdminCookie,createAdminSession,readAdminCookie,validAdminPin,verifyAdminSession} from './netlify/admin-session.mjs';
import {sanitizePost} from './netlify/news-store.mjs';
import {decodeUpload} from './netlify/media-store.mjs';
const root=path.resolve('public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.ttf':'font/ttf'};
const portalIds=process.env.MASCO_PORTAL_ACCESS_IDS||'';
const portalSecret=process.env.MASCO_PORTAL_SESSION_SECRET||'';
const adminPin=process.env.MASCO_ADMIN_PIN||'';
const adminSecret=process.env.MASCO_ADMIN_SESSION_SECRET||'';
const newsFile=path.resolve('tmp/admin-news.json');
const mediaRoot=path.resolve('tmp/admin-media');
const sendJson=(res,status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(body));};
const readBody=req=>new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>10000)reject(new Error('Request too large'));});req.on('end',()=>resolve(body));req.on('error',reject);});
const readUploadBody=req=>new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>7*1024*1024)reject(new Error('Image upload is too large'));});req.on('end',()=>resolve(body));req.on('error',reject);});
const listNews=async()=>{try{const value=JSON.parse(await readFile(newsFile,'utf8'));return Array.isArray(value)?value:[];}catch{return [];}};
const saveNews=async posts=>{await mkdir(path.dirname(newsFile),{recursive:true});await writeFile(newsFile,JSON.stringify(posts,null,2));};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/portal/auth'){
  if(req.method!=='POST')return sendJson(res,405,{error:'Method not allowed.'});
  if(!portalIds||!portalSecret)return sendJson(res,503,{error:'Portal access has not been configured by MASCO IT.'});
  const body=JSON.parse(await readBody(req));if(!accessIdAllowed(body.accessId,portalIds))return sendJson(res,401,{error:'Access ID was not recognized. Contact MASCO Pipelines IT.'});
  return sendJson(res,200,{ok:true},{'Set-Cookie':sessionCookie(createPortalSession(body.accessId.trim(),portalSecret),{secure:false})});
 }
 if(url.pathname==='/api/portal/data'){
  if(req.method!=='GET')return sendJson(res,405,{error:'Method not allowed.'});
  const token=readCookie(req.headers.cookie,'masco_portal_session');if(!portalSecret||!verifyPortalSession(token,portalSecret))return sendJson(res,401,{error:'Authorized portal access is required.'});
  return sendJson(res,200,getPortalData());
 }
 if(url.pathname==='/api/portal/logout')return sendJson(res,req.method==='POST'?200:405,{ok:req.method==='POST'},{'Set-Cookie':clearSessionCookie({secure:false})});
 if(url.pathname==='/api/news'){
  if(req.method!=='GET')return sendJson(res,405,{error:'Method not allowed.'});const posts=await listNews(),id=url.searchParams.get('id');if(id){const post=posts.find(item=>item.id===id);return post?sendJson(res,200,{post}):sendJson(res,404,{error:'Article not found.'});}return sendJson(res,200,{posts});
 }
 if(url.pathname==='/api/news/media'){
  if(req.method!=='GET')return sendJson(res,405,{error:'Method not allowed.'});const id=url.searchParams.get('id');if(!/^[a-z0-9-]+\.(?:jpg|png|webp)$/i.test(String(id||'')))return sendJson(res,404,{error:'Image not found.'});const file=path.resolve(mediaRoot,id);if(!file.startsWith(mediaRoot+path.sep))return sendJson(res,403,{error:'Invalid image.'});const data=await readFile(file);const ext=path.extname(file).toLowerCase();res.writeHead(200,{'Content-Type':ext==='.png'?'image/png':ext==='.jpg'?'image/jpeg':'image/webp','Cache-Control':'public, max-age=31536000, immutable'});return res.end(data);
 }
 if(url.pathname==='/api/admin/auth'){
  if(req.method!=='POST')return sendJson(res,405,{error:'Method not allowed.'});
  if(!adminPin||!adminSecret)return sendJson(res,503,{error:'Admin access has not been configured.'});
  const body=JSON.parse(await readBody(req));if(!validAdminPin(body.pin,adminPin))return sendJson(res,401,{error:'The PIN is incorrect.'});
  return sendJson(res,200,{ok:true},{'Set-Cookie':adminCookie(createAdminSession(adminSecret),{secure:false})});
 }
 if(url.pathname==='/api/admin/news'){
  if(!adminSecret||!verifyAdminSession(readAdminCookie(req.headers.cookie),adminSecret))return sendJson(res,401,{error:'Admin sign-in required.'});
  let posts=await listNews();if(req.method==='GET')return sendJson(res,200,{posts});const body=JSON.parse(await readBody(req));
  if(req.method==='POST'){const post=sanitizePost(body);posts=[post,...posts];await saveNews(posts);return sendJson(res,201,{post});}
  const index=posts.findIndex(post=>post.id===String(body.id||''));if(index<0)return sendJson(res,404,{error:'News post not found.'});
  if(req.method==='PUT'){posts[index]=sanitizePost(body,posts[index]);await saveNews(posts);return sendJson(res,200,{post:posts[index]});}
  if(req.method==='DELETE'){posts.splice(index,1);await saveNews(posts);return sendJson(res,200,{ok:true});}
  return sendJson(res,405,{error:'Method not allowed.'});
 }
 if(url.pathname==='/api/admin/media'){
  if(req.method!=='POST')return sendJson(res,405,{error:'Method not allowed.'});if(!adminSecret||!verifyAdminSession(readAdminCookie(req.headers.cookie),adminSecret))return sendJson(res,401,{error:'Admin sign-in required.'});const media=decodeUpload(JSON.parse(await readUploadBody(req))),id=`${randomUUID()}.${media.extension}`;await mkdir(mediaRoot,{recursive:true});await writeFile(path.join(mediaRoot,id),media.bytes);return sendJson(res,201,{id,url:`/api/news/media?id=${encodeURIComponent(id)}`});
 }
 if(url.pathname==='/api/admin/logout')return sendJson(res,req.method==='POST'?200:405,{ok:req.method==='POST'},{'Set-Cookie':clearAdminCookie({secure:false})});
 const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname);const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
}catch(error){if(error instanceof SyntaxError)return sendJson(res,400,{error:'Invalid request.'});res.writeHead(404);res.end('Not found');}}).listen(3004,'0.0.0.0',()=>console.log('MASCO Pipelines ready at http://localhost:3004'));
