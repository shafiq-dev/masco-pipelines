const sharedQuality=[
  {id:'DEMO-JW-01042',chainage:'KP 18+240',method:'PAUT',stage:'Final scan',status:'Accepted'},
  {id:'DEMO-JW-01043',chainage:'KP 18+258',method:'PAUT',stage:'Final scan',status:'Accepted'},
  {id:'DEMO-JW-01044',chainage:'KP 18+276',method:'UT',stage:'Field inspection',status:'Under review'},
  {id:'DEMO-JW-01045',chainage:'KP 18+294',method:'PAUT',stage:'Final scan',status:'Accepted'}
];
const documents=[
  {type:'PDF',name:'Weekly project progress report',reference:'DEMO-DOC-PM-014',revision:'Rev. 03'},
  {type:'ITP',name:'Pipeline welding inspection plan',reference:'DEMO-QA-ITP-022',revision:'Rev. 02'},
  {type:'DWR',name:'Daily field activity register',reference:'DEMO-CON-DR-118',revision:'Current'},
  {type:'HSE',name:'Project safety performance summary',reference:'DEMO-HSE-RPT-009',revision:'Rev. 01'}
];
const project=(code,name,location,packageName,overall,installed,joints,docs)=>({code,name,location,package:packageName,overall,
  metrics:[
    {label:'OVERALL PROGRESS',value:overall,suffix:'%',note:'Planned versus completed',progress:overall},
    {label:'PIPELINE INSTALLED',value:installed,suffix:' km',note:'Demonstration quantity',progress:Math.min(installed/62*100,100)},
    {label:'WELDS COMPLETED',value:joints,note:'Demonstration register',progress:Math.min(joints/1280*100,100)},
    {label:'DOCUMENTS APPROVED',value:docs,suffix:'%',note:'Controlled submissions',progress:docs}
  ],
  qualityMetrics:[
    {label:'JOINTS INSPECTED',value:Math.max(joints-14,0),note:'Demonstration count',progress:94},
    {label:'FIRST-PASS RATE',value:97.4,suffix:'%',note:'Illustrative only',progress:97.4},
    {label:'OPEN REVIEWS',value:3,note:'Illustrative only',progress:18},
    {label:'ITP HOLD POINTS',value:2,note:'Illustrative only',progress:25}
  ],
  phases:[{name:'Engineering',value:100},{name:'Procurement',value:92},{name:'Construction',value:overall},{name:'Commissioning',value:Math.max(overall-58,0)}],
  milestones:[{title:'Engineering package approved',date:'Completed · Demo',state:'done'},{title:'Long-lead materials delivered',date:'Completed · Demo',state:'done'},{title:'Mainline construction',date:'Current phase · Demo',state:'active'},{title:'Testing and commissioning',date:'Planned · Demo',state:'planned'}],
  activities:[{type:'CONSTRUCTION',title:'Mainline installation advanced',detail:'Illustrative daily progress update for layout demonstration.'},{type:'QUALITY',title:'NDT batch reviewed',detail:'Illustrative inspection status; no client or field data is shown.'},{type:'DOCUMENT CONTROL',title:'Weekly report issued',detail:'Sample workflow awaiting connection to an approved data source.'}],
  quality:sharedQuality,documents
});
export function getPortalData(){return {mode:'demonstration',generatedAt:new Date().toISOString(),projects:[project('DEMO-PKG-A','Pipeline Package A','Eastern Province, Saudi Arabia','EPCC demonstration project',68,42.6,1184,86),project('DEMO-PKG-B','Water Transmission Package B','Saudi Arabia','Water infrastructure demonstration',43,26.2,742,64),project('DEMO-FAC-C','Metering Facilities Package C','Saudi Arabia','Stations demonstration project',81,51.8,1260,91)]};}
