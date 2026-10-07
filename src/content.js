import brandContent from './brand-content.json' with {type:'json'};
import templates from './templates.json' with {type:'json'};
export {templates};
export const contactInstruction=brandContent.contact;
export const brandLine=`${brandContent.name}. ${brandContent.catchphrase}.`;
export const brandStatuses=brandContent.statuses;
export const illustrations=brandContent.illustrations;
export const allFonts=brandContent.fonts;
export const customFonts=allFonts.filter(f=>f.family!=='Inter');
export const meta={version:'0.8',updated:'7 October 2026',status:'Working draft'};
export const palette=[{name:'Mojo orange',hex:'#F06A21',role:'Use for key actions and highlights.'},{name:'Warm cream',hex:'#FFF8F0',role:'Use for backgrounds.'},{name:'Soft ink',hex:'#1D1B18',role:'Use for text.'},{name:'Sage',hex:'#A7B59E',role:'Use for supporting backgrounds.'},{name:'Forest',hex:'#35594A',role:'Use for dark sections and emphasis.'}];
export const chapters=[
{id:'foundations',n:'01',title:'Brand foundations',short:'What makes us Mojo',description:'A shared starting point for how we show up.',items:[['Brand line',brandLine],['Visual identity','Original cat plus lowercase Mojo Draft; cream and ink for reading; orange for emphasis; pixel display details with Inter body text.'],['Product descriptions','We’re waiting for the product to be finalized before fully approving the brand foundations.']]},
{id:'logos',n:'02',title:'Logo & mascot',short:'A familiar face',description:'Use original artwork, every time.',items:[['Asset availability','The original transparent Mojo mascot is supplied and available as SVG. Wordmark, combined logo, and app icon are still pending. Original mascot colours and white eye highlights are preserved.'],['Space around the logo','Keep text and images away from the logo.'],['Logo size','Choose a size that keeps the cat and wordmark easy to read.'],['Keep the original','Do not stretch, crop, recolour, add effects, or remove the white eye highlights. Preserve the exact supplied SVG geometry.']]},
{id:'colour',n:'03',title:'Colour',short:'A palette with personality',description:'Five colours. Plenty of possibilities.',items:[]},
{id:'typography',n:'04',title:'Typography',short:'Words with warmth',description:'Expressive headlines. Effortless reading.',items:[['Mojo Pixel Serif Draft · main headings','Supplied regular font, version 0.200. Used for main headings, page titles, and the editable specimen.'],['Mojo Serif Refined · subtitles','Supplied regular font, version 0.601. Used for section headings and editorial subtitles.'],['Inter · installed','Supplied Inter variable fonts, version 4.001. Regular and italic, weights 100–900, optical sizes 14–32. Body text, navigation, and controls. SIL Open Font License.'],['Type scale · proposed','Display 64/68 px; headings 40/44 px; subheads 24/30 px; body 14/23 px; captions 12/18 px. Inter weights 400, 500, and 600. Main headings: Mojo Pixel Serif Draft. Subtitles: Mojo Serif Refined. Serif fallback: Georgia. Body fallback: Arial, sans-serif.']]},
{id:'voice',n:'05',title:'Voice & language',short:'Work in progress',description:'We’re still shaping how Mojo sounds. Writing guidance and examples will be added here.',items:[]},
{id:'templates',n:'06',title:'Templates',short:'A head start on making',description:'Five template categories under development.',items:templates.map(t=>[t.name,t.description+' Under development'])},
{id:'imagery',n:'07',title:'Imagery & motion',short:'Scenes with room to think',description:'We’re developing Mojo’s illustration and motion style. These images show the current direction.',items:[['Status','Work in progress'],['Explorations','Courtyard and Sunlit workspace.'],['Motion','Under development']]},
{id:'components',n:'08',title:'Reusable components',short:'Use what already works',description:'Working elements from this toolkit, ready to reuse in the same project.',items:[]},
{id:'campus',n:'09',title:'Campus & merchandise',short:'Bring people together',description:'Brand materials for campus events and merchandise.',items:[['Merchandise concepts','Production artwork pending.'],['Event checklist','Venue, accessibility, hosts, permissions, registration and signage.']]},
{id:'downloads',n:'10',title:'Quick guide & downloads',short:'Everything in one place',description:'Find a resource. Make it your own.',items:[]},
{id:'requests',n:'11',title:'Requests & updates',short:'Keep the toolkit growing',description:'Request an asset, suggest a change, or see what’s being worked on.',items:[['Contact',contactInstruction]]}
];
export const assets=[

{name:'Quick brand guide',id:'guide',type:'Guides',format:'HTML',status:'Proposed',version:'0.2',use:'Print-friendly working reference',path:'/downloads/quick-guide.html'},
{name:'Core palette tokens',id:'palette',type:'Guides',format:'CSS',status:brandStatuses.primaryPalette,version:'0.2',use:'Five primary palette values',path:'/downloads/palette.css'},
{name:'Mojo mascot',id:'mascot',type:'Logos',format:'SVG',status:brandStatuses.signature,version:'Original',use:'Supplied original · unchanged geometry and colours',path:'/brand/mojo-cat-transparent.svg'},
...allFonts.map(f=>({...f,type:'Fonts',status:'Available',use:f.role+' · supplied desktop TTF; web-loadable'})),
...['Mojo wordmark','Combined logo','App icon'].map(name=>({name,id:name,type:'Logos',format:'Pending',status:'Unavailable',version:'—',use:'Awaiting original file',path:null}))];
export const requestBrief=`Mojo asset request @c.c.
What I need: [Asset]
Where it will be used: [Channel or context]
When I need it: [Date]
Size or format: [If relevant]`;
export const changeBrief=`Mojo change request @c.c.
Page or asset: [Name or link]
What needs changing: [Describe the change]
Why: [Brief reason]
Screenshot or reference: [If relevant]`;
export const completion={
 proposed:[
  {name:'Primary colour palette',href:'#colour',text:'The five current colours need approval.'},
  {name:'Brand foundations',href:'#foundations',text:'Existing visual guidance awaits the finalized product before full approval.'},
  {name:'Type scale',href:'#typography',text:'The proposed sizes need review; supplied fonts are available.'}
 ],
 incomplete:[
  ...templates.map(t=>({name:t.name,href:'#templates/'+t.id,text:'Under development. '+t.description})),
  {name:'Imagery & motion',href:'#imagery',text:'Work in progress. Current illustration explorations; motion is under development.'},
  {name:'Secondary & tertiary palettes',href:'#colour/secondary',text:brandStatuses.secondaryPalette+'. No additional colours have been selected.'},
  {name:'Voice & language',href:'#voice',text:brandStatuses.voice+'. Writing guidance and examples are still to come.'},
  {name:'Mojo animations',href:'#logos/animations',text:brandStatuses.animations+'. The gallery currently shows a static preview.'},
  {name:'Logo exports',href:'#logos',text:'Standalone wordmark, combined-logo, reversed and one-colour files are missing.'},
  {name:'Production app artwork',href:'#logos',text:'Production app-icon artwork has not been supplied; the mascot favicon is available.'},
  {name:'Font supporting files',href:'#typography',text:'Custom licence documents and separate WOFF/WOFF2 files have not been supplied.'},
  ...illustrations.filter(i=>!i.path).map(i=>({name:i.title+' artwork',href:'#imagery',text:'Original image file needed to complete its preview.'})),
  {name:'Photography & product screenshots',href:'#imagery',text:'Real images and their permissions have not been supplied.'},
  {name:'Production merchandise',href:'#campus',text:'Specifications and production artwork are still needed.'}
 ]
};
export const changelog=[
 {date:'2026-10-07',title:'v0.8 · Shared sticky header',label:'Updated',summary:'Mojo Draft title and signature share a text baseline in one cream header. Search and Quick Guide stay visible, navigation sits below the header, and section links leave space for their titles.',href:'#overview'},
 {date:'2026-10-07',title:'Sunlit workspace artwork',label:'Added',summary:'Original supplied Sunlit workspace PNG added to the Imagery & motion explorations, preserving its proportions and pixel transition.',href:'#imagery'},
 {date:'2026-10-06',title:'Layout and courtyard motion refinements',label:'Updated',commit:'b902f7e',summary:'Simpler overview, grouped logo backgrounds, coordinated Quick Guide cards, plain merchandise cards and measured mug steam. Flower movement remains static because separate layers are unavailable.',href:'#overview'},
 {date:'2026-10-07',title:'Toolkit polish and work in progress',label:'Updated',summary:'Template categories under development, refined Quick Guide and controls, a calmer introduction, and merchandise concepts with production artwork pending.',href:'#templates',commit:'2e04c46'},
 {date:'2026-10-06',title:'Shared controls and practical resources',label:'Updated',summary:'Branded copy controls, refreshed templates, visual imagery examples, a compact Quick Guide, and Discord request briefs.',href:'#templates',commit:'f241104'},
 {date:'2026-10-06',title:'Artwork edge and reference pages',label:'Updated',summary:'Foliage transparency, shared approval statuses, simple logo and colour examples, and all-font downloads.',href:'#imagery',commit:'b695ba4'},
 {date:'2026-10-06',title:'Better together and font downloads',label:'Updated',summary:'Confirmed brand line, visual foundations, and supplied custom TTF downloads.',href:'#typography',commit:'0498730'},
 {date:'2026-10-06',title:'Internal foundations and identity',label:'Updated',summary:'Draft-font wordmark, mascot icons, and editorial foundations.',href:'#foundations',commit:'dd7e11f'},
 {date:'2026-10-06',title:'Courtyard overview and introduction',label:'Added',summary:'Original courtyard illustration and session introduction.',href:'#overview',commit:'bd40e69'},
 {date:'2026-10-06',title:'Supplied mascot and typography',label:'Added',summary:'Original cat SVG and the supplied Mojo and Inter fonts.',href:'#logos',commit:'a2ad62f'},
 {date:'2026-10-06',title:'Initial brand toolkit',label:'Added',summary:'Sidebar, reference pages, and editable starter layouts.',href:'#downloads',commit:'aa33a03'}
];

export const foundations={tagline:brandLine,decisions:['Original cat plus lowercase Mojo Draft signature','Cream and ink for reading; orange for emphasis; sage and forest for supporting surfaces','Pixel details for identity and illustrations; Inter for body text and controls']};
