import {readCookie,verifyPortalSession} from '../portal-session.mjs';
import {getPortalData} from '../portal-data.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default async request=>{if(request.method!=='GET')return json({error:'Method not allowed.'},405);const secret=process.env.MASCO_PORTAL_SESSION_SECRET;if(!secret)return json({error:'Portal access has not been configured by MASCO IT.'},503);const token=readCookie(request.headers.get('cookie'),'masco_portal_session');if(!verifyPortalSession(token,secret))return json({error:'Authorized portal access is required.'},401);return json(getPortalData());};
