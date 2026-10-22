import {getStore} from '@netlify/blobs';
import {decodeUpload} from '../shared/media.mjs';

export{decodeUpload};
export async function saveMedia(input){const media=decodeUpload(input),id=`${crypto.randomUUID()}.${media.extension}`;await getStore('masco-news-media').set(id,media.bytes,{metadata:{contentType:media.contentType,name:media.name}});return{id,url:`/api/news/media?id=${encodeURIComponent(id)}`};}
export async function getMedia(id){if(!/^[a-z0-9-]+\.(?:jpg|png|webp)$/i.test(String(id||'')))return null;const result=await getStore('masco-news-media').getWithMetadata(id,{type:'arrayBuffer'});if(!result)return null;return{bytes:result.data,contentType:result.metadata?.contentType||'application/octet-stream'};}
