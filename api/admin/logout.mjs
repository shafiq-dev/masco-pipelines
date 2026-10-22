import {clearAdminCookie} from '../../netlify/admin-session.mjs';
import {json} from '../_http.mjs';
export function POST(){return json({ok:true},200,{'Set-Cookie':clearAdminCookie()});}
