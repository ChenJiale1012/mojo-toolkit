// The supplied SVG is the artwork master. These formulas only place dimensions.
const S=160,x=72,y=72,catWidth=.75*S,catHeight=catWidth*1026/1189;
const left=x+.125*S,right=left+catWidth,top=y+(S-catHeight)/2,bottom=top+catHeight;
const tick=(a,b,c)=>`<path d="M${a} ${b}H${c}M${a} ${b-4}v8M${c} ${b-4}v8"/>`;

export function toolkitIconSection(){
 return `<section class="editorial-section toolkit-icon-section" id="toolkit-icon" tabindex="-1">
  <h2>Toolkit icon.</h2>
  <p>Centre the cat on a cream square. Keep it at 75% of the square’s width and preserve its proportions. Use the supplied files for consistent spacing.</p>
  <div class="toolkit-icon-layout">
   <figure class="toolkit-icon-card"><img class="toolkit-icon-art" src="/favicon.svg?v=6" width="160" height="160" alt="Mojo cat centred on the supplied warm cream icon"><figcaption>Supplied toolkit icon</figcaption></figure>
   <figure class="toolkit-icon-card"><svg class="toolkit-icon-diagram" viewBox="0 0 352 320" role="img" aria-labelledby="toolkit-icon-diagram-title toolkit-icon-diagram-desc">
    <title id="toolkit-icon-diagram-title">Toolkit icon construction</title>
    <desc id="toolkit-icon-diagram-desc">The supplied cream square with a centred cat. Cat width 75%; left and right margins 12.5% each; top and bottom margins approximately 17.64% each. Corner radius 18.75%. Measurements run from straight outer edges to the outermost mascot outline, including the ears.</desc>
    <image class="toolkit-icon-diagram-art" href="/favicon.svg?v=6" x="${x}" y="${y}" width="${S}" height="${S}"/>
    <g class="toolkit-icon-dimensions" aria-hidden="true">
     ${tick(left,48,right)}
     <path class="toolkit-icon-projections" d="M${left} 52V${y}M${right} 52V${y}M${x} ${y+S}v28M${left} ${y+S}v28M${right} ${y+S}v28M${x+S} ${y+S}v28M${x+S} ${y}h24M${x+S} ${top}h24M${x+S} ${bottom}h24M${x+S} ${y+S}h24"/>
     ${tick(x,256,left)}${tick(right,256,x+S)}
     <path d="M252 ${y}V${top}M248 ${y}h8M248 ${top}h8M252 ${bottom}V${y+S}M248 ${bottom}h8M248 ${y+S}h8"/>
    </g>
    <g class="toolkit-icon-labels" aria-hidden="true">
     <text x="${x+S/2}" y="32" text-anchor="middle">Cat · 75%</text>
     <text x="${x+10}" y="282" text-anchor="middle">12.5%</text><text x="${x+S-10}" y="282" text-anchor="middle">12.5%</text>
     <text x="268" y="${(y+top)/2+5}">≈17.64%</text><text x="268" y="${(bottom+y+S)/2+5}">≈17.64%</text>
     <text x="${x+S/2}" y="310" text-anchor="middle">Corner radius · 18.75%</text>
    </g>
   </svg><figcaption>Spacing from the straight outer edges</figcaption></figure>
  </div>
  <dl class="toolkit-icon-specs">${[['Background','Warm cream · #FFF8F0'],['Canvas','Square'],['Cat width','75% of the canvas width'],['Left and right margins','12.5% each'],['Top and bottom margins','Approximately 17.64% each'],['Corner radius','18.75% of the canvas width']].map(([term,value])=>`<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}</dl>
  <p class="muted">Measure to the cat’s outermost outline, including the ears. These are favicon construction rules, not general logo clear-space requirements. The main Mojo website keeps its orange-background icon.</p>
  <div class="actions"><a class="button primary" href="/downloads/mojo-toolkit-favicon-cream.zip" download>Download toolkit icons ↓</a><a class="text-link" href="/downloads/toolkit-icons/BRAND-GUIDELINES.md" download>Construction specification ↓</a></div>
 </section>`;
}
