import sanitizeHtml from 'sanitize-html';

const originalImages=new Set(['/media/jv-group.webp','/media/jv-signing.webp','/media/jv-handshake.webp','/media/black-sea.webp','/media/interconnection.webp','/media/welding.webp']);
const clean=value=>String(value||'').trim();
const netlifyMedia=value=>/^\/api\/news\/media\?id=[a-z0-9._-]+$/i.test(value);
const vercelMedia=value=>/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/masco\/news\/media\/[a-z0-9._-]+$/i.test(value);
export const managedMedia=value=>netlifyMedia(value)||vercelMedia(value);
const sanitizeArticle=value=>sanitizeHtml(String(value||''),{allowedTags:['p','h2','h3','strong','em','u','ul','ol','li','blockquote','a','figure','img','figcaption','br','hr'],allowedAttributes:{a:['href','target','rel'],img:['src','alt']},allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,nestingLimit:8,exclusiveFilter:frame=>frame.tag==='img'&&!originalImages.has(frame.attribs.src)&&!managedMedia(frame.attribs.src),transformTags:{a:(tagName,attribs)=>({tagName,attribs:{...attribs,target:'_blank',rel:'noopener'}})}});

export function sanitizePost(input,existing={}){
  const title=clean(input.title),category=clean(input.category).toUpperCase(),excerpt=clean(input.excerpt),linkLabel=clean(input.linkLabel),image=clean(input.image),content=sanitizeArticle(input.content||`<p>${excerpt}</p>`);
  if(title.length<4||title.length>110)throw new Error('Title must be 4–110 characters.');
  if(category.length<3||category.length>38)throw new Error('Category must be 3–38 characters.');
  if(excerpt.length<10||excerpt.length>240)throw new Error('Summary must be 10–240 characters.');
  if(!managedMedia(image))throw new Error('Upload and crop a valid cover image.');
  if(linkLabel.length<2||linkLabel.length>40)throw new Error('Link label must be 2–40 characters.');
  const plain=sanitizeHtml(content,{allowedTags:[],allowedAttributes:{}}).replace(/\s+/g,' ').trim();
  if(plain.length<40||plain.length>12000)throw new Error('Article must contain 40–12,000 characters.');
  const now=new Date().toISOString(),id=existing.id||crypto.randomUUID();
  return{id,title,category,excerpt,link:`/news/article/?id=${encodeURIComponent(id)}`,linkLabel,image,content,createdAt:existing.createdAt||now,updatedAt:now};
}
