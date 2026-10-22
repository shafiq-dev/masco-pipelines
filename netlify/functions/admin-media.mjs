import {readAdminCookie,verifyAdminSession} from '../admin-session.mjs';
import {saveMedia} from '../media-store.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default async request=>{if(request.method!=='POST')return json({error:'Method not allowed.'},405);const secret=process.env.MASCO_ADMIN_SESSION_SECRET;if(!secret||!verifyAdminSession(readAdminCookie(request.headers.get('cookie')),secret))return json({error:'Admin sign-in required.'},401);try{return json(await saveMedia(await request.json()),201);}catch(error){return json({error:error.message||'Upload failed.'},400);}};
