import {readCookie,verifyPortalSession} from '../../netlify/portal-session.mjs';
import {getPortalData} from '../../netlify/portal-data.mjs';
import {json} from '../_http.mjs';

export function GET(request){const secret=process.env.MASCO_PORTAL_SESSION_SECRET;if(!secret)return json({error:'Portal access has not been configured by MASCO IT.'},503);const token=readCookie(request.headers.get('cookie'),'masco_portal_session');if(!verifyPortalSession(token,secret))return json({error:'Authorized portal access is required.'},401);return json(getPortalData());}
