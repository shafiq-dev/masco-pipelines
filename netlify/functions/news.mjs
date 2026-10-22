import {listNews} from '../news-store.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default async request=>{if(request.method!=='GET')return json({error:'Method not allowed.'},405);try{return json({posts:await listNews()});}catch{return json({posts:[]});}};
