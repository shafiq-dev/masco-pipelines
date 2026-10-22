import {readAdminCookie,verifyAdminSession} from '../../netlify/admin-session.mjs';
import {sanitizePost} from '../../shared/news-sanitize.mjs';
import {failure,json} from '../_http.mjs';
import {listNews,saveNews} from '../_storage.mjs';

const authorize=request=>{const secret=process.env.MASCO_ADMIN_SESSION_SECRET;return secret&&verifyAdminSession(readAdminCookie(request.headers.get('cookie')),secret);};
export async function GET(request){if(!authorize(request))return json({error:'Admin sign-in required.'},401);try{return json({posts:await listNews()});}catch(error){return failure(error,'Unable to load news.');}}
export async function POST(request){if(!authorize(request))return json({error:'Admin sign-in required.'},401);try{const posts=await listNews(),post=sanitizePost(await request.json());await saveNews([post,...posts]);return json({post},201);}catch(error){return failure(error,'Unable to publish news.');}}
export async function PUT(request){if(!authorize(request))return json({error:'Admin sign-in required.'},401);try{const body=await request.json(),posts=await listNews(),index=posts.findIndex(post=>post.id===String(body.id||''));if(index<0)return json({error:'News post not found.'},404);posts[index]=sanitizePost(body,posts[index]);await saveNews(posts);return json({post:posts[index]});}catch(error){return failure(error,'Unable to update news.');}}
export async function DELETE(request){if(!authorize(request))return json({error:'Admin sign-in required.'},401);try{const body=await request.json(),posts=await listNews(),index=posts.findIndex(post=>post.id===String(body.id||''));if(index<0)return json({error:'News post not found.'},404);posts.splice(index,1);await saveNews(posts);return json({ok:true});}catch(error){return failure(error,'Unable to delete news.');}}
