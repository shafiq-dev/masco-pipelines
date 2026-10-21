import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {accessIdAllowed,clearSessionCookie,createPortalSession,readCookie,sessionCookie,verifyPortalSession} from './netlify/portal-session.mjs';
import {getPortalData} from './netlify/portal-data.mjs';
const root=path.resolve('public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.ttf':'font/ttf'};
const portalIds=process.env.MASCO_PORTAL_ACCESS_IDS||'';
const portalSecret=process.env.MASCO_PORTAL_SESSION_SECRET||'';
const sendJson=(res,status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(body));};
const readBody=req=>new Promise((resolve,reject)=>{let body='';req.on('data',chunk=>{body+=chunk;if(body.length>10000)reject(new Error('Request too large'));});req.on('end',()=>resolve(body));req.on('error',reject);});
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
 const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname);const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
}catch(error){if(error instanceof SyntaxError)return sendJson(res,400,{error:'Invalid request.'});res.writeHead(404);res.end('Not found');}}).listen(3004,'0.0.0.0',()=>console.log('MASCO Pipelines ready at http://localhost:3004'));
