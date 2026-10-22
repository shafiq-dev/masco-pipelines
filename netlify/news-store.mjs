import {getStore} from '@netlify/blobs';
import {sanitizePost} from '../shared/news-sanitize.mjs';

const key='published-news';
export{sanitizePost};
export async function listNews(){const value=await getStore('masco-news').get(key,{type:'json'});return Array.isArray(value)?value:[];}
export async function saveNews(posts){await getStore('masco-news').setJSON(key,posts);return posts;}
