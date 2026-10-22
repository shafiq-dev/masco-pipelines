import {failure,json} from './_http.mjs';
import {listNews} from './_storage.mjs';

export async function GET(request){try{const posts=await listNews(),id=new URL(request.url).searchParams.get('id');if(id){const post=posts.find(item=>item.id===id);return post?json({post}):json({error:'Article not found.'},404);}return json({posts});}catch(error){return failure(error,'Unable to load news.');}}
