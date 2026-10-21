import {createHmac,createHash,timingSafeEqual} from 'node:crypto';

const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const sign=(value,secret)=>createHmac('sha256',secret).update(value).digest('base64url');
export function createPortalSession(accessId,secret){const payload=encode({sub:createHash('sha256').update(accessId).digest('hex').slice(0,20),exp:Date.now()+8*60*60*1000});return `${payload}.${sign(payload,secret)}`;}
export function verifyPortalSession(token,secret){try{const [payload,signature]=String(token||'').split('.');if(!payload||!signature)return false;const expected=sign(payload,secret),a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));return typeof data.sub==='string'&&data.exp>Date.now();}catch{return false;}}
export function accessIdAllowed(candidate,configured){if(typeof candidate!=='string'||!candidate.trim())return false;return String(configured||'').split(',').map(v=>v.trim()).filter(Boolean).some(value=>{const a=Buffer.from(candidate.trim()),b=Buffer.from(value);return a.length===b.length&&timingSafeEqual(a,b);});}
export function readCookie(header,name){const item=String(header||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${name}=`));return item?decodeURIComponent(item.slice(name.length+1)):'';}
export function sessionCookie(token,{secure=true}={}){return `masco_portal_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure?'; Secure':''}`;}
export function clearSessionCookie({secure=true}={}){return `masco_portal_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure?'; Secure':''}`;}
