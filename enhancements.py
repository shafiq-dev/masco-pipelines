import re
from pathlib import Path

PATHS={
 'pipeline':'<path d="M4 8h7a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3h3M4 5v6m16 2v6M8 8v6a3 3 0 0 0 3 3h2"/>',
 'tool':'<path d="M14 6a5 5 0 0 0-6 6L3 17a2.8 2.8 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
 'design':'<path d="m4 17 11-11 4 4L8 21H4v-4Zm9-9 4 4M4 4h6M4 4v6m16 5v5h-5"/>',
 'water':'<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
 'shield':'<path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
 'integrity':'<path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="m8 12 3 3 5-6"/>',
 'innovation':'<path d="M8 15a7 7 0 1 1 8 0l-1 3H9l-1-3Zm1 6h6M12 5v3m-4 1 2 2m6-2-2 2"/>',
 'quality':'<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8m-7-5 2 2 3-4"/>',
 'partnership':'<path d="m3 9 4-4 5 2 5-2 4 4-5 8-3 3-3-1-7-10Z"/><path d="m7 5 5 2-4 5 3 2 4-3 5 4M6 15l4 4m0-4 5 5"/>',
 'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8m-4 0h4v4"/>',
 'pin':'<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'arrow':'<path d="M5 19 19 5M5 5h14v14"/>',
 'close':'<path d="m6 6 12 12M6 18 18 6"/>',
 'check':'<path d="m5 12 4 4L19 6"/>',
 'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 'copy':'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H4v13h4"/>',
 'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 'globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
}
def icon(name,cls=''):
    return f'<svg class="icon {cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{PATHS[name]}</svg>'

def enhance(html,caps):
    html=html.replace('<button class="motion-toggle" aria-label="Pause animations">Ⅱ</button>','')
    html=html.replace('</head>','<link rel="stylesheet" href="/enhancements.css"><link rel="stylesheet" href="/portfolio-map.css"></head>')
    html=html.replace('<a class="button small" href="#contact">Contact Us <span>↗</span></a>','<button type="button" class="button small contact-trigger">Contact Us '+icon('arrow')+'</button>')
    nav=[('about','About us','The joint venture'),('capabilities','Capabilities','Integrated services'),('epcc','EPCC expertise','The project lifecycle'),('portfolio','Project portfolio','Our combined track record'),('presence','Our presence','Across four countries')]
    menu='<dialog class="mobile-menu" aria-label="Navigation"><div class="menu-head"><a href="#home" class="menu-brand"><img src="/profile/page-01-55.webp" alt="MASCO Pipelines" width="160" height="48"></a><button class="menu-close" aria-label="Close menu">'+icon('close')+'</button></div><div class="menu-eyebrow">EXPLORE MASCO PIPELINES</div><nav>'
    menu+=''.join(f'<a href="#{key}"><span class="menu-index">0{i+1}</span><span><strong>{name}</strong><small>{desc}</small></span>'+icon('arrow')+'</a>' for i,(key,name,desc) in enumerate(nav))
    menu+='</nav><div class="menu-bottom"><p>'+icon('pin')+'<span>Al Khobar, Eastern Province<br>Kingdom of Saudi Arabia</span></p><button class="button contact-trigger" type="button">Contact Us '+icon('arrow')+'</button></div></dialog>'
    html=re.sub(r'<dialog class="mobile-menu".*?</dialog>',lambda m:menu,html,flags=re.S)
    intro='<figure class="intro-photo reveal"><img src="/imagery/pipeline-corridor.webp" alt="Illustrative pipeline infrastructure in a desert setting" loading="lazy"><figcaption>'+icon('pipeline')+'<span>PIPELINE INFRASTRUCTURE</span><span>EPCC · O&M</span></figcaption></figure>'
    html=re.sub(r'(<section id="about".*?)(</section>)',lambda m:m[1]+intro+m[2],html,flags=re.S)
    for i,name in enumerate(['shield','integrity','innovation','quality','partnership']):
        html=html.replace(f'<span class="value-no">0{i+1}</span>',f'<div class="value-icon">{icon(name)}<span class="value-no">0{i+1}</span></div>')
    html=html.replace('<span class="small-label">01 / VISION</span>',icon('eye','principle-icon')+'<span class="small-label">01 / VISION</span>')
    html=html.replace('<span class="small-label">02 / MISSION</span>',icon('target','principle-icon')+'<span class="small-label">02 / MISSION</span>')
    cap_images=['pipeline-corridor','pumping-station','engineering-studio','pumping-station']
    cap_icons=['pipeline','tool','design','water']
    cards='<div class="capability-cards">'
    for i,(title,items) in enumerate(caps):
        cards+=f'<article class="capability-card reveal"><figure class="capability-photo cap-photo-{i}"><img src="/imagery/{cap_images[i]}.webp" alt="Illustrative {title.lower()}" loading="lazy"><span class="cap-photo-number">0{i+1}</span></figure><div class="capability-content"><div class="capability-title"><span class="service-symbol">{icon(cap_icons[i])}</span><h3>{title}</h3></div><ul>'+''.join(f'<li>{s}</li>' for s in items)+'</ul></div></article>'
    cards+='</div>'
    html=re.sub(r'<div class="capability-list">.*?</div></section>',lambda m:cards+'</section>',html,flags=re.S)
    project_names=['oil-gas','utilities','water','black-sea','hdd','egypt']
    project_alts=['Oil and gas pipeline infrastructure','Industrial utilities pipe racks','Water transmission and pumping infrastructure','Gas pipeline construction in Romanian countryside','HDD equipment at a river crossing','Gas metering and pressure regulating station']
    project_index=iter(range(6))
    def project_photo(match):
        i=next(project_index)
        return match[0]+f'<figure class="project-thumbnail"><img src="/imagery/project-{project_names[i]}.webp" alt="Illustrative {project_alts[i].lower()}" loading="lazy" width="960" height="640"></figure><div class="project-details">'
    html=re.sub(r'<article class="project reveal" data-owner="[^"]+">',project_photo,html)
    html=re.sub(r'(<article class="project reveal".*?)(</article>)',lambda m:m[1]+'</div>'+m[2],html,flags=re.S)
    html=html.replace('<div class="portfolio-grid">','<p class="portfolio-image-note">Images illustrate the project types. Project references are drawn from the parent companies’ portfolios.</p><div class="portfolio-grid">')
    countries=[('saudi','Saudi Arabia',1545,61.4,44.8),('romania','Romania',1549,56.5,28.7),('moldova','Republic of Moldova',1547,57.8,27.4),('egypt','Egypt',1557,57.6,40.9)]
    pins='<div class="map-pins" aria-label="Countries of operation">'
    for key,name,xref,x,y in countries:
        pins+=f'<a class="map-pin pin-{key}" href="#market-{key}" aria-label="Explore {name}" style="--pin-x:{x}%;--pin-y:{y}%"><span class="pin-dot"></span><span class="pin-connector"></span><span class="pin-label"><img src="/profile/page-08-{xref}.webp" alt="" width="28" height="28"><span>{name}</span></span></a>'
        html=html.replace(f'<article class="market reveal"><img class="" src="/profile/page-08-{xref}.webp"',f'<article class="market reveal" id="market-{key}"><img class="" src="/profile/page-08-{xref}.webp"')
    pins+='</div>'
    html=re.sub(r'(<div class="presence-map reveal">.*?)(</div>)',lambda m:m[1]+pins+m[2],html,flags=re.S)
    html=html.replace('<img class="" src="/profile/page-05-865.webp" alt="Pipeline artwork from the EPCC capabilities page" loading="lazy">','<img id="epcc-photo" src="/imagery/engineering-studio.webp" alt="Illustrative engineering design studio" loading="lazy">')
    html=html.replace('<img class="why-art" src="/profile/page-09-1655.webp" alt="Pipeline artwork from Why MASCO Pipelines" loading="lazy">','<img class="why-art" src="/imagery/pipeline-logistics.webp" alt="Illustrative pipeline procurement and logistics facility" loading="lazy">')
    html=re.sub(r'(<div class="why-list">)(.*?)(</div></div></section>)',lambda m:m[1]+re.sub(r'<span class="index">(\d+)</span>',lambda n:'<span class="why-symbol">'+icon(['pipeline','partnership','shield','quality'][int(n[1])-1])+'</span>',m[2])+m[3],html,flags=re.S)
    html=re.sub(r'(<div class="cert-grid">)(.*?)(</div></section>)',lambda m:m[1]+re.sub(r'<span class="index">(\d+)</span>',lambda n:'<span class="cert-symbol">'+icon('quality' if int(n[1])<4 else 'shield')+'</span>',m[2])+m[3],html,flags=re.S)
    html=html.replace('<p>Al Khobar, Eastern Province,<br>Kingdom of Saudi Arabia</p><a class="button light"', '<p>Al Khobar, Eastern Province,<br>Kingdom of Saudi Arabia</p><div class="contact-ctas"><button class="button light contact-trigger" type="button">Contact Us '+icon('arrow')+'</button><a class="profile-secondary"')
    html=html.replace('Company Profile 2026 <span>↗</span></a></div></section>', 'Company Profile 2026 '+icon('download')+'</a></div></div></section>')
    popup=Path('contact-dialog.html').read_text(encoding='utf-8')
    for name in PATHS:popup=popup.replace('{{icon:'+name+'}}',icon(name))
    html=html.replace('<script src="/profile.js"',popup+'<script src="/profile.js"')
    html=re.sub(r'<section class="hero" id="home">.*?</section>',lambda m:Path('hero.html').read_text(encoding='utf-8'),html,flags=re.S)
    html=html.replace('</head>','<link rel="stylesheet" href="/hero.css"></head>')
    html=re.sub(r'<a class="profile-secondary"[^>]*>.*?</a>','',html,flags=re.S)
    html=html.replace('<a class="back-top"', '<a class="footer-profile" href="/masco-pipelines-profile.pdf" target="_blank" rel="noopener">Company Profile '+icon('download')+'</a><a class="back-top"')
    html=html.replace('<title>MASCO Pipelines | Company Profile</title>','<title>MASCO Pipelines | Integrated Pipeline Solutions</title>')
    html=html.replace('alt="Closing pipeline artwork from the company profile"','alt="MASCO Pipelines infrastructure"')
    html=html.replace('alt="Geographic presence world map from the company profile"','alt="Global geographic presence map"')
    return html
