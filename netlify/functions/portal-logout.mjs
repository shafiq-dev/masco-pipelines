import {clearSessionCookie} from '../portal-session.mjs';
export default async request=>new Response(JSON.stringify({ok:true}),{status:request.method==='POST'?200:405,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':clearSessionCookie()}});
