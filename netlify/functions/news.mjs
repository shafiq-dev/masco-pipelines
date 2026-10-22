import {listNews} from '../news-store.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default async request=>{if(request.method!=='GET')return json({error:'Method not allowed.'},405);try{const posts=await listNews(),id=new URL(request.url).searchParams.get('id');if(id){const post=posts.find(item=>item.id===id);return post?json({post}):json({error:'Article not found.'},404);}return json({posts});}catch{return json({posts:[]});}};
