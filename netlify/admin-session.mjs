import {createHmac,timingSafeEqual} from 'node:crypto';

const cookieName='masco_admin_session';
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const sign=(value,secret)=>createHmac('sha256',secret).update(value).digest('base64url');
export function validAdminPin(candidate,configured){
  if(!/^\d{8}$/.test(String(candidate||''))||!/^\d{8}$/.test(String(configured||'')))return false;
  const a=Buffer.from(String(candidate)),b=Buffer.from(String(configured));
  return a.length===b.length&&timingSafeEqual(a,b);
}
export function createAdminSession(secret){const payload=encode({role:'news-admin',exp:Date.now()+4*60*60*1000});return `${payload}.${sign(payload,secret)}`;}
export function verifyAdminSession(token,secret){try{const [payload,signature]=String(token||'').split('.');if(!payload||!signature||!secret)return false;const expected=sign(payload,secret),a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return data.role==='news-admin'&&data.exp>Date.now();}catch{return false;}}
export function readAdminCookie(header){const item=String(header||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${cookieName}=`));return item?decodeURIComponent(item.slice(cookieName.length+1)):'';}
export function adminCookie(token,{secure=true}={}){return `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=14400${secure?'; Secure':''}`;}
export function clearAdminCookie({secure=true}={}){return `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure?'; Secure':''}`;}
