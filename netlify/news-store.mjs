import {getStore} from '@netlify/blobs';

const key='published-news';
const allowedImages=new Set(['/media/jv-group.webp','/media/jv-signing.webp','/media/jv-handshake.webp','/media/black-sea.webp','/media/interconnection.webp','/media/welding.webp']);
const clean=value=>String(value||'').trim();
export function sanitizePost(input,existing={}){
  const title=clean(input.title),category=clean(input.category).toUpperCase(),excerpt=clean(input.excerpt),link=clean(input.link),linkLabel=clean(input.linkLabel),image=clean(input.image);
  if(title.length<4||title.length>110)throw new Error('Title must be 4–110 characters.');
  if(category.length<3||category.length>38)throw new Error('Category must be 3–38 characters.');
  if(excerpt.length<10||excerpt.length>240)throw new Error('Summary must be 10–240 characters.');
  if(!allowedImages.has(image))throw new Error('Select an approved original MASCO image.');
  if(link&&!/^(https?:\/\/|#|\/)/i.test(link))throw new Error('Link must be an HTTPS URL or a site path.');
  if(linkLabel.length<2||linkLabel.length>40)throw new Error('Link label must be 2–40 characters.');
  const now=new Date().toISOString();
  return {id:existing.id||crypto.randomUUID(),title,category,excerpt,link:link||'#news',linkLabel,image,createdAt:existing.createdAt||now,updatedAt:now};
}
export async function listNews(){const value=await getStore('masco-news').get(key,{type:'json'});return Array.isArray(value)?value:[];}
export async function saveNews(posts){await getStore('masco-news').setJSON(key,posts);return posts;}
