import {list,put} from '@vercel/blob';
import {randomUUID} from 'node:crypto';
import {decodeUpload} from '../shared/media.mjs';

const newsPath='masco/news/index.json';

export async function listNews(){
  try{const result=await list({prefix:newsPath,limit:1}),blob=result.blobs.find(item=>item.pathname===newsPath);if(!blob)return[];const response=await fetch(blob.url,{cache:'no-store'});if(!response.ok)throw new Error('Unable to read the news archive.');const value=await response.json();return Array.isArray(value)?value:[];}catch(error){console.error('Vercel Blob news read unavailable:',error);return[];}
}
export async function saveNews(posts){try{await put(newsPath,JSON.stringify(posts),{access:'public',allowOverwrite:true,contentType:'application/json',cacheControlMaxAge:60});return posts;}catch(error){console.error('Vercel Blob news write unavailable:',error);throw new Error('Vercel Blob is not connected. Add a public Blob store to this project, then redeploy.');}}
export async function saveMedia(input){const media=decodeUpload(input),id=`${randomUUID()}.${media.extension}`;try{const blob=await put(`masco/news/media/${id}`,media.bytes,{access:'public',contentType:media.contentType,addRandomSuffix:false,cacheControlMaxAge:31536000});return{id,url:blob.url};}catch(error){console.error('Vercel Blob media write unavailable:',error);throw new Error('Vercel Blob is not connected. Add a public Blob store to this project, then redeploy.');}}
