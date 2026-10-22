import {adminCookie,createAdminSession,validAdminPin} from '../../netlify/admin-session.mjs';
import {failure,json} from '../_http.mjs';

const attempts=new Map(),maxAttempts=6,windowMs=15*60*1000;
export async function POST(request){try{const pin=process.env.MASCO_ADMIN_PIN,secret=process.env.MASCO_ADMIN_SESSION_SECRET;if(!pin||!secret)return json({error:'Admin access has not been configured.'},503);const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown',now=Date.now(),record=attempts.get(ip);if(record&&record.reset>now&&record.count>=maxAttempts)return json({error:'Too many attempts. Try again later.'},429,{'Retry-After':String(Math.ceil((record.reset-now)/1000))});const body=await request.json();if(!validAdminPin(body.pin,pin)){attempts.set(ip,record&&record.reset>now?{count:record.count+1,reset:record.reset}:{count:1,reset:now+windowMs});return json({error:'The PIN is incorrect.'},401);}attempts.delete(ip);return json({ok:true},200,{'Set-Cookie':adminCookie(createAdminSession(secret))});}catch(error){return failure(error,'Unable to sign in.');}}
export function GET(){return json({error:'Method not allowed.'},405);}
