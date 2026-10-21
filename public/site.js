const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=$('.mobile-menu'),contact=$('.contact-dialog'),projectDialog=$('.project-dialog');
const returnFocus=new WeakMap();
function openDialog(dialog,trigger=document.activeElement){
  $$('dialog[open]').forEach(d=>d.close());
  returnFocus.set(dialog,trigger);dialog.showModal();document.body.classList.add('modal-open');
  $('.menu-toggle').setAttribute('aria-expanded',String(dialog===menu));
}
function closeDialog(dialog){dialog.close();}
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('modal-open');$('.menu-toggle').setAttribute('aria-expanded','false');const trigger=returnFocus.get(dialog);if(trigger?.isConnected&&!$('dialog[open]'))trigger.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);});
});
$('.menu-toggle').addEventListener('click',e=>openDialog(menu,e.currentTarget));
$('.menu-close').addEventListener('click',()=>closeDialog(menu));
$('.contact-close').addEventListener('click',()=>closeDialog(contact));
$('.dialog-close',projectDialog).addEventListener('click',()=>closeDialog(projectDialog));
$$('.contact-trigger').forEach(button=>button.addEventListener('click',e=>openDialog(contact,e.currentTarget.closest('dialog')?$('.header .contact-trigger'):e.currentTarget)));
$$('a[href^="#"]',menu).forEach(link=>link.addEventListener('click',()=>closeDialog(menu)));
matchMedia('(min-width:851px)').addEventListener('change',e=>{if(e.matches&&menu.open)closeDialog(menu);});

const slides=$$('.hero-image'),slideText=[['PIPELINE CONSTRUCTION','Black Sea Shore–Podișor · Romania'],['CONNECTING ENERGY NETWORKS','Romania–Moldova interconnection'],['EXPERTISE IN EVERY CONNECTION','Pipeline welding & construction']];
let currentSlide=0,timer,heroVisible=true;
function resetTimer(){clearInterval(timer);const progress=$('.hero-progress span');progress.style.animation='none';void progress.offsetWidth;progress.style.animation='';if(!reduced.matches&&!document.hidden&&heroVisible&&!$('dialog[open]'))timer=setInterval(()=>showSlide(currentSlide+1),7000);}
function showSlide(index){currentSlide=(index+slides.length)%slides.length;slides.forEach((slide,i)=>slide.classList.toggle('active',i===currentSlide));$('#hero-caption-title').textContent=slideText[currentSlide][0];$('#hero-caption-location').textContent=slideText[currentSlide][1];$('#hero-count').innerHTML=`0${currentSlide+1} <i>/ 03</i>`;resetTimer();}
$('#hero-prev').addEventListener('click',()=>showSlide(currentSlide-1));$('#hero-next').addEventListener('click',()=>showSlide(currentSlide+1));
document.addEventListener('visibilitychange',resetTimer);reduced.addEventListener('change',resetTimer);
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;resetTimer();},{threshold:.15}).observe($('#home'));
new MutationObserver(resetTimer).observe(document.body,{attributes:true,attributeFilter:['class']});

const tabs=$$('[data-service]');function selectService(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;$('#service-panel-'+i).hidden=i!==index;});if(focus)tabs[index].focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectService(i));tab.addEventListener('keydown',e=>{let next;if(['ArrowRight','ArrowDown'].includes(e.key))next=(i+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(e.key))next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();selectService(next,true);});});
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;$$('.project-card').forEach(card=>{card.hidden=filter!=='all'&&filter!==card.dataset.category;if(!card.hidden)count++;});$('.project-counter').textContent=String(count).padStart(2,'0')+' PROJECTS';}));
const projects=JSON.parse($('#project-data').textContent),escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
 const p=projects[Number(button.dataset.project)];
 $('#project-dialog-content').innerHTML=`<img class="project-detail-photo" src="/media/${p.image}.webp" alt="${escapeHTML(p.name)} project photograph"><div class="project-detail-body"><p class="eyebrow">CIS GAZ PROJECT EXPERIENCE · ${escapeHTML(p.category_label)}</p><h2 id="project-title">${escapeHTML(p.name)}</h2><p>${escapeHTML(p.description)}</p><div class="project-facts">${[['Scale',p.metric+' '+p.unit],['Specification',p.diameter],['Location',p.location],['Client',p.client]].map(([key,value])=>`<div><small>${key}</small><b>${escapeHTML(value)}</b></div>`).join('')}</div><div class="project-detail-bottom"><ul class="check-list">${p.scope.map(s=>`<li><span aria-hidden="true">✓</span>${escapeHTML(s)}</li>`).join('')}</ul><button class="button project-contact">Discuss a project ↗</button></div></div>`;
 $('.project-contact').addEventListener('click',()=>openDialog(contact,button));openDialog(projectDialog,button);
}));
const countryCopy={saudi:'Al Khobar, Eastern Province. Pipeline, water and energy infrastructure aligned with Vision 2030.',romania:'Gas transmission, major HDD river crossings and international EPCC delivery.',moldova:'Romania–Moldova gas interconnection and pressure reducing and metering facilities.',egypt:'Hayah Karima gas stations and energy infrastructure programme experience.'};
$$('[data-country]').forEach(button=>button.addEventListener('click',()=>{const country=button.dataset.country;$$('[data-country]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.country===country));b.classList.toggle('active',b.dataset.country===country);});$('#country-description').textContent=countryCopy[country];}));
const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const element=entry.target,end=Number(element.dataset.count);counterObserver.unobserve(element);if(reduced.matches)return;const start=performance.now();function frame(now){const t=Math.min((now-start)/1100,1),eased=1-Math.pow(1-t,3);element.textContent=Math.round(end*eased).toLocaleString('en-US');if(t<1)requestAnimationFrame(frame);}requestAnimationFrame(frame);}),{threshold:.8});$$('[data-count]').forEach(el=>counterObserver.observe(el));
const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('.header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}),{rootMargin:'-20% 0px -65% 0px'});$$('main section[id]').forEach(section=>navObserver.observe(section));
if(!reduced.matches){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');revealObserver.unobserve(entry.target);}}),{threshold:.08});$$('.section-head,.about-grid,.epcc-stages,.qhse-grid,.vision-grid,.values,.news-card').forEach(el=>{el.classList.add('scroll-reveal');revealObserver.observe(el);});}

let enquiryDraft='';$('#enquiry-form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const values=new FormData(form);enquiryDraft=`MASCO PIPELINES — PROJECT ENQUIRY\n\nName: ${values.get('name').trim()}\nEmail: ${values.get('email').trim()}\nCompany: ${values.get('company').trim()||'—'}\nArea of interest: ${values.get('service')||'General enquiry'}\n\nProject details:\n${values.get('message').trim()}`;$('#enquiry-preview').textContent=enquiryDraft;$('.enquiry-form-view').hidden=true;$('.enquiry-ready').hidden=false;contact.setAttribute('aria-labelledby','enquiry-ready-title');contact.removeAttribute('aria-describedby');$('#copy-enquiry').focus();});
$('.edit-enquiry').addEventListener('click',()=>{$('.enquiry-ready').hidden=true;$('.enquiry-form-view').hidden=false;contact.setAttribute('aria-labelledby','enquiry-title');contact.setAttribute('aria-describedby','enquiry-description');$('#enquiry-name').focus();});
$('#copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(enquiryDraft);$('#enquiry-status').textContent='Enquiry copied. Ready to share with your MASCO contact.';}catch{$('#enquiry-status').textContent='Please select and copy the enquiry above, or download it.';}});
$('#download-enquiry').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([enquiryDraft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MASCO-Pipelines-Enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#enquiry-status').textContent='Enquiry downloaded. It has not been sent.';});
