import {copyButton,escapeHtml as esc} from './controls.js';
export const badge = (status='Proposed') => `<span class="badge ${status.toLowerCase().replaceAll(' ','-')}">${esc(status)}</span>`;
export const pageIntro = (title, text) => `<div class="chapter-heading"><h1>${esc(title)}.</h1>${text?`<p>${esc(text)}</p>`:''}</div>`;
export const downloadLink = asset => asset.path ? `<a class="download" href="${asset.path}" download aria-label="Download ${esc(asset.name)}">Download ${asset.format} ↓</a>` : '<span class="missing">File not supplied</span>';
export function assetCard(asset) {
  let preview=asset.preview?`<img src="${asset.preview}" alt="${esc(asset.name)}: preview of the actual editable file" loading="lazy">`:
    asset.id==='mascot'?'<img src="/brand/mojo-cat-transparent.svg" alt="Original Mojo cat" loading="lazy">':
    asset.type==='Fonts'?`<span class="mini-word" style="font-family:'${asset.cssFamily}'">Aa</span>`:
    asset.id==='guide'?'<img src="/previews/quick-guide.png" alt="Current Quick Guide" loading="lazy">':
    asset.path?`<span class="mini-word">${esc(asset.name)}</span>`:'<span class="empty-symbol">Asset pending</span>';
  return `<article class="asset-card" data-asset="${esc(asset.id)}"><div class="asset-preview ${asset.id}">${preview}</div><div class="asset-info"><div class="row">${badge(asset.status)}<span class="technical">${asset.format}</span></div><h3>${esc(asset.name)}</h3><p>${esc(asset.use)}</p><div class="asset-actions">${downloadLink(asset)}</div></div></article>`;
}

export function colourCards(palette) {
  return `<div class="swatches">${palette.map(p=>`<article class="swatch"><div class="paint" style="background:${p.hex}">${p.name==='Mojo orange'?'<span>Our signature</span>':''}</div><div class="swatch-info"><strong>${esc(p.name)}</strong><p class="swatch-role">${esc(p.role)}</p>${copyButton(p.hex,`Copy ${p.name} HEX`,'hex',p.hex)}</div></article>`).join('')}</div>`;
}
