import {readAdminCookie,verifyAdminSession} from '../../netlify/admin-session.mjs';
import {failure,json} from '../_http.mjs';
import {saveMedia} from '../_storage.mjs';

export async function POST(request){const secret=process.env.MASCO_ADMIN_SESSION_SECRET;if(!secret||!verifyAdminSession(readAdminCookie(request.headers.get('cookie')),secret))return json({error:'Admin sign-in required.'},401);try{return json(await saveMedia(await request.json()),201);}catch(error){return failure(error,'Upload failed.');}}
