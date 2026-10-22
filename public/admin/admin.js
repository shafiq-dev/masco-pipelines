const $=selector=>document.querySelector(selector);
let posts=[],quill,pendingCrop=null,inlineRange=null;

const request=async(url,options={})=>{const response=await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});const data=await response.json().catch(()=>({error:'Unexpected server response.'}));if(!response.ok)throw new Error(data.error||'Request failed.');return data;};
const escapeHTML=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanPreview=html=>{const template=document.createElement('template');template.innerHTML=html;template.content.querySelectorAll('script,style,iframe,object,embed').forEach(el=>el.remove());template.content.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(attr=>{if(/^on/i.test(attr.name)||attr.name==='style')el.removeAttribute(attr.name);}));return template.innerHTML;};

function semanticHTML(){
  const root=quill.root.cloneNode(true);
  root.querySelectorAll('.ql-ui').forEach(el=>el.remove());
  root.querySelectorAll('ol').forEach(list=>{const items=[...list.children];if(items.length&&items.every(item=>item.dataset.list==='bullet')){const replacement=document.createElement('ul');items.forEach(item=>{item.removeAttribute('data-list');replacement.append(item);});list.replaceWith(replacement);}else items.forEach(item=>item.removeAttribute('data-list'));});
  root.querySelectorAll('[class]').forEach(el=>el.removeAttribute('class'));
  return root.innerHTML;
}

function updatePreview(){
  const category=$('#category').value.trim()||'PROJECT UPDATE',title=$('#title').value.trim()||'Your headline appears here',excerpt=$('#excerpt').value.trim()||'Your story summary appears here.',content=semanticHTML();
  $('#preview-category').textContent=category.toUpperCase();$('#preview-title').textContent=title;$('#preview-excerpt').textContent=excerpt;$('#preview-content').innerHTML=cleanPreview(content)||'<p>Your full article preview appears here.</p>';
  $('#excerpt-count').textContent=$('#excerpt').value.length;
  const words=quill.getText().trim().split(/\s+/).filter(Boolean).length;$('#article-count').textContent=`${words} word${words===1?'':'s'}`;
  $('#draft-state').textContent='Unsaved';
}

function setEditorHTML(html=''){
  quill.setText('');
  if(html)quill.clipboard.dangerouslyPasteHTML(html);
  updatePreview();
}

function resetForm(){
  $('#news-form').reset();$('#post-id').value='';$('#cover-value').value='';$('#link-label').value='Read article';$('#preview-image').removeAttribute('src');$('#preview-image').hidden=true;
  setEditorHTML('');$('#editor-mode').textContent='NEW ARTICLE';$('#editor-title').textContent='Create a full article';$('#save-post').textContent='Publish article';$('#delete-post').hidden=true;$('#view-article').hidden=true;$('#editor-status').textContent='';$('#cover-status').textContent='Upload an original project image for this article.';$('#inline-status').textContent='';document.querySelectorAll('.post-item').forEach(el=>el.classList.remove('active'));updatePreview();
}

function editPost(post){
  $('#post-id').value=post.id;$('#category').value=post.category;$('#title').value=post.title;$('#excerpt').value=post.excerpt;$('#link-label').value=post.linkLabel;$('#cover-value').value=post.image;$('#preview-image').src=post.image;$('#preview-image').hidden=false;setEditorHTML(post.content||`<p>${escapeHTML(post.excerpt)}</p>`);
  $('#editor-mode').textContent='EDIT ARTICLE';$('#editor-title').textContent='Update full article';$('#save-post').textContent='Save changes';$('#delete-post').hidden=false;$('#view-article').href=`/news/article/?id=${encodeURIComponent(post.id)}`;$('#view-article').hidden=false;$('#cover-status').textContent='Current cropped cover. Upload another image to replace it.';document.querySelectorAll('.post-item').forEach(el=>el.classList.toggle('active',el.dataset.id===post.id));updatePreview();$('#draft-state').textContent='Published';window.scrollTo({top:0,behavior:'smooth'});
}

function renderPosts(){
  const list=$('#post-list');if(!posts.length){list.innerHTML='<p class="empty">No admin-created articles yet. The three confirmed stories remain live.</p>';return;}
  list.innerHTML=posts.map(post=>`<button class="post-item" data-id="${escapeHTML(post.id)}"><img src="${escapeHTML(post.image)}" alt=""><span><b>${escapeHTML(post.title)}</b><small>${escapeHTML(post.category)}</small></span></button>`).join('');
  list.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>editPost(posts.find(post=>post.id===button.dataset.id))));
}

async function openDashboard(){const data=await request('/api/admin/news');posts=data.posts||[];$('#login-view').hidden=true;$('#dashboard').hidden=false;renderPosts();resetForm();}

async function optimizeInlineImage(file){
  if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a JPG, PNG or WebP image.');
  const bitmap=await createImageBitmap(file),scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return{name:file.name,data:canvas.toDataURL('image/webp',.86)};
}
async function uploadPayload(payload,status){status.textContent='Optimizing and uploading…';const media=await request('/api/admin/media',{method:'POST',body:JSON.stringify(payload)});status.textContent='Image uploaded.';return media.url;}

function drawCrop(){
  if(!pendingCrop)return;const {bitmap}=pendingCrop,zoom=Number($('#crop-zoom').value),x=Number($('#crop-x').value)/100,y=Number($('#crop-y').value)/100,ratio=16/9;
  let baseW,baseH;if(bitmap.width/bitmap.height>ratio){baseH=bitmap.height;baseW=baseH*ratio;}else{baseW=bitmap.width;baseH=baseW/ratio;}
  const cropW=baseW/zoom,cropH=baseH/zoom,maxX=(bitmap.width-cropW)/2,maxY=(bitmap.height-cropH)/2,sx=bitmap.width/2+x*maxX-cropW/2,sy=bitmap.height/2+y*maxY-cropH/2;
  const canvas=$('#crop-canvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,sx,sy,cropW,cropH,0,0,canvas.width,canvas.height);
}
async function openCrop(file){
  if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a JPG, PNG or WebP image.');
  if(pendingCrop?.bitmap)pendingCrop.bitmap.close();pendingCrop={file,bitmap:await createImageBitmap(file)};$('#crop-zoom').value='1';$('#crop-x').value='0';$('#crop-y').value='0';drawCrop();$('#crop-dialog').showModal();
}
function closeCrop(){if(pendingCrop?.bitmap)pendingCrop.bitmap.close();pendingCrop=null;$('#crop-dialog').close();$('#cover-upload').value='';}

function initializeEditor(){
  quill=new Quill('#article-editor',{theme:'snow',placeholder:'Write the full article here…',modules:{toolbar:{container:'#article-toolbar',handlers:{image(){inlineRange=quill.getSelection(true);$('#inline-upload').click();}}},history:{delay:600,maxStack:100,userOnly:true}},formats:['header','bold','italic','underline','list','blockquote','link','image']});
  quill.on('text-change',updatePreview);
}

initializeEditor();
$('#show-pin').addEventListener('click',()=>{const input=$('#admin-pin'),show=input.type==='password';input.type=show?'text':'password';$('#show-pin').textContent=show?'Hide':'Show';});
$('#login-form').addEventListener('submit',async event=>{event.preventDefault();const status=$('#login-status');status.textContent='Checking…';try{await request('/api/admin/auth',{method:'POST',body:JSON.stringify({pin:$('#admin-pin').value})});await openDashboard();}catch(error){status.textContent=error.message;}});
$('#logout').addEventListener('click',async()=>{await request('/api/admin/logout',{method:'POST'}).catch(()=>{});location.reload();});$('#new-post').addEventListener('click',resetForm);
['category','title','excerpt','link-label'].forEach(id=>$('#'+id).addEventListener('input',updatePreview));

$('#cover-upload').addEventListener('change',async event=>{try{await openCrop(event.target.files[0]);}catch(error){$('#cover-status').textContent=error.message;event.target.value='';}});
['crop-zoom','crop-x','crop-y'].forEach(id=>$('#'+id).addEventListener('input',drawCrop));$('#crop-cancel').addEventListener('click',closeCrop);$('#crop-close').addEventListener('click',closeCrop);
$('#crop-apply').addEventListener('click',async()=>{if(!pendingCrop)return;const button=$('#crop-apply'),status=$('#cover-status');button.disabled=true;button.textContent='Uploading…';try{const payload={name:pendingCrop.file.name,data:$('#crop-canvas').toDataURL('image/webp',.88)},url=await uploadPayload(payload,status);$('#cover-value').value=url;$('#preview-image').src=url;$('#preview-image').hidden=false;closeCrop();updatePreview();status.textContent='Cover cropped to 1600 × 900 and uploaded.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;button.textContent='Use this crop';}});
const drop=$('#cover-drop');drop.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('dragging');});drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));drop.addEventListener('drop',async event=>{event.preventDefault();drop.classList.remove('dragging');try{await openCrop(event.dataTransfer.files[0]);}catch(error){$('#cover-status').textContent=error.message;}});

$('#inline-upload').addEventListener('change',async event=>{const status=$('#inline-status');try{const file=event.target.files[0],payload=await optimizeInlineImage(file),url=await uploadPayload(payload,status),range=inlineRange||{index:quill.getLength()};quill.insertEmbed(range.index,'image',url,'user');quill.insertText(range.index+1,'\n','user');quill.setSelection(range.index+2,0);status.textContent='Image added to the article.';}catch(error){status.textContent=error.message;}event.target.value='';});

$('#news-form').addEventListener('submit',async event=>{event.preventDefault();const id=$('#post-id').value,status=$('#editor-status');if(!$('#cover-value').value){status.textContent='Upload and crop a cover image before publishing.';$('#cover-drop').scrollIntoView({behavior:'smooth',block:'center'});return;}const payload={id,category:$('#category').value,image:$('#cover-value').value,title:$('#title').value,excerpt:$('#excerpt').value,linkLabel:$('#link-label').value,content:semanticHTML()};status.className='status';status.textContent=id?'Saving…':'Publishing…';try{const data=await request('/api/admin/news',{method:id?'PUT':'POST',body:JSON.stringify(payload)});if(id)posts=posts.map(post=>post.id===id?data.post:post);else posts=[data.post,...posts];renderPosts();editPost(data.post);status.className='status ok';status.textContent=id?'Article updated.':'Full article published.';}catch(error){status.textContent=error.message;}});
$('#delete-post').addEventListener('click',async()=>{const id=$('#post-id').value;if(!id||!confirm('Delete this admin-created article?'))return;const status=$('#editor-status');status.textContent='Deleting…';try{await request('/api/admin/news',{method:'DELETE',body:JSON.stringify({id})});posts=posts.filter(post=>post.id!==id);renderPosts();resetForm();status.className='status ok';status.textContent='Article deleted.';}catch(error){status.textContent=error.message;}});
request('/api/admin/news').then(data=>{posts=data.posts||[];$('#login-view').hidden=true;$('#dashboard').hidden=false;renderPosts();resetForm();}).catch(()=>{});
